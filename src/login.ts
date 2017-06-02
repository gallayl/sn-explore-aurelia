import { autoinject } from 'aurelia-framework';
import { Repository } from "sn-client-js";
import { Router } from "aurelia-router";

@autoinject
export class Login {
    private readonly heading = "Login to sense NET ECM"
    private userName: string = '';
    private password: string = '';

    constructor(
        private snService: Repository.BaseRepository<any, any>,
        private router: Router
    ) { }

    public async Login() {
        const success = this.snService.Authentication.Login(this.userName, this.password)
            .subscribe(success => {
                if (success) {
                    this.router.navigate('/');
                }
            });
    }
}