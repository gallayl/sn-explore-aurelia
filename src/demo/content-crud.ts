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
        this.contents = [
            new ContentTypes.Task({
                // DueDate: new Date(),
                StartDate: "2017-06-30T09:12:00.000Z",
                Name: 'Demo Task'
            } as any, this.repo),
            new ContentTypes.Email({
                Name: 'Demo E-Mail'
            }, this.repo),
            new ContentTypes.User({
                Name: 'Demo User',
                LoginName: '',
                Email: '',
                FullName: '',
                Password: ''
            }, this.repo)
        ];
        // this.content = this.contents[0];
    }
}