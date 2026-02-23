/**
 * NHTSA vPIC API Service
 * Free VIN decoder API from US Department of Transportation.
 * Docs: https://vpic.nhtsa.dot.gov/api/
 */

const https = require('https');

const API_BASE = 'https://vpic.nhtsa.dot.gov/api/vehicles';
const TIMEOUT_MS = 10000;

/**
 * Decode VIN using NHTSA API
 * @param {string} vin - VIN number (17 chars)
 * @returns {Promise<Object>}
 */
async function decodeVin(vin) {
  try {
    const url = `${API_BASE}/decodevin/${vin}?format=json`;
    const response = await fetchJson(url);

    if (!response.Results || response.Results.length === 0) {
      return { available: false, error: 'No data from NHTSA' };
    }

    return {
      available: true,
      vin: vin,
      data: parseResults(response.Results),
      raw: response.Results,
    };
  } catch (error) {
    return {
      available: false,
      error: error.message,
    };
  }
}

/**
 * Parse NHTSA results into structured object
 */
function parseResults(results) {
  const cleanValue = (val) => {
    if (!val || val === '-' || val === 'Not Applicable' || val === '') {
      return null;
    }
    return val.trim();
  };

  const getByName = (name) => {
    const item = results.find((r) => r.Variable === name);
    return cleanValue(item?.Value);
  };

  return {
    make: getByName('Make'),
    model: getByName('Model'),
    year: getByName('Model Year'),
    manufacturer: getByName('Manufacturer Name'),
    plantCountry: getByName('Plant Country'),
    plantCity: getByName('Plant City'),
    vehicleType: getByName('Vehicle Type'),
    bodyClass: getByName('Body Class'),
    doors: getByName('Doors'),
    engineCylinders: getByName('Engine Number of Cylinders'),
    engineDisplacement: getByName('Displacement (L)'),
    engineHP: getByName('Engine Brake (hp) From'),
    fuelType: getByName('Fuel Type - Primary'),
    driveType: getByName('Drive Type'),
    transmission: getByName('Transmission Style'),
    abs: getByName('Anti-lock Braking System (ABS)'),
    trim: getByName('Trim'),
    series: getByName('Series'),
    errorCode: getByName('Error Code'),
    errorText: getByName('Error Text'),
  };
}

/**
 * Fetch JSON from URL
 */
function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { timeout: TIMEOUT_MS }, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          reject(new Error('Invalid JSON from NHTSA'));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`NHTSA API error: ${error.message}`));
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('NHTSA API timeout'));
    });
  });
}

module.exports = { decodeVin };
