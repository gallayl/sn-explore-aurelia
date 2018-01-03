import { autoinject } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { Repository } from 'sn-client-js';

@autoinject
export class Logout {

    public heading = 'Log out from sensenet ECM';
    public confirmText = 'Really log out?';
    constructor(
        private snService: Repository.BaseRepository,
        private router: Router,
    ) { }

    public logout() {
        this.snService.Authentication.Logout().subscribe(() => {
            this.router.navigate('/');
        });
    }

    public goBack() {
        this.router.navigateBack();
    }
}
