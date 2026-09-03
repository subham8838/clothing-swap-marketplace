// Rule-based (non-AI) clothing value estimator.
// Estimated value = Base Category Value x Brand Factor x Condition Factor x Age Factor

const CATEGORY_BASE_VALUES = {
  'T-Shirts': 500, 'Shirts': 800, 'Jeans': 1200, 'Trousers': 900, 'Jackets': 2000,
  'Hoodies': 1100, 'Sweaters': 1000, 'Dresses': 1300, 'Skirts': 800, 'Shorts': 600,
  'Ethnic Wear': 1500, 'Sportswear': 900, 'Formal Wear': 1800, 'Shoes': 1600,
  'Accessories': 500,
};

const BRAND_FACTORS = {
  "Nike": 1.4, "Adidas": 1.35, "Levi's": 1.3, "Zara": 1.15, "H&M": 1.0,
  "Uniqlo": 1.1, "Puma": 1.25, "Roadster": 0.9, "Allen Solly": 1.05, "Peter England": 1.0,
};
const DEFAULT_BRAND_FACTOR = 0.85;

const CONDITION_FACTORS = {
  'New': 1.0, 'Like New': 0.9, 'Excellent': 0.75, 'Good': 0.6, 'Fair': 0.4,
};

function ageFactor(purchaseYear) {
  if (!purchaseYear) return 0.85;
  const age = new Date().getFullYear() - purchaseYear;
  if (age <= 0) return 1.0;
  if (age === 1) return 0.9;
  if (age === 2) return 0.8;
  if (age <= 4) return 0.65;
  return 0.5;
}

function calculateEstimatedValue({ category, brand, condition, purchaseYear }) {
  const base = CATEGORY_BASE_VALUES[category] || 700;
  const brandFactor = BRAND_FACTORS[brand] || DEFAULT_BRAND_FACTOR;
  const conditionFactor = CONDITION_FACTORS[condition] || 0.6;
  const age = ageFactor(purchaseYear);
  const value = base * brandFactor * conditionFactor * age;
  return Math.round(value / 10) * 10; // round to nearest 10
}

function calculateFairness(offeredValue, requestedValue) {
  const diff = Math.abs(offeredValue - requestedValue);
  const base = Math.max(offeredValue, requestedValue, 1);
  const pct = (diff / base) * 100;
  let fairness;
  if (pct < 10) fairness = 'Excellent Match';
  else if (pct < 20) fairness = 'Good Match';
  else if (pct < 35) fairness = 'Moderate Match';
  else fairness = 'Large Value Difference';
  return { difference: diff, percentDifference: Math.round(pct * 10) / 10, fairness };
}

module.exports = { calculateEstimatedValue, calculateFairness, CATEGORY_BASE_VALUES, BRAND_FACTORS, CONDITION_FACTORS };
