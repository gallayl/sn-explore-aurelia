import { MDCTextField } from '@material/textfield/dist/mdc.textfield';
import { autoinject } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { Repository } from "@sensenet/client-core";
import { ValidationController, ValidationControllerFactory, ValidationRules } from 'aurelia-validation';
import { GoogleOauthProvider } from '@sensenet/authentication-google';

@autoinject
export class Login {
    public readonly heading = 'Login';
    public userName: string = '';
    public password: string = '';

    public error: string = '';

    public canLogin: boolean = false;

    public isLoginInProgress: boolean = false;

    public readonly repositoryUrl: string;

    private controller: ValidationController;

    constructor(
        private snService: Repository,
        private router: Router,
        private googleAuth: GoogleOauthProvider,
        controllerFactory: ValidationControllerFactory,
    ) {
        this.repositoryUrl = this.snService.configuration.repositoryUrl;
        this.controller = controllerFactory.createForCurrentScope();
    }

    public rules = ValidationRules
        .ensure('userName')
        .required()
        .minLength(4)
        .ensure('password')
        .required()
        .rules;

    public async validateModel() {
        const v = await this.controller.validate();
        if (v.valid) {
            this.error = '';
            this.canLogin = true;
        } else {
            this.error = 'You have errors!';
            this.canLogin = false;
        }
    }

    public async Login() {
        this.isLoginInProgress = true;
        try {
            const success = await this.snService.authentication.login(this.userName, this.password)
            if (success) {
                this.router.navigate('/');
                this.error = '';
            } else {
                this.isLoginInProgress = false;
                this.error = 'Error: failed to log in.';
            }
        } catch (error) {
            this.error = error;
            this.isLoginInProgress = false;
        }
    }

    public attached() {
        const textfields = document.querySelectorAll('.login-wrapper .mdc-text-field');
        [].forEach.call(textfields, (textfield: any) => {
            // tslint:disable-next-line:no-unused-expression
            new MDCTextField(textfield);
        });
    }

    public async googleAuthClick() {
        this.isLoginInProgress = true;
        try {
            this.googleAuth.login();
            this.router.navigate('/');
        } catch (error) {
            /** */
        }

        this.isLoginInProgress = false;
    }

}
