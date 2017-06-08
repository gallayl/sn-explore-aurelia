import { ContentTypes, Mocks } from 'sn-client-js';
import { bindable } from 'aurelia-templating';

export class Task {
    
    @bindable
    task: ContentTypes.Task;
    repo: Mocks.MockRepository;

    constructor() {
        this.repo = new Mocks.MockRepository();
        this.task = new ContentTypes.Task({
            DueDate: new Date(),
            Name: 'Demo Task'
        }, this.repo);
    }
}