import { autoinject, bindable, computedFrom, bindingBehavior } from "aurelia-framework";
import { Repository, Content, ODataApi, ContentTypes, ActionName, Query, ODataHelper, SavedContent } from "sn-client-js";
import { SelectionService, Tree } from "sn-controls-aurelia";
import { RouterConfiguration, Router } from "aurelia-router";
import { AddContent } from "explore/add-content";
import { Subscription } from "@reactivex/rxjs";
import { MDCDialog } from '@material/dialog';
import { CollectionView } from 'sn-controls-aurelia';
import { DeleteContent } from "explore/delete-content";

@autoinject
export class Index {

    @bindable
    public RootContent: Content;

    @bindable
    Scope: Content;

    @bindable
    AllowedChildTypes: { new(...args): Content }[] = [];

    @bindable
    actionName: ActionName = 'view';

    @bindable
    isMobile: boolean = false;

    addContentComponent: AddContent;

    deleteContentComponent: DeleteContent;

    Subscriptions: Subscription[] = [];


    @bindable
    ViewType: CollectionView = localStorage.getItem('sn-explore-viewtype') || 'List';

    ViewTypeChanged(){
        localStorage.setItem('sn-explore-viewtype', this.ViewType);
    }

    @bindable
    IsDrawerOpened: boolean = true;

    editContentDialog: HTMLElement;
    editMdcDialog: MDCDialog;
    

    Select(content: Content) {
        if (this.Scope.Id === content.Id) {
            this.snService.Load(content.ParentId).subscribe(p => {
                this.Scope = p;
            })
        } else {
            this.Scope = content;
        }
    }

    setViewType(newType: CollectionView) {
        this.ViewType = newType;
    }

    clearSubscriptions() {
        this.Subscriptions.forEach(subscription => {
            subscription.unsubscribe();
        });
        this.Subscriptions = [];
    }

    GetSelectedChildren(scope: Content, q?: Query): Promise<Content[]> {
        return new Promise((resolve, reject) => scope.Children({ select: ['Icon'], query: q && q.toString() }).subscribe(resolve, reject));
    }

    toggleExploreDrawer() {
        this.IsDrawerOpened = !this.IsDrawerOpened;
    }


    attached() {
        this.editMdcDialog = new MDCDialog(this.editContentDialog);
    }

    detached() {
        this.clearSubscriptions();
    }

    constructor(private snService: Repository.BaseRepository, private router: Router) {
    }

    activate(params) {
        if (params.path) {
            this.changePath(params.path);
        }
        this.snService.Load('/Root', {
            select: 'all'
        }).subscribe(root => {
            this.RootContent = root;
        });
    }

    ScopeChanged() {
        this.clearSubscriptions();

        this.router.navigateToRoute('explore', { path: this.Scope.Path }, { replace: true });
        this.Scope.GetRepository().Events.OnContentMoved.subscribe(m => {
            this.router.navigateToRoute('explore', { path: m.Content.Path }, { replace: true });
        })
    }

    @bindable
    EditedContent: Content;
    EditItem(content: Content) {
        this.EditedContent = content;
        content.Reload('edit').subscribe(c => {
            this.editMdcDialog.show();
        })
    }

    async SaveEditedContent(){
        this.EditedContent.Save().subscribe(()=>{
            this.editMdcDialog.close();
        });
    }

    exploreActions: {name: string, action: (c:SavedContent)=>void}[] = [
        {
            name: 'Edit',
            action: (c) => {
                this.EditItem(c);
            }
        },
        {
            name: "Delete",
            action: (c) => {
                this.deleteContentComponent.open([c]);
            }
        }
    ]

    changePath(path: string) {
        this.snService.Load(path, { select: 'all' }).subscribe((selection) => {
            this.Scope = selection;
        });
    }


    resize(param) {
        this.isMobile = param.width <= 600;
    }

    addContent() {
        this.addContentComponent.open();
    }


    ContentDropped(content:Content){
        content.MoveTo(this.Scope.Path);
    }

    ContentListDropped(contentList: SavedContent[]){
        this.Scope.GetRepository().MoveBatch(contentList, this.Scope.Path);
    }

    ContentDroppedOnItem(content: Content, item: Content){
        content.MoveTo(item.Path);
    }

    ContentListDroppedOnItem(contentList: SavedContent[], item: Content){
        this.Scope.GetRepository().MoveBatch(contentList, item.Path)
    }



    async FilesDropped(event: DragEvent, files: FileList){
        await this.Scope.UploadFromDropEvent({
            ContentType: ContentTypes.File as any,
            CreateFolders: true,
            Event: event,
            Overwrite: false,
            PropertyName: 'Binary'
        });
    }

    @bindable
    SelectedContent: SavedContent[];

    @bindable
    ShowDeleteSelected: boolean = false;

    DeleteSelected(){
        this.deleteContentComponent.open(this.SelectedContent);
    }

    SelectedContentChanged(){
        if (this.SelectedContent.length){
            this.ShowDeleteSelected = true;
        } else {
            this.ShowDeleteSelected = false;
        }
        console.log(this.SelectedContent);
    }
}