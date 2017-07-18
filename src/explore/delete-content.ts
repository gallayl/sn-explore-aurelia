import { customElement, bindable } from "aurelia-framework";
import { Content } from "sn-client-js";
import { MdModal } from "aurelia-materialize-bridge/dist/aurelia-materialize-bridge";

@customElement('delete-content')
export class DeleteContent{
    @bindable
    contents: Content[];

    @bindable
    permanently: boolean = false;

    deleteContentModal: MdModal;


    open(contents: Content[]){
        this.contents = contents;
        this.permanently = false;
        this.deleteContentModal.open();
    }

    cancel(){
        this.deleteContentModal.close();
    }


    async delete(){
        await Promise.all(this.contents.map(c=>c.Delete(this.permanently).toPromise()));
        this.deleteContentModal.close();
    }
}