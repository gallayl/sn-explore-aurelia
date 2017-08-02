import { autoinject, bindable, computedFrom, bindingBehavior } from "aurelia-framework";
import { Repository, Content, ODataApi, ContentTypes, ActionName } from "sn-client-js";
import { SelectionService, Tree } from "sn-controls-aurelia";
import { RouterConfiguration, Router } from "aurelia-router";
import { MdModal } from 'aurelia-materialize-bridge'
import { AddContent } from "explore/add-content";
import { Subscription } from "@reactivex/rxjs";

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

    clearSubscriptions() {
        this.Subscriptions.forEach(subscription => {
            subscription.unsubscribe();
        });
        this.Subscriptions = [];
    }

    detached() {
        this.clearSubscriptions();
    }

    constructor(private snService: Repository.BaseRepository, private router: Router) {
    }

    activate(params) {
        if (params.path) {
            this.snService.Load(params.path, { select: 'all' }).subscribe((selection) => {
                this.Selection = selection;
            });
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


    resize(param) {
        this.isMobile = param.width <= 600;
    }

    addContent() {
        this.addContentComponent.open();
    }
}