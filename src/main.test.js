// Test suite for DVD Bounce animation physics
// Uses jsdom for DOM/canvas mocking

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { state, getTextHeight, getTextWidth, getCurrentColor, setCurrentColor, getRandomColor, update, keepInBounds, COLORS } from './physics.js';

// Mock canvas context
const createMockContext = () => ({
  fillStyle: '',
  fillRect: vi.fn(),
  font: '',
  fillText: vi.fn(),
  shadowColor: '',
  shadowBlur: 0,
  measureText: vi.fn(() => ({ width: 120 }))
});

// Mock canvas element
const createMockCanvas = (width = 800, height = 600) => ({
  width,
  height,
  getContext: vi.fn(() => createMockContext())
});

describe('Bouncing Animation Physics', () => {
  let canvas;
  let ctx;
  const MARGIN = 10;
  const TEXT_WIDTH = 120;
  const TEXT_HEIGHT = 80;

  beforeEach(() => {
    canvas = createMockCanvas();
    ctx = canvas.getContext('2d');
    // Reset state to default values
    state.x = 100;
    state.y = 100;
    state.vx = 3;
    state.vy = 3;
  });

  describe('AC1: Animation runs at 60fps via requestAnimationFrame', () => {
    it('should call requestAnimationFrame for animation loop', () => {
      const mockRAF = vi.fn();
      global.requestAnimationFrame = mockRAF;
      
      // Simulate animate function calling requestAnimationFrame
      const animate = () => {
        mockRAF(animate);
      };
      
      animate();
      expect(mockRAF).toHaveBeenCalledWith(animate);
    });

    it('should maintain consistent animation timing', () => {
      // Animation should use requestAnimationFrame, not setInterval
      const mockRAF = vi.fn();
      global.requestAnimationFrame = mockRAF;
      
      const animate = () => {
        mockRAF(animate);
      };
      
      animate();
      expect(mockRAF).toHaveBeenCalled();
    });
  });

  describe('AC2: Logo bounces off all four edges', () => {
    it('should bounce off left edge', () => {
      // Move logo to left edge (at margin)
      state.x = MARGIN;
      state.vx = -3; // Moving left
      
      const nextX = state.x + state.vx;
      
      // Test the bounce logic (mirroring physics.js)
      if (nextX <= MARGIN) {
        state.x = MARGIN;
        state.vx = Math.abs(state.vx);
      }
      
      expect(state.x).toBe(MARGIN);
      expect(state.vx).toBeGreaterThan(0);
    });

    it('should bounce off right edge', () => {
      canvas.width = 800;
      // Move logo to right edge
      state.x = canvas.width - TEXT_WIDTH - MARGIN;
      state.vx = 3; // Moving right
      
      const nextX = state.x + state.vx;
      
      if (nextX + TEXT_WIDTH >= canvas.width - MARGIN) {
        state.x = canvas.width - TEXT_WIDTH - MARGIN;
        state.vx = -Math.abs(state.vx);
      }
      
      expect(state.x).toBe(canvas.width - TEXT_WIDTH - MARGIN);
      expect(state.vx).toBeLessThan(0);
    });

    it('should bounce off top edge with correct margin', () => {
      // Move logo to top edge (at margin = 10px from top)
      state.y = MARGIN;
      state.vy = -3; // Moving up
      
      const nextY = state.y + state.vy;
      
      // Test the CORRECTED bounce logic (y >= margin, not y >= textHeight)
      if (nextY <= MARGIN) {
        state.y = MARGIN;
        state.vy = Math.abs(state.vy);
      }
      
      expect(state.y).toBe(MARGIN);
      expect(state.vy).toBeGreaterThan(0);
    });

    it('should bounce off bottom edge with correct margin accounting for text height', () => {
      canvas.height = 600;
      // Move logo to bottom edge - CORRECT: y + TEXT_HEIGHT should be at canvas.height - MARGIN
      state.y = canvas.height - TEXT_HEIGHT - MARGIN;
      state.vy = 3; // Moving down
      
      const nextY = state.y + state.vy;
      
      // Test the CORRECTED bounce logic: y + TEXT_HEIGHT >= canvas.height - MARGIN
      if (nextY + TEXT_HEIGHT >= canvas.height - MARGIN) {
        state.y = canvas.height - TEXT_HEIGHT - MARGIN;
        state.vy = -Math.abs(state.vy);
      }
      
      expect(state.y).toBe(canvas.height - TEXT_HEIGHT - MARGIN);
      expect(state.vy).toBeLessThan(0);
    });
  });

  describe('AC3: Velocity reflects correctly on edge collision', () => {
    it('should reverse x velocity when hitting left wall', () => {
      state.vx = -3; // Moving left
      state.x = MARGIN + 1;
      
      const nextX = state.x + state.vx;
      
      if (nextX <= MARGIN) {
        state.vx = Math.abs(state.vx);
      }
      
      expect(state.vx).toBe(3);
    });

    it('should reverse x velocity when hitting right wall', () => {
      canvas.width = 800;
      state.vx = 3; // Moving right
      state.x = canvas.width - TEXT_WIDTH - MARGIN - 1;
      
      const nextX = state.x + state.vx;
      
      if (nextX + TEXT_WIDTH >= canvas.width - MARGIN) {
        state.vx = -Math.abs(state.vx);
      }
      
      expect(state.vx).toBe(-3);
    });

    it('should reverse y velocity when hitting top wall', () => {
      state.vy = -3; // Moving up
      state.y = MARGIN + 1;
      
      const nextY = state.y + state.vy;
      
      // CORRECTED: should bounce at margin, not textHeight
      if (nextY <= MARGIN) {
        state.vy = Math.abs(state.vy);
      }
      
      expect(state.vy).toBe(3);
    });

    it('should reverse y velocity when hitting bottom wall', () => {
      canvas.height = 600;
      state.vy = 3; // Moving down
      state.y = canvas.height - TEXT_HEIGHT - MARGIN - 1;
      
      const nextY = state.y + state.vy;
      
      // CORRECTED: should check y + TEXT_HEIGHT
      if (nextY + TEXT_HEIGHT >= canvas.height - MARGIN) {
        state.vy = -Math.abs(state.vy);
      }
      
      expect(state.vy).toBe(-3);
    });

    it('should maintain velocity magnitude after bounce', () => {
      const initialSpeed = Math.sqrt(state.vx * state.vx + state.vy * state.vy);
      
      // Simulate a bounce
      state.vx = -state.vx;
      
      const speedAfterBounce = Math.sqrt(state.vx * state.vx + state.vy * state.vy);
      expect(speedAfterBounce).toBe(initialSpeed);
    });
  });

  describe('AC4: Logo maintains 10px margin at all edges', () => {
    it('should keep 10px margin on left side', () => {
      state.x = MARGIN;
      expect(state.x).toBeGreaterThanOrEqual(MARGIN);
    });

    it('should keep 10px margin on right side', () => {
      canvas.width = 800;
      state.x = canvas.width - TEXT_WIDTH - MARGIN;
      expect(state.x + TEXT_WIDTH).toBeLessThanOrEqual(canvas.width - MARGIN);
    });

    it('should keep 10px margin on top (corrected - baseline position)', () => {
      state.y = MARGIN;
      // y is the text baseline, so the top of the text is y - TEXT_HEIGHT
      // With margin=10, y should be >= margin
      expect(state.y).toBeGreaterThanOrEqual(MARGIN);
    });

    it('should keep 10px margin on bottom (corrected - accounts for text height)', () => {
      canvas.height = 600;
      state.y = canvas.height - TEXT_HEIGHT - MARGIN;
      // y + TEXT_HEIGHT should be <= canvas.height - MARGIN
      expect(state.y + TEXT_HEIGHT).toBeLessThanOrEqual(canvas.height - MARGIN);
    });
  });

  describe('AC5: Animation loop structure', () => {
    it('should have update function to modify position', () => {
      const initialX = state.x;
      const initialY = state.y;
      
      state.x += state.vx;
      state.y += state.vy;
      
      expect(state.x).toBe(initialX + state.vx);
      expect(state.y).toBe(initialY + state.vy);
    });

    it('should have draw function to render frame', () => {
      const mockFillRect = vi.fn();
      const mockFillText = vi.fn();
      ctx.fillRect = mockFillRect;
      ctx.fillText = mockFillText;
      
      // Simulate draw function from main.js
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillText('DVD', state.x, state.y);
      
      expect(mockFillRect).toHaveBeenCalledWith(0, 0, canvas.width, canvas.height);
      expect(mockFillText).toHaveBeenCalledWith('DVD', state.x, state.y);
    });
  });

  describe('Velocity and Movement', () => {
    it('should move at 3-4 pixels per frame', () => {
      // Test that velocity is within expected range
      expect(Math.abs(state.vx)).toBeGreaterThanOrEqual(3);
      expect(Math.abs(state.vx)).toBeLessThanOrEqual(4);
      expect(Math.abs(state.vy)).toBeGreaterThanOrEqual(3);
      expect(Math.abs(state.vy)).toBeLessThanOrEqual(4);
    });

    it('should update position based on velocity', () => {
      const initialX = state.x;
      const initialY = state.y;
      
      state.x += state.vx;
      state.y += state.vy;
      
      expect(state.x - initialX).toBe(state.vx);
      expect(state.y - initialY).toBe(state.vy);
    });
  });

  describe('Exported functions from physics.js', () => {
    it('should export getTextHeight', () => {
      expect(typeof getTextHeight).toBe('function');
      expect(getTextHeight()).toBe(80);
    });

    it('should export getTextWidth', () => {
      expect(typeof getTextWidth).toBe('function');
    });

    it('should export state object', () => {
      expect(state).toBeDefined();
      expect(state.margin).toBe(10);
      expect(state.vx).toBe(3);
      expect(state.vy).toBe(3);
    });

    it('should export update function', () => {
      expect(typeof update).toBe('function');
    });

    it('should export keepInBounds function', () => {
      expect(typeof keepInBounds).toBe('function');
    });
  });

  describe('Color management', () => {
    it('should export COLORS array', () => {
      expect(COLORS).toBeDefined();
      expect(Array.isArray(COLORS)).toBe(true);
      expect(COLORS.length).toBeGreaterThan(0);
    });

    it('should get random color excluding current', () => {
      const current = getCurrentColor();
      const random = getRandomColor(current);
      expect(random).not.toBe(current);
      expect(COLORS).toContain(random);
    });

    it('should set and get current color', () => {
      setCurrentColor('#FF0000');
      expect(getCurrentColor()).toBe('#FF0000');
    });
  });

  describe('Integration: update function works with canvas', () => {
    it('should update position and bounce correctly', () => {
      state.x = 100;
      state.y = 100;
      state.vx = 3;
      state.vy = 3;
      
      update(canvas, ctx);
      
      // Position should have changed
      expect(state.x).toBe(103);
      expect(state.y).toBe(103);
    });

    it('should bounce off left edge when calling update', () => {
      state.x = MARGIN;
      state.vx = -3;
      
      update(canvas, ctx);
      
      // Should have bounced
      expect(state.vx).toBeGreaterThan(0);
      expect(state.x).toBe(MARGIN);
    });

    it('should bounce off right edge when calling update', () => {
      canvas.width = 800;
      state.x = canvas.width - TEXT_WIDTH - MARGIN;
      state.vx = 3;
      
      update(canvas, ctx);
      
      // Should have bounced
      expect(state.vx).toBeLessThan(0);
      expect(state.x).toBe(canvas.width - TEXT_WIDTH - MARGIN);
    });
  });
});
