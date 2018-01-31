import { MDCDialog } from '@material/dialog';
import { MDCSnackbar } from '@material/snackbar';
import { autoinject, bindable } from 'aurelia-framework';

import groupBy from 'lodash.groupby';
import { Repository } from '@sensenet/client-core';
import { EventHub } from '@sensenet/repository-events';
import { ObservableValue } from '@sensenet/client-utils/dist/ObservableValue';

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

    public InfosSubject: ObservableValue<SnackInfo> = new ObservableValue<SnackInfo>();

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

    private readonly eventHub: EventHub;

    constructor(
        private readonly repository: Repository
    ) {

        this.eventHub = new EventHub(this.repository);
        this.eventHub.onContentCreated.subscribe((c) => {
            const summary = `'${(c as any).content.DisplayName || c.content.Name}' has been created.`;
            this.InfosSubject.setValue({
                Type: SnackEventType.Created,
                Message: summary,
                DialogHtml: `The content has been created and saved to the sensenet ECM Repository. <br /> Content path: <i>${c.content.Path}</i>`,
                BulkMessage: '{0} content has been created'
            });
        });

        this.eventHub.onContentCreateFailed.subscribe((c) => {
            this.InfosSubject.setValue({
                Type: SnackEventType.CreateFailed,
                Message: this.tryGetErrorResponseMessage(c.error) || `Failed to create content '${c.content.Name}'.`,
                DialogHtml: `There was an error during creating the content '${c.content.Name}'`,
                BulkMessage: 'Failed to create {0} content'
            });
        });

        this.eventHub.onContentModified.subscribe((c) => {
            this.InfosSubject.setValue({
                Type: SnackEventType.Modified,
                Message: `'${c.content.Name}' has been modified.`,
                BulkMessage: '{0} content has been modified',
                DialogHtml: `<p>The content has been modified and saved to the sensenet ECM Repository. <br /> Content path: <i>${c.content.Path}</i> </p> Changes: <br /> <textarea style="width: 100%; height: 200px;" readonly>${JSON.stringify(c.changes, null, 3)}</textarea> `
            });
        });

        this.eventHub.onContentModificationFailed.subscribe((c) => {
            this.InfosSubject.setValue({
                Type: SnackEventType.ModifyFailed,
                Message:  this.tryGetErrorResponseMessage(c.error) || `Failed to modify '${c.content.Name}'`,
                BulkMessage: 'Failed to modify {0} content',
                DialogHtml: `<p>There was an error during saving the content to the sensenet ECM Repository. <br /> Content path: <i>${c.content.Path}</i> </p>
                Fields: <br />
                <textarea style="width: 100%; height: 50px;" readonly>${JSON.stringify(c.content, null, 3)}</textarea>  <br />
                Request <br />
                <textarea style="width: 100%; height: 150px;" readonly>${JSON.stringify(c.error, null, 3)}</textarea>
                Response <br />
                <textarea style="width: 100%; height: 150px;" readonly>${JSON.stringify(c.error.xhr.response, null, 3)}</textarea>
                `
            });
        });

        this.eventHub.onContentDeleted.subscribe((c) => {
            this.InfosSubject.setValue({
                Type: SnackEventType.Deleted,
                Message: `'${c.contentData.Name}' has been ${c.permanently ? 'deleted' : 'moved to trash'}.`,
                BulkMessage: `{0} content has been ${c.permanently ? 'deleted' : 'moved to trash'}`,
                DialogHtml: `Content path: <i>${c.contentData.Path}</i> </p> Content Data: <br /> <textarea style="width: 100%; height: 200px;" readonly>${JSON.stringify(c.contentData, null, 3)}</textarea> `
            });
        });

        this.eventHub.onContentDeleteFailed.subscribe((c) => {
            this.InfosSubject.setValue({
                Type: SnackEventType.DeleteFailed,
                Message: this.tryGetErrorResponseMessage(c.error) || `Failed to  ${c.permanently ? 'delete' : 'move to trash'} '${c.content.Name}'`,
                BulkMessage: `There was an error deleting {0} content`,
                DialogHtml: `<br /> Content path: <i>${c.content.Path}</i> </p>
                Fields: <br />
                <textarea style="width: 100%; height: 50px;" readonly>${JSON.stringify(c.content, null, 3)}</textarea>  <br />
                Request <br />
                <textarea style="width: 100%; height: 150px;" readonly>${JSON.stringify(c.error, null, 3)}</textarea>
                Response <br />
                <textarea style="width: 100%; height: 150px;" readonly>${JSON.stringify(c.error, null, 3)}</textarea>
                `
            });
        });

        this.eventHub.onContentMoved.subscribe((c) => {
            this.InfosSubject.setValue({
                Type: SnackEventType.Moved,
                Message: `'${(c as any).content.DisplayName}' has been moved to '${c.content.Path}'.`,
                BulkMessage: `{0} content has been moved.`,
                DialogHtml: `<br /> Target: <i>${c.content.Path}</i>`
            });
        });

        this.eventHub.onContentMoveFailed.subscribe((c) => {
            this.InfosSubject.setValue({
                Type: SnackEventType.MoveFailed,
                Message: this.tryGetErrorResponseMessage(c.error) || `Failed to move '${(c as any).content.DisplayName || c.content.Name}' to '${c.content.Path}'`,
                BulkMessage: 'There was an error moving {0} content',
                DialogHtml: `
                Target path: <i>${c.content.Path}</i><br />
                Request <br />
                <textarea style="width: 100%; height: 130px;" readonly>${JSON.stringify(c.error, null, 3)}</textarea>
                Response <br />
                <textarea style="width: 100%; height: 130px;" readonly>${JSON.stringify(c.error.xhr, null, 3)}</textarea>
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

        this.InfosSubject
            // ToDo...
            // .debounceTime(this.debounceTime)
            .subscribe(() => {
            this.ActualInfos = [];
            // this.MDCDialog.close();
            this.MDCSnackBar.getDefaultFoundation().cleanup_();
            this.MDCSnackBar.getDefaultFoundation().destroy();
            this.MDCSnackBar = new MDCSnackbar(this.snackbarElement);

        });
    }
}
