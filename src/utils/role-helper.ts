import { Repository, SavedContent } from "sn-client-js";
import { autoinject } from "aurelia-framework";
import { Group, User } from "sn-client-js/dist/src/ContentTypes";
import { LoginState } from "sn-client-js/dist/src/Authentication";
import { ReplaySubject } from "rxjs/ReplaySubject";
import { Observable } from "rxjs/Observable";

export enum Role {
    IsGlobalAdministratorUser = 'IsGlobalAdministratorUser',
    IsExploreUser = 'IsExploreUser',
    IsLoggedIn = 'IsLoggedIn',
    IsVisitor = 'IsVisitor'
}

@autoinject
export class RoleHelper {
    private _groups: Group[] = [];
    private _roles: Map<Role, boolean> = new Map();

    private _currentUser: User;

    private async evaluateIsExploreUser() {
        try {
            return this._groups.find(g=> g.Path === '/Root/IMS/BuiltIn/Portal/ContentExplorers') != null;
        } catch (error) {
            return false;
        }
    }

    private async evaluateIsGlobalAdmin(){
        try {
            return this._groups.find(g=> g.Path === '/Root/IMS/BuiltIn/Portal/Administrators') != null;
        } catch (error) {
            return false;
        }
    }

    private async evaluateRole(role: Role): Promise<boolean> {
        switch (role) {
            case Role.IsExploreUser:
                return await this.evaluateIsExploreUser();
            case Role.IsGlobalAdministratorUser:
                return await this.evaluateIsGlobalAdmin();
            default:
                console.warn(`No role evaluation implemented for '${role}' `);
                return false;
        }
    }

    public async IsInRole(role: Role): Promise<boolean> {

        await this.OnRolesChanged.first().toPromise();

        if (this._roles.has(role)) {
            return this._roles.get(role) || false;
        } else {
            try {
                const roleValue = await this.evaluateRole(role);
                this._roles.set(role, roleValue);
                return roleValue;
            } catch (error) {
                console.warn(`Failed to evaluate role '${role}'`, error);
                return false;
            }
        }
    }

    private rolesChangedSubject: ReplaySubject<void> = new ReplaySubject(1);
    private TriggerRolesChanged(){
        this.rolesChangedSubject.next(null);
    }

    public get OnRolesChanged(): Observable<void>{
        return this.rolesChangedSubject.asObservable();
    }

    constructor(private repo: Repository.BaseRepository) {
        
        repo.GetCurrentUser().subscribe(async u => {
            this._roles.clear();
            this._currentUser = u;
            const isVisitor = u.Id === this.repo['_staticContent']['VisitorUser']['Id']

            this._groups = [];
            if (!isVisitor){
                try {
                    this._groups = await u.GetParentGroups(false).map(r=>(r as any).d.results as Group[]).toPromise<Group[]>();
                } catch (error) {
                    console.warn('Error fetching groups for user. Check "GetParentGroups" action permission settings');
                }
            }

            this._roles.set(Role.IsLoggedIn, !isVisitor);
            this._roles.set(Role.IsVisitor, isVisitor);

            console.log('User changed: ', u);
            console.log('Roles resetted. ');
            this.TriggerRolesChanged();
        });
    }
}