// Seller profile shown on public pages. Override any value via env vars.
export const seller = {
  name: process.env.SELLER_NAME || 'Aman Singh Nayak',
  headline: process.env.SELLER_HEADLINE || "Farmer's Son | Topper | Teacher | CISF Selected | Motivational Speaker",
  about: process.env.SELLER_ABOUT || 'Hi Everyone!',
  avatar: process.env.SELLER_AVATAR || '',
  instagram: process.env.SELLER_INSTAGRAM || '',
  youtube: process.env.SELLER_YOUTUBE || '',
  email: process.env.SUPPORT_EMAIL || '',
};
