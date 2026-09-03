// Configurable average clothing weight used for the sustainability estimate.
// This is a rough, transparent estimate, not a scientifically exact measurement.
const AVERAGE_GARMENT_WEIGHT_KG = 0.7;

function estimateTextileWasteAvoidedKg(itemsSwapped) {
  return Math.round(itemsSwapped * AVERAGE_GARMENT_WEIGHT_KG * 10) / 10;
}

module.exports = { AVERAGE_GARMENT_WEIGHT_KG, estimateTextileWasteAvoidedKg };
