import { state, canvas, inchesToPx, pxToInches, snap } from '../State.js';
import { updateSelectedShapeUI } from '../ui/UIManager.js';
import { render } from '../physics/Renderer.js';

const constrainProportionsInput = document.getElementById('constrainProportions');

function getPointerPos(evt) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
        x: (evt.clientX - rect.left) * scaleX,
        y: (evt.clientY - rect.top) * scaleY
    };
}

function handleMouseDown(e) {
    const pos = getPointerPos(e);
    
    if (state.activeTool === 'measure') {
        state.isDragging = false; 
        state.isResizing = false;
        state.selectedShapeId = null;
        updateSelectedShapeUI();
        state.measureCursor.start = { x: pos.x, y: pos.y };
        state.measureCursor.end = { x: pos.x, y: pos.y };
        render();
        return;
    }
    
    if (state.selectedShapeId) {
        const shape = state.shapes.find(s => s.id === state.selectedShapeId);
        if (shape) {
            let sizeXPx = inchesToPx(shape.widthInches);
            let sizeYPx = inchesToPx(shape.heightInches);

            const pad = 4;
            const handleSize = 10;
            const hx = shape.x + sizeXPx + pad;
            const hy = shape.y + sizeYPx + pad;
            
            if (Math.abs(pos.x - hx) <= handleSize*1.5 && Math.abs(pos.y - hy) <= handleSize*1.5) {
                state.isResizing = true;
                return;
            }
        }
    }

    let hits = [];
    for (let i = state.shapes.length - 1; i >= 0; i--) {
        const shape = state.shapes[i];
        let sizeXPx = inchesToPx(shape.widthInches);
        let sizeYPx = inchesToPx(shape.heightInches);
        
        const hitPadding = 10;
        
        if (pos.x >= shape.x - hitPadding && pos.x <= shape.x + sizeXPx + hitPadding &&
            pos.y >= shape.y - hitPadding && pos.y <= shape.y + sizeYPx + hitPadding) {
            
            hits.push({
                shape: shape,
                index: i,
                area: sizeXPx * sizeYPx
            });
        }
    }

    if (hits.length > 0) {
        hits.sort((a, b) => a.area - b.area);
        
        const bestHit = hits[0];
        const shape = bestHit.shape;
        
        state.selectedShapeId = shape.id;
        state.isDragging = true;
        state.dragOffsetX = pos.x - shape.x;
        state.dragOffsetY = pos.y - shape.y;
        
        state.shapes.splice(bestHit.index, 1);
        state.shapes.push(shape);
        
        updateSelectedShapeUI();
        render();
        return;
    }
    
    state.selectedShapeId = null;
    updateSelectedShapeUI();
    render();
}

function handleMouseMove(e) {
    const pos = getPointerPos(e);
    
    if (state.activeTool === 'measure' && state.measureCursor.start) {
        state.measureCursor.end = { x: pos.x, y: pos.y };
        render();
        return;
    }

    if (!state.selectedShapeId) return;
    const shape = state.shapes.find(s => s.id === state.selectedShapeId);
    if (!shape) return;

    if (state.isResizing) {
        let newXPx = pos.x - shape.x;
        let newYPx = pos.y - shape.y;
        
        if (constrainProportionsInput.checked && shape.type !== 'text') {
            const ratio = shape.widthInches / shape.heightInches;
            if (newXPx / newYPx > ratio) {
                newYPx = newXPx / ratio;
            } else {
                newXPx = newYPx * ratio;
            }
        }

        newXPx = snap(newXPx);
        newYPx = snap(newYPx);
        
        const minSize = inchesToPx(state.snapIncrement);
        if (newXPx < minSize) newXPx = minSize;
        if (newYPx < minSize) newYPx = minSize;
        
        shape.widthInches = pxToInches(newXPx);
        shape.heightInches = pxToInches(newYPx);
        
        if (shape.type === 'text') {
            shape.fontSize = Math.round(shape.heightInches * 72);
        }
        
        updateSelectedShapeUI();
        render();
        return;
    }

    if (state.isDragging) {
        shape.x = snap(pos.x - state.dragOffsetX);
        shape.y = snap(pos.y - state.dragOffsetY);
        
        let sizeXPx = inchesToPx(shape.widthInches);
        let sizeYPx = inchesToPx(shape.heightInches);

        shape.x = Math.max(0, Math.min(canvas.width - sizeXPx, shape.x));
        shape.y = Math.max(0, Math.min(canvas.height - sizeYPx, shape.y));
        render();
    }
}

function handleMouseUp(e) {
    state.isDragging = false;
    state.isResizing = false;
    
    if (state.activeTool === 'measure' && state.measureCursor.start) {
        // Leave the final line visually up until they click again or switch tools
    }
}

export function setupInputListeners() {
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    canvas.addEventListener('touchstart', (e) => {
        if(e.touches.length > 0) handleMouseDown(e.touches[0]);
    }, {passive: false});
    
    window.addEventListener('touchmove', (e) => {
        if(e.touches.length > 0) {
            handleMouseMove(e.touches[0]);
            if(state.isDragging || state.isResizing) e.preventDefault();
        }
    }, {passive: false});
    
    window.addEventListener('touchend', handleMouseUp);
}
