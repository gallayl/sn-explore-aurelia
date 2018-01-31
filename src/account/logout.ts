import { autoinject } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { Repository } from '@sensenet/client-core';

@autoinject
export class Logout {

    public heading = 'Log out from sensenet ECM';
    public confirmText = 'Really log out?';
    constructor(
        private snService: Repository,
        private router: Router,
    ) { }

    public logout() {
        this.snService.authentication.logout();            
        this.router.navigate('/');
    }

    public goBack() {
        this.router.navigateBack();
    }
}
