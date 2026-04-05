import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const imagesToConvert = [
  '/img/media-coverage/press-conference/gcv-06833.jpg',
  '/img/media-coverage/press-conference/gcv-07061.jpg',
  '/img/media-coverage/press-conference/gcv-07089.jpg',
];

const publicDir = path.join(process.cwd(), 'public');

async function convertImages() {
  for (const imagePath of imagesToConvert) {
    const inputPath = path.join(publicDir, imagePath);
    const outputPath = inputPath.replace(/\.jpg$/i, '.webp');

    try {
      // Check if input file exists
      if (!fs.existsSync(inputPath)) {
        console.log(`⚠️  File not found: ${inputPath}`);
        continue;
      }

      // Convert to webp
      await sharp(inputPath)
        .webp({ quality: 85 })
        .toFile(outputPath);

      console.log(`✅ Converted: ${imagePath} → ${path.basename(outputPath)}`);
    } catch (error) {
      console.error(`❌ Error converting ${imagePath}:`, error.message);
    }
  }
}

convertImages().then(() => {
  console.log('\n✨ Image conversion complete!');
  process.exit(0);
}).catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
