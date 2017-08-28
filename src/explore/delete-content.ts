import { customElement, bindable } from "aurelia-framework";
import { Content } from "sn-client-js";

@customElement('delete-content')
export class DeleteContent{
    @bindable
    contents: Content[];

    @bindable
    permanently: boolean = false;

    // ToDo
    //    deleteContentModal: MdModal;


    open(contents: Content[]){
        this.contents = contents;
        this.permanently = false;
        // ToDo
        // this.deleteContentModal.open();
    }

    cancel(){
        // ToDo
        // this.deleteContentModal.close();
    }


    async delete(){
        await Promise.all(this.contents.map(c=>c.Delete(this.permanently).toPromise()));
        // ToDo
        // this.deleteContentModal.close();
    }
}