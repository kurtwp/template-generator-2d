import { inchesToPx, DPI } from '../State.js';

/**
 * Returns the rendered size of a shape in pixels. Text nodes measure
 * their width from the font metrics instead of the stored widthInches.
 */
export function getShapeSizePx(shape, measureCtx) {
    let width = inchesToPx(shape.widthInches);
    if (shape.type === 'text') {
        const fontPx = ((shape.fontSize || 24) / 72) * DPI;
        measureCtx.font = `${fontPx}px ${shape.fontFamily || 'Arial, sans-serif'}`;
        width = measureCtx.measureText(shape.textContent || 'New Node').width;
    }
    return { width, height: inchesToPx(shape.heightInches) };
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
