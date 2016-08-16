import { Component } from '@angular/core';
import { ROUTER_DIRECTIVES } from '@angular/router';
import './rxjs-extensions';

import { PeopleService }     from './people.service';
@Component({
  selector: 'my-app',
  template: `
    <h1>{{title}}</h1>
    <nav>
      <a [routerLink]="['/dashboard']" routerLinkActive="active">Dashboard</a>
      <a [routerLink]="['/people']" routerLinkActive="active">People</a>
    </nav>
    <router-outlet></router-outlet>
  `,
  styleUrls: ['app/app.component.css'],
  directives: [ROUTER_DIRECTIVES],
  providers: [
    PeopleService
  ]
})
export class AppComponent {
  title = 'people-service title';
}
