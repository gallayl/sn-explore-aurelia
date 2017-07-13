import { autoinject, bindable, computedFrom, bindingBehavior } from "aurelia-framework";
import { Repository, Content, ODataApi, ContentTypes, ActionName } from "sn-client-js";
import { SelectionService, Tree } from "sn-controls-aurelia";
import { RouterConfiguration, Router } from "aurelia-router";


@autoinject
export class Index {

    @bindable
    public RootContent: Content;

    @bindable
    Selection: Content;

    @bindable
    AllowedChildTypes: {new(...args): Content}[] = [];

    @bindable
    actionName: ActionName = 'view';

    @bindable
    isMobile: boolean = false;
    

    constructor(private snService: Repository.BaseRepository, private router: Router) {
    }

    @computedFrom('Selection')
    public get Schema() {
        this.router.navigateToRoute('explore', { path: this.Selection.Path }, { replace: true });
        return this.Selection && this.Selection.GetSchema();
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
        this.SelectionChanged();
    }

    SelectionChanged() {
        this.actionName = 'view';
        this.Selection.GetEffectiveAllowedChildTypes({
            select: ['Name']
        }).subscribe(cts => {
            this.AllowedChildTypes = cts.map(ct => {
                return ContentTypes[ct.Name];
            }).filter(ct=> ct != null);
            console.log(this.AllowedChildTypes);
        },err=>{
            this.AllowedChildTypes = [];
        });
    }

    resize(param){
        this.isMobile = param.width <= 600;
    }
}