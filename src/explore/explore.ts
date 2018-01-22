import { MDCTextField } from '@material/textfield/dist/mdc.textfield';
import { autoinject, bindable, computedFrom } from "aurelia-framework";
import { Router } from "aurelia-router";
import { BinaryTextEditor } from "explore/binary-text-editor";
import { Subscription } from "rxjs/subscription";
import { ActionName, Content, ContentTypes, Query, Repository, SavedContent } from "sn-client-js";
import { ActionModel } from "sn-client-js/dist/src/Repository";
import { CollectionView, DeleteContent, SetPermissionsDialog } from "sn-controls-aurelia";
import { AddContentDialog, EditContentDialog } from "sn-controls-aurelia";

@autoinject
export class Index {
    public binaryTextEditor: BinaryTextEditor;
    public setPermissionsDialog: SetPermissionsDialog;
    public searchBar: HTMLInputElement;

    @bindable
    public RootContent: Content;

    @bindable
    public Scope: Content;

    @bindable
    public AllowedChildTypes: Array<{ new(...args): Content }> = [];

    @bindable
    public actionName: ActionName = 'view';

    @bindable
    public isMobile: boolean = false;

    public addContentDialog: AddContentDialog;
    public editContentDialog: EditContentDialog;

    public searchField: MDCTextField;

    public deleteContentComponent: DeleteContent;

    public Subscriptions: Subscription[] = [];

    @bindable
    public ViewType: CollectionView = localStorage.getItem('sn-explore-viewtype') || 'List';

    public ViewTypeChanged() {
        localStorage.setItem('sn-explore-viewtype', this.ViewType);
    }

    @bindable
    public IsDrawerOpened: boolean = true;

    public Select(content: Content) {
        if (content.IsFolder) {
            if (this.Scope.Id === content.Id) {
                this.snService.Load(content.ParentId).subscribe((p) => {
                    this.Scope = p;
                });
            } else {
                this.Scope = content;
            }
        } else {
            this.EditItem(content);
        }
    }

    public setViewType(newType: CollectionView) {
        this.ViewType = newType;
    }

    public clearSubscriptions() {
        this.Subscriptions.forEach((subscription) => {
            subscription.unsubscribe();
        });
        this.Subscriptions = [];
    }

    public GetSelectedChildren(scope: SavedContent, q?: Query): Promise<Content[]> {
        return new Promise((resolve, reject) => scope.Children({
            select: ['Icon', 'ParentId', 'Actions', 'IsFolder'],
            expand: ['Actions'],
            query: q && q.toString(),
            orderby: ['IsFolder desc', 'DisplayName asc'],
            // scenario: 'ListItem'
        }).subscribe(resolve, reject));
    }

    public toggleExploreDrawer() {
        this.IsDrawerOpened = !this.IsDrawerOpened;
    }

    public attached() {
        this.searchField = new MDCTextField(this.searchBar);
    }

    public detached() {
        this.clearSubscriptions();
    }

    constructor(private snService: Repository.BaseRepository,
                private router: Router
            ) {
    }

    public activate(params) {
        if (params.path) {
            this.changePath(params.path);
        }
        this.snService.Load('/Root', {
            select: 'all',
        }).subscribe((root) => {
            this.RootContent = root;
        });
    }

    public ScopeChanged() {
        this.clearSubscriptions();

        this.router.navigateToRoute('explore', { path: this.Scope.Path }, { replace: true });
        this.Scope.GetRepository().Events.OnContentMoved.subscribe((m) => {
            this.router.navigateToRoute('explore', { path: m.Content.Path }, { replace: true });
        });
    }

    @bindable
    public EditedContent: Content;
    public EditItem(content: Content) {
        this.editContentDialog.open(content);
    }
    public changePath(path: string) {
        this.snService.Load(path, { select: 'all' }).subscribe((selection) => {
            this.Scope = selection;
        });
    }

    public resize(param) {
        this.isMobile = param.width <= 600;
    }

    public addContent() {
        this.addContentDialog.open();
    }

    public ContentDropped(content: Content) {
        content.MoveTo(this.Scope.Path);
    }

    public ContentListDropped(contentList: SavedContent[]) {
        this.Scope.GetRepository().MoveBatch(contentList, this.Scope.Path);
    }

    public ContentDroppedOnItem(content: Content, item: Content) {
        content.MoveTo(item.Path);
    }

    public ContentListDroppedOnItem(contentList: SavedContent[], item: Content) {
        this.Scope.GetRepository().MoveBatch(contentList, item.Path);
    }

    public async FilesDropped(event: DragEvent) {
        await this.Scope.UploadFromDropEvent({
            ContentType: ContentTypes.File as any,
            CreateFolders: true,
            Event: event,
            Overwrite: false,
            PropertyName: 'Binary',
        });
    }

    @bindable
    public SelectedContent: SavedContent[];

    @bindable
    public ShowDeleteSelected: boolean = false;

    public DeleteSelected() {
        this.deleteContentComponent.open(this.SelectedContent);
    }

    public SelectedContentChanged() {
        if (this.SelectedContent.length) {
            this.ShowDeleteSelected = true;
        } else {
            this.ShowDeleteSelected = false;
        }
    }

    public searchEnabled = false;
    @bindable
    public queryString = '';

    @computedFrom('queryString', 'searchEnabled')
    public get query(): Query | undefined {
        const searchString = `${this.queryString}*`;
        return this.queryString && this.searchEnabled && new Query((q) =>
            q.InTree(this.Scope.Path).And.Equals('_Text', searchString).Or.Equals('DisplayName', searchString).Or.Equals('Name', searchString)
        );
    }

    public searchInput: HTMLInputElement;

    public toggleSearch() {
        this.searchEnabled = !this.searchEnabled;
        if (this.searchEnabled && this.searchInput) {
            this.searchInput.focus();
        }
    }

    public reloadSchema() {
        /** */
    }

    public getActions(content: Content<ContentTypes.GenericContent>): ActionModel[] {

        return (content.Actions as any as ActionModel[]).filter((a) => {
                return ['Delete', 'SetPermissions', 'Edit', 'BinarySpecial'].indexOf(a.Name) > -1;
            });
    }
    public onAction(content: Content, action: ActionModel) {
        switch (action.Name) {
            case 'Delete':
                this.deleteContentComponent.open([content]);
                break;
            case 'SetPermissions':
                this.setPermissionsDialog.open(content);
                break;
            case 'Edit':
                if (content.GetSchemaWithParents().filter((t) => t.ContentTypeName === 'ContentType').length) {
                    this.binaryTextEditor.open(content);
                } else {
                    this.EditItem(content);
                }
                break;
            case 'BinarySpecial':
                this.binaryTextEditor.open(content);
                break;
            default:
                // console.log(content, action);
                break;

        }
    }
}
