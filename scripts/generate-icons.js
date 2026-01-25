import { createCanvas } from 'canvas';
import { writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function generateIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = '#1a1a2e';
  ctx.beginPath();
  ctx.roundRect(0, 0, size, size, size * 0.125);
  ctx.fill();

  const scale = size / 512;

  // Metronome body (triangle)
  ctx.fillStyle = '#16213e';
  ctx.strokeStyle = '#4a90d9';
  ctx.lineWidth = 8 * scale;
  ctx.beginPath();
  ctx.moveTo(256 * scale, 80 * scale);
  ctx.lineTo(340 * scale, 400 * scale);
  ctx.lineTo(172 * scale, 400 * scale);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Pendulum line
  ctx.strokeStyle = '#e94560';
  ctx.lineWidth = 12 * scale;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(256 * scale, 120 * scale);
  ctx.lineTo(320 * scale, 200 * scale);
  ctx.stroke();

  // Pendulum weight
  ctx.fillStyle = '#e94560';
  ctx.beginPath();
  ctx.arc(320 * scale, 200 * scale, 20 * scale, 0, Math.PI * 2);
  ctx.fill();

  // Base
  ctx.fillStyle = '#4a90d9';
  ctx.beginPath();
  ctx.roundRect(152 * scale, 380 * scale, 208 * scale, 40 * scale, 8 * scale);
  ctx.fill();

  // Scale marks
  ctx.fillStyle = 'rgba(74, 144, 217, 0.5)';
  const marks = [
    { x: 220, y: 160, w: 72 },
    { x: 210, y: 200, w: 92 },
    { x: 200, y: 240, w: 112 },
    { x: 190, y: 280, w: 132 },
    { x: 180, y: 320, w: 152 },
  ];
  marks.forEach(mark => {
    ctx.beginPath();
    ctx.roundRect(mark.x * scale, mark.y * scale, mark.w * scale, 4 * scale, 2 * scale);
    ctx.fill();
  });

  return canvas.toBuffer('image/png');
}

// Generate icons
const sizes = [192, 512];
const iconsDir = join(__dirname, '..', 'public', 'icons');

sizes.forEach(size => {
  const buffer = generateIcon(size);
  const filename = join(iconsDir, `icon-${size}.png`);
  writeFileSync(filename, buffer);
  console.log(`Generated ${filename}`);
});

console.log('Icons generated successfully!');
