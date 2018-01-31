import { autoinject } from "aurelia-framework";
import { Group } from "@sensenet/default-content-types";
import { ObservableValue } from "@sensenet/client-utils";
import { Repository } from "@sensenet/client-core";
import { ConstantContent } from "@sensenet/client-core/dist/Repository/ConstantContent";

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

    OnRolesChanged: ObservableValue<void> = new ObservableValue();

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

    public async IsInRole(role: Role): Promise<boolean> {
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

    constructor(private repo: Repository) {

        repo.authentication.currentUser.subscribe(async (u) => {
            this.roles.clear();
            // tslint:disable-next-line:no-string-literal
            const isVisitor = u.Id === ConstantContent.VISITOR_USER.Id;
            this.groups = [];
            if (!isVisitor) {
                try {
                    const g: any = await this.repo.security.getParentGroups(u.Id, false);
                    this.groups = g.d.results as Group[];
                } catch (error) {
                    // tslint:disable-next-line:no-console
                    console.warn('Error fetching groups for user. Check "GetParentGroups" action permission settings');
                }
            }

            this.roles.set(Role.IsLoggedIn, !isVisitor);
            this.roles.set(Role.IsVisitor, isVisitor);
            this.OnRolesChanged.setValue(Math.random() as any);            
        }, true);
    }
}
