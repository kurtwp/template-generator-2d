export const DPI = 96;

export const PAPER_SIZES = {
    letter: { width: 8.5, height: 11 },
    legal: { width: 8.5, height: 14 },
    tabloid: { width: 11, height: 17 },
    a4: { width: 8.27, height: 11.69 },
    a3: { width: 11.69, height: 16.54 }
};

export const state = {
    paper: 'letter',
    orientation: 'portrait',
    snapIncrement: 0.25,
    showGrid: true,
    distributeDirection: 'horizontal',
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

export function generateId() {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
        return crypto.randomUUID();
    }
    return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10);
}
