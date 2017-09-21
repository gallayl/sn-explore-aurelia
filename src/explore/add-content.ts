import { customElement, bindable } from "aurelia-framework";
import { Content } from "sn-client-js";
import { Schemas, ContentTypes, Repository } from "sn-client-js";
import { MDCDialog } from '@material/dialog';

@customElement('add-content')
export class AddContent {
    @bindable
    errorMessage: string;

    @bindable
    isLoading: boolean;

    @bindable
    parent: Content;

    createContentDialog: HTMLElement;

    createContentMDCDialog: MDCDialog;

    constructor(private snService: Repository.BaseRepository) {
    }

    attached() {
        this.createContentMDCDialog = new MDCDialog(this.createContentDialog);
    }    

    parentChanged() {
        this.AvailableSchemas = [];
    }

    @bindable
    SelectedSchema: Schemas.Schema<Content>;

    @bindable
    NewContent: Content;

    @bindable
    AvailableSchemas = []

    selectSchema(newSchema: Schemas.Schema<Content>) {
        this.SelectedSchema = newSchema;
        this.NewContent = Content.Create({
            Path: this.parent.Path
        }, this.SelectedSchema.ContentType, this.snService);
        console.log("Schema changed, create new Content...");
    }


    open: () => void = () => {
        // ToDo
        this.createContentMDCDialog.show();
        this.SelectedSchema = null;
        this.isLoading = true;
        this.errorMessage = null;
        this.NewContent = null;

        this.parent.GetEffectiveAllowedChildTypes({
            select: ['Name']
        }).subscribe(cts => {
            this.isLoading = false;
            this.AvailableSchemas = cts.map(ct => {
                return ContentTypes[ct.Name] && Content.GetSchema(ContentTypes[ct.Name]);
            }).filter(ct => ct != null);
        }, (err) => {
            this.isLoading = false;
            this.errorMessage = "There was an error loading the allowed content types." + err
            this.AvailableSchemas = [];
        });
    }

    create(){
        this.NewContent.Save().subscribe(c=>{
            this.createContentMDCDialog.close();
        });
    }

    cancel(){
        this.createContentMDCDialog.close();
    }
}