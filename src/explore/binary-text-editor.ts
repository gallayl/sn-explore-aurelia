/// <reference path="../../node_modules/monaco-editor/monaco.d.ts" />

import { customElement, bindable, computedFrom } from 'aurelia-framework';
import { Content } from 'sn-client-js';
import { Schemas, ContentTypes, Repository } from 'sn-client-js';
import { dialog } from 'material-components-web/dist/material-components-web';
import { BinaryField } from 'sn-client-js/dist/src/BinaryField';
import { GenericContent } from 'sn-client-js/dist/src/ContentTypes';


declare const monaco: any;
declare const require: any;

@customElement('binary-text-editor')
export class BinaryTextEditor {

    editBinaryDialog: HTMLElement;
    @bindable
    monacoEditArea: HTMLElement;

    monacoEditorInstance: monaco.editor.IStandaloneCodeEditor;

    editBinaryMDCDialog: dialog.MDCDialog;

    @bindable
    isLoading: boolean = true;


    private initMonaco(){
        this.monacoEditorInstance = monaco.editor.create(this.monacoEditArea, {
          value: this.binaryData,
          language: 'plaintext',
        });
    }

    attached() {
        this.editBinaryMDCDialog = new dialog.MDCDialog(this.editBinaryDialog);

        var onGotAmdLoader = () => {
            // Load monaco
            (<any>window).require(['vs/editor/editor.main'], () => {
                this.initMonaco();
            });
        };

        // Load AMD loader if necessary
        if (!(<any>window).require) {
            var loaderScript = document.createElement('script');
            loaderScript.type = 'text/javascript';
            loaderScript.src = 'vs/loader.js';
            loaderScript.addEventListener('load', onGotAmdLoader);
            document.body.appendChild(loaderScript);
        } else {
            onGotAmdLoader();
        }
    }

    @bindable
    public content: Content<ContentTypes.File>;

    @bindable
    public fieldName: string;

    @computedFrom('content', 'fieldName')
    public get field(): BinaryField<Content> {
        const f = this.content[this.fieldName];
        if (!(f instanceof BinaryField)) {
            throw Error(`Field '${this.fieldName}' is not a binary field on content`);
        }
        return this.content[this.fieldName] as BinaryField<Content>;
    };

    @bindable
    public binaryData: any;

    public tryGetLanguageForContentType(content: Content<GenericContent>){
        const schemas = content.GetSchemaWithParents().map(s=>s.ContentTypeName);
        if (schemas.indexOf('ContentType') > -1){
            return 'xml';
        }
        if (schemas.indexOf('Settings') > -1){
            return 'json';
        }

    }

    public async open<T extends Content<ContentTypes.File>>(content: T, fieldName: keyof T = 'Binary') {
        this.isLoading = true;
        this.content = content;
        this.fieldName = fieldName;
        this.editBinaryMDCDialog.show();

        this.binaryData = await this.content.GetRepository().Ajax(this.field.GetDownloadUrl(), 'GET', String, {}, [], false, 'text').toPromise();
        this.monacoEditorInstance.setValue(this.binaryData);

        const languages: monaco.languages.ILanguageExtensionPoint[] = monaco.languages.getLanguages();
        const available = [
            this.tryGetLanguageForContentType(content),
            ...languages.filter(lang => {
                return lang.extensions.filter(e => content.Name.endsWith(e)).length;
            }).map(lang=>lang.id)];
        monaco.editor.setModelLanguage(this.monacoEditorInstance.getModel(), available[0] || 'plaintext');
        this.monacoEditorInstance['_themeService'].setTheme(localStorage.getItem('sn-dark-theme') === 'true' ? 'vs-dark' : 'vs');
        this.isLoading = false;
    }

    cancel(){
        this.editBinaryMDCDialog.close();
    }

    async save(){
        await this.field.SaveBinaryText(this.monacoEditorInstance.getValue()).toPromise();
        this.editBinaryMDCDialog.close();
    }


}