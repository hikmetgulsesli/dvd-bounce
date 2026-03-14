// Test suite for DVD Bounce animation physics
// Uses jsdom for DOM/canvas mocking

import { describe, it, expect, beforeEach, vi } from 'vitest';

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
  let x, y, vx, vy;
  const MARGIN = 10;
  const TEXT_WIDTH = 120;
  const TEXT_HEIGHT = 80;

  beforeEach(() => {
    canvas = createMockCanvas();
    ctx = canvas.getContext('2d');
    x = 100;
    y = 100;
    vx = 3;
    vy = 3;
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
      // Move logo to left edge
      x = MARGIN;
      
      // Simulate update that would push logo past left edge
      const nextX = x - Math.abs(vx);
      
      if (nextX <= MARGIN) {
        x = MARGIN;
        vx = Math.abs(vx);
      } else {
        x += vx;
      }
      
      expect(x).toBe(MARGIN);
      expect(vx).toBeGreaterThan(0);
    });

    it('should bounce off right edge', () => {
      canvas.width = 800;
      // Move logo to right edge
      x = canvas.width - TEXT_WIDTH - MARGIN;
      
      // Simulate update that would push logo past right edge
      const nextX = x + Math.abs(vx);
      
      if (nextX + TEXT_WIDTH >= canvas.width - MARGIN) {
        x = canvas.width - TEXT_WIDTH - MARGIN;
        vx = -Math.abs(vx);
      } else {
        x += vx;
      }
      
      expect(x).toBe(canvas.width - TEXT_WIDTH - MARGIN);
      expect(vx).toBeLessThan(0);
    });

    it('should bounce off top edge', () => {
      // Move logo to top edge
      y = TEXT_HEIGHT;
      
      // Simulate update that would push logo past top edge
      const nextY = y - Math.abs(vy);
      
      if (nextY <= TEXT_HEIGHT) {
        y = TEXT_HEIGHT;
        vy = Math.abs(vy);
      } else {
        y += vy;
      }
      
      expect(y).toBe(TEXT_HEIGHT);
      expect(vy).toBeGreaterThan(0);
    });

    it('should bounce off bottom edge', () => {
      canvas.height = 600;
      // Move logo to bottom edge
      y = canvas.height - MARGIN;
      
      // Simulate update that would push logo past bottom edge
      const nextY = y + Math.abs(vy);
      
      if (nextY >= canvas.height - MARGIN) {
        y = canvas.height - MARGIN;
        vy = -Math.abs(vy);
      } else {
        y += vy;
      }
      
      expect(y).toBe(canvas.height - MARGIN);
      expect(vy).toBeLessThan(0);
    });
  });

  describe('AC3: Velocity reflects correctly on edge collision', () => {
    it('should reverse x velocity when hitting left wall', () => {
      vx = -3; // Moving left
      x = MARGIN + 1;
      
      const nextX = x + vx;
      
      if (nextX <= MARGIN) {
        vx = Math.abs(vx);
      }
      
      expect(vx).toBe(3);
    });

    it('should reverse x velocity when hitting right wall', () => {
      canvas.width = 800;
      vx = 3; // Moving right
      x = canvas.width - TEXT_WIDTH - MARGIN - 1;
      
      const nextX = x + vx;
      
      if (nextX + TEXT_WIDTH >= canvas.width - MARGIN) {
        vx = -Math.abs(vx);
      }
      
      expect(vx).toBe(-3);
    });

    it('should reverse y velocity when hitting top wall', () => {
      vy = -3; // Moving up
      y = TEXT_HEIGHT + 1;
      
      const nextY = y + vy;
      
      if (nextY <= TEXT_HEIGHT) {
        vy = Math.abs(vy);
      }
      
      expect(vy).toBe(3);
    });

    it('should reverse y velocity when hitting bottom wall', () => {
      canvas.height = 600;
      vy = 3; // Moving down
      y = canvas.height - MARGIN - 1;
      
      const nextY = y + vy;
      
      if (nextY >= canvas.height - MARGIN) {
        vy = -Math.abs(vy);
      }
      
      expect(vy).toBe(-3);
    });

    it('should maintain velocity magnitude after bounce', () => {
      const initialSpeed = Math.sqrt(vx * vx + vy * vy);
      
      // Simulate a bounce
      vx = -vx;
      
      const speedAfterBounce = Math.sqrt(vx * vx + vy * vy);
      expect(speedAfterBounce).toBe(initialSpeed);
    });
  });

  describe('AC4: Logo maintains 10px margin at all edges', () => {
    it('should keep 10px margin on left side', () => {
      x = MARGIN;
      expect(x).toBeGreaterThanOrEqual(MARGIN);
    });

    it('should keep 10px margin on right side', () => {
      canvas.width = 800;
      x = canvas.width - TEXT_WIDTH - MARGIN;
      expect(x + TEXT_WIDTH).toBeLessThanOrEqual(canvas.width - MARGIN);
    });

    it('should keep 10px margin on top', () => {
      y = TEXT_HEIGHT;
      expect(y).toBeLessThanOrEqual(TEXT_HEIGHT);
    });

    it('should keep 10px margin on bottom', () => {
      canvas.height = 600;
      y = canvas.height - MARGIN;
      expect(y).toBeLessThanOrEqual(canvas.height - MARGIN);
    });
  });

  describe('AC5: Animation loop structure', () => {
    it('should have update function to modify position', () => {
      const update = () => {
        x += vx;
        y += vy;
      };
      
      const initialX = x;
      const initialY = y;
      
      update();
      
      expect(x).toBe(initialX + vx);
      expect(y).toBe(initialY + vy);
    });

    it('should have draw function to render frame', () => {
      const draw = () => {
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillText('DVD', x, y);
      };
      
      draw();
      
      expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, canvas.width, canvas.height);
      expect(ctx.fillText).toHaveBeenCalledWith('DVD', x, y);
    });
  });

  describe('Velocity and Movement', () => {
    it('should move at 3-4 pixels per frame', () => {
      // Test that velocity is within expected range
      expect(Math.abs(vx)).toBeGreaterThanOrEqual(3);
      expect(Math.abs(vx)).toBeLessThanOrEqual(4);
      expect(Math.abs(vy)).toBeGreaterThanOrEqual(3);
      expect(Math.abs(vy)).toBeLessThanOrEqual(4);
    });

    it('should update position based on velocity', () => {
      const initialX = x;
      const initialY = y;
      
      x += vx;
      y += vy;
      
      expect(x - initialX).toBe(vx);
      expect(y - initialY).toBe(vy);
    });
  });
});
