import { MDCSnackbar } from '@material/snackbar';
import { MDCDialog } from '@material/dialog';
import { autoinject, bindable } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { Repository } from "sn-client-js";


@autoinject
export class Snackbar {

    private readonly Info_Timeout = 5000;

    private readonly Warning_Timeout = 15000;

    private readonly Error_Timeout = 15000;

    private MDCSnackBar: MDCSnackbar;
    private MDCDialog: MDCDialog;

    @bindable
    private DialogTitle: string = "";

    @bindable DialogHtml: string;

    private tryGetErrorResponseMessage(error: any){
        var result = null;
        try {
            result = error.xhr.response.error.message.value
        } catch (error) {
            // ignore
        }

        return result;
    }

    constructor(
        private readonly repository: Repository.BaseRepository,
        private readonly router: Router
    ) {

        this.repository.Events.OnContentCreated.subscribe(c => {
            const summary = `'${c.Content.DisplayName}' has been created.`;
            this.MDCSnackBar.show({
                message: summary,
                actionText: 'Details',
                timeout: this.Info_Timeout,
                actionHandler: () => {
                    this.DialogTitle = summary;
                    this.DialogHtml = `The content has been created and saved to the sensenet ECM Repository. <br /> Content path: <i>${c.Content.Path}</i>`;
                    this.MDCDialog.show();
                }
            });
        });

        this.repository.Events.OnContentCreateFailed.subscribe(c => {
            this.MDCSnackBar.show({
                message: this.tryGetErrorResponseMessage(c.Error) || `Failed to create content '${c.Content.DisplayName}'.`,
                actionText: 'Details',
                timeout: this.Error_Timeout,               
                actionHandler: () => {
                    this.MDCDialog.show();
                }
            });
        });

        this.repository.Events.OnContentModified.subscribe(c => {
            const summary = `'${c.Content.DisplayName}' has been modified.`;
            this.MDCSnackBar.show({
                message: summary,
                actionText: 'Details',
                timeout: this.Info_Timeout,
                actionHandler: () => {
                    this.DialogTitle = summary;
                    this.DialogHtml = `<p>The content has been modified and saved to the sensenet ECM Repository. <br /> Content path: <i>${c.Content.Path}</i> </p> Changes: <br /> <textarea style="width: 100%; height: 200px;" readonly>${JSON.stringify(c.Changes, null, 3)}</textarea> `;
                    this.MDCDialog.show();
                }
            });
        });

        this.repository.Events.OnContentModificationFailed.subscribe(c=>{
            const summary = this.tryGetErrorResponseMessage(c.Error) || `Failed to modify '${c.Content.DisplayName}'`          
            this.MDCSnackBar.show({
                message: summary,
                actionText: 'Details',
                timeout: this.Error_Timeout,                
                actionHandler: () => {
                    this.DialogTitle = summary;
                    this.DialogHtml = `<p>There was an error during saving the content to the sensenet ECM Repository. <br /> Content path: <i>${c.Content.Path}</i> </p> 
                            Fields: <br /> 
                            <textarea style="width: 100%; height: 50px;" readonly>${JSON.stringify(c.Fields, null, 3)}</textarea>  <br />
                            Request <br />
                            <textarea style="width: 100%; height: 150px;" readonly>${JSON.stringify(c.Error, null, 3)}</textarea>
                            Response <br />
                            <textarea style="width: 100%; height: 150px;" readonly>${JSON.stringify(c.Error.xhr.response, null, 3)}</textarea>
                            `;
                    this.MDCDialog.show();
                }
            });
        });

        this.repository.Events.OnContentDeleted.subscribe(c=>{
            const summary = `'${c.ContentData.DisplayName}' has been ${c.Permanently ? 'deleted' : 'moved to trash'}.`;
            this.MDCSnackBar.show({
                message: summary,
                actionText: 'Details',
                timeout: this.Info_Timeout,
                actionHandler: () => {
                    this.DialogTitle = summary;
                    this.DialogHtml = `Content path: <i>${c.ContentData.Path}</i> </p> Content Data: <br /> <textarea style="width: 100%; height: 200px;" readonly>${JSON.stringify(c.ContentData, null, 3)}</textarea> `;
                    this.MDCDialog.show();
                }
            });
        })

        this.repository.Events.OnContentDeleteFailed.subscribe(c=>{
            const summary = this.tryGetErrorResponseMessage(c.Error) || `Failed to  ${c.Permanently ? 'delete' : 'move to trash'} '${c.Content.DisplayName}'`          
            this.MDCSnackBar.show({
                message: summary,
                actionText: 'Details',
                timeout: this.Error_Timeout,                
                actionHandler: () => {
                    this.DialogTitle = summary;
                    this.DialogHtml = `<br /> Content path: <i>${c.Content.Path}</i> </p> 
                            Fields: <br /> 
                            <textarea style="width: 100%; height: 50px;" readonly>${JSON.stringify(c.Content.options, null, 3)}</textarea>  <br />
                            Request <br />
                            <textarea style="width: 100%; height: 150px;" readonly>${JSON.stringify(c.Error, null, 3)}</textarea>
                            Response <br />
                            <textarea style="width: 100%; height: 150px;" readonly>${JSON.stringify(c.Error.xhr.response, null, 3)}</textarea>
                            `;
                    this.MDCDialog.show();
                }
            });
        });        

        this.repository.Events.OnContentMoved.subscribe(c=>{
            const summary = `'${c.Content.DisplayName}' has been moved to '${c.To}'.`;
            this.MDCSnackBar.show({
                message: summary,
                actionText: 'Details',
                timeout: this.Info_Timeout,
                actionHandler: () => {
                    this.DialogTitle = summary;
                    this.DialogHtml = `Original Path: <i>${c.From}</i> <br /> Target: <i>${c.To}</i>`;
                    this.MDCDialog.show();
                }
            });
        })

        this.repository.Events.OnContentMoveFailed.subscribe(c=>{
            const summary = this.tryGetErrorResponseMessage(c.Error) || `Failed to move '${c.Content.DisplayName}' from '${c.From}' to '${c.To}'`
            this.MDCSnackBar.show({
                message: summary,
                multiline: true,
                actionText: 'Details',
                timeout: this.Error_Timeout,                
                actionHandler: () => {
                    this.DialogTitle = summary;
                    this.DialogHtml = `
                            Original path: <i>${c.From}</i> <br />
                            Target path: <i>${c.To}</i><br />
                            Request <br />
                            <textarea style="width: 100%; height: 130px;" readonly>${JSON.stringify(c.Error, null, 3)}</textarea>
                            Response <br />
                            <textarea style="width: 100%; height: 130px;" readonly>${JSON.stringify(c.Error.xhr.response, null, 3)}</textarea>
                            `;
                    this.MDCDialog.show();
                }
            });
        });   

    }

    attached() {
        this.MDCSnackBar = new MDCSnackbar(document.querySelector('.snackbar-wrapper .mdc-snackbar'));
        this.MDCDialog = new MDCDialog(document.querySelector('.snackbar-wrapper .mdc-details-dialog'))
    }
}