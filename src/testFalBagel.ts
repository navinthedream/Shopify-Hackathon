import { FalBagelAnalyzer } from './FalBagelAnalyzer';
import * as fs from 'fs';
import * as path from 'path';

// Load API key from environment variable
const FAL_KEY = process.env.FAL_KEY || '';
if (!FAL_KEY) {
  console.error('Please set the FAL_KEY environment variable.');
  process.exit(1);
}

// Path to test image (place a test_selfie.jpg in src/)
const imagePath = path.resolve(__dirname, 'test_selfie.jpg');
if (!fs.existsSync(imagePath)) {
  console.error('Test image not found:', imagePath);
  process.exit(1);
}

async function main() {
  const analyzer = new FalBagelAnalyzer({ apiKey: FAL_KEY });
  const fileBuffer = fs.readFileSync(imagePath);
  const blob = new Blob([fileBuffer], { type: 'image/jpeg' });
  try {
    console.log('Analyzing image...');
    const result = await analyzer.analyze({ image: blob, mode: 'comprehensive' });
    console.log('Analysis Result:\n', JSON.stringify(result, null, 2));
  } catch (err: any) {
    console.error('Error:', err.message || err);
  }
}

main(); 