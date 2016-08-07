import { Component } from 'angular2/core';
import { RouteConfig, ROUTER_DIRECTIVES, ROUTER_PROVIDERS } from 'angular2/router';

import { DashboardComponent } from './dashboard.component';
import { PeopleComponent } from './people.component';
import { PersonDetailComponent } from './person-detail.component';
import { PeopleService } from './people.service';

@Component({
  selector: 'my-app',
  template: `
    <h1>{{title}}</h1>
    <nav>
      <a [routerLink]="['Dashboard']">Dashboard</a>
      <a [routerLink]="['People']">People</a>
    </nav>
    <router-outlet></router-outlet>
  `,
  styleUrls: ['html/app.component.css'],
  directives: [ROUTER_DIRECTIVES],
  providers: [
    ROUTER_PROVIDERS,
    PeopleService
  ]
})
@RouteConfig([
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardComponent,
    useAsDefault: true
  },
  {
    path: '/detail/:id',
    name: 'PersonDetail',
    component: PersonDetailComponent
  },
  {
    path: '/people',
    name: 'People',
    component: PeopleComponent
  }
])
export class AppComponent {
  title = 'Tour of People';
}
