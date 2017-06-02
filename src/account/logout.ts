import { autoinject } from 'aurelia-framework';
import { Repository } from "sn-client-js";
import { Router } from "aurelia-router";

@autoinject
export class Logout {
    
    heading = "Log out from sensenet ECM";
    confirmText = "Really log out?";
    constructor(
        private snService: Repository.BaseRepository<any, any>,
        private router: Router
    ) { }

    logout(){
        this.snService.Authentication.Logout().subscribe(success=>{
            this.router.navigate('/');
        });
    }

    goBack(){
        this.router.navigateBack();
    }
}