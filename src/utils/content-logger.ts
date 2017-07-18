import { autoinject } from 'aurelia-framework';
import { Repository } from "sn-client-js";
import { MdToastService } from "aurelia-materialize-bridge";

@autoinject
export class ContentLogger {

    private readonly toasTimeout: number = 4000;

    constructor(private repo: Repository.BaseRepository, toast: MdToastService) {
        this.repo.OnContentLoaded.subscribe(p => {
            console.log('OnContentLoaded', p);
        });

        this.repo.OnContentCreated.subscribe(mod => {
            console.log("OnContentCreated", mod);
            toast.show('Content created', this.toasTimeout, 'green');
        });
        this.repo.OnContentCreateFailed.subscribe(mod => {
            console.log("OnContentCreateFailed", mod);
            toast.show('Failed to create content', this.toasTimeout, 'red');
        });

        this.repo.OnContentModified.subscribe(mod => {
            console.log("OnContentModified", mod);
            toast.show('Content modified', this.toasTimeout, 'green');
        });
        this.repo.OnContentModificationFailed.subscribe(mod => {
            console.log("OnContentModificationFailed", mod);
            toast.show('Content modified', this.toasTimeout, 'red');
        });


        this.repo.OnContentDeleted.subscribe(del => {
            console.log("OnContentDeleted", del);
            toast.show('Content deleted', this.toasTimeout, 'red');
        });
    }
}