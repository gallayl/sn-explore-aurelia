import { autoinject } from 'aurelia-framework';
import { Repository } from '@sensenet/client-core';
import { EventHub } from '@sensenet/repository-events';

// tslint:disable:no-console

@autoinject
export class ContentLogger {

    private eventHub: EventHub;
    constructor(repo: Repository) {
        this.eventHub = new EventHub(repo);

        this.eventHub.onContentLoaded.subscribe(() => {
            // console.log('OnContentLoaded', p);
        });

        this.eventHub.onContentCreated.subscribe((mod) => {
            console.log("OnContentCreated", mod);
        });
        this.eventHub.onContentCreateFailed.subscribe((mod) => {
            console.log("OnContentCreateFailed", mod);
        });

        this.eventHub.onContentModified.subscribe((mod) => {
            console.log("OnContentModified", mod);
        });
        this.eventHub.onContentModificationFailed.subscribe((mod) => {
            console.log("OnContentModificationFailed", mod);
        });

        this.eventHub.onContentDeleted.subscribe((del) => {
            console.log("OnContentDeleted", del);
        });
    }
}
