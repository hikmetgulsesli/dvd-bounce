const canvas = document.getElementById('dvd-canvas');
const ctx = canvas.getContext('2d');

const COLORS = [
  '#FF0000', // Red
  '#00FF00', // Green
  '#0000FF', // Blue
  '#FFFF00', // Yellow
  '#FF00FF', // Magenta
  '#00FFFF', // Cyan
  '#FF8000', // Orange
  '#8000FF', // Purple
  '#00FF80', // Spring Green
  '#FF0080'  // Pink
];

let currentColor = COLORS[0];
let x = 100;
let y = 100;
let vx = 3;
let vy = 3;
const margin = 10;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  // Keep logo in bounds after resize
  if (x + getTextWidth() > canvas.width - margin) {
    x = canvas.width - getTextWidth() - margin;
  }
  if (y > canvas.height - margin) {
    y = canvas.height - margin;
  }
}

function getTextWidth() {
  ctx.font = 'bold 80px "Space Grotesk", sans-serif';
  return ctx.measureText('DVD').width;
}

function getTextHeight() {
  return 80;
}

function getRandomColor(exclude) {
  const available = COLORS.filter((c) => c !== exclude);
  return available[Math.floor(Math.random() * available.length)];
}

function draw() {
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw DVD text with glow
  ctx.font = 'bold 80px "Space Grotesk", sans-serif';

  // Glow effect
  ctx.shadowColor = currentColor;
  ctx.shadowBlur = 25;
  ctx.fillStyle = currentColor;
  ctx.fillText('DVD', x, y + getTextHeight());

  // Reset shadow
  ctx.shadowBlur = 0;
}

function update() {
  x += vx;
  y += vy;

  const textWidth = getTextWidth();
  const textHeight = getTextHeight();

  // Bounce off edges
  if (x <= margin) {
    x = margin;
    vx = Math.abs(vx);
  }
  if (x + textWidth >= canvas.width - margin) {
    x = canvas.width - textWidth - margin;
    vx = -Math.abs(vx);
  }
  if (y <= textHeight) {
    y = textHeight;
    vy = Math.abs(vy);
  }
  if (y >= canvas.height - margin) {
    y = canvas.height - margin;
    vy = -Math.abs(vy);
  }
}

function animate() {
  update();
  draw();
  requestAnimationFrame(animate);
}

// Handle spacebar press
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
    currentColor = getRandomColor(currentColor);
  }
});

// Handle window resize
window.addEventListener('resize', resizeCanvas);

// Initialize
resizeCanvas();
animate();
