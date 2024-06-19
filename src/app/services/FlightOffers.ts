export class FFOffers {
  OfferId: number;
  OfferDetails: ResultDetails[];

  constructor(offerId: number = 0, offerDetails: ResultDetails[] = []) {
    this.OfferId = offerId;
    this.OfferDetails = offerDetails;
  }
}

export class FlightDetails {
  ID: string;
  Carrier: string;
  FlightNumber: string;
  Origin: string;
  Destination: string;
  DepDate: string;
  DepTime: string;
  ArrivalDate: string;
  ArrivalTime: string;
  ClassofService: string;
  FlightDuration: string;
  Distance: string;
  Equipment: string;
  ArrivalDetail: any; // Define as per your JSON structure
  DepartureDetails: any; // Define as per your JSON structure

  constructor(
    id: string = '', carrier: string = '', flightNumber: string = '', origin: string = '', destination: string = '',
    depDate: string = '', depTime: string = '', arrivalDate: string = '', arrivalTime: string = '',
    classofService: string = '', flightDuration: string = '', distance: string = '', equipment: string = '',
    arrivalDetail: any = {}, departureDetails: any = {}
  ) {
    this.ID = id;
    this.Carrier = carrier;
    this.FlightNumber = flightNumber;
    this.Origin = origin;
    this.Destination = destination;
    this.DepDate = depDate;
    this.DepTime = depTime;
    this.ArrivalDate = arrivalDate;
    this.ArrivalTime = arrivalTime;
    this.ClassofService = classofService;
    this.FlightDuration = flightDuration;
    this.Distance = distance;
    this.Equipment = equipment;
    this.ArrivalDetail = arrivalDetail;
    this.DepartureDetails = departureDetails;
  }
}

export class ResultDetails {
  Type: string;
  TotalPrice: string;
  TotalTaxes: string;
  BrandRef: string;
  tierLevel: string;
  flights: FlightDetails[];
  returnflights: FlightDetails[];
  Currency: string;
  Carrier: string;
  Sequence: number;
  CombinabilityCode: string;
  OfferSource: string;
  Brandattributes: BrandAttributes[];
  TotalDuration: string;
  TermsAndConditions: string;

  constructor(
    type: string = '', totalPrice: string = '', totalTaxes: string = '', brandRef: string = '', tierLevel: string = '',
    flights: FlightDetails[] = [], returnflights: FlightDetails[] = [], currency: string = '', carrier: string = '',
    sequence: number = 0, combinabilityCode: string = '', offerSource: string = '', brandAttributes: BrandAttributes[] = [],
    totalDuration: string = '', termsAndConditions: string = ''
  ) {
    this.Type = type;
    this.TotalPrice = totalPrice;
    this.TotalTaxes = totalTaxes;
    this.BrandRef = brandRef;
    this.tierLevel = tierLevel;
    this.flights = flights;
    this.returnflights = returnflights;
    this.Currency = currency;
    this.Carrier = carrier;
    this.Sequence = sequence;
    this.CombinabilityCode = combinabilityCode;
    this.OfferSource = offerSource;
    this.Brandattributes = brandAttributes;
    this.TotalDuration = totalDuration;
    this.TermsAndConditions = termsAndConditions;
  }
}

export class BrandAttributes {
  brandAttribute: string;

  constructor(brandAttribute: string = '') {
    this.brandAttribute = brandAttribute;
  }
}

export interface Reference {
  "@type": string;
  [key: string]: any;
}

export interface CatalogProductOfferingsResponse {
  CatalogProductOfferings: {
    CatalogProductOffering: CatalogProductOffering[];
  };
  ReferenceList: Reference[];
}

export interface CatalogProductOffering {
  sequence: number;
  ProductBrandOptions: ProductBrandOption[];
}

export interface ProductBrandOption {
  ProductBrandOffering: ProductBrandOffering[];
}

export interface ProductBrandOffering {
  BestCombinablePrice?: Price;
  Price: Price;
  Brand?: {
    BrandRef: string;
  };
  Product: any[];
  CombinabilityCode: string;
}

export interface Price {
  TotalPrice: string;
  TotalTaxes: string;
  CurrencyCode: {
    value: string;
  };
}

