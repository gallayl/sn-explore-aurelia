import { autoinject } from 'aurelia-framework';
import { Repository, ContentTypes } from 'sn-client-js';
import { Router } from 'aurelia-router';
import { ValidationControllerFactory, ValidationRules, ValidationController } from 'aurelia-validation';


@autoinject
export class Login {
    private readonly heading = 'Login to sense NET ECM'
    public userName: string = '';
    public password: string = '';

    private error: string = '';

    private canLogin: boolean = false;

    private isLoginInProgress: boolean = false;

    private readonly repositoryUrl: string;

    private controller: ValidationController;

    constructor(
        private snService: Repository.BaseRepository,
        private router: Router,
        controllerFactory: ValidationControllerFactory
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

    async validateModel() {
        const v = await this.controller.validate()
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
        const success = this.snService.Authentication.Login(this.userName, this.password)
            .subscribe(success => {
                if (success) {

                    // this.snService.Load(3534, {}, null, ContentTypes.PortalRoot).subscribe(root=>{
                    //     alert(JSON.stringify(root.options));
                        this.router.navigate('/');
                        this.error = '';
                    // });
                } else {
                    this.isLoginInProgress = false;
                    this.error = 'Error: failed to log in.'
                }
            }, err => {
                // console.error(err);
                this.error = err;
                this.isLoginInProgress = false;
            });
    }
}