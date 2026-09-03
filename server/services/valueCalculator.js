// Rule-based swap value estimator (Section 16). No AI involved — purely deterministic.

const BASE_CATEGORY_VALUE = {
  'T-Shirts': 500, 'Shirts': 700, 'Jeans': 1200, 'Trousers': 900,
  'Jackets': 1800, 'Hoodies': 1100, 'Sweaters': 1000, 'Dresses': 1400,
  'Skirts': 800, 'Shorts': 600, 'Ethnic Wear': 1600, 'Sportswear': 900,
  'Formal Wear': 2000, 'Shoes': 1500, 'Accessories': 500,
};

const BRAND_FACTORS = {
  "Levi's": 1.3, Nike: 1.35, Adidas: 1.3, 'H&M': 1.0, Zara: 1.15,
  Uniqlo: 1.1, Puma: 1.2, Roadster: 0.9, 'Allen Solly': 1.05,
  'Peter England': 1.0,
};
const DEFAULT_BRAND_FACTOR = 0.95;

const CONDITION_FACTORS = {
  New: 1.0, 'Like New': 0.9, Excellent: 0.75, Good: 0.6, Fair: 0.4,
};

const currentYear = () => new Date().getFullYear();

const ageFactor = (purchaseYear) => {
  if (!purchaseYear) return 0.85;
  const age = Math.max(0, currentYear() - Number(purchaseYear));
  if (age <= 0) return 1.0;
  if (age === 1) return 0.9;
  if (age === 2) return 0.8;
  if (age <= 4) return 0.65;
  return 0.5;
};

/**
 * Estimates a swap value for a clothing item using:
 * Estimated Value = Base Category Value × Brand Factor × Condition Factor × Age Factor
 */
exports.estimateValue = ({ category, brand, condition, purchaseYear }) => {
  const base = BASE_CATEGORY_VALUE[category] || 700;
  const brandFactor = BRAND_FACTORS[brand] || DEFAULT_BRAND_FACTOR;
  const conditionFactor = CONDITION_FACTORS[condition] || 0.6;
  const age = ageFactor(purchaseYear);

  const raw = base * brandFactor * conditionFactor * age;
  // Round to nearest 50 to look like realistic Indian pricing (₹500, ₹800, ₹1,200 ...)
  return Math.max(100, Math.round(raw / 50) * 50);
};

/**
 * Computes fairness of a proposed swap given two total values (Section 17)
 */
exports.computeFairness = (valueA, valueB) => {
  const diff = Math.abs(valueA - valueB);
  const avg = (valueA + valueB) / 2 || 1;
  const pctDiff = (diff / avg) * 100;

  let label = 'Large Value Difference';
  if (pctDiff < 10) label = 'Excellent Match';
  else if (pctDiff < 20) label = 'Good Match';
  else if (pctDiff < 35) label = 'Moderate Match';

  return {
    difference: diff,
    percentDifference: Math.round(pctDiff * 10) / 10,
    fairness: label,
  };
};

exports.BASE_CATEGORY_VALUE = BASE_CATEGORY_VALUE;
exports.BRAND_FACTORS = BRAND_FACTORS;
exports.CONDITION_FACTORS = CONDITION_FACTORS;
