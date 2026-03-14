// DVD Bounce - Main Entry Point
import { state, getTextHeight, getCurrentColor, setCurrentColor, getRandomColor, update, keepInBounds, COLORS } from './physics.js';

const canvas = document.getElementById('dvd-canvas');
const ctx = canvas.getContext('2d');

function changeColor() {
  const newColor = getRandomColor(getCurrentColor());
  setCurrentColor(newColor);
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  
  keepInBounds(canvas, ctx);
}

function draw() {
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw DVD text with glow
  ctx.font = 'bold 80px "Space Grotesk", sans-serif';

  // Get current color
  const color = getCurrentColor();
  
  // Glow effect
  ctx.shadowColor = color;
  ctx.shadowBlur = 25;
  ctx.fillStyle = color;
  ctx.fillText('DVD', state.x, state.y + getTextHeight());

  // Reset shadow
  ctx.shadowBlur = 0;
}

function animate() {
  update(canvas, ctx);
  draw();
  requestAnimationFrame(animate);
}

// Handle spacebar press
document.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
    changeColor();
  }
});

// Handle window resize
window.addEventListener('resize', resizeCanvas);

// Initialize
setCurrentColor(COLORS[0]);
resizeCanvas();
animate();
