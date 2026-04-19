import { state, canvas, inchesToPx, pxToInches, snap, toLocal, rotatePoint } from '../State.js';
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
        state.selectedShapeIds = [];
        updateSelectedShapeUI();
        state.measureCursor.start = { x: pos.x, y: pos.y };
        state.measureCursor.end = { x: pos.x, y: pos.y };
        render();
        return;
    }
    
    // Only single selection resizing allowed currently
    if (state.selectedShapeIds.length === 1) {
        const shape = state.shapes.find(s => s.id === state.selectedShapeIds[0]);
        if (shape) {
            const w = inchesToPx(shape.widthInches);
            const h = inchesToPx(shape.heightInches);
            const pad = 4;
            const handleSize = 10;
            
            // Convert cursor to local space to check against local handle position
            const localPos = toLocal(pos.x, pos.y, shape);
            const hxLocal = shape.x + w + pad;
            const hyLocal = shape.y + h + pad;
            
            if (Math.abs(localPos.x - hxLocal) <= handleSize * 2 && 
                Math.abs(localPos.y - hyLocal) <= handleSize * 2) {
                state.isResizing = true;
                return;
            }
        }
    }

    let hits = [];
    for (let i = state.shapes.length - 1; i >= 0; i--) {
        const shape = state.shapes[i];
        const w = inchesToPx(shape.widthInches);
        const h = inchesToPx(shape.heightInches);
        
        const localPos = toLocal(pos.x, pos.y, shape);
        const hitPadding = 10;
        
        if (localPos.x >= shape.x - hitPadding && localPos.x <= shape.x + w + hitPadding &&
            localPos.y >= shape.y - hitPadding && localPos.y <= shape.y + h + hitPadding) {
            
            hits.push({
                shape: shape,
                index: i,
                area: w * h
            });
        }
    }

    if (hits.length > 0) {
        hits.sort((a, b) => a.area - b.area);
        const bestHit = hits[0];
        const shape = bestHit.shape;
        
        if(e.shiftKey) {
            const idx = state.selectedShapeIds.indexOf(shape.id);
            if(idx > -1) state.selectedShapeIds.splice(idx, 1);
            else state.selectedShapeIds.push(shape.id);
        } else {
            if(!state.selectedShapeIds.includes(shape.id)) {
                state.selectedShapeIds = [shape.id];
            }
        }
        
        state.isDragging = true;
        state.dragOffset = {};
        state.selectedShapeIds.forEach(id => {
            const s = state.shapes.find(v => v.id === id);
            if(s) state.dragOffset[id] = { x: pos.x - s.x, y: pos.y - s.y };
        });
        
        // Push the most recently clicked shape to front context strictly if Shift isn't held (layer bringing isn't natively expected when lassoing)
        if(state.selectedShapeIds.length === 1 && bestHit.index !== undefined) {
             state.shapes.splice(bestHit.index, 1);
             state.shapes.push(shape);
        }
        
        updateSelectedShapeUI();
        render();
        return;
    }
    
    // No hits -> Lasso Box
    if(!e.shiftKey) state.selectedShapeIds = [];
    state.selectionBox = { startX: pos.x, startY: pos.y, currentX: pos.x, currentY: pos.y };
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

    if (state.selectionBox) {
        state.selectionBox.currentX = pos.x;
        state.selectionBox.currentY = pos.y;
        
        const bx = Math.min(state.selectionBox.startX, state.selectionBox.currentX);
        const by = Math.min(state.selectionBox.startY, state.selectionBox.currentY);
        const bw = Math.abs(state.selectionBox.startX - state.selectionBox.currentX);
        const bh = Math.abs(state.selectionBox.startY - state.selectionBox.currentY);

        state.selectedShapeIds = [];
        state.shapes.forEach(shape => {
            const shapeRight = shape.x + inchesToPx(shape.widthInches);
            const shapeBottom = shape.y + inchesToPx(shape.heightInches);
            
            // Check geographic intersection mathematically
            if (shape.x < bx + bw && shapeRight > bx && shape.y < by + bh && shapeBottom > by) {
                state.selectedShapeIds.push(shape.id);
            }
        });
        
        updateSelectedShapeUI();
        render();
        return;
    }

    if (state.selectedShapeIds.length === 0) return;

    if (state.isResizing && state.selectedShapeIds.length === 1) {
        const shape = state.shapes.find(s => s.id === state.selectedShapeIds[0]);
        if(!shape) return;
        
        const wOld = inchesToPx(shape.widthInches);
        const hOld = inchesToPx(shape.heightInches);
        const cxOld = shape.x + wOld/2;
        const cyOld = shape.y + hOld/2;
        
        // Pivot is Top-Left in world space
        const pivotWorld = rotatePoint(shape.x, shape.y, cxOld, cyOld, shape.rotation || 0);
        
        // 1. Convert mouse to local space relative to current center
        const localPos = toLocal(pos.x, pos.y, shape);
        
        // 2. new dimensions in local space (subtract padding since handle is offset)
        const pad = 4;
        let newXPx = localPos.x - shape.x - pad;
        let newYPx = localPos.y - shape.y - pad;
        
        if (constrainProportionsInput.checked && shape.type !== 'text') {
            const ratio = shape.widthInches / shape.heightInches;
            if (newXPx / newYPx > ratio) newYPx = newXPx / ratio;
            else newXPx = newYPx * ratio;
        }

        newXPx = snap(newXPx);
        newYPx = snap(newYPx);
        
        const minSize = inchesToPx(state.snapIncrement);
        if (newXPx < minSize) newXPx = minSize;
        if (newYPx < minSize) newYPx = minSize;
        
        // 3. Update Dimensions
        shape.widthInches = pxToInches(newXPx);
        shape.heightInches = pxToInches(newYPx);
        if (shape.type === 'text') shape.fontSize = Math.round(shape.heightInches * 72);
        
        // 4. Reposition to keep Pivot fixed
        // New center calculation: Pivot + rotateVector( (w/2, h/2), angle )
        const wNew = inchesToPx(shape.widthInches);
        const hNew = inchesToPx(shape.heightInches);
        
        const rotatedOffset = rotatePoint(wNew/2, hNew/2, 0, 0, shape.rotation || 0);
        const cxNew = pivotWorld.x + rotatedOffset.x;
        const cyNew = pivotWorld.y + rotatedOffset.y;
        
        shape.x = cxNew - wNew/2;
        shape.y = cyNew - hNew/2;
        
        updateSelectedShapeUI();
        render();
        return;
    }

    if (state.isDragging) {
        state.selectedShapeIds.forEach(id => {
            const shape = state.shapes.find(s => s.id === id);
            if(!shape) return;
            
            const offset = state.dragOffset[id] || {x: 0, y: 0};
            shape.x = snap(pos.x - offset.x);
            shape.y = snap(pos.y - offset.y);
            
            let sizeXPx = inchesToPx(shape.widthInches);
            let sizeYPx = inchesToPx(shape.heightInches);

            shape.x = Math.max(0, Math.min(canvas.width - sizeXPx, shape.x));
            shape.y = Math.max(0, Math.min(canvas.height - sizeYPx, shape.y));
        });
        render();
    }
}

function handleMouseUp(e) {
    state.isDragging = false;
    state.isResizing = false;
    state.selectionBox = null;
    render();
    
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
