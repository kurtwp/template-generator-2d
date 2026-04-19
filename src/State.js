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
    currentShapeStyle: '#000000', // Legacy bindings
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

/**
 * Rotates a point around an origin
 */
export function rotatePoint(x, y, cx, cy, angleDegrees) {
    const rad = (angleDegrees || 0) * Math.PI / 180;
    const dx = x - cx;
    const dy = y - cy;
    return {
        x: cx + dx * Math.cos(rad) - dy * Math.sin(rad),
        y: cy + dx * Math.sin(rad) + dy * Math.cos(rad)
    };
}

/**
 * Converts world coordinates to a shape's local coordinate system (centered at 0,0)
 */
export function toLocal(worldX, worldY, shape) {
    const w = inchesToPx(shape.widthInches);
    const h = inchesToPx(shape.heightInches);
    const cx = shape.x + w / 2;
    const cy = shape.y + h / 2;
    // Rotate by NEGATIVE angle to "un-rotate" the point into local space
    return rotatePoint(worldX, worldY, cx, cy, -(shape.rotation || 0));
}

/**
 * Converts a shape's local coordinates (relative to center) back to world space
 */
export function fromLocal(localX, localY, shape) {
    const w = inchesToPx(shape.widthInches);
    const h = inchesToPx(shape.heightInches);
    const cx = shape.x + w / 2;
    const cy = shape.y + h / 2;
    // Rotation is applied around the center
    const rad = (shape.rotation || 0) * Math.PI / 180;
    const dx = localX - cx;
    const dy = localY - cy;
    return {
        x: cx + dx * Math.cos(rad) - dy * Math.sin(rad),
        y: cy + dx * Math.sin(rad) + dy * Math.cos(rad)
    };
}
