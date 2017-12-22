import { MDCTextField } from '@material/textfield/dist/mdc.textfield';
import { autoinject } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { ValidationController, ValidationControllerFactory, ValidationRules } from 'aurelia-validation';
import { GoogleOauthProvider } from 'sn-client-auth-google';
import { Repository } from 'sn-client-js';

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
        private snService: Repository.BaseRepository,
        private router: Router,
        controllerFactory: ValidationControllerFactory,
    ) {
        this.repositoryUrl = this.snService.Config.RepositoryUrl;
        this.controller = controllerFactory.createForCurrentScope();
        // ToDo
        // this.controller.addRenderer(new MterializeFormValidationRenderer())
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
        this.snService.Authentication.Login(this.userName, this.password)
            .subscribe((success) => {
                if (success) {
                    this.router.navigate('/');
                    this.error = '';
                } else {
                    this.isLoginInProgress = false;
                    this.error = 'Error: failed to log in.';
                }
            }, (err) => {
                this.error = err;
                this.isLoginInProgress = false;
            });
    }

    public attached() {
        const textfields = document.querySelectorAll('.login-wrapper .mdc-text-field');
        [].forEach.call(textfields, (textfield: any) => {
            const f = new MDCTextField(textfield);
        });
    }

    public async googleAuthClick() {
        this.isLoginInProgress = true;
        try {
            const token = await this.snService.Authentication.GetOauthProvider(GoogleOauthProvider).Login();
            this.router.navigate('/');
        } catch (error) {
            /** */
        }

        this.isLoginInProgress = false;
    }

}
