import sharp from 'sharp';
import { readFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const inputSvg = join(__dirname, '../public/vite.svg');
const publicDir = join(__dirname, '../public');

// Read the SVG file
const svgBuffer = readFileSync(inputSvg);

// Generate different sizes
const sizes = {
    'favicon-16x16.png': 16,
    'favicon.png': 32,
    'apple-touch-icon.png': 180,
    'android-chrome-192x192.png': 192,
    'android-chrome-512x512.png': 512
};

// Generate each size
Object.entries(sizes).forEach(([filename, size]) => {
    sharp(svgBuffer)
        .resize(size, size)
        .png()
        .toFile(join(publicDir, filename))
        .then(() => console.log(`Generated ${filename}`))
        .catch(err => console.error(`Error generating ${filename}:`, err));
});
