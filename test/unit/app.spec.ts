import { App } from 'app';
import { RoleHelper } from 'utils/role-helper';
import { Repository } from '@sensenet/client-core';
import { JwtService } from '@sensenet/authentication-jwt/dist/JwtService';

class RouterStub {
  public routes;

  public configure(handler) {
    handler(this);
  }

  public map(routes) {
    this.routes = routes;
  }
}

describe('the App module', () => {
  let sut: any;
  let mockedRouter: any;

  beforeEach(() => {
    mockedRouter = new RouterStub();
    const mockRepo = new Repository();
    sut = new App(new RoleHelper(mockRepo, new JwtService(mockRepo)));
    sut.configureRouter(mockedRouter, mockedRouter);
  });

  it('contains a router property', () => {
    expect(sut.router).toBeDefined();
  });

  it('configures the router title', () => {
    expect(sut.router.title).toEqual('Aurelia');
  });

  it('should have a welcome route', () => {
    expect(sut.router.routes).toContainEqual({ route: ['', 'welcome'], name: 'welcome',  moduleId: './welcome', nav: true, title: 'Welcome' });
  });

  it('should have a users route', () => {
    expect(sut.router.routes).toContainEqual({ route: 'users', name: 'users', moduleId: './users', nav: true, title: 'Github Users' });
  });

  it('should have a child router route', () => {
    expect(sut.router.routes).toContainEqual({ route: 'child-router', name: 'child-router', moduleId: './child-router', nav: true, title: 'Child Router' });
  });
});
