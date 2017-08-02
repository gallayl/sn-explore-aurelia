import { autoinject } from 'aurelia-framework';
import { Repository } from "sn-client-js";
import { MdToastService } from "aurelia-materialize-bridge";

@autoinject
export class ContentLogger {

    private readonly toasTimeout: number = 4000;

    constructor(private repo: Repository.BaseRepository, toast: MdToastService) {
        this.repo.Events.OnContentLoaded.subscribe(p => {
            console.log('OnContentLoaded', p);
        });

        this.repo.Events.OnContentCreated.subscribe(mod => {
            console.log("OnContentCreated", mod);
            toast.show('Content created', this.toasTimeout, 'green');
        });
        this.repo.Events.OnContentCreateFailed.subscribe(mod => {
            console.log("OnContentCreateFailed", mod);
            toast.show('Failed to create content', this.toasTimeout, 'red');
        });

        this.repo.Events.OnContentModified.subscribe(mod => {
            console.log("OnContentModified", mod);
            toast.show('Content modified', this.toasTimeout, 'green');
        });
        this.repo.Events.OnContentModificationFailed.subscribe(mod => {
            console.log("OnContentModificationFailed", mod);
            toast.show('Content modified', this.toasTimeout, 'red');
        });


        this.repo.Events.OnContentDeleted.subscribe(del => {
            console.log("OnContentDeleted", del);
            toast.show('Content deleted', this.toasTimeout, 'red');
        });
    }
}