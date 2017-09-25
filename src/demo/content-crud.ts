import { ContentTypes, Mocks, Content, ActionName } from 'sn-client-js';
import { bindable } from 'aurelia-templating';

export class ContentCrud {
    
    @bindable
    content: Content;
    repo: Mocks.MockRepository;

    @bindable
    contents: Content[];

    @bindable actionName: ActionName;

    constructor() {
        this.repo = new Mocks.MockRepository();
        const createdContents = [];
        for (const contentType in ContentTypes){
            try {
                const content = this.repo.HandleLoadedContent({
                    Id: Math.random(),
                    Path: 'example/demo',
                    Name: `Demo ${contentType}`
                }, ContentTypes[contentType]);

                createdContents.push(content);
            } catch (error) {
                
            }
        }

        this.contents = createdContents;
    }
}