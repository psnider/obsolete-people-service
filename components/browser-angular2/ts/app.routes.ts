import { provideRouter, RouterConfig }  from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { PeopleComponent } from './people.component';
import { PersonDetailComponent } from './person-detail.component';

const routes: RouterConfig = [
  {
    path: 'people',
    component: PeopleComponent
  },
  {
    path: 'dashboard',
    component: DashboardComponent
  },
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'detail/:id',
    component: PersonDetailComponent
  },
];

export const appRouterProviders = [
  provideRouter(routes)
];
