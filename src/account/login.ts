import { autoinject } from 'aurelia-framework';
import { Repository } from "sn-client-js";
import { Router } from "aurelia-router";
import { ValidationController, ValidationRules } from 'aurelia-validation';
import { MaterializeFormValidationRenderer } from 'aurelia-materialize-bridge';


@autoinject
export class Login {
    private readonly heading = "Login to sense NET ECM"
    public userName: string = '';
    public password: string = '';

    private error: string = '';

    private isLoginInProgress: boolean;

    private readonly repositoryUrl: string;

    constructor(
        private snService: Repository.BaseRepository<any, any>,
        private router: Router,
        private controller: ValidationController
    ) {
        this.repositoryUrl = this.snService.Config.RepositoryUrl;
        this.controller.addRenderer(new MaterializeFormValidationRenderer())
    }

    public rules = ValidationRules
        .ensure('userName')
            .required()
            .minLength(4)
        .ensure('password')
            .required()
        .rules;

    validateModel() {
        this.controller.validate().then(v => {
            if (v.valid) {
                this.error = '';
            } else {
                this.error = 'You have errors!';
            }
        });
    }

    public async Login() {
        this.isLoginInProgress = true;
        const success = this.snService.Authentication.Login(this.userName, this.password)
            .subscribe(success => {
                if (success) {
                    this.router.navigate('/');
                    this.error = "";
                };
                this.isLoginInProgress = false;
                this.error = "Error: failed to log in."
            }, err => {
                // console.error(err);
                this.error = err;
                this.isLoginInProgress = false;
            });
    }
}