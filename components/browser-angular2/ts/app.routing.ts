import { Routes, RouterModule } from '@angular/router';

import { DashboardComponent }  from './dashboard.component';
import { PeopleComponent }     from './people.component';
import { PersonDetailComponent } from './person-detail.component';

const appRoutes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    component: DashboardComponent
  },
  {
    path: 'detail/:id',
    component: PersonDetailComponent
  },
  {
    path: 'heroes',
    component: PeopleComponent
  }
];

export const routing = RouterModule.forRoot(appRoutes);
