import { ContentTypes, Mocks } from 'sn-client-js';
import { bindable } from 'aurelia-templating';

export class User {
    
    @bindable
    user: ContentTypes.User;
    repo: Mocks.MockRepository;

    constructor() {
        this.repo = new Mocks.MockRepository();
        this.user = new ContentTypes.User({
            Name: 'Demo Task',
            LoginName: 'ExampleLoginName',
            Email: 'example@sn.com',
            FullName: 'Example User',
            Password: ''
        }, this.repo);
    }
}