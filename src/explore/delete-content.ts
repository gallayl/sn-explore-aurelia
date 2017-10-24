import { customElement, bindable } from "aurelia-framework";
import { Content, SavedContent } from "sn-client-js";
import { MDCDialog } from '@material/dialog';

@customElement('delete-content')
export class DeleteContent{
    @bindable
    contents: SavedContent[];

    @bindable
    permanently: boolean = false;

    deleteContentDialog: HTMLElement;
    deleteContentMDCDialog: MDCDialog;

    attached(){
        this.deleteContentMDCDialog = new MDCDialog(this.deleteContentDialog);
    }


    open(contents: SavedContent[]){
        this.contents = contents;
        this.permanently = false;
        this.deleteContentMDCDialog.show();
    }

    cancel(){
        this.deleteContentMDCDialog.close();
    }


    async delete(){
        this.deleteContentMDCDialog.close();
        await this.contents[0].GetRepository().DeleteBatch(this.contents, this.permanently).toPromise()
    }
}