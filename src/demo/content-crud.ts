import { bindable, autoinject } from 'aurelia-framework';
import { Repository, IContent } from '@sensenet/client-core';
import { ActionName } from '@sensenet/control-mapper';

@autoinject
export class ContentCrud {
    
    @bindable
    content: IContent;

    @bindable
    contents: IContent[];

    @bindable actionName: ActionName;

    constructor(private repository: Repository) {
        const createdContents = [];
        for (const contentType in this.repository.schemas["schemas"].map(s=>s.Name)){
            try {
                const content = {
                    Id: Math.random(),
                    Path: 'example/demo',
                    Name: `${contentType} example`,
                    Type: contentType
                } as IContent;

                createdContents.push(content);
            } catch (error) {
                
            }
        }

        this.contents = createdContents;
    }
}