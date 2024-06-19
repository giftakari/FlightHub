import { Component, OnInit } from '@angular/core';
import { AirTravelService } from '../../services/air-travel.service';
import { Observable } from 'rxjs';
import { mergeMap, toArray } from 'rxjs/operators';

@Component({
  selector: 'app-air-travel',
  templateUrl: './air-travel.component.html',
  styleUrls: ['./air-travel.component.css']
})


export class AirTravelComponent implements OnInit {
  productsWithMatchingCombinabilityCode$!: Observable<any>;

  constructor(private airTravelService: AirTravelService) {}

  ngOnInit(): void {
    // this.airTravelService.fetchData().subscribe();

  /*   this.productsWithMatchingCombinabilityCode$.subscribe(result => {
      console.log('Products with matching CombinabilityCode:', result);
    });
  } */
}

}
