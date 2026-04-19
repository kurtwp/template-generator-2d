import { state, canvas, ctx, inchesToPx, pxToInches } from '../State.js';

export function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    if(state.showGrid) {
        drawGrid();
    }
    
    state.shapes.forEach(shape => {
        if(shape.type === 'cross') drawCross(shape);
        else if (shape.type === 'square') drawSquare(shape);
        else if (shape.type === 'circle') drawCircle(shape);
        else if (shape.type === 'rectangle') drawRectangle(shape);
        else if (shape.type === 'oval') drawOval(shape);
        else if (shape.type === 'line') drawLine(shape);
        else if (shape.type === 'text') drawText(shape);
        else if (shape.type === 'image') drawImageShape(shape);
    });

    if (state.activeTool === 'measure' && state.measureCursor.start && state.measureCursor.end) {
        drawMeasuringTape();
    }

    if (state.selectionBox) {
        drawSelectionBox();
    }
}

function drawGrid() {
    const snapPx = inchesToPx(state.snapIncrement);
    const majorPx = inchesToPx(1.0); // 1-inch lines
    
    if(state.gridStyle === 'dashed') {
        ctx.setLineDash([4, 4]);
    } else {
        ctx.setLineDash([]);
    }

    ctx.beginPath();
    ctx.strokeStyle = '#e2e8f0'; 
    ctx.lineWidth = 1;
    
    for(let x = 0; x <= canvas.width; x += snapPx) {
        if(x % majorPx !== 0) {
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
        }
    }
    for(let y = 0; y <= canvas.height; y += snapPx) {
        if(y % majorPx !== 0) {
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
        }
    }
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = '#cbd5e1'; 
    ctx.lineWidth = 1.5;
    
    if(state.gridStyle === 'dashed') {
        ctx.setLineDash([8, 8]);
    } else {
        ctx.setLineDash([]);
    }
    
    for(let x = 0; x <= canvas.width; x += majorPx) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
    }
    for(let y = 0; y <= canvas.height; y += majorPx) {
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
    }
    ctx.stroke();
    
    const margin = inchesToPx(0.25);
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(239, 68, 68, 0.2)';
    ctx.setLineDash([10, 10]);
    ctx.strokeRect(margin, margin, canvas.width - margin*2, canvas.height - margin*2);
    ctx.setLineDash([]);
}

function setShapeStyle(shape) {
    if(shape.stroke === 'dashed') {
        ctx.setLineDash([8, 6]);
    } else {
        ctx.setLineDash([]);
    }
    ctx.strokeStyle = '#000000'; 
    ctx.lineWidth = 2.5; 
}

function drawCross(shape) {
    const sizeXPx = inchesToPx(shape.widthInches);
    const sizeYPx = inchesToPx(shape.heightInches);
    
    ctx.save();
    ctx.translate(shape.x + sizeXPx/2, shape.y + sizeYPx/2);
    ctx.rotate((shape.rotation || 0) * Math.PI / 180);
    
    drawFocusRing(shape, sizeXPx, sizeYPx); 
    
    if (shape.fill && shape.fill !== 'transparent') {
        ctx.fillStyle = shape.fill;
        const thirdX = sizeXPx/3;
        const thirdY = sizeYPx/3;
        ctx.fillRect(-sizeXPx/2 + thirdX, -sizeYPx/2, thirdX, sizeYPx);
        ctx.fillRect(-sizeXPx/2, -sizeYPx/2 + thirdY, sizeXPx, thirdY);
    }

    ctx.beginPath();
    ctx.strokeStyle = shape.stroke;
    ctx.lineWidth = shape.strokeWidth !== undefined ? shape.strokeWidth : 1;
    
    ctx.moveTo(0, -sizeYPx / 2);
    ctx.lineTo(0, sizeYPx / 2);
    ctx.moveTo(-sizeXPx / 2, 0);
    ctx.lineTo(sizeXPx / 2, 0);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
}

function drawSquare(shape) {
    drawRectangle(shape);
}

function drawCircle(shape) {
    drawOval(shape);
}

function drawRectangle(shape) {
    const sizeXPx = inchesToPx(shape.widthInches);
    const sizeYPx = inchesToPx(shape.heightInches);
    
    ctx.save();
    ctx.translate(shape.x + sizeXPx/2, shape.y + sizeYPx/2);
    ctx.rotate((shape.rotation || 0) * Math.PI / 180);
    
    drawFocusRing(shape, sizeXPx, sizeYPx); 
    
    ctx.beginPath();
    ctx.rect(-sizeXPx/2, -sizeYPx/2, sizeXPx, sizeYPx);
    
    if (shape.fill && shape.fill !== 'transparent') {
        ctx.fillStyle = shape.fill;
        ctx.fill();
    }
    
    ctx.strokeStyle = shape.stroke;
    ctx.lineWidth = shape.strokeWidth !== undefined ? shape.strokeWidth : 1;
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
}

function drawOval(shape) {
    const sizeXPx = inchesToPx(shape.widthInches);
    const sizeYPx = inchesToPx(shape.heightInches);
    
    ctx.save();
    ctx.translate(shape.x + sizeXPx/2, shape.y + sizeYPx/2);
    ctx.rotate((shape.rotation || 0) * Math.PI / 180);
    
    drawFocusRing(shape, sizeXPx, sizeYPx);
    ctx.beginPath();
    ctx.ellipse(0, 0, sizeXPx / 2, sizeYPx / 2, 0, 0, Math.PI * 2);
    
    if (shape.fill && shape.fill !== 'transparent') {
        ctx.fillStyle = shape.fill;
        ctx.fill();
    }
    
    ctx.strokeStyle = shape.stroke;
    ctx.lineWidth = shape.strokeWidth !== undefined ? shape.strokeWidth : 1;
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
}

function drawLine(shape) {
    const sizeXPx = inchesToPx(shape.widthInches);
    const sizeYPx = inchesToPx(shape.heightInches);
    
    ctx.save();
    ctx.translate(shape.x + sizeXPx/2, shape.y + sizeYPx/2);
    ctx.rotate((shape.rotation || 0) * Math.PI / 180);
    
    drawFocusRing(shape, sizeXPx, sizeYPx); 
    ctx.beginPath();
    ctx.strokeStyle = shape.stroke;
    ctx.lineWidth = shape.strokeWidth !== undefined ? shape.strokeWidth : 1;
    
    // Modern rotation-aware line: draw horizontally centered in its transformed space
    ctx.moveTo(-sizeXPx / 2, 0);
    ctx.lineTo(sizeXPx / 2, 0);
    
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();
}

function drawText(shape) {
    const pointToPx = (shape.fontSize / 72) * 96; 
    ctx.font = `${pointToPx}px ${shape.fontFamily || 'Arial, sans-serif'}`;
    ctx.textBaseline = 'top';

    const textStr = shape.textContent || 'New Node';
    const metrics = ctx.measureText(textStr);
    const sizeXPx = metrics.width;
    shape.widthInches = pxToInches(sizeXPx);
    const sizeYPx = inchesToPx(shape.heightInches);

    ctx.save();
    ctx.translate(shape.x + sizeXPx/2, shape.y + sizeYPx/2);
    ctx.rotate((shape.rotation || 0) * Math.PI / 180);
    
    drawFocusRing(shape, sizeXPx, sizeYPx); 
    
    if (shape.fill && shape.fill !== 'transparent') {
        ctx.fillStyle = shape.fill;
        ctx.fillRect(-sizeXPx/2, -sizeYPx/2, sizeXPx, sizeYPx);
    }
    
    ctx.fillStyle = shape.stroke;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(textStr, 0, 0);
    ctx.restore();
}

function drawImageShape(shape) {
    const sizeXPx = inchesToPx(shape.widthInches);
    const sizeYPx = inchesToPx(shape.heightInches);

    ctx.save();
    ctx.translate(shape.x + sizeXPx/2, shape.y + sizeYPx/2);
    ctx.rotate((shape.rotation || 0) * Math.PI / 180);
    
    drawFocusRing(shape, sizeXPx, sizeYPx);

    if (shape.img) {
        ctx.drawImage(shape.img, -sizeXPx/2, -sizeYPx/2, sizeXPx, sizeYPx);
    } else {
        ctx.fillStyle = '#f1f5f9';
        ctx.fillRect(-sizeXPx/2, -sizeYPx/2, sizeXPx, sizeYPx);
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('Image Missing', -sizeXPx/2 + 5, -sizeYPx/2 + 5);
    }
    ctx.restore();
}

function drawFocusRing(shape, sizeXPx, sizeYPx) {
    const height = sizeYPx || sizeXPx;
    const isSelected = state.selectedShapeIds.includes(shape.id);
    if(isSelected && !window.matchMedia('print').matches) {
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.setLineDash([6, 6]);
        const pad = 4;
        // Drawing relative to local origin (centered)
        ctx.strokeRect(-sizeXPx/2 - pad, -height/2 - pad, sizeXPx + pad*2, height + pad*2);
        ctx.setLineDash([]);
        
        const handleSize = 8;
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        const hx = sizeXPx/2 + pad - handleSize/2;
        const hy = height/2 + pad - handleSize/2;
        
        ctx.fillRect(hx, hy, handleSize, handleSize);
        ctx.strokeRect(hx, hy, handleSize, handleSize);
    }
}

function drawMeasuringTape() {
    const s = state.measureCursor.start;
    const e = state.measureCursor.end;
    if (!s || !e) return;
    
    // Draw the bright line
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.lineTo(e.x, e.y);
    ctx.strokeStyle = '#f43f5e'; // Rose-500
    ctx.lineWidth = 2.5;
    ctx.setLineDash([6, 4]);
    ctx.stroke();
    ctx.setLineDash([]);
    
    // Draw Crosshairs
    const drawX = (pt) => {
        ctx.beginPath();
        ctx.moveTo(pt.x - 5, pt.y - 5); ctx.lineTo(pt.x + 5, pt.y + 5);
        ctx.moveTo(pt.x - 5, pt.y + 5); ctx.lineTo(pt.x + 5, pt.y - 5);
        ctx.stroke();
    };
    drawX(s); 
    drawX(e);
    
    // Distance Math
    const dx = e.x - s.x;
    const dy = e.y - s.y;
    const distPx = Math.hypot(dx, dy);
    
    if (distPx > 10) {
        const distInches = pxToInches(distPx).toFixed(2);
        
        ctx.save();
        ctx.translate(s.x + dx/2, s.y + dy/2);
        
        ctx.fillStyle = '#f43f5e';
        const txt = `${distInches}"`;
        ctx.font = 'bold 12px Inter, sans-serif';
        const metrics = ctx.measureText(txt);
        const w = metrics.width + 16;
        const h = 24;
        
        ctx.beginPath();
        ctx.roundRect(-w/2, -h/2, w, h, 12);
        ctx.fill();
        
        ctx.fillStyle = '#ffffff';
        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.fillText(txt, 0, 0);
        ctx.restore();
    }
}

function drawSelectionBox() {
    if (!state.selectionBox) return;
    const bx = Math.min(state.selectionBox.startX, state.selectionBox.currentX);
    const by = Math.min(state.selectionBox.startY, state.selectionBox.currentY);
    const bw = Math.abs(state.selectionBox.startX - state.selectionBox.currentX);
    const bh = Math.abs(state.selectionBox.startY - state.selectionBox.currentY);

    ctx.save();
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 1;
    ctx.fillStyle = 'rgba(59, 130, 246, 0.1)';
    ctx.strokeRect(bx, by, bw, bh);
    ctx.fillRect(bx, by, bw, bh);
    ctx.restore();
}
