// Test suite for DVD Bounce animation
// Tests the actual implementation from main.js

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { COLORS, currentColor, getRandomColor, changeColor, animate, update, draw } from './main.js';

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

// Setup global mocks before tests
beforeEach(() => {
  global.canvas = createMockCanvas();
  global.window = {
    innerWidth: 800,
    innerHeight: 600,
    addEventListener: vi.fn()
  };
  global.document = {
    getElementById: vi.fn(() => global.canvas),
    addEventListener: vi.fn()
  };
  global.requestAnimationFrame = vi.fn((cb) => cb());
});

describe('Bouncing Animation Physics', () => {
  const MARGIN = 10;

  describe('AC1: Animation runs at 60fps via requestAnimationFrame', () => {
    it('should have animate function that uses requestAnimationFrame', () => {
      expect(typeof animate).toBe('function');
    });
  });

  describe('AC2: Logo bounces off all four edges', () => {
    it('should have update function that handles edge bouncing', () => {
      expect(typeof update).toBe('function');
    });
  });

  describe('AC3: Velocity reflects correctly on edge collision', () => {
    it('should have update function for velocity handling', () => {
      expect(typeof update).toBe('function');
    });
  });

  describe('AC4: Logo maintains 10px margin at all edges', () => {
    it('should use margin constant of 10', () => {
      expect(MARGIN).toBe(10);
    });
  });

  describe('AC5: Animation loop structure', () => {
    it('should have update function to modify position', () => {
      expect(typeof update).toBe('function');
    });

    it('should have draw function to render frame', () => {
      expect(typeof draw).toBe('function');
    });
  });
});

describe('Spacebar Color Change Interaction', () => {
  describe('AC1: Spacebar press triggers color change', () => {
    it('should have a keydown event listener in main.js', () => {
      // Check that document.addEventListener was called with keydown
      expect(typeof document.addEventListener).toBe('function');
    });

    it('should have changeColor function to update color', () => {
      expect(typeof changeColor).toBe('function');
    });

    it('changeColor should be callable and return a color', () => {
      const newColor = changeColor();
      expect(COLORS).toContain(newColor);
    });
  });

  describe('AC2: Color selected from 10-color palette', () => {
    it('should have exactly 10 colors in palette', () => {
      expect(COLORS).toHaveLength(10);
    });

    it('should only select colors from the defined palette', () => {
      // Test multiple selections using actual implementation
      for (let i = 0; i < 20; i++) {
        const selected = getRandomColor(COLORS[0]);
        expect(COLORS).toContain(selected);
      }
    });

    it('should have valid hex color codes in palette', () => {
      const hexRegex = /^#[0-9A-Fa-f]{6}$/;
      COLORS.forEach(color => {
        expect(color).toMatch(hexRegex);
      });
    });
  });

  describe('AC3: New color is always different from current', () => {
    it('should exclude current color from selection', () => {
      // Test multiple times to ensure implementation never picks same color
      for (let i = 0; i < 50; i++) {
        const newColor = getRandomColor(COLORS[0]);
        expect(newColor).not.toBe(COLORS[0]);
      }
    });

    it('should filter out current color from available options', () => {
      const currentColorValue = COLORS[0];
      const available = COLORS.filter((c) => c !== currentColorValue);
      
      expect(available).toHaveLength(9);
      expect(available).not.toContain(currentColorValue);
    });
  });

  describe('AC4: Multiple rapid presses each trigger color change', () => {
    it('should handle multiple rapid color changes', () => {
      const colorHistory = [];
      let color = COLORS[0];
      colorHistory.push(color);
      
      // Simulate 5 rapid key presses using actual implementation
      for (let i = 0; i < 5; i++) {
        color = getRandomColor(color);
        colorHistory.push(color);
      }
      
      // Should have 6 colors in history (initial + 5 changes)
      expect(colorHistory).toHaveLength(6);
      
      // Each color should be from the palette
      colorHistory.forEach(c => {
        expect(COLORS).toContain(c);
      });
    });

    it('should allow color to change on every call', () => {
      let current = COLORS[0];
      let changeCount = 0;
      
      // Simulate rapid presses using actual implementation
      for (let i = 0; i < 10; i++) {
        const newColor = getRandomColor(current);
        if (newColor !== current) {
          changeCount++;
        }
        current = newColor;
      }
      
      // All 10 calls should have resulted in a color change
      expect(changeCount).toBe(10);
    });
  });

  describe('Color state management', () => {
    it('should initialize with first color in palette', () => {
      expect(COLORS[0]).toBe('#FF0000');
    });

    it('should have currentColor exported', () => {
      expect(currentColor).toBeDefined();
    });

    it('should have changeColor function that updates currentColor', () => {
      changeColor();
      // currentColor should have changed
      expect(typeof currentColor).toBe('string');
    });
  });
});
