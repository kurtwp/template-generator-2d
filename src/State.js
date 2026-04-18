export const DPI = 96;

export const PAPER_SIZES = {
    letter: { width: 8.5, height: 11 },
    legal: { width: 8.5, height: 14 }
};

export const state = {
    paper: 'letter',
    orientation: 'portrait',
    snapIncrement: 0.25,
    showGrid: true,
    currentShapeStyle: '#000000', // Legacy bindings
    currentStrokeStyle: '#000000',
    currentStrokeWidth: 1,
    currentFillStyle: '#e2e8f0',
    currentFillEnabled: false,
    gridStyle: 'solid',
    shapes: [],
    selectedShapeIds: [],
    selectionBox: null,
    currentShapeType: 'cross',
    isDragging: false,
    isResizing: false,
    dragOffset: {}, // Map of id -> {offsetX, offsetY}
    activeTool: 'cursor',
    measureCursor: { start: null, end: null }
};

// Extracted globally needed DOM elements (for structural bounds checking)
export const canvas = document.getElementById('designCanvas');
export const ctx = canvas.getContext('2d');

export function inchesToPx(inches) { 
    return inches * DPI; 
}

export function pxToInches(px) { 
    return px / DPI; 
}

export function snap(valuePx) {
    const snapPx = inchesToPx(state.snapIncrement);
    return Math.round(valuePx / snapPx) * snapPx;
}
