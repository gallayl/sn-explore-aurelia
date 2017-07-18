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
    actionName: ActionName = 'view';

    @bindable
    canEdit: boolean = false;

    deleteContentDialog: DeleteContent;

    @computedFrom('actionName', 'canEdit')
    public get showEdit(){
        return this.canEdit && this.actionName == 'view';
    }

    @bindable
    canDelete: boolean = false;




    @computedFrom('Selection', 'actionName')
    public get Schema() {
        this.router.navigateToRoute('explore', { path: this.Selection.Path }, { replace: true });
        return this.Selection && this.Selection.GetSchema();
    }

    SelectionChanged() {
        this.isContentLoading = true;
        this.actionName = 'view';

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


}