import { Component } from '@angular/core';
import { RouterLinkActive } from '@angular/router';
import './rxjs-extensions';

@Component({
  selector: 'my-app',
  template: `
    <h1>{{title}}</h1>
    <nav>
      <a routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
      <a routerLink="/people" routerLinkActive="active">People</a>
    </nav>
    <router-outlet></router-outlet>
  `,
  styleUrls: ['people-app/app.component.css']
})
export class AppComponent {
  title = 'people-service title';
}
