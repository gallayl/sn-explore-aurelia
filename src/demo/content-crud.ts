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
            this.repo.HandleLoadedContent({
                // DueDate: new Date(),
                StartDate: "2017-06-30T09:12:00.000Z",
                Name: 'Demo Task',
                Type: 'Task'
            } as any),
            this.repo.HandleLoadedContent({
                Name: 'Demo E-Mail'
            } as any),
            this.repo.HandleLoadedContent({
                Name: 'Demo User',
                LoginName: '',
                Email: '',
                FullName: '',
                Password: ''
            } as any)
        ];
        // this.content = this.contents[0];
    }
}