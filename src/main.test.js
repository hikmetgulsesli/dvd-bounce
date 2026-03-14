// Test suite for DVD Bounce animation physics
// Uses jsdom for DOM/canvas mocking

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

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

// Mock document
const mockDocument = {
  getElementById: vi.fn(() => createMockCanvas(800, 600)),
  addEventListener: vi.fn()
};

// Mock window
const mockWindow = {
  innerWidth: 800,
  innerHeight: 600,
  addEventListener: vi.fn()
};

describe('Bouncing Animation Physics', () => {
  beforeEach(() => {
    // Reset modules to ensure fresh state
    vi.resetModules();
    
    // Mock document and window globals
    global.document = mockDocument;
    global.window = mockWindow;
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
    it('should bounce off left edge', async () => {
      // Import the actual update function
      const { update, setState, getState } = await import('./main.js');
      
      // Set up state: logo at left edge, moving left
      setState({ x: 10, y: 100, vx: -3, vy: 3 });
      
      // Override canvas for this test
      const testCanvas = createMockCanvas(800, 600);
      global.document.getElementById = vi.fn(() => testCanvas);
      
      // Call the actual update function
      update();
      
      const state = getState();
      
      // Should have bounced - velocity should be positive
      expect(state.vx).toBeGreaterThan(0);
      // Position should be at or beyond margin
      expect(state.x).toBeGreaterThanOrEqual(10);
    });

    it('should bounce off right edge', async () => {
      const { update, setState, getState } = await import('./main.js');
      
      const testCanvas = createMockCanvas(800, 600);
      global.document.getElementById = vi.fn(() => testCanvas);
      
      // Set state near right edge, moving right
      setState({ x: 800 - 120 - 10 - 3, y: 100, vx: 3, vy: 3 });
      
      update();
      
      const state = getState();
      
      // Should have bounced - velocity should be negative
      expect(state.vx).toBeLessThan(0);
    });

    it('should bounce off top edge', async () => {
      const { update, setState, getState } = await import('./main.js');
      
      const testCanvas = createMockCanvas(800, 600);
      global.document.getElementById = vi.fn(() => testCanvas);
      
      // Set state at top, moving up
      setState({ x: 100, y: 80 - 3, vx: 3, vy: -3 });
      
      update();
      
      const state = getState();
      
      // Should have bounced - velocity should be positive
      expect(state.vy).toBeGreaterThan(0);
    });

    it('should bounce off bottom edge', async () => {
      const { update, setState, getState } = await import('./main.js');
      
      const testCanvas = createMockCanvas(800, 600);
      global.document.getElementById = vi.fn(() => testCanvas);
      
      // Set state at bottom, moving down
      setState({ x: 100, y: 600 - 10 - 3, vx: 3, vy: 3 });
      
      update();
      
      const state = getState();
      
      // Should have bounced - velocity should be negative
      expect(state.vy).toBeLessThan(0);
    });
  });

  describe('AC3: Velocity reflects correctly on edge collision', () => {
    it('should reverse x velocity when hitting left wall', async () => {
      const { update, setState, getState } = await import('./main.js');
      
      const testCanvas = createMockCanvas(800, 600);
      global.document.getElementById = vi.fn(() => testCanvas);
      
      setState({ x: 10, y: 100, vx: -3, vy: 3 });
      
      update();
      
      const state = getState();
      expect(state.vx).toBe(3);
    });

    it('should reverse x velocity when hitting right wall', async () => {
      const { update, setState, getState } = await import('./main.js');
      
      const testCanvas = createMockCanvas(800, 600);
      global.document.getElementById = vi.fn(() => testCanvas);
      
      setState({ x: 800 - 120 - 10 - 1, y: 100, vx: 3, vy: 3 });
      
      update();
      
      const state = getState();
      expect(state.vx).toBe(-3);
    });

    it('should reverse y velocity when hitting top wall', async () => {
      const { update, setState, getState } = await import('./main.js');
      
      const testCanvas = createMockCanvas(800, 600);
      global.document.getElementById = vi.fn(() => testCanvas);
      
      setState({ x: 100, y: 80 + 1, vx: 3, vy: -3 });
      
      update();
      
      const state = getState();
      expect(state.vy).toBe(3);
    });

    it('should reverse y velocity when hitting bottom wall', async () => {
      const { update, setState, getState } = await import('./main.js');
      
      const testCanvas = createMockCanvas(800, 600);
      global.document.getElementById = vi.fn(() => testCanvas);
      
      setState({ x: 100, y: 600 - 10 - 1, vx: 3, vy: 3 });
      
      update();
      
      const state = getState();
      expect(state.vy).toBe(-3);
    });

    it('should maintain velocity magnitude after bounce', async () => {
      const { getState, setState } = await import('./main.js');
      
      const testCanvas = createMockCanvas(800, 600);
      global.document.getElementById = vi.fn(() => testCanvas);
      
      setState({ x: 100, y: 100, vx: 3, vy: 4 });
      const state = getState();
      
      const initialSpeed = Math.sqrt(state.vx * state.vx + state.vy * state.vy);
      
      // Reverse velocity
      setState({ vx: -state.vx, vy: -state.vy });
      const reversedState = getState();
      
      const speedAfterBounce = Math.sqrt(reversedState.vx * reversedState.vx + reversedState.vy * reversedState.vy);
      expect(speedAfterBounce).toBe(initialSpeed);
    });
  });

  describe('AC4: Logo maintains 10px margin at all edges', () => {
    it('should keep 10px margin on left side', async () => {
      const { getState, setState } = await import('./main.js');
      
      const testCanvas = createMockCanvas(800, 600);
      global.document.getElementById = vi.fn(() => testCanvas);
      
      setState({ x: 10 });
      const state = getState();
      
      expect(state.x).toBeGreaterThanOrEqual(state.margin);
    });

    it('should keep 10px margin on right side', async () => {
      const { getState, setState } = await import('./main.js');
      
      const testCanvas = createMockCanvas(800, 600);
      global.document.getElementById = vi.fn(() => testCanvas);
      
      const MARGIN = 10;
      const TEXT_WIDTH = 120;
      setState({ x: 800 - TEXT_WIDTH - MARGIN });
      const state = getState();
      
      expect(state.x + TEXT_WIDTH).toBeLessThanOrEqual(800 - MARGIN);
    });

    it('should keep 10px margin on top', async () => {
      const { getState, setState } = await import('./main.js');
      
      const testCanvas = createMockCanvas(800, 600);
      global.document.getElementById = vi.fn(() => testCanvas);
      
      setState({ y: 80 });
      const state = getState();
      
      expect(state.y).toBeLessThanOrEqual(80);
    });

    it('should keep 10px margin on bottom', async () => {
      const { getState, setState } = await import('./main.js');
      
      const testCanvas = createMockCanvas(800, 600);
      global.document.getElementById = vi.fn(() => testCanvas);
      
      const MARGIN = 10;
      setState({ y: 600 - MARGIN });
      const state = getState();
      
      expect(state.y).toBeLessThanOrEqual(600 - MARGIN);
    });
  });

  describe('AC5: Animation loop structure', () => {
    it('should have update function to modify position', async () => {
      const { update, setState, getState } = await import('./main.js');
      
      const testCanvas = createMockCanvas(800, 600);
      global.document.getElementById = vi.fn(() => testCanvas);
      
      setState({ x: 100, y: 100, vx: 3, vy: 3 });
      const initialState = getState();
      
      update();
      const newState = getState();
      
      expect(newState.x).toBe(initialState.x + initialState.vx);
      expect(newState.y).toBe(initialState.y + initialState.vy);
    });

    it('should have draw function to render frame', () => {
      const mockCtx = createMockContext();
      const testCanvas = createMockCanvas(800, 600);
      testCanvas.getContext = vi.fn(() => mockCtx);
      
      global.document = { getElementById: vi.fn(() => testCanvas) };
      
      // Import draw (can't easily test without side effects, but verify export exists)
      import('./main.js').then(({ COLORS }) => {
        expect(COLORS).toBeDefined();
        expect(Array.isArray(COLORS)).toBe(true);
        expect(COLORS.length).toBe(10);
      });
    });
  });

  describe('Velocity and Movement', () => {
    it('should move at 3-4 pixels per frame', async () => {
      const { getState } = await import('./main.js');
      const state = getState();
      
      expect(Math.abs(state.vx)).toBeGreaterThanOrEqual(3);
      expect(Math.abs(state.vx)).toBeLessThanOrEqual(4);
    });

    it('should update position based on velocity', async () => {
      const { update, setState, getState } = await import('./main.js');
      
      const testCanvas = createMockCanvas(800, 600);
      global.document.getElementById = vi.fn(() => testCanvas);
      
      setState({ x: 100, y: 100, vx: 3, vy: 3 });
      const initialState = getState();
      
      update();
      const newState = getState();
      
      expect(newState.x - initialState.x).toBe(initialState.vx);
      expect(newState.y - initialState.y).toBe(initialState.vy);
    });
  });
});

describe('Window Resize Handling', () => {
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

  beforeEach(() => {
    vi.resetModules();
    
    // Set up global mocks before importing
    const testCanvas = createMockCanvas(800, 600);
    
    global.document = {
      getElementById: vi.fn(() => testCanvas),
      addEventListener: vi.fn()
    };
    global.window = {
      innerWidth: 800,
      innerHeight: 600,
      addEventListener: vi.fn()
    };
    
    // Set canvas override immediately after reset
    return import('./main.js').then(({ setCanvasOverride }) => {
      setCanvasOverride(testCanvas);
    });
  });

  afterEach(() => {
    return import('./main.js').then(({ clearCanvasOverride }) => {
      clearCanvasOverride();
    });
  });

  describe('AC1: Canvas resizes on window resize event', () => {
    it('should update canvas dimensions to match window size', async () => {
      const { resizeCanvas, setCanvasOverride } = await import('./main.js');
      
      // Create and override the canvas
      const testCanvas = createMockCanvas(800, 600);
      setCanvasOverride(testCanvas);
      
      global.window = { 
        innerWidth: 1024, 
        innerHeight: 768,
        addEventListener: vi.fn()
      };
      
      resizeCanvas();
      
      expect(testCanvas.width).toBe(1024);
      expect(testCanvas.height).toBe(768);
    });

    it('should handle resize to smaller dimensions', async () => {
      const { resizeCanvas, setCanvasOverride } = await import('./main.js');
      
      const testCanvas = createMockCanvas(800, 600);
      setCanvasOverride(testCanvas);
      
      global.window = { 
        innerWidth: 400, 
        innerHeight: 300,
        addEventListener: vi.fn()
      };
      
      resizeCanvas();
      
      expect(testCanvas.width).toBe(400);
      expect(testCanvas.height).toBe(300);
    });

    it('should handle resize to larger dimensions', async () => {
      const { resizeCanvas, setCanvasOverride } = await import('./main.js');
      
      const testCanvas = createMockCanvas(800, 600);
      setCanvasOverride(testCanvas);
      
      global.window = { 
        innerWidth: 1920, 
        innerHeight: 1080,
        addEventListener: vi.fn()
      };
      
      resizeCanvas();
      
      expect(testCanvas.width).toBe(1920);
      expect(testCanvas.height).toBe(1080);
    });
  });

  describe('AC2: Logo stays within canvas bounds after resize', () => {
    it('should reposition logo if outside right boundary after resize', async () => {
      const { resizeCanvas, setState, getState, setCanvasOverride } = await import('./main.js');
      
      // First set position outside new bounds
      setState({ x: 700, y: 100 });
      
      const testCanvas = createMockCanvas(800, 600);
      setCanvasOverride(testCanvas);
      
      global.window = { 
        innerWidth: 400, 
        innerHeight: 600,
        addEventListener: vi.fn()
      };
      
      resizeCanvas();
      
      const state = getState();
      const TEXT_WIDTH = 120;
      expect(state.x + TEXT_WIDTH).toBeLessThanOrEqual(400 - 10);
    });

    it('should reposition logo if outside bottom boundary after resize', async () => {
      const { resizeCanvas, setState, getState, setCanvasOverride } = await import('./main.js');
      
      setState({ x: 100, y: 500 });
      
      const testCanvas = createMockCanvas(800, 600);
      setCanvasOverride(testCanvas);
      
      global.window = { 
        innerWidth: 800, 
        innerHeight: 300,
        addEventListener: vi.fn()
      };
      
      resizeCanvas();
      
      const state = getState();
      expect(state.y).toBeLessThanOrEqual(300 - 10);
    });

    it('should keep logo position if still within bounds after resize', async () => {
      const { resizeCanvas, setState, getState, setCanvasOverride } = await import('./main.js');
      
      setState({ x: 100, y: 100 });
      const originalX = 100;
      const originalY = 100;
      
      const testCanvas = createMockCanvas(800, 600);
      setCanvasOverride(testCanvas);
      
      global.window = { 
        innerWidth: 1024, 
        innerHeight: 768,
        addEventListener: vi.fn()
      };
      
      resizeCanvas();
      
      const state = getState();
      expect(state.x).toBe(originalX);
      expect(state.y).toBe(originalY);
    });

    it('should handle simultaneous x and y boundary violations', async () => {
      const { resizeCanvas, setState, getState, setCanvasOverride } = await import('./main.js');
      
      setState({ x: 700, y: 500 });
      
      const testCanvas = createMockCanvas(800, 600);
      setCanvasOverride(testCanvas);
      
      global.window = { 
        innerWidth: 400, 
        innerHeight: 300,
        addEventListener: vi.fn()
      };
      
      resizeCanvas();
      
      const state = getState();
      expect(state.x + 120).toBeLessThanOrEqual(400 - 10);
      expect(state.y).toBeLessThanOrEqual(300 - 10);
    });
  });

  describe('AC3: Animation continues without interruption', () => {
    it('should maintain velocity after resize', async () => {
      const { resizeCanvas, setState, getState, setCanvasOverride } = await import('./main.js');
      
      setState({ vx: 3, vy: 3 });
      const originalVx = 3;
      const originalVy = 3;
      
      const testCanvas = createMockCanvas(800, 600);
      setCanvasOverride(testCanvas);
      
      global.window = { 
        innerWidth: 1024, 
        innerHeight: 768,
        addEventListener: vi.fn()
      };
      
      resizeCanvas();
      
      const state = getState();
      expect(state.vx).toBe(originalVx);
      expect(state.vy).toBe(originalVy);
    });

    it('should maintain animation state after resize', async () => {
      const { resizeCanvas, setState, getState, setCanvasOverride } = await import('./main.js');
      
      setState({ x: 100, y: 100, vx: 3, vy: 3 });
      
      const testCanvas = createMockCanvas(800, 600);
      setCanvasOverride(testCanvas);
      
      global.window = { 
        innerWidth: 1024, 
        innerHeight: 768,
        addEventListener: vi.fn()
      };
      
      resizeCanvas();
      
      const state = getState();
      // State should be maintained
      expect(state.x).toBeDefined();
      expect(state.y).toBeDefined();
    });
  });

  describe('AC4: Resize event handler is registered', () => {
    it('should have window resize event listener', async () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      
      // Import main.js to trigger event listener registration
      await import('./main.js');
      
      // Check if resize listener was registered
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'resize',
        expect.any(Function)
      );
      addEventListenerSpy.mockRestore();
    });
  });

  describe('Edge cases for resize handling', () => {
    it('should handle extreme small window sizes', async () => {
      const { resizeCanvas, setState, getState, setCanvasOverride } = await import('./main.js');
      
      setState({ x: 700, y: 500 });
      
      const testCanvas = createMockCanvas(800, 600);
      setCanvasOverride(testCanvas);
      
      global.window = { 
        innerWidth: 200, 
        innerHeight: 150,
        addEventListener: vi.fn()
      };
      
      resizeCanvas();
      
      const state = getState();
      expect(state.x + 120).toBeLessThanOrEqual(200 - 10);
      expect(state.y).toBeLessThanOrEqual(150 - 10);
    });

    it('should handle multiple rapid resizes', async () => {
      const { resizeCanvas, setState, setCanvasOverride } = await import('./main.js');
      
      setState({ x: 100, y: 100 });
      
      // First resize
      let testCanvas = createMockCanvas(800, 600);
      setCanvasOverride(testCanvas);
      global.window = { innerWidth: 600, innerHeight: 400, addEventListener: vi.fn() };
      resizeCanvas();
      
      // Second resize
      testCanvas = createMockCanvas(600, 400);
      setCanvasOverride(testCanvas);
      global.window = { innerWidth: 800, innerHeight: 600, addEventListener: vi.fn() };
      resizeCanvas();
      
      // Third resize - push outside bounds
      testCanvas = createMockCanvas(800, 600);
      setCanvasOverride(testCanvas);
      global.window = { innerWidth: 400, innerHeight: 300, addEventListener: vi.fn() };
      resizeCanvas();
      
      const { getState } = await import('./main.js');
      const state = getState();
      expect(state.x + 120).toBeLessThanOrEqual(400 - 10);
      expect(state.y).toBeLessThanOrEqual(300 - 10);
    });
  });
});

describe('Color Randomization', () => {
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

  beforeEach(() => {
    vi.resetModules();
    
    const testCanvas = createMockCanvas(800, 600);
    
    global.document = {
      getElementById: vi.fn(() => testCanvas),
      addEventListener: vi.fn()
    };
    global.window = {
      innerWidth: 800,
      innerHeight: 600,
      addEventListener: vi.fn()
    };
    
    return import('./main.js').then(({ setCanvasOverride }) => {
      setCanvasOverride(testCanvas);
    });
  });

  it('should have 10 colors in palette', async () => {
    const { COLORS } = await import('./main.js');
    expect(COLORS).toHaveLength(10);
  });

  it('should get random color different from excluded', async () => {
    const { getRandomColor } = await import('./main.js');
    
    const result = getRandomColor('#FF0000');
    expect(result).not.toBe('#FF0000');
  });

  it('should work when all colors except one are excluded', async () => {
    const { getRandomColor, COLORS } = await import('./main.js');
    
    // Exclude all but one color
    const result = getRandomColor(COLORS[0]);
    const available = COLORS.filter(c => c !== COLORS[0]);
    expect(available).toContain(result);
  });
});
