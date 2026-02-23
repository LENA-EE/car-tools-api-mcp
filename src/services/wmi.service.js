/**
 * WMI (World Manufacturer Identifier) Service
 * Decodes first 3 characters of VIN to identify manufacturer and country.
 */

// WMI database (first 3 chars of VIN)
const WMI_DATA = {
  // Germany
  WBA: { brand: 'BMW', country: 'Germany' },
  WBS: { brand: 'BMW M', country: 'Germany' },
  WDB: { brand: 'Mercedes-Benz', country: 'Germany' },
  WDD: { brand: 'Mercedes-Benz', country: 'Germany' },
  WDC: { brand: 'Mercedes-Benz', country: 'Germany' },
  WMW: { brand: 'MINI', country: 'Germany' },
  WAU: { brand: 'Audi', country: 'Germany' },
  WVW: { brand: 'Volkswagen', country: 'Germany' },
  WVG: { brand: 'Volkswagen', country: 'Germany' },
  WP0: { brand: 'Porsche', country: 'Germany' },
  WP1: { brand: 'Porsche', country: 'Germany' },

  // Japan
  JT: { brand: 'Toyota', country: 'Japan' },
  JN: { brand: 'Nissan', country: 'Japan' },
  JH: { brand: 'Honda', country: 'Japan' },
  JM: { brand: 'Mazda/Mitsubishi', country: 'Japan' },
  JS: { brand: 'Suzuki', country: 'Japan' },
  JF: { brand: 'Subaru', country: 'Japan' },

  // USA
  '1G': { brand: 'General Motors', country: 'USA' },
  '1F': { brand: 'Ford', country: 'USA' },
  '1C': { brand: 'Chrysler', country: 'USA' },
  '1J': { brand: 'Jeep', country: 'USA' },
  '1L': { brand: 'Lincoln', country: 'USA' },
  '2F': { brand: 'Ford', country: 'Canada' },
  '2G': { brand: 'General Motors', country: 'Canada' },
  '3F': { brand: 'Ford', country: 'Mexico' },
  '3G': { brand: 'General Motors', country: 'Mexico' },
  '5Y': { brand: 'Toyota', country: 'USA' },
  '5T': { brand: 'Toyota', country: 'USA' },

  // South Korea
  KM: { brand: 'Hyundai/Kia', country: 'South Korea' },
  KN: { brand: 'Kia', country: 'South Korea' },

  // UK
  SAJ: { brand: 'Jaguar', country: 'UK' },
  SAL: { brand: 'Land Rover', country: 'UK' },
  SAR: { brand: 'Land Rover', country: 'UK' },
  SCC: { brand: 'Lotus', country: 'UK' },

  // Italy
  ZAR: { brand: 'Alfa Romeo', country: 'Italy' },
  ZFA: { brand: 'Fiat', country: 'Italy' },
  ZFF: { brand: 'Ferrari', country: 'Italy' },
  ZLA: { brand: 'Lancia', country: 'Italy' },
  ZAM: { brand: 'Maserati', country: 'Italy' },

  // France
  VF1: { brand: 'Renault', country: 'France' },
  VF3: { brand: 'Peugeot', country: 'France' },
  VF7: { brand: 'Citroen', country: 'France' },

  // Sweden
  YV1: { brand: 'Volvo', country: 'Sweden' },
  YS3: { brand: 'Saab', country: 'Sweden' },

  // Czech
  TMB: { brand: 'Skoda', country: 'Czech Republic' },

  // Russia
  XTA: { brand: 'Lada', country: 'Russia' },
  XTT: { brand: 'UAZ', country: 'Russia' },
  X96: { brand: 'GAZ', country: 'Russia' },

  // China
  LFV: { brand: 'FAW-Volkswagen', country: 'China' },
  LVS: { brand: 'Ford China', country: 'China' },
  LSG: { brand: 'SAIC GM', country: 'China' },
};

/**
 * Decode WMI from VIN
 * @param {string} vin - VIN number
 * @returns {Object} { brand, country, wmi }
 */
function decodeWmi(vin) {
  if (!vin || vin.length < 3) {
    return { brand: null, country: null, wmi: null };
  }

  const wmi3 = vin.substring(0, 3).toUpperCase();
  const wmi2 = vin.substring(0, 2).toUpperCase();

  // Try 3-char WMI first, then 2-char (for Japanese manufacturers)
  const data = WMI_DATA[wmi3] || WMI_DATA[wmi2];

  if (data) {
    return {
      brand: data.brand,
      country: data.country,
      wmi: wmi3,
    };
  }

  // Unknown WMI - try to guess country by first char
  const firstChar = vin[0].toUpperCase();
  const countryByFirstChar = {
    '1': 'USA',
    '2': 'Canada',
    '3': 'Mexico',
    '4': 'USA',
    '5': 'USA',
    J: 'Japan',
    K: 'South Korea',
    L: 'China',
    S: 'UK',
    V: 'France/Spain',
    W: 'Germany',
    X: 'Russia/Europe',
    Y: 'Sweden/Finland',
    Z: 'Italy',
  };

  return {
    brand: null,
    country: countryByFirstChar[firstChar] || 'Unknown',
    wmi: wmi3,
  };
}

module.exports = { decodeWmi };
