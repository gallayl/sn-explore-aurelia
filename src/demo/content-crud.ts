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
                DueDate: new Date(),
                Name: 'Demo Task'
            }, this.repo),
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