import { env, assertEnv } from '../config/env.js';
import { connectDB } from '../config/db.js';
import mongoose from 'mongoose';
import Product from '../models/Product.js';

const GS_DESC = `📚 Complete GS Notes Combo

Pre + Mains preparation ke liye important GS subjects ke handwritten notes.

📖 Includes:`;
const GS_SUBJECTS = ['Ancient History', 'Modern History', 'Indian Geography', 'World Geography', 'Polity', 'Economy', 'Art & Culture'];
const GS_FEATURES = ['Easy Revision', 'Handwritten Notes', 'Pre + Mains Oriented'];

const digital = (name, shortDescription, originalPrice, sellingPrice, extra = {}) => ({
  name, shortDescription, type: 'digital', originalPrice, sellingPrice,
  description: GS_DESC, subjects: GS_SUBJECTS, features: GS_FEATURES, ...extra,
});

const samples = [
  digital('Complete ✅ GS Notes Combo 📚 | Pre+Mains', '📚 Complete GS Notes Combo Pre + Mains preparation ke liye important GS subjects ke handwritten notes.', 349, 249),
  {
    name: '1:1 Clarity Session 🔥', type: 'video_call', originalPrice: 699, sellingPrice: 499,
    shortDescription: '🎯 1:1 Clarity Session with Aman A one-to-one session focused on understanding your preparation and next steps.',
    description: 'A focused one-to-one video call to understand your preparation, clear doubts and plan the next steps.',
    subjects: [], features: ['30 min video call', 'You pick the time'],
  },
  digital('घटनाचक्र All Notes 📚 - Hindi', '📚 घटनाचक्र GS Notes COMBO Complete GS preparation ke liye high-quality, handwritten notes.', 499, 299),
  digital('Ghatnachakr All Notes 📚 - English', '📚 All Notes 📚 - English Complete GS preparation ke liye high-quality, handwritten notes.', 699, 399),
  digital('SPECTRUM Notes Hindi – आधुनिक भारत', '📚 SPECTRUM BOOKS – आधुनिक भारत का इतिहास आधुनिक भारत के इतिहास की तैयारी के लिए notes.', 149, 69),
  digital('11th Notes Combo ( Hindi ) 📚', '📚 Class 11 Notes Combo Class 11 ki preparation ke liye subject-wise study notes.', 299, 149),
  digital('Class 12 Notes Combo ( Hindi ) 📚', '📚 Class 12 Notes Combo Class 12 ki preparation ke liye subject-wise study notes.', 399, 149),
  digital('UPSC + State PCS Master Notes 📚', '📚 UPSC + State PCS Master Notes Combo Complete GS preparation ke liye notes.', 599, 399),
  digital('SSC Complete Notes Combo 📚 | Hindi Medium', '📚 SSC COMPLETE NOTES COMBO | HINDI MEDIUM SSC CGL, CHSL, MTS notes.', 499, 299),
];

async function run() {
  assertEnv();
  await connectDB();
  if (process.argv.includes('--reset')) await Product.deleteMany({});
  const existing = await Product.countDocuments();
  if (existing > 0) {
    console.log(`Products already exist (${existing}). Use --reset to replace them.`);
  } else {
    for (const s of samples) await Product.create(s);
    console.log(`Seeded ${samples.length} products.`);
  }
  await mongoose.disconnect();
}
run().catch((e) => { console.error(e.message); process.exit(1); });
