import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { ProductsComponent } from './products/products.component';
import { PaginationComponent } from './pagination/pagination.component';
import { AirTravelComponent } from './components/air-travel/air-travel.component';
import { AirTravelService } from './services/air-travel.service';
import { HttpClientModule } from '@angular/common/http';
import { FlightOffersComponent } from './components/flight-offers/flight-offers.component';


@NgModule({
  declarations: [
    AppComponent,
    ProductsComponent,
    PaginationComponent,
    AirTravelComponent,
    FlightOffersComponent
  ],
  imports: [
    BrowserModule,HttpClientModule
  ],
  providers: [AirTravelService],
  bootstrap: [AppComponent]
})
export class AppModule { }
