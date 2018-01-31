// tslint:disable-next-line:no-reference
/// <reference path="../../node_modules/monaco-editor/monaco.d.ts" />

import { bindable, computedFrom, customElement } from 'aurelia-framework';
import { dialog } from 'material-components-web/dist/material-components-web';
import { SensenetCtdLanguage } from 'utils/monaco-languages/sensenet-ctd';
import {File as SnFile, BinaryField} from "@sensenet/default-content-types";
import { Repository } from '@sensenet/client-core';
import { PathHelper } from '@sensenet/client-utils';

@customElement('binary-text-editor')
export class BinaryTextEditor {

    public editBinaryDialog: HTMLElement;
    @bindable
    public monacoEditArea: HTMLElement;

    public monacoEditorInstance: monaco.editor.IStandaloneCodeEditor;

    public editBinaryMDCDialog: dialog.MDCDialog;

    @bindable
    public isLoading: boolean = true;

    private initMonaco() {
        this.monacoEditorInstance = monaco.editor.create(this.monacoEditArea, {
            value: this.binaryData,
            language: 'plaintext',
        });

        this.monacoEditArea.addEventListener('keydown', (ev) => {
            // Stop closing by ESC - MDC vs Monaco
            ev.stopImmediatePropagation();
        });
    }

    public attached() {
        this.editBinaryMDCDialog = new dialog.MDCDialog(this.editBinaryDialog);

        const onGotAmdLoader = () => {
            // Load monaco
            (window as any).require(['vs/editor/editor.main'], () => {
                this.initMonaco();
            });
        };

        // Load AMD loader if necessary
        if (!(window as any).require) {
            const loaderScript = document.createElement('script');
            loaderScript.type = 'text/javascript';
            loaderScript.src = 'vs/loader.js';
            loaderScript.addEventListener('load', onGotAmdLoader);
            document.body.appendChild(loaderScript);
        } else {
            onGotAmdLoader();
        }
    }

    @bindable
    public content: SnFile;

    @bindable
    public fieldName: string;

    @computedFrom('content', 'fieldName')
    public get field(): BinaryField {
        return this.content[this.fieldName] as BinaryField;
    }

    @bindable
    public binaryData: any;

    public explicitSetupForContent(repo: Repository, content: SnFile): boolean {
        const schemas = repo.schemas.getSchemaByName(content.Type).ContentTypeName;// content.GetSchemaWithParents().map((s) => s.ContentTypeName);
        if (schemas.indexOf('ContentType') > -1) {
            SensenetCtdLanguage.Register();
            monaco.editor.setModelLanguage(this.monacoEditorInstance.getModel(), SensenetCtdLanguage.LanguageId);
            return true;
        }
        if (schemas.indexOf('Settings') > -1) {
            monaco.editor.setModelLanguage(this.monacoEditorInstance.getModel(), 'json');
            return true;
        }

    }

    public async open<T extends SnFile>(repo: Repository, content: T, fieldName: keyof T = 'Binary') {
        this.isLoading = true;
        this.content = content;
        this.fieldName = fieldName;
        this.editBinaryMDCDialog.show();

        const downloadRequest = await repo.fetch(PathHelper.joinPaths(repo.configuration.repositoryUrl,
            `/binaryhandler.ashx?nodeid=${content.Id}&propertyname=${fieldName}`));

        if (downloadRequest.ok) {
            // ToDo: Check me pls
            this.binaryData = await downloadRequest.text();

        } else {
            throw Error("Failed to download binary");
        }
        // await this.content.GetRepository().Ajax(this.field.GetDownloadUrl(), 'GET', String, {}, [], false, 'text').toPromise();
        this.monacoEditorInstance.setValue(this.binaryData);

        if (!this.explicitSetupForContent(repo, content)) {
            const languages: monaco.languages.ILanguageExtensionPoint[] = monaco.languages.getLanguages();
            const available = languages.filter((lang) => {
                return lang.extensions.filter((e) => content.Name.endsWith(e)).length;
            }).map((lang) => lang.id);
            monaco.editor.setModelLanguage(this.monacoEditorInstance.getModel(), available[0] || 'plaintext');
        }

        // tslint:disable-next-line:no-string-literal
        this.monacoEditorInstance['_themeService'].setTheme(localStorage.getItem('sn-dark-theme') === 'true' ? 'vs-dark' : 'vs');
        this.isLoading = false;

        // for tabbing - monaco vs material design
        setTimeout(() => {
            // this.editBinaryMDCDialog.set
            this.editBinaryMDCDialog.focusTrap_.deactivate();
        }, 500);
    }

    public cancel() {
        this.editBinaryMDCDialog.close();
    }

    public async save() {
        // ToDo: Upload me pls!!!
        // await this.field.SaveBinaryText(this.monacoEditorInstance.getValue()).toPromise();
        this.editBinaryMDCDialog.close();
    }
}
