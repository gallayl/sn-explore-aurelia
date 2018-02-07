import { autoinject } from "aurelia-framework";
import { Group } from "@sensenet/default-content-types";
import { ObservableValue, Retrier } from "@sensenet/client-utils";
import { Repository } from "@sensenet/client-core";
import { ConstantContent } from "@sensenet/client-core/dist/Repository/ConstantContent";
import { JwtService } from "@sensenet/authentication-jwt/dist/JwtService";

export enum Role {
    IsGlobalAdministratorUser = 'IsGlobalAdministratorUser',
    IsExploreUser = 'IsExploreUser',
    IsLoggedIn = 'IsLoggedIn',
    IsVisitor = 'IsVisitor'
}

@autoinject
export class RoleHelper {
    private groups: Group[] = [];
    private roles: Map<Role, boolean> = new Map();

    OnRolesChanged: ObservableValue<any> = new ObservableValue();

    private async evaluateIsExploreUser() {
        try {
            return this.groups.find((g) => g.Path === '/Root/IMS/BuiltIn/Portal/ContentExplorers') != null;
        } catch (error) {
            return false;
        }
    }

    private async evaluateIsGlobalAdmin() {
        try {
            return this.groups.find((g) => g.Path === '/Root/IMS/BuiltIn/Portal/Administrators') != null;
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
                // console.warn(`No role evaluation implemented for '${role}' `);
                return false;
        }
    }

    private isInitialized = false;
    public async IsInRole(role: Role): Promise<boolean> {
        await Retrier.create(async () => this.isInitialized)
            .setup({
                RetryIntervalMs: 10,
                Retries: 100000,
                timeoutMs: 10000,
            })
            .run();

        if (this.roles.has(role)) {
            return this.roles.get(role) || false;
        } else {
            try {
                const roleValue = await this.evaluateRole(role);
                this.roles.set(role, roleValue);
                return roleValue;
            } catch (error) {
                // console.warn(`Failed to evaluate role '${role}'`, error);
                return false;
            }
        }
    }

    private async init(){
        await this.jwt.checkForUpdate();
        this.jwt.currentUser.subscribe(async (u) => {
            if (!u){
                return;
            }
            console.log("User changed, ", u);
            this.isInitialized = false;
            this.roles.clear();
            // tslint:disable-next-line:no-string-literal
            const isVisitor = !u || u.Id === ConstantContent.VISITOR_USER.Id;
            this.groups = [];
            if (!isVisitor) {
                try {
                    const g: any = await this.repo.security.getParentGroups({
                        contentIdOrPath: u.Id,
                        directOnly: false});
                    this.groups = g.d.results as Group[];
                } catch (error) {
                    // tslint:disable-next-line:no-console
                    console.warn('Error fetching groups for user. Check "GetParentGroups" action permission settings');
                }
            }

            this.roles.set(Role.IsLoggedIn, !isVisitor);
            this.roles.set(Role.IsVisitor, isVisitor);
            this.OnRolesChanged.setValue(Math.random());
            this.isInitialized = true;
        }, true);      
    }

    constructor(private repo: Repository, private jwt: JwtService) {
        this.init();
    }
}
