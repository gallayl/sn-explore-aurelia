import { customElement, bindable } from "aurelia-framework";
import { Content } from "sn-client-js";
import { MdModal } from "aurelia-materialize-bridge/dist/aurelia-materialize-bridge";
import { Schemas, ContentTypes, Repository } from "sn-client-js";

@customElement('add-content')
export class AddContent {
    @bindable
    errorMessage: string;

    @bindable
    isLoading: boolean;

    @bindable
    parent: Content;

    constructor(private snService: Repository.BaseRepository) {
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

    addContentModal: MdModal;

    open: () => void = () => {
        this.addContentModal.open();
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
            console.log(this.AvailableSchemas);
        }, (err) => {
            this.isLoading = false;
            this.errorMessage = "There was an error loading the allowed content types." + err
            this.AvailableSchemas = [];
        });
    }

    create(){
        this.NewContent.Save().subscribe(c=>{
            this.addContentModal.close();
        });
    }

    cancel(){
        this.addContentModal.close();
    }
}