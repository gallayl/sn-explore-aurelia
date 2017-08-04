import { bindable, computedFrom, autoinject } from "aurelia-framework";
import { Content, ActionName, Repository } from "sn-client-js";
import { Router } from "aurelia-router";
import { DeleteContent } from "explore/delete-content";

@autoinject
export class ExploreEdit {

    constructor(private snService: Repository.BaseRepository, private router: Router) {
    }

    @bindable
    Selection: Content;

    @bindable
    isContentLoading: boolean = false;

    @bindable
    actionName: ActionName = 'edit';

    @bindable
    canEdit: boolean = false;

    deleteContentDialog: DeleteContent;

    @computedFrom('actionName', 'canEdit')
    public get showEdit(){
        return this.canEdit && this.actionName == 'view';
    }

    @computedFrom('actionName', 'canEdit')
    public get showDelete(){
        return this.canDelete && this.actionName == 'view';
    }

    @bindable
    canDelete: boolean = false;


    @computedFrom('Selection', 'actionName')
    public get Schema() {
        return this.Selection && this.Selection.GetSchema();
    }

    SelectionChanged() {
        this.isContentLoading = true;

        this.Selection.HasPermission(['Save']).subscribe(p => {
            this.canEdit = p
        });

        this.Selection.HasPermission(['Delete']).subscribe(p => {
            this.canDelete = p
        });

        this.snService.Load(this.Selection.Id, { select: 'all' }).subscribe(() => { this.isContentLoading = false; }, () => { this.isContentLoading = false; });
    }

    edit() {
        this.actionName = 'edit';
    }
    
    delete(){
        this.deleteContentDialog.open([this.Selection]);
    }


    save(){
        this.Selection.Save();
    }

    cancel(){
        const savedFields = JSON.parse(JSON.stringify(this.Selection.SavedFields));
        Object.assign(this.Selection, savedFields);
        this.actionName = 'view';
    }


}