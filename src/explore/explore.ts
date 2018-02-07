import { MDCTextField } from '@material/textfield/dist/mdc.textfield';
import { autoinject, bindable, computedFrom } from "aurelia-framework";
import { Router } from "aurelia-router";
import { BinaryTextEditor } from "explore/binary-text-editor";
import { SetPermissionsDialog, AddContentDialog, EditContentDialog, DeleteContent, CollectionView} from "@sensenet/controls-aurelia";
import { IContent, Repository, Upload } from '@sensenet/client-core';
import { ActionName } from '@sensenet/control-mapper';
import { GenericContent, IActionModel } from '@sensenet/default-content-types';
import { Query } from '@sensenet/query';
import { EventHub } from '@sensenet/repository-events';
import { IDisposable } from '@sensenet/client-utils/dist/Disposable';

@autoinject
export class Index {
    public binaryTextEditor: BinaryTextEditor;
    public setPermissionsDialog: SetPermissionsDialog;
    public searchBar: HTMLInputElement;

    @bindable
    public rootContent: IContent;

    @bindable
    public scope: IContent;

    @bindable
    public AllowedChildTypes: Array<{ new(...args): IContent }> = [];

    @bindable
    public actionName: ActionName = 'view';

    @bindable
    public isMobile: boolean = false;

    public addContentDialog: AddContentDialog;
    public editContentDialog: EditContentDialog;

    public searchField: MDCTextField;

    public deleteContentComponent: DeleteContent;

    @bindable
    public ViewType: CollectionView = localStorage.getItem('sn-explore-viewtype') as any || 'List';

    public ViewTypeChanged() {
        localStorage.setItem('sn-explore-viewtype', this.ViewType);
    }

    @bindable
    public IsDrawerOpened: boolean = true;

    public async Select(content: GenericContent) {
        if (content.IsFolder) {
            if (this.scope.Id === content.Id) {
                this.scope = (await this.snService.load({
                    idOrPath: content.ParentId,
                })).d;
            } else {
                this.scope = content;
            }
        } else {
            this.EditItem(content);
        }
    }

    public setViewType(newType: CollectionView) {
        this.ViewType = newType;
    }


    public async GetSelectedChildren(scope: GenericContent, q?: Query<IContent>): Promise<IContent[]> {
        const collection = await this.snService.loadCollection<any>({
            path: scope.Path,
            oDataOptions: {            
                select: ['Icon', 'ParentId', 'Actions', 'IsFolder'],
                expand: ['Actions'],
                query: q && q.toString(),
                orderby: ['IsFolder desc', 'DisplayName asc'],}
        });
        return collection.d.results;
    }

    public toggleExploreDrawer() {
        this.IsDrawerOpened = !this.IsDrawerOpened;
    }

    public attached() {
        this.searchField = new MDCTextField(this.searchBar);
    }

    public detached() {
        this.contentMoveSubscription.dispose();
        this.eventHub.dispose;
    }
    private eventHub: EventHub;

    constructor(private snService: Repository,
                private router: Router
            ) {
                this.eventHub = new EventHub(this.snService);
    }

    public async activate(params) {
        if (params.path) {
            this.changePath(params.path);
        }
        this.rootContent = (await this.snService.load({
            idOrPath: '/Root',
            oDataOptions: {
            select: 'all',
            }
        })).d;
    }

    private contentMoveSubscription: IDisposable;
    public scopeChanged() {
        this.contentMoveSubscription && this.contentMoveSubscription.dispose();
        this.router.navigateToRoute('explore', { path: this.scope.Path }, { replace: true });
        this.contentMoveSubscription = this.eventHub.onContentMoved.subscribe((m)=>{
            this.router.navigateToRoute('explore', { path: m.content.Path }, { replace: true });
        })
    }

    @bindable
    public EditedContent: IContent;
    public EditItem(content: IContent) {
        this.editContentDialog.open(content);
    }
    public changePath(path: string) {
        this.snService.load({
            idOrPath: path,
            oDataOptions: { select: 'all' }
        }).then((selection) => {
            this.scope = selection.d;
        });
    }

    public resize(param) {
        this.isMobile = param.width <= 600;
    }

    public addContent() {
        this.addContentDialog.open();
    }

    public ContentDropped(content: IContent) {
        this.snService.move({
            targetPath: this.scope.Path,
            idOrPath: content.Id,
        })
    }

    public ContentListDropped(contentList: IContent[]) {
        this.snService.move({
            targetPath: this.scope.Path,
            idOrPath: contentList.map(c=>c.Id),
        })        
    }

    public ContentDroppedOnItem(content: IContent, item: IContent) {
        this.snService.move({
            targetPath: item.Path,
            idOrPath: content.Id,
        })
    }

    public ContentListDroppedOnItem(contentList: IContent[], item: IContent) {
        this.snService.move({
            targetPath: item.Path,
            idOrPath: contentList.map(c=>c.Id),
        })        
    }

    public async FilesDropped(_event: DragEvent) {
        await Upload.fromDropEvent({
            event: _event,
            contentTypeName: "File",
            parentPath: this.scope.Path,
            createFolders: true,
            repository: this.snService,
            binaryPropertyName: "Binary",
            overwrite: true,
        })
    }

    @bindable
    public selectedContent: IContent[];

    @bindable
    public showDeleteSelected: boolean = false;

    public DeleteSelected() {
        this.deleteContentComponent.open(this.selectedContent);
    }

    public selectedContentChanged() {
        if (this.selectedContent.length) {
            this.showDeleteSelected = true;
        } else {
            this.showDeleteSelected = false;
        }
    }

    public searchEnabled = false;
    @bindable
    public queryString = '';

    @computedFrom('queryString', 'searchEnabled')
    public get query(): Query<IContent> | undefined {
        const searchString = `${this.queryString}*`;
        return this.queryString && this.searchEnabled && new Query((q) =>
            q.inTree(this.scope.Path).and.equals('_Text', searchString).or.equals('DisplayName', searchString).or.equals('Name', searchString)
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

    public getActions(content: GenericContent): IActionModel[] {

        return ((content as any).Actions as IActionModel[]).filter((a) => {
                return ['Delete', 'SetPermissions', 'Edit', 'BinarySpecial'].indexOf(a.Name) > -1;
            });
    }
    public onAction(content: IContent, action: IActionModel) {
        switch (action.Name) {
            case 'Delete':
                this.deleteContentComponent.open([content]);
                break;
            case 'SetPermissions':
                this.setPermissionsDialog.open(content);
                break;
            case 'Edit':
                if (content.Type === "ContentType"){
                    this.binaryTextEditor.open(this.snService, content as any);
                } else {
                    this.EditItem(content);
                }
                break;
            case 'BinarySpecial':
                this.binaryTextEditor.open(this.snService, content as any);
                break;
            default:
                break;
        }
    }
}
