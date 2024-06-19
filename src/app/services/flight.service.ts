import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { BrandAttributes, CatalogProductOfferingsResponse, FFOffers, FlightDetails, ResultDetails } from './FlightOffers';

@Injectable({
  providedIn: 'root'
})

/*
export class FlightService {


  constructor(private http: HttpClient) { }

  getFlightOffers(): Observable<FFOffers[]> {
    return this.http.get<any>('assets/flight-response.json').pipe(
      map((jsonData: any) => this.mapJsonToFFOffers(jsonData))
    );
  }

  private mapJsonToFFOffers(jsonData: any): FFOffers[] {
    const OfferList: FFOffers[] = [];

    if (jsonData && jsonData.CatalogProductOfferingsResponse && jsonData.CatalogProductOfferingsResponse.CatalogProductOfferings) {
      const { CatalogProductOfferings: { CatalogProductOffering }, ReferenceList } = jsonData.CatalogProductOfferingsResponse;

      CatalogProductOffering.forEach((catalogProduct: { sequence: number; ProductBrandOptions: any[]; }) => {
        if (catalogProduct.sequence === 1) {
          catalogProduct.ProductBrandOptions.forEach(brandOption => {
            const offer = new FFOffers();
            offer.OfferId = OfferList.length + 1; // Assign a unique OfferId

            const OfferDetails: ResultDetails[] = brandOption.ProductBrandOffering.map((productOffering: any) =>
              this.getBrandDetails(productOffering, ReferenceList)
            );

            offer.OfferDetails = OfferDetails;
            OfferList.push(offer);
          });
        }
      });
    }

    return OfferList;
  }

  private getBrandDetails(ProductOffer: any, Reference: any[]): ResultDetails {
    const ProductDetails = new ResultDetails();
    ProductDetails.Type = ProductOffer['@type'];

    if (ProductOffer.BestCombinablePrice != null) {
      ProductDetails.TotalPrice = ProductOffer.BestCombinablePrice.TotalPrice;
      ProductDetails.TotalTaxes = ProductOffer.BestCombinablePrice.TotalTaxes;
      ProductDetails.Currency = ProductOffer.BestCombinablePrice.CurrencyCode.value;
      ProductDetails.OfferSource = 'GDS';
    } else {
      if (ProductOffer.Price.CurrencyCode != null) {
        ProductDetails.Currency = ProductOffer.Price.CurrencyCode.value;
        ProductDetails.OfferSource = 'NDC';
      }
      ProductDetails.TotalPrice = ProductOffer.Price.TotalPrice;
      ProductDetails.TotalTaxes = ProductOffer.Price.TotalTaxes;
    }

    if (ProductOffer.Brand != null) {
      ProductDetails.BrandRef = ProductOffer.Brand.BrandRef;
      ProductDetails.tierLevel = this.getBrandDetailsAsString(ProductOffer.Brand.BrandRef, Reference);
      ProductDetails.Brandattributes = this.getBrandAttributes(ProductOffer.Brand.BrandRef, Reference);
    }

    ProductDetails.flights = this.getProductsDetails(ProductOffer.Product, Reference);
    ProductDetails.Carrier = this.getCarrierProductsDetailsAsString(ProductOffer.Product, Reference);
    ProductDetails.TotalDuration = this.getTotalDuration(ProductOffer.Product[0]?.productRef, Reference[1].Product);
    ProductDetails.TermsAndConditions = this.getTermsAndCondition(ProductOffer.TermsAndConditions.termsAndConditionsRef, Reference[2].TermsAndConditions);

    return ProductDetails;
  }

  private getBrandDetailsAsString(brandRef: string, reference: any[]): string {
    for (const refOption of reference) {
      if (refOption["@type"] === "ReferenceListBrand" && refOption.Brand) {
        for (const brand of refOption.Brand) {
          if (brand.id === brandRef) {
            return brand.name + " Tier " + brand.tier;
          }
        }
      }
    }
    return "";
  }

  private getBrandAttributes(brandRef: string, reference: any[]): BrandAttributes[] {
    const brandOption = reference.find(ref => ref['@type'] === 'ReferenceListBrand' && ref.Brand);
    if (!brandOption) return [];

    const targetBrand = brandOption.Brand.find((brand: { id: string; }) => brand.id === brandRef);
    if (!targetBrand || !targetBrand.BrandAttribute) return [];

    return targetBrand.BrandAttribute.map((eachBrandAttribute: { inclusion: string; classification: any; }) => {
      const brandAttributeObj = new BrandAttributes();
      brandAttributeObj.brandAttribute = eachBrandAttribute.inclusion === 'Not Offered'
        ? `${eachBrandAttribute.classification}NotOffered`
        : `${eachBrandAttribute.classification}${eachBrandAttribute.inclusion}`;

      return brandAttributeObj;
    });
  }

  private getTotalDuration(productRef: string, referenceProduct: any[]): string {
    const matchingProduct = referenceProduct.find(product => productRef === product.id);
    return matchingProduct ? matchingProduct.totalDuration : '';
  }

  private getCarrierProductsDetailsAsString(products: any[], reference: any[]): string {
    const productMap = new Map<string, any>();

    reference.forEach(refOptionLoop => {
      if (refOptionLoop['@type'] === 'ReferenceListProduct' && refOptionLoop.Product) {
        refOptionLoop.Product.forEach((refProduct: { id: string; }) => {
          productMap.set(refProduct.id, refProduct);
        });
      }
    });

    let carrier = '';

    products.some(searchProduct => {
      const refProduct = productMap.get(searchProduct.productRef);

      if (refProduct) {
        carrier = this.getFlightCarrier(refProduct.FlightSegment, reference);
        return true;
      }

      return false;
    });

    return carrier;
  }

  private getFlightCarrier(flightSegment: any[], reference: any[]): string {
    let details = '';
    const refOption = reference.find(ref => ref['@type'] === 'ReferenceListFlight');

    if (refOption) {
      flightSegment.forEach(segment => {
        refOption.Flight.forEach((refFlight: { id: any; carrier: string; }) => {
          if (refFlight.id === segment.Flight.FlightRef) {
            details = refFlight.carrier;
          }
        });
      });
    }
    return details;
  }

  private getProductsDetails(products: any[], reference: any[]): FlightDetails[] {
    const refOption = reference.find((refOptionLoop: any) => refOptionLoop["@type"] === "ReferenceListProduct");

    if (!refOption || !refOption.Product) {
      return [];
    }

    return products
      .map(searchProduct => refOption.Product.find((refProduct: any) => refProduct.id === searchProduct.productRef))
      .filter(Boolean) // Remove undefined elements
      .map(refProduct => this.getFlightDetails(refProduct, reference)).flat();
  }

  private getFlightDetails(refProduct: any, reference: any[]): FlightDetails[] {
    const flights: FlightDetails[] = [];


    const flightSegment = refProduct.FlightSegment;
    // Create a dictionary to map FlightRef to refFlight
    const refFlightMap = reference.find(
      (refOption: any) => refOption["@type"] === "ReferenceListFlight"
    )?.Flight.reduce((map: any, refFlight: any) => {
      map[refFlight.id] = refFlight;
      return map;
    }, {});

    if (!refFlightMap) {
      return flights; // This is correctly typed, an empty FlightDetails array
    }

    flightSegment.forEach((segment: { Flight: { FlightRef: string | number; }; sequence: any; }) => {
      const refFlight = refFlightMap[segment.Flight.FlightRef];

      if (refFlight) {
        const flight = new FlightDetails();
        flight.Carrier = refFlight.carrier;
        flight.ID = refFlight.id;
        flight.FlightNumber = refFlight.number;
        flight.Origin = refFlight.Departure.location;
        flight.Equipment = refFlight.equipment;
        flight.DepDate = refFlight.Departure.date.substring(5, refFlight.Departure.date.length);
        flight.DepTime = refFlight.Departure.time.substring(0, refFlight.Departure.time.length - 3);
        flight.Destination = refFlight.Arrival.location;
        flight.ArrivalDate = refFlight.Arrival.date.substring(5, refFlight.Arrival.date.length);
        flight.ArrivalTime = refFlight.Arrival.time.substring(0, refFlight.Arrival.time.length - 3);
        flight.ClassofService = this.getFlightProductDetails(refProduct, segment.sequence);
        flight.Distance = refFlight.distance;
        flight.FlightDuration = refFlight.duration;
        flight.ArrivalDetail = refFlight.Arrival;
        flight.DepartureDetails = refFlight.Departure;
        flights.push(flight);
      }
    });

    return flights;
  }

  private getFlightProductDetails(refProduct: any, l: any): string {
    let details = '';

    refProduct.PassengerFlight.forEach((flight: { FlightProduct: any[]; }) => {
      flight.FlightProduct.forEach(product => {
        if (product.segmentSequence.includes(l)) {
          details += product.classOfService;
        }
      });
    });

    return details;
  }

  private getTermsAndCondition(termsAndConditionRef: string, referenceTermsAndCondition: any[]): string {
    const matchingTerms = referenceTermsAndCondition.find(terms => termsAndConditionRef === terms.id);
    return matchingTerms ? matchingTerms : '';
  }
}



 */











@Injectable({
  providedIn: 'root',
})
export class FlightService {
  constructor() { }

  getFlightCarrier(flightSegment: any[], reference: any[]): string {
    let details = '';
    const refOption = reference.find(ref => ref['@type'] === 'ReferenceListFlight');

    if (refOption) {
      flightSegment.forEach(segment => {
        refOption.Flight.forEach((refFlight: any) => {
          if (refFlight.id === segment.Flight.FlightRef) {
            details = refFlight.carrier;
          }
        });
      });
    }
    return details;
  }

  getBrandDetails(ProductOffer: any, Reference: any[]): ResultDetails {
    let ProductDetails = new ResultDetails();
    ProductDetails.Type = ProductOffer['@type'];

    if (ProductOffer.BestCombinablePrice != null) {
      ProductDetails.TotalPrice = ProductOffer.BestCombinablePrice.TotalPrice;
      ProductDetails.TotalTaxes = ProductOffer.BestCombinablePrice.TotalTaxes;
      ProductDetails.Currency = ProductOffer.BestCombinablePrice.CurrencyCode.value;
      ProductDetails.OfferSource = 'GDS';
    } else {
      if (ProductOffer.Price.CurrencyCode != null) {
        ProductDetails.Currency = ProductOffer.Price.CurrencyCode.value;
        ProductDetails.OfferSource = 'NDC';
      }
      ProductDetails.TotalPrice = ProductOffer.Price.TotalPrice;
      ProductDetails.TotalTaxes = ProductOffer.Price.TotalTaxes;
    }

    if (ProductDetails != null) {
      if (ProductOffer.Brand != null) {
        ProductDetails.BrandRef = ProductOffer.Brand.BrandRef;
        ProductDetails.tierLevel = this.getBrandDetailsAsString(ProductOffer.Brand.BrandRef, Reference);
        ProductDetails.Brandattributes = this.getBrandAttributes(ProductOffer.Brand.BrandRef, Reference);
      }
      ProductDetails.flights = this.getProductsDetails(ProductOffer.Product, Reference);
      ProductDetails.Carrier = this.getCarrierProductsDetailsAsString(ProductOffer.Product, Reference);
      ProductDetails.TotalDuration = this.getTotalDuration(ProductOffer.Product[0]?.productRef, Reference[1].Product);
      ProductDetails.TermsAndConditions = this.getTermsAndCondition(ProductOffer.TermsAndConditions.termsAndConditionsRef, Reference[2].TermsAndConditions);
    }

    return ProductDetails;
  }

  getTotalDuration(productRef: string, referenceProduct: any[]): string {
    const matchingProduct = referenceProduct.find(product => productRef === product.id);
    return matchingProduct ? matchingProduct.totalDuration : '';
  }

  getBrandAttributes(brandRef: string, reference: any[]): BrandAttributes[] {
    const brandOption = reference.find(ref => ref['@type'] === 'ReferenceListBrand' && ref.Brand);
    if (!brandOption) return [];

    const targetBrand = brandOption.Brand.find((brand: any) => brand.id === brandRef);
    if (!targetBrand || !targetBrand.BrandAttribute) return [];

    return targetBrand.BrandAttribute.map((eachBrandAttribute: any) => {
      const brandAttributeObj = new BrandAttributes();
      brandAttributeObj.brandAttribute = eachBrandAttribute.inclusion === 'Not Offered'
        ? eachBrandAttribute.classification + 'NotOffered'
        : eachBrandAttribute.classification + eachBrandAttribute.inclusion;
      return brandAttributeObj;
    });
  }

  getTermsAndCondition(termsAndConditionRef: string, referenceTermsAndCondition: any[]): any {
    return referenceTermsAndCondition.find(terms => termsAndConditionRef === terms.id) || '';
  }

  getBrandDetailsAsString(brandRef: string, reference: any[]): string {
    for (const refOption of reference) {
      if (refOption['@type'] === 'ReferenceListBrand' && refOption.Brand) {
        for (const brand of refOption.Brand) {
          if (brand.id === brandRef) {
            return brand.name + ' Tier ' + brand.tier;
          }
        }
      }
    }
    return '';
  }

  getCarrierProductsDetailsAsString(products: any[], reference: any[]): string {
    const productMap = new Map();
    for (const refOptionLoop of reference) {
      if (refOptionLoop['@type'] === 'ReferenceListProduct' && refOptionLoop.Product) {
        for (const refProduct of refOptionLoop.Product) {
          productMap.set(refProduct.id, refProduct);
        }
      }
    }

    let carrier = '';
    for (const searchProduct of products) {
      const refProduct = productMap.get(searchProduct.productRef);
      if (refProduct) {
        carrier = this.getFlightCarrier(refProduct.FlightSegment, reference);
        break;
      }
    }
    return carrier;
  }

  getProductsDetails(products: any[], reference: any[]): FlightDetails[] {
    const refOption = reference.find(refOptionLoop => refOptionLoop['@type'] === 'ReferenceListProduct');
    if (!refOption || !refOption.Product) return [];

    return products
      .map(searchProduct => refOption.Product.find((refProduct: any) => refProduct.id === searchProduct.productRef))
      .filter(Boolean)
      .map(refProduct => this.getFlightDetails(refProduct, reference)).flat();
  }

  getFlightDetails(refProduct: any, reference: any[]): FlightDetails[] {
    const flights: FlightDetails[] = [];
    const flightSegment = refProduct.FlightSegment;

    const refFlightMap = reference.find(refOption => refOption['@type'] === 'ReferenceListFlight')
      ?.Flight.reduce((map: { [x: string]: any; }, refFlight: { id: string | number; }) => {
        map[refFlight.id] = refFlight;
        return map;
      }, {});

    if (!refFlightMap) return flights;

    flightSegment.forEach((segment: any) => {
      const refFlight = refFlightMap[segment.Flight.FlightRef];
      if (refFlight) {
        const flight = new FlightDetails();
        flight.Carrier = refFlight.carrier;
        flight.ID = refFlight.id;
        flight.FlightNumber = refFlight.number;
        flight.Origin = refFlight.Departure.location;
        flight.Equipment = refFlight.equipment;
        flight.DepDate = refFlight.Departure.date.substring(5);
        flight.DepTime = refFlight.Departure.time.substring(0, refFlight.Departure.time.length - 3);
        flight.Destination = refFlight.Arrival.location;
        flight.ArrivalDate = refFlight.Arrival.date.substring(5);
        flight.ArrivalTime = refFlight.Arrival.time.substring(0, refFlight.Arrival.time.length - 3);
        flight.ClassofService = this.getFlightProductDetails(refProduct, segment.sequence);
        flight.Distance = refFlight.distance;
        flight.FlightDuration = refFlight.duration;
        flight.ArrivalDetail = refFlight.Arrival;
        flight.DepartureDetails = refFlight.Departure;
        flights.push(flight);
      }
    });

    return flights;
  }

  getAllReturnFlights(returnflights: FlightDetails[], combinabilitycode: string, root: any[], referenceList: any[]): void {
    root.forEach(lofferReturn => {
      if (lofferReturn.sequence != 1) {
        lofferReturn.ProductBrandOptions.forEach((item: any) => {
          item.ProductBrandOffering.forEach((poffer: any) => {
            if (poffer.CombinabilityCode === combinabilitycode) {
              const flight = this.getProductsDetails(poffer.Product, referenceList);

             // console.log('test return flight',flight)
               returnflights.push(...flight);
            }
          });
        });
      }
    });
  }

  getFlightProductDetails(refProduct: any, l: number): string {
    let details = '';
    refProduct.PassengerFlight.forEach((flight: any) => {
      flight.FlightProduct.forEach((product: any) => {
        if (product.segmentSequence.includes(l)) {
          details += product.classOfService;
        }
      });
    });
    return details;
  }

  searchDisplayAllOffers(jsonData: any): Observable<FFOffers[]> {
    return of(jsonData).pipe(
      map((data: { CatalogProductOfferingsResponse: CatalogProductOfferingsResponse }) => {
        let id = 0;
        let OfferList: FFOffers[] = [];

        if (data && data.CatalogProductOfferingsResponse && data.CatalogProductOfferingsResponse.CatalogProductOfferings) {
          const { CatalogProductOfferings: { CatalogProductOffering }, ReferenceList } = data.CatalogProductOfferingsResponse;

          CatalogProductOffering.forEach(catalogProduct => {
            if (catalogProduct.sequence === 1) {
              catalogProduct.ProductBrandOptions.forEach(brandOption => {
                const offer = new FFOffers(id, []);
                brandOption.ProductBrandOffering.forEach(productOffering => {
                  const details = this.getBrandDetails(productOffering, ReferenceList);
                  details.returnflights = [];
                  this.getAllReturnFlights(details.returnflights, productOffering.CombinabilityCode, data.CatalogProductOfferingsResponse.CatalogProductOfferings.CatalogProductOffering, ReferenceList);
                  details.Sequence = catalogProduct.sequence;
                  offer.OfferDetails.push(details);
                });
                OfferList.push(offer);
                id++;
              });
            }
          });
        }
        return OfferList;
      })
    );
  }
}
