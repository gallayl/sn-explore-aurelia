import { autoinject } from 'aurelia-framework';
import { Repository, Authentication } from "sn-client-js";

@autoinject
export class ContentLogger {

    private readonly toasTimeout: number = 4000;

    constructor(private repo: Repository.BaseRepository) {


        repo.GetCurrentUser().subscribe(u => {
            console.log('User changed: ', u);
        });

        repo.Authentication.State.subscribe(s=>{
            console.log("AuthState:", Authentication.LoginState[s]);
        })


        this.repo.Events.OnContentLoaded.subscribe(p => {
            // console.log('OnContentLoaded', p);
        });

        this.repo.Events.OnContentCreated.subscribe(mod => {
            console.log("OnContentCreated", mod);
        });
        this.repo.Events.OnContentCreateFailed.subscribe(mod => {
            console.log("OnContentCreateFailed", mod);
        });

        this.repo.Events.OnContentModified.subscribe(mod => {
            console.log("OnContentModified", mod);
        });
        this.repo.Events.OnContentModificationFailed.subscribe(mod => {
            console.log("OnContentModificationFailed", mod);
        });


        this.repo.Events.OnContentDeleted.subscribe(del => {
            console.log("OnContentDeleted", del);
        });
    }
}