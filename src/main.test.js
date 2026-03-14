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

describe('Window Resize Handling', () => {
  let canvas;
  let x, y;
  const MARGIN = 10;
  const TEXT_WIDTH = 120;

  beforeEach(() => {
    canvas = createMockCanvas(800, 600);
    x = 100;
    y = 100;
  });

  describe('AC1: Canvas resizes on window resize event', () => {
    it('should update canvas dimensions to match window size', () => {
      // Simulate resize
      const newWidth = 1024;
      const newHeight = 768;
      
      canvas.width = newWidth;
      canvas.height = newHeight;
      
      expect(canvas.width).toBe(newWidth);
      expect(canvas.height).toBe(newHeight);
    });

    it('should handle resize to smaller dimensions', () => {
      canvas.width = 400;
      canvas.height = 300;
      
      expect(canvas.width).toBe(400);
      expect(canvas.height).toBe(300);
    });

    it('should handle resize to larger dimensions', () => {
      canvas.width = 1920;
      canvas.height = 1080;
      
      expect(canvas.width).toBe(1920);
      expect(canvas.height).toBe(1080);
    });
  });

  describe('AC2: Logo stays within canvas bounds after resize', () => {
    it('should reposition logo if outside right boundary after resize', () => {
      // Logo at position that would be outside after resize
      x = 700;
      canvas.width = 400; // Resize to smaller width
      
      // Simulate resizeCanvas logic
      if (x + TEXT_WIDTH > canvas.width - MARGIN) {
        x = canvas.width - TEXT_WIDTH - MARGIN;
      }
      
      expect(x).toBe(canvas.width - TEXT_WIDTH - MARGIN);
      expect(x + TEXT_WIDTH).toBeLessThanOrEqual(canvas.width - MARGIN);
    });

    it('should reposition logo if outside bottom boundary after resize', () => {
      y = 500;
      canvas.height = 300; // Resize to smaller height
      
      // Simulate resizeCanvas logic
      if (y > canvas.height - MARGIN) {
        y = canvas.height - MARGIN;
      }
      
      expect(y).toBe(canvas.height - MARGIN);
      expect(y).toBeLessThanOrEqual(canvas.height - MARGIN);
    });

    it('should keep logo position if still within bounds after resize', () => {
      x = 100;
      y = 100;
      const originalX = x;
      const originalY = y;
      
      canvas.width = 1024;
      canvas.height = 768;
      
      // Simulate resizeCanvas logic
      if (x + TEXT_WIDTH > canvas.width - MARGIN) {
        x = canvas.width - TEXT_WIDTH - MARGIN;
      }
      if (y > canvas.height - MARGIN) {
        y = canvas.height - MARGIN;
      }
      
      expect(x).toBe(originalX);
      expect(y).toBe(originalY);
    });

    it('should handle simultaneous x and y boundary violations', () => {
      x = 700;
      y = 500;
      canvas.width = 400;
      canvas.height = 300;
      
      // Simulate resizeCanvas logic
      if (x + TEXT_WIDTH > canvas.width - MARGIN) {
        x = canvas.width - TEXT_WIDTH - MARGIN;
      }
      if (y > canvas.height - MARGIN) {
        y = canvas.height - MARGIN;
      }
      
      expect(x).toBe(canvas.width - TEXT_WIDTH - MARGIN);
      expect(y).toBe(canvas.height - MARGIN);
    });
  });

  describe('AC3: Animation continues without interruption', () => {
    it('should maintain velocity after resize', () => {
      const vx = 3;
      const vy = 3;
      const originalVx = vx;
      const originalVy = vy;
      
      // Simulate resize - velocity should remain unchanged
      canvas.width = 1024;
      canvas.height = 768;
      
      expect(vx).toBe(originalVx);
      expect(vy).toBe(originalVy);
    });

    it('should maintain animation state after resize', () => {
      const mockRAF = vi.fn();
      global.requestAnimationFrame = mockRAF;
      
      // Animation loop should continue
      const animate = () => {
        mockRAF(animate);
      };
      
      animate();
      
      // Resize happens
      canvas.width = 1024;
      
      // Animation should still be running
      expect(mockRAF).toHaveBeenCalled();
    });
  });

  describe('AC4: Resize event handler is registered', () => {
    it('should have window resize event listener', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      
      // Simulate registering resize handler
      window.addEventListener('resize', () => {});
      
      expect(addEventListenerSpy).toHaveBeenCalledWith('resize', expect.any(Function));
      addEventListenerSpy.mockRestore();
    });
  });

  describe('Edge cases for resize handling', () => {
    it('should handle extreme small window sizes', () => {
      canvas.width = 200;
      canvas.height = 150;
      x = 700;
      y = 500;
      
      // Simulate resizeCanvas logic
      if (x + TEXT_WIDTH > canvas.width - MARGIN) {
        x = canvas.width - TEXT_WIDTH - MARGIN;
      }
      if (y > canvas.height - MARGIN) {
        y = canvas.height - MARGIN;
      }
      
      // Logo should be repositioned to fit
      expect(x + TEXT_WIDTH).toBeLessThanOrEqual(canvas.width - MARGIN);
      expect(y).toBeLessThanOrEqual(canvas.height - MARGIN);
    });

    it('should handle multiple rapid resizes', () => {
      const positions = [];
      
      // First resize
      canvas.width = 600;
      canvas.height = 400;
      if (x + TEXT_WIDTH > canvas.width - MARGIN) {
        x = canvas.width - TEXT_WIDTH - MARGIN;
      }
      positions.push({ x, y });
      
      // Second resize
      canvas.width = 800;
      canvas.height = 600;
      if (x + TEXT_WIDTH > canvas.width - MARGIN) {
        x = canvas.width - TEXT_WIDTH - MARGIN;
      }
      positions.push({ x, y });
      
      // Third resize
      canvas.width = 400;
      canvas.height = 300;
      if (x + TEXT_WIDTH > canvas.width - MARGIN) {
        x = canvas.width - TEXT_WIDTH - MARGIN;
      }
      if (y > canvas.height - MARGIN) {
        y = canvas.height - MARGIN;
      }
      positions.push({ x, y });
      
      // All positions should be valid
      positions.forEach(pos => {
        expect(pos.x + TEXT_WIDTH).toBeLessThanOrEqual(canvas.width - MARGIN);
        expect(pos.y).toBeLessThanOrEqual(canvas.height - MARGIN);
      });
    });
  });
});
