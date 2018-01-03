import { autoinject } from 'aurelia-framework';
import { Repository } from "sn-client-js";

// tslint:disable:no-console

@autoinject
export class ContentLogger {

    constructor(private repo: Repository.BaseRepository) {

        this.repo.Events.OnContentLoaded.subscribe(() => {
            // console.log('OnContentLoaded', p);
        });

        this.repo.Events.OnContentCreated.subscribe((mod) => {
            console.log("OnContentCreated", mod);
        });
        this.repo.Events.OnContentCreateFailed.subscribe((mod) => {
            console.log("OnContentCreateFailed", mod);
        });

        this.repo.Events.OnContentModified.subscribe((mod) => {
            console.log("OnContentModified", mod);
        });
        this.repo.Events.OnContentModificationFailed.subscribe((mod) => {
            console.log("OnContentModificationFailed", mod);
        });

        this.repo.Events.OnContentDeleted.subscribe((del) => {
            console.log("OnContentDeleted", del);
        });
    }
}
