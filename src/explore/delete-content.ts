import { customElement, bindable } from "aurelia-framework";
import { Content } from "sn-client-js";
import { MDCDialog } from '@material/dialog';

@customElement('delete-content')
export class DeleteContent{
    @bindable
    contents: Content[];

    @bindable
    permanently: boolean = false;

    deleteContentDialog: HTMLElement;
    deleteContentMDCDialog: MDCDialog;

    attached(){
        this.deleteContentMDCDialog = new MDCDialog(this.deleteContentDialog);
    }


    open(contents: Content[]){
        this.contents = contents;
        this.permanently = false;
        this.deleteContentMDCDialog.show();
    }

    cancel(){
        this.deleteContentMDCDialog.close();
    }


    async delete(){

        //ToDo: Batch action

        await Promise.all(this.contents.map(c=>c.Delete(this.permanently).toPromise()));

        this.deleteContentMDCDialog.close();
    }
}