export const formatINR = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n ?? 0);

export const discountPercent = (original, selling) =>
  original > 0 ? Math.round(((original - selling) / original) * 100) : 0;
