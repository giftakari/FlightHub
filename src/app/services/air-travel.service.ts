import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, mergeMap } from 'rxjs/operators';

interface CatalogProductOfferingsResponse {
  CatalogProductOfferings: {
    CatalogProductOffering: Array<any>;
  };
  ReferenceList: [
    { Flight: Array<any> },
    { Product: Array<any> },
    { TermsAndConditions: Array<any> },
    { Brand: Array<any> }
  ];
}

@Injectable({
  providedIn: 'root'
})
export class AirTravelService {
  private apiUrl = '/api/data'; // Replace with your actual API endpoint

  constructor(private http: HttpClient) {}

  fetchData(): Observable<CatalogProductOfferingsResponse> {
    return this.http.post<CatalogProductOfferingsResponse>(this.apiUrl, {}).pipe(
      catchError(error => {
        console.error('Error fetching data', error);
        return of({ // Return an empty response object that matches the expected type
          CatalogProductOfferings: { CatalogProductOffering: [] },
          ReferenceList: [
            { Flight: [] },
            { Product: [] },
            { TermsAndConditions: [] },
            { Brand: [] }
          ]
        } as CatalogProductOfferingsResponse);
      })
    );
  }

  processData(response: CatalogProductOfferingsResponse): Observable<any[]> {
    const {
      CatalogProductOfferings: { CatalogProductOffering },
      ReferenceList: [ReferenceListFlight, ReferenceListProduct, ReferenceListTermsAndConditions, ReferenceListBrand]
    } = response;

    const termsIndex = new Map(ReferenceListTermsAndConditions.TermsAndConditions.map(term => [term.id, term]));
    const brandIndex = new Map(ReferenceListBrand.Brand.map(brand => [brand.id, brand]));
    const flightMap = new Map(ReferenceListFlight.Flight.map(flight => [flight.id, flight]));

    const productOfferMap = new Map(
      CatalogProductOffering.flatMap(options =>
        options.ProductBrandOptions.flatMap((option: { ProductBrandOffering: { Product: { productRef: any; }[]; }[]; }) =>
          option.ProductBrandOffering.map((product: { Product: { productRef: any; }[]; }) => [product.Product[0].productRef, { offers: options, productOffer: product }])
        )
      )
    );

    const matchingProducts = ReferenceListProduct.Product.map(product => {
      const productRef = product.id;
      const matchingOffering = productOfferMap.get(productRef);
      return matchingOffering ? { product, matchingOffering } : null;
    }).filter(Boolean);

    const findMatchingDetails = (productsMatched: any[], flightMap: Map<any, any>) => {
      return productsMatched.map(offering => {
        const flightRefs = offering.product.FlightSegment.map((option: { Flight: { FlightRef: any; }; }) => option.Flight.FlightRef);
        const matchingFlights = flightRefs.map((flightId: any) => flightMap.get(flightId)).filter(Boolean);

        const termsAndConditionsRef = [offering.matchingOffering.productOffer.TermsAndConditions.termsAndConditionsRef];
        const matchingTermCondition = termsAndConditionsRef.map(termsId => termsIndex.get(termsId));
        const brandRefs = [offering.matchingOffering.productOffer.Brand.BrandRef] || [];
        const matchingBrands = brandRefs.map(brandId => brandIndex.get(brandId)).filter(Boolean);

        return { offering, matchingFlights, matchingTermCondition, matchingBrands };
      });
    };

    const matchingDetails = findMatchingDetails(matchingProducts, flightMap);

    type GroupedFlight = {
      oneway?: any[];
      return?: any[];
    };

    const groupedFlight = matchingDetails.reduce((acc: GroupedFlight, flightGroup) => {
      const key = flightGroup.offering.matchingOffering.offers.sequence === 1 ? 'oneway' : 'return';
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key]!.push(flightGroup); // Non-null assertion operator
      return acc;
    }, {} as GroupedFlight);

    const productsWithMatchingCombinabilityCode = (groupedFlight.return?.length ?? 0) > 0
      ? groupedFlight.oneway?.map(product => {
          const combinabilityCode = product?.offering?.matchingOffering?.productOffer.CombinabilityCode[0];
          const matchingReturnProduct = groupedFlight.return?.find(returnProduct => {
            const returnCombinabilityCode = returnProduct?.offering.matchingOffering?.productOffer.CombinabilityCode[0];
            return combinabilityCode === returnCombinabilityCode;
          });
          return matchingReturnProduct ? { departureFlights: product, returnFlights: matchingReturnProduct } : { departureFlights: product };
        })
      : groupedFlight.oneway?.map(product => ({ departureFlights: product }));

    return of(productsWithMatchingCombinabilityCode || []);
  }
}
