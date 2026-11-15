import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 160 },
    shortDescription: { type: String, trim: true, maxlength: 300, default: '' },
    description: { type: String, trim: true, default: '' },
    type: { type: String, enum: ['digital', 'video_call'], default: 'digital', index: true },
    thumbnail: { type: String, default: '' },
    pdfFileKey: { type: String, default: '', select: false },
    originalPrice: { type: Number, required: true, min: 0 },
    sellingPrice: { type: Number, required: true, min: 0 },
    discount: { type: Number, min: 0, max: 100, default: 0 }, // percent, derived
    subjects: [{ type: String, trim: true }],
    features: [{ type: String, trim: true }],
    status: { type: String, enum: ['active', 'inactive'], default: 'active', index: true },
  },
  { timestamps: true }
);

productSchema.pre('validate', function () {
  if (this.sellingPrice > this.originalPrice) {
    throw new Error('sellingPrice cannot exceed originalPrice');
  }
  this.discount = this.originalPrice > 0
    ? Math.round(((this.originalPrice - this.sellingPrice) / this.originalPrice) * 100)
    : 0;
});

productSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model('Product', productSchema);
