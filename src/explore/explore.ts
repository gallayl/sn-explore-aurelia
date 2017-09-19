import { autoinject, bindable, computedFrom, bindingBehavior } from "aurelia-framework";
import { Repository, Content, ODataApi, ContentTypes, ActionName, Query } from "sn-client-js";
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
    ViewType: CollectionView = 'List';

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
        return new Promise((resolve, reject) => scope.Children({ select: 'all', query: q && q.toString() }).subscribe(resolve, reject));
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

    exploreActions: {name: string, action: (c:Content)=>void}[] = [
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
}