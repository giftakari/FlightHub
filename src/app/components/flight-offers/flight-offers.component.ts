import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { FFOffers } from 'src/app/services/FlightOffers';
import { FlightService } from 'src/app/services/flight.service';
import * as jsonData from '../../../assets/flight-response.json';

console.log(jsonData);


@Component({
  selector: 'app-flight-offers',
  templateUrl: './flight-offers.component.html',
  styleUrls: ['./flight-offers.component.css']
})
export class FlightOffersComponent implements OnInit {
  offers$!: Observable<FFOffers[]>;

  constructor(private flightService: FlightService) {}


    ngOnInit(): void {
      this.offers$ = this.flightService.searchDisplayAllOffers(jsonData);

      this.offers$.subscribe(value => console.log(value));

    }





}
