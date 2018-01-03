import { MDCDialog } from '@material/dialog';
import { MDCSnackbar } from '@material/snackbar';
import { autoinject, bindable } from 'aurelia-framework';
import 'rxjs/add/operator/debounceTime';
import { Subject } from 'rxjs/Subject';
import { Repository } from "sn-client-js";

import groupBy from 'lodash.groupby';

export enum SnackEventType {
    Created = 'created',
    CreateFailed = 'createFailed',
    Modified = 'modified',
    ModifyFailed = 'modifyFailey',
    Deleted = 'deleted',
    DeleteFailed = 'deleteFailed',
    Moved = 'moved',
    MoveFailed = 'moveFailed'

}

export class SnackInfo {
    public Type: SnackEventType;
    public Message: string;
    public DialogHtml: string;
    public BulkMessage: string;
}

export class BulkSnackInfo<T extends SnackInfo> {
    public Infos: T[];
}

@autoinject
export class Snackbar {

    public InfosSubject: Subject<SnackInfo> = new Subject<SnackInfo>();

    @bindable
    public ActualInfos: SnackInfo[] = [];

    @bindable
    public Message: string;

    private readonly debounceTime = 10000;

    private snackbarElement: HTMLDivElement;
    private MDCSnackBar: MDCSnackbar;
    private MDCDialog: MDCDialog;

    @bindable
    private DialogTitle: string = "";

    @bindable public DialogHtml: string;

    private tryGetErrorResponseMessage(error: any) {
        let result = null;
        try {
            result = error.xhr.response.error.message.value;
        } catch (error) {
            // ignore
        }

        return result;
    }

    constructor(
        private readonly repository: Repository.BaseRepository
    ) {

        this.repository.Events.OnContentCreated.subscribe((c) => {
            const summary = `'${c.Content.DisplayName || c.Content.Name}' has been created.`;
            this.InfosSubject.next({
                Type: SnackEventType.Created,
                Message: summary,
                DialogHtml: `The content has been created and saved to the sensenet ECM Repository. <br /> Content path: <i>${c.Content.Path}</i>`,
                BulkMessage: '{0} content has been created'
            });
        });

        this.repository.Events.OnContentCreateFailed.subscribe((c) => {
            this.InfosSubject.next({
                Type: SnackEventType.CreateFailed,
                Message: this.tryGetErrorResponseMessage(c.Error) || `Failed to create content '${c.Content.DisplayName || c.Content.Name}'.`,
                DialogHtml: `There was an error during creating the content '${c.Content.Name}'`,
                BulkMessage: 'Failed to create {0} content'
            });
        });

        this.repository.Events.OnContentModified.subscribe((c) => {
            this.InfosSubject.next({
                Type: SnackEventType.Modified,
                Message: `'${c.Content.DisplayName}' has been modified.`,
                BulkMessage: '{0} content has been modified',
                DialogHtml: `<p>The content has been modified and saved to the sensenet ECM Repository. <br /> Content path: <i>${c.Content.Path}</i> </p> Changes: <br /> <textarea style="width: 100%; height: 200px;" readonly>${JSON.stringify(c.Changes, null, 3)}</textarea> `
            });
        });

        this.repository.Events.OnContentModificationFailed.subscribe((c) => {
            this.InfosSubject.next({
                Type: SnackEventType.ModifyFailed,
                Message:  this.tryGetErrorResponseMessage(c.Error) || `Failed to modify '${c.Content.DisplayName || c.Content.Name}'`,
                BulkMessage: 'Failed to modify {0} content',
                DialogHtml: `<p>There was an error during saving the content to the sensenet ECM Repository. <br /> Content path: <i>${c.Content.Path}</i> </p>
                Fields: <br />
                <textarea style="width: 100%; height: 50px;" readonly>${JSON.stringify(c.Fields, null, 3)}</textarea>  <br />
                Request <br />
                <textarea style="width: 100%; height: 150px;" readonly>${JSON.stringify(c.Error, null, 3)}</textarea>
                Response <br />
                <textarea style="width: 100%; height: 150px;" readonly>${JSON.stringify(c.Error.xhr.response, null, 3)}</textarea>
                `
            });
        });

        this.repository.Events.OnContentDeleted.subscribe((c) => {
            this.InfosSubject.next({
                Type: SnackEventType.Deleted,
                Message: `'${c.ContentData.DisplayName}' has been ${c.Permanently ? 'deleted' : 'moved to trash'}.`,
                BulkMessage: `{0} content has been ${c.Permanently ? 'deleted' : 'moved to trash'}`,
                DialogHtml: `Content path: <i>${c.ContentData.Path}</i> </p> Content Data: <br /> <textarea style="width: 100%; height: 200px;" readonly>${JSON.stringify(c.ContentData, null, 3)}</textarea> `
            });
        });

        this.repository.Events.OnContentDeleteFailed.subscribe((c) => {
            this.InfosSubject.next({
                Type: SnackEventType.DeleteFailed,
                Message: this.tryGetErrorResponseMessage(c.Error) || `Failed to  ${c.Permanently ? 'delete' : 'move to trash'} '${c.Content.DisplayName || c.Content.Name}'`,
                BulkMessage: `There was an error deleting {0} content`,
                DialogHtml: `<br /> Content path: <i>${c.Content.Path}</i> </p>
                Fields: <br />
                <textarea style="width: 100%; height: 50px;" readonly>${JSON.stringify(c.Content.GetFields(), null, 3)}</textarea>  <br />
                Request <br />
                <textarea style="width: 100%; height: 150px;" readonly>${JSON.stringify(c.Error, null, 3)}</textarea>
                Response <br />
                <textarea style="width: 100%; height: 150px;" readonly>${JSON.stringify(c.Error.xhr.response, null, 3)}</textarea>
                `
            });
        });

        this.repository.Events.OnContentMoved.subscribe((c) => {
            this.InfosSubject.next({
                Type: SnackEventType.Moved,
                Message: `'${c.Content.DisplayName}' has been moved to '${c.To}'.`,
                BulkMessage: `{0} content has been moved.`,
                DialogHtml: `Original Path: <i>${c.From}</i> <br /> Target: <i>${c.To}</i>`
            });
        });

        this.repository.Events.OnContentMoveFailed.subscribe((c) => {
            this.InfosSubject.next({
                Type: SnackEventType.MoveFailed,
                Message: this.tryGetErrorResponseMessage(c.Error) || `Failed to move '${c.Content.DisplayName || c.Content.Name}' from '${c.From}' to '${c.To}'`,
                BulkMessage: 'There was an error moving {0} content',
                DialogHtml: `
                Original path: <i>${c.From}</i> <br />
                Target path: <i>${c.To}</i><br />
                Request <br />
                <textarea style="width: 100%; height: 130px;" readonly>${JSON.stringify(c.Error, null, 3)}</textarea>
                Response <br />
                <textarea style="width: 100%; height: 130px;" readonly>${JSON.stringify(c.Error.xhr && c.Error.xhr.response, null, 3)}</textarea>
                `
            });
        });

    }

    public attached() {
        this.MDCSnackBar = new MDCSnackbar(this.snackbarElement);
        this.MDCDialog = new MDCDialog(document.querySelector('.snackbar-wrapper .mdc-details-dialog'));

        this.InfosSubject.subscribe((i) => {
            this.ActualInfos.push(i);
            const grouped = groupBy(this.ActualInfos, 'BulkMessage');
            const msgSegments: string[] = [];
            for (const type in grouped) {
                if (grouped[type].length === 1) {
                    msgSegments.push(grouped[type][0].Message);
                } else {
                    msgSegments.push(grouped[type][0].BulkMessage.replace('{0}', (grouped as any)[type].length));
                }
            }
            this.Message = msgSegments.join(', ') + '.';

            if (this.ActualInfos.length === 1) {
                this.MDCSnackBar.show({
                    message: i.Message,
                    actionText: 'Details',
                    timeout: this.debounceTime,
                    actionHandler: () => {
                        this.DialogTitle = i.Message,
                        this.DialogHtml = i.DialogHtml,
                        this.MDCDialog.show();
                    }
                });
            } else {
                clearTimeout(this.MDCSnackBar.foundation_.timeoutId_);
                this.MDCSnackBar.getDefaultFoundation().adapter_.setMessageText(this.Message);
            }
        });

        this.InfosSubject.debounceTime(this.debounceTime).subscribe(() => {
            this.ActualInfos = [];
            // this.MDCDialog.close();
            this.MDCSnackBar.getDefaultFoundation().cleanup_();
            this.MDCSnackBar.getDefaultFoundation().destroy();
            this.MDCSnackBar = new MDCSnackbar(this.snackbarElement);

        });
    }
}
