import { ContentTypes, Mocks } from 'sn-client-js';
import { bindable } from 'aurelia-templating';

export class Email {
    
    @bindable
    email: ContentTypes.Email;
    repo: Mocks.MockRepository;

    constructor() {
        this.repo = new Mocks.MockRepository();
        this.email = new ContentTypes.Email({
            Name: 'Demo Email',
        }, this.repo);
    }
}