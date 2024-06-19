import { TestBed } from '@angular/core/testing';

import { AirTravelService } from './air-travel.service';

describe('AirTravelService', () => {
  let service: AirTravelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AirTravelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
