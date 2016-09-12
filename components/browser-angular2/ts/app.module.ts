import { NgModule }       from '@angular/core';
import { BrowserModule }  from '@angular/platform-browser';
import { FormsModule }    from '@angular/forms';
import { HttpModule }     from '@angular/http';

// Imports for loading & configuring the in-memory web api
import { XHRBackend } from '@angular/http';

import { AppComponent }   from './app.component';
import { routing }        from './app.routing';

import { PeopleComponent }      from './people.component';
import { DashboardComponent }   from './dashboard.component';
import { PersonDetailComponent }  from './person-detail.component';
import { PeopleService }          from './people.service';
import { PeopleSearchComponent }  from './people-search.component';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    routing,
    HttpModule
  ],
  declarations: [
    AppComponent,
    PeopleComponent,
    DashboardComponent,
    PersonDetailComponent,
    PeopleSearchComponent
  ],
  providers: [
    PeopleService,
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule {
}
