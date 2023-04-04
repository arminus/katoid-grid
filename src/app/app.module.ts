import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { KtdGridModule } from '@katoid/angular-grid-layout';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    KtdGridModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
