//const jsonData = require("./flight-response.json")


class FFOffers {
  OfferId;
  OfferDetails;
}


 class FlightDetails {
  ID;
  Carrier;
  FlightNumber;
  Origin;
  Destination;
  DepDate;
  DepTime;
  ArrivalDate;
  ArrivalTime;
  ClassofService;
  FlightDuration;
  Distance;
  Equipment;
  ArrivalDetail;
  DepartureDetails;
}

class resultDetails {
  Type;
  TotalPrice;
  TotalTaxes;
  BrandRef;
  tierLevel;
  flights;
  returnflights;
  Currency;
  Carrier;
  Sequence;
  CombinabilityCode;
  OfferSource;
  Brandattributes;
  TotalDuration;
  TermsAndConditions;
}

class BrandAttributes {
  brandAttribute
}


 function getFlightCarrier(flightSegment, reference) {
  let details = "";
  let refOption = null;
  reference.forEach(function (refOptionLoop) {
    if (refOptionLoop["@type"] == "ReferenceListFlight") {
      refOption = refOptionLoop;
    }
  })

  flightSegment.forEach(function (segment) {
    refOption.Flight.forEach(function (refFlight) {
      if (refFlight.id == segment.Flight.FlightRef) {
        details = refFlight.carrier;
      }
    })
  })
  return details;
}

function getBrandDetails(ProductOffer, Reference) {
  let ProductDetails = new resultDetails();
  ProductDetails.Type = ProductOffer["@type"];
  if (ProductOffer.BestCombinablePrice != null) {
    ProductDetails.TotalPrice = ProductOffer.BestCombinablePrice.TotalPrice;
    ProductDetails.TotalTaxes = ProductOffer.BestCombinablePrice.TotalTaxes;
    ProductDetails.Currency = ProductOffer.BestCombinablePrice.CurrencyCode.value;
    ProductDetails.OfferSource = "GDS";
  }
  else {
    if (ProductOffer.Price.CurrencyCode != null) {
      ProductDetails.Currency = ProductOffer.Price.CurrencyCode.value;
      ProductDetails.OfferSource = "NDC";
    }

    ProductDetails.TotalPrice = ProductOffer.Price.TotalPrice;
    ProductDetails.TotalTaxes = ProductOffer.Price.TotalTaxes;

  }

  if (ProductDetails != null) {
    if (ProductOffer.Brand != null) {
      ProductDetails.BrandRef = ProductOffer.Brand.BrandRef;
      ProductDetails.tierLevel = getBrandDetailsAsString(ProductOffer.Brand.BrandRef, Reference);
      ProductDetails.Brandattributes = getBrandAttributes(ProductOffer.Brand.BrandRef, Reference);
    }
    ProductDetails.flights = getProductsDetails(ProductOffer.Product, Reference);
    ProductDetails.Carrier = getCarrierProductsDetailsAsString(ProductOffer.Product, Reference);
    ProductDetails.TotalDuration = getTotalDuration(ProductOffer.Product[0]?.productRef, Reference[1].Product)
    ProductDetails.TermsAndConditions = getTermsAndCondition(ProductOffer.TermsAndConditions.termsAndConditionsRef, Reference[2].TermsAndConditions)

    return ProductDetails;
  }
}

function getTotalDuration(productRef, referenceProduct) {
  // Use find to get the matching product
  const matchingProduct = referenceProduct.find(product => productRef === product.id);

  // Check if a matching product is found
  if (matchingProduct) {
    return matchingProduct.totalDuration;
  } else {
    // Handle the case when no matching product is found
    // You might want to return a default value or handle it based on your requirements
    return ""; // Defaulting to 0, replace with your logic
  }
}



function getBrandAttributes(brandRef, reference) {
  const brandOption = reference.find(
    refOption => refOption["@type"] === "ReferenceListBrand" && refOption.Brand
  );

  if (!brandOption) {
    return [];
  }

  const targetBrand = brandOption.Brand.find(brand => brand.id === brandRef);

  if (!targetBrand || !targetBrand.BrandAttribute) {
    return [];
  }

  return targetBrand.BrandAttribute.map(eachBrandAttribute => {
    const brandAttributeObj = new BrandAttributes();
    brandAttributeObj.brandAttribute =
      eachBrandAttribute.inclusion === "Not Offered"
        ? eachBrandAttribute.classification + "NotOffered"
        : eachBrandAttribute.classification + eachBrandAttribute.inclusion;

    return brandAttributeObj;
  });
}

function getTermsAndCondition(termsAndConditionRef, referenceTermsAndCondition) {
  const matchingTerms = referenceTermsAndCondition.find(terms => termsAndConditionRef === terms.id)
  if (matchingTerms) {
    return matchingTerms
  } else {
    return "";
  }
}


function getBrandDetailsAsString(brandRef, reference) {
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



function getCarrierProductsDetailsAsString(products, reference) {
  const productMap = new Map();

  for (const refOptionLoop of reference) {
    if (refOptionLoop["@type"] === "ReferenceListProduct" && refOptionLoop.Product) {
      for (const refProduct of refOptionLoop.Product) {
        productMap.set(refProduct.id, refProduct);
      }
    }
  }

  let carrier = "";

  for (const searchProduct of products) {
    const refProduct = productMap.get(searchProduct.productRef);

    if (refProduct) {
      carrier = getFlightCarrier(refProduct.FlightSegment, reference);
      break;
    }
  }

  return carrier;
}


function getProductsDetails(products, reference) {
  const refOption = reference.find(refOptionLoop => refOptionLoop["@type"] === "ReferenceListProduct");

  if (!refOption || !refOption.Product) {
    return [];
  }

  return products
    .map(searchProduct => refOption.Product.find(refProduct => refProduct.id === searchProduct.productRef))
    .filter(Boolean) // Remove undefined elements
    .map(refProduct => getFlightDetails(refProduct, reference));
}




function getFlightDetails(refProduct, reference) {
  const flights = [];
  const flightSegment = refProduct.FlightSegment;

  // Create a dictionary to map FlightRef to refFlight
  const refFlightMap = reference.find(
    refOption => refOption["@type"] === "ReferenceListFlight"
  )?.Flight.reduce((map, refFlight) => {
    map[refFlight.id] = refFlight;
    return map;
  }, {});

  if (!refFlightMap) {
    return flights;
  }

  flightSegment.forEach(segment => {
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
      flight.ClassofService = getFlightProductDetails(refProduct, segment.sequence);
      flight.Distance = refFlight.distance;
      flight.FlightDuration = refFlight.duration;
      flight.ArrivalDetail = refFlight.Arrival;
      flight.DepartureDetails = refFlight.Departure;
      flights.push(flight);
    }
  });

  return flights;
}


function getAllReturnFlights(returnflights, combinabilitycode, root, referenceList) {
  let listofOffers = root
  listofOffers.forEach(function (lofferReturn) {
    if (lofferReturn.sequence != 1) {
      lofferReturn.ProductBrandOptions.forEach(function (item) {
        item.ProductBrandOffering.forEach(function (poffer) {
          if (poffer.CombinabilityCode[0] == combinabilitycode) {

            let flight = getProductsDetails(poffer.Product, referenceList);

            returnflights.push(...flight);

          }
        })
      })
    }
  })

}


function getFlightProductDetails(refProduct, l) {
  let details = "";

  refProduct.PassengerFlight.forEach(flight => {
    flight.FlightProduct.forEach(product => {
      if (product.segmentSequence.includes(l)) {
        details += product.classOfService;
      }
    });
  });

  return details;
}


 function SearchDisplayAllOffers(jsonData) {
  let id = 0;
  let OfferList = [];

  if (jsonData != null && jsonData.CatalogProductOfferingsResponse != null && jsonData.CatalogProductOfferingsResponse.CatalogProductOfferings != null) {
    const { CatalogProductOfferings: { CatalogProductOffering }, ReferenceList } = jsonData.CatalogProductOfferingsResponse;

    CatalogProductOffering.forEach(function (catalogProduct) {
      if (catalogProduct.sequence == 1) {
        let offer;
        catalogProduct.ProductBrandOptions.forEach(function (brandOption) {
          offer = new FFOffers();
          offer.OfferId = id;
          let OfferDetails = [];
          brandOption.ProductBrandOffering.forEach(function (productOffering) {
            let details = getBrandDetails(productOffering, ReferenceList);
            if (details.TotalPrice == null) {
              details.TotalPrice = productOffering.Price.TotalPrice;
              details.Currency = productOffering.Price.CurrencyCode.value;
              details.OfferSource = "NDC";
            }
            details.returnflights = [];
            getAllReturnFlights(details.returnflights, productOffering.CombinabilityCode, CatalogProductOffering, ReferenceList);
            details.Sequence = catalogProduct.sequence;
            OfferDetails.push(details);
          })
          offer.OfferDetails = OfferDetails;
          OfferList.push(offer);
          id = id + 1;
        })
      }
    })
  }

  console.log(OfferList)

  return OfferList;
}


fetch('./flight-response.json')
  .then(response => response.json())
  .then(jsonData => {
    // Use jsonData here

    SearchDisplayAllOffers(jsonData)


    console.log(jsonData);
  })
  .catch(error => {
    console.error('Error fetching JSON:', error);
  });


//SearchDisplayAllOffers(jsonData)
