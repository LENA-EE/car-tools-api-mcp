/**
 * VIN Tools
 * decode_vin - Basic VIN decoding
 * check_vin - Full VIN check with pledges, accidents, etc.
 */

const nhtsaService = require('../services/nhtsa.service');
const fnpService = require('../services/fnp.service');
const wmiService = require('../services/wmi.service');

/**
 * Validate VIN format
 */
function validateVin(vin) {
  if (!vin || typeof vin !== 'string') {
    return { valid: false, error: 'VIN is required' };
  }

  const cleanVin = vin.toUpperCase().replace(/[^A-HJ-NPR-Z0-9]/g, '');

  if (cleanVin.length !== 17) {
    return { valid: false, error: `VIN must be 17 characters (got ${cleanVin.length})` };
  }

  // Check for invalid characters (I, O, Q are not used in VINs)
  if (/[IOQ]/.test(cleanVin)) {
    return { valid: false, error: 'VIN contains invalid characters (I, O, Q)' };
  }

  return { valid: true, vin: cleanVin };
}

/**
 * Decode VIN (basic info only)
 * @param {Object} args - { vin }
 * @returns {Promise<Object>}
 */
async function decodeVin(args) {
  const validation = validateVin(args.vin);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  const vin = validation.vin;

  // Get WMI data (instant, from local database)
  const wmi = wmiService.decodeWmi(vin);

  // Get NHTSA data (API call)
  const nhtsa = await nhtsaService.decodeVin(vin);

  // Combine results
  const decode = {
    vin,
    brand: nhtsa.data?.make || wmi.brand || 'Unknown',
    model: nhtsa.data?.model || null,
    year: nhtsa.data?.year || null,
    country: wmi.country || nhtsa.data?.plantCountry || 'Unknown',
    bodyType: nhtsa.data?.bodyClass || null,
    engine: nhtsa.data?.engineDisplacement
      ? `${nhtsa.data.engineDisplacement}L ${nhtsa.data.engineCylinders || ''}cyl`
      : null,
    fuelType: nhtsa.data?.fuelType || null,
    driveType: nhtsa.data?.driveType || null,
    transmission: nhtsa.data?.transmission || null,
  };

  return {
    success: true,
    vin,
    decode,
    nhtsa: nhtsa.available ? nhtsa.data : null,
    wmi,
  };
}

/**
 * Full VIN check (decode + pledges + GIBDD)
 * @param {Object} args - { vin }
 * @returns {Promise<Object>}
 */
async function checkVin(args) {
  // First decode
  const decodeResult = await decodeVin(args);
  if (!decodeResult.success) {
    return decodeResult;
  }

  const vin = decodeResult.vin;

  // Check pledges (FNP)
  let fnp = null;
  try {
    fnp = await fnpService.checkPledges(vin);
  } catch (err) {
    fnp = { available: false, error: err.message };
  }

  // GIBDD check (placeholder - requires Russian IP and complex API)
  const gibdd = {
    available: false,
    message: 'GIBDD check not available (requires Russian IP)',
  };

  // Calculate status
  let status = 'ok';
  if (fnp?.pledgesCount > 0) status = 'danger';
  if (gibdd?.wanted) status = 'danger';
  if (gibdd?.accidentsCount > 0) status = 'warning';

  // Generate summary
  const vehicle = [decodeResult.decode.brand, decodeResult.decode.model, decodeResult.decode.year]
    .filter(Boolean)
    .join(' ');

  let summary = vehicle || 'Vehicle';
  if (decodeResult.decode.country && decodeResult.decode.country !== 'Unknown') {
    summary += ` (${decodeResult.decode.country})`;
  }

  if (status === 'ok') {
    summary += ' - No issues found';
  } else if (status === 'warning') {
    summary += ' - Has warnings';
  } else if (status === 'danger') {
    summary += ' - Issues detected!';
  }

  return {
    success: true,
    vin,
    decode: decodeResult.decode,
    nhtsa: decodeResult.nhtsa,
    wmi: decodeResult.wmi,
    fnp,
    gibdd,
    status,
    summary,
    checkedAt: new Date().toISOString(),
  };
}

module.exports = { decodeVin, checkVin };
