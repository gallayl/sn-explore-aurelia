import { autoinject, bindable, computedFrom, bindingBehavior } from "aurelia-framework";
import { Repository, Content, ODataApi, ContentTypes, ActionName, Query } from "sn-client-js";
import { SelectionService, Tree } from "sn-controls-aurelia";
import { RouterConfiguration, Router } from "aurelia-router";
import { AddContent } from "explore/add-content";
import { Subscription } from "@reactivex/rxjs";

import { CollectionView } from 'sn-controls-aurelia';

@autoinject
export class Index {

    @bindable
    public RootContent: Content;

    @bindable
    Selection: Content;

    @bindable
    AllowedChildTypes: { new(...args): Content }[] = [];

    @bindable
    actionName: ActionName = 'view';

    @bindable
    isMobile: boolean = false;

    addContentComponent: AddContent;
    
    Subscriptions: Subscription[] = [];


    @bindable
    ViewType: CollectionView = 'List';

    @bindable
    IsDrawerOpened: boolean;

    Select(content:Content){
        if (this.Selection.Id === content.Id){
            this.snService.Load(content.ParentId).subscribe(p=>{
                this.Selection = p;
            })
        } else {
            this.Selection = content;
        }
    }

    setViewType(newType: CollectionView){
        this.ViewType = newType;
    }

    clearSubscriptions() {
        this.Subscriptions.forEach(subscription => {
            subscription.unsubscribe();
        });
        this.Subscriptions = [];
    }

    GetSelectedChildren(scope: Content, q?: Query): Promise<Content[]> {
        return new Promise( (resolve, reject) => scope.Children({select: 'all', query: q && q.toString()}).subscribe(resolve, reject));
    }

    toggleExploreDrawer(){
        // this.MdcTreeDrawer.open = !this.MdcTreeDrawer.open;
        this.IsDrawerOpened = !this.IsDrawerOpened;
    }


    attached(){
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

    SelectionChanged(){
        this.clearSubscriptions();
        
        this.router.navigateToRoute('explore', { path: this.Selection.Path }, { replace: true });
        this.Selection.GetRepository().Events.OnContentMoved.subscribe(m=>{
            this.router.navigateToRoute('explore', { path: m.Content.Path }, { replace: true });
        })
    }

    EditedContent: Content;
    async EditItem(content: Content){
        this.EditedContent = content;
        this.EditedContent.Reload('edit').subscribe(c=>{
            // ToDo
            // this.editModal.open();
        })
    }

    changePath(path: string){
        this.snService.Load(path, { select: 'all' }).subscribe((selection) => {
                this.Selection = selection;
        });
    }


    resize(param) {
        this.isMobile = param.width <= 600;
    }

    addContent() {
        this.addContentComponent.open();
    }
}