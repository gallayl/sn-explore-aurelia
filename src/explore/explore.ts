import { autoinject, bindable, computedFrom } from "aurelia-framework";
import { Repository, Content, ODataApi } from "sn-client-js";
import { SelectionService } from "sn-controls-aurelia";
import { RouterConfiguration, Router } from "aurelia-router";

@autoinject
export class Index {

    @bindable
    public RootContent: Content;

    @bindable
    Selection: Content;

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
    }
}