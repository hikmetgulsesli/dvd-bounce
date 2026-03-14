// Physics module - pure logic, no DOM dependencies
// This can be tested without JSDOM

export const state = {
  x: 100,
  y: 100,
  vx: 3,
  vy: 3,
  margin: 10
};

export const COLORS = [
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

export function getTextHeight() {
  return 80;
}

export function getTextWidth(ctx) {
  ctx.font = 'bold 80px "Space Grotesk", sans-serif';
  return ctx.measureText('DVD').width;
}

export function getCurrentColor() {
  return currentColor;
}

export function setCurrentColor(color) {
  currentColor = color;
  state.color = color;
}

export function getRandomColor(exclude) {
  const available = COLORS.filter((c) => c !== exclude);
  return available[Math.floor(Math.random() * available.length)];
}

// Update function - pure physics logic
export function update(canvas, ctx) {
  state.x += state.vx;
  state.y += state.vy;

  const textWidth = getTextWidth(ctx);
  const textHeight = getTextHeight();

  // Bounce off edges
  if (state.x <= state.margin) {
    state.x = state.margin;
    state.vx = Math.abs(state.vx);
  }
  if (state.x + textWidth >= canvas.width - state.margin) {
    state.x = canvas.width - textWidth - state.margin;
    state.vx = -Math.abs(state.vx);
  }
  // Top bounce: y position (which is the text baseline) should stay >= margin
  if (state.y <= state.margin) {
    state.y = state.margin;
    state.vy = Math.abs(state.vy);
  }
  // Bottom bounce: y + textHeight should stay <= canvas.height - margin
  if (state.y + textHeight >= canvas.height - state.margin) {
    state.y = canvas.height - textHeight - state.margin;
    state.vy = -Math.abs(state.vy);
  }
}

// Keep logo in bounds (for resize handling)
export function keepInBounds(canvas, ctx) {
  const textHeight = getTextHeight();
  
  if (state.x + getTextWidth(ctx) > canvas.width - state.margin) {
    state.x = canvas.width - getTextWidth(ctx) - state.margin;
  }
  if (state.y + textHeight > canvas.height - state.margin) {
    state.y = canvas.height - textHeight - state.margin;
  }
}
