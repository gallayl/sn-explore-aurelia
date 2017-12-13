import { autoinject, bindable, computedFrom, bindingBehavior } from "aurelia-framework";
import { BindingSignaler } from 'aurelia-templating-resources';
import { Repository, Content, ODataApi, ContentTypes, ActionName, Query, ODataHelper, SavedContent, ContentInternal } from "sn-client-js";
import { SelectionService, Tree, CollectionView, DeleteContent } from "sn-controls-aurelia";
import { RouterConfiguration, Router } from "aurelia-router";
import { AddContentDialog, EditContentDialog } from "sn-controls-aurelia";
import { Subscription } from "rxjs/subscription";
import { MDCDialog } from '@material/dialog';
import { MDCTextField } from '@material/textfield/dist/mdc.textfield';
import { ActionModel } from "sn-client-js/dist/src/Repository";

@autoinject
export class Index {
    searchBar: HTMLInputElement;

    private readonly queryChanged: string = 'explore-query-changed';

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

    addContentDialog: AddContentDialog;
    editContentDialog: EditContentDialog;

    deleteContentComponent: DeleteContent;

    Subscriptions: Subscription[] = [];


    @bindable
    ViewType: CollectionView = localStorage.getItem('sn-explore-viewtype') || 'List';

    ViewTypeChanged(){
        localStorage.setItem('sn-explore-viewtype', this.ViewType);
    }

    @bindable
    IsDrawerOpened: boolean = true;    

    Select(content: Content) {
        if (content.IsFolder){
            if (this.Scope.Id === content.Id) {
                this.snService.Load(content.ParentId).subscribe(p => {
                    this.Scope = p;
                })
            } else {
                this.Scope = content;
            }
        } else {
            this.EditItem(content);
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

    GetSelectedChildren(scope: SavedContent, q?: Query): Promise<Content[]> {
        return new Promise((resolve, reject) => scope.Children({ 
            select: ['Icon', 'ParentId', 'Actions', 'IsFolder'],
            expand: ['Actions'],
            query: q && q.toString(),
            orderby:['IsFolder desc', 'DisplayName asc'],
            scenario: 'ListItem'
        }).subscribe(resolve, reject));
    }

    toggleExploreDrawer() {
        this.IsDrawerOpened = !this.IsDrawerOpened;
    }


    attached() {
        new MDCTextField(this.searchBar)
    }

    detached() {
        this.clearSubscriptions();
    }

    constructor(private snService: Repository.BaseRepository,
                private router: Router,
                private readonly bindingSignaler: BindingSignaler
            ) {
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
        this.editContentDialog.open(content);
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
        this.addContentDialog.open();
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
    }

    searchEnabled = false;
    @bindable
    queryString = '';


    @computedFrom('queryString', 'searchEnabled')
    public get query():Query | undefined{
        return this.queryString && this.searchEnabled && new Query(q=>
            q.Equals('_Text', this.queryString + '*')
        );
    }
    
    searchInput: HTMLInputElement;

    toggleSearch(){
        this.searchEnabled = !this.searchEnabled;
        if (this.searchEnabled && this.searchInput){
            this.searchInput.focus();
        }
    }

    onAction(content: Content, action: ActionModel){
        switch (action.Name){
            case 'Delete':
                this.deleteContentComponent.open([content]);
                break;
            default:
                console.log(content, action);
                break;

        }
    }
}