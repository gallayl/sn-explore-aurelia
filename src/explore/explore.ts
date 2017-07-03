import { autoinject, bindable } from "aurelia-framework";
import { Repository, Content, ODataApi } from "sn-client-js";
import { SelectionService } from "sn-controls-aurelia";

@autoinject
export class Index{
    
    @bindable
    public RootContent: Content;

    @bindable
    Selection: Content;
    constructor(private snService: Repository.BaseRepository<any, any>) {
    }

    activate(){
        this.snService.Load('/Root', {
            select: ['Name', 'DisplayName', 'Id', 'Path']
        }).subscribe(root=>{
            this.RootContent = root;
        });
    }
}