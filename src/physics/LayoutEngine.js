import { state, canvas, inchesToPx, snap, PAPER_SIZES, DPI } from '../State.js';
import { updateSelectedShapeUI } from '../ui/UIManager.js';
import { render } from './Renderer.js';

const paperContainer = document.getElementById('paper');

export function updatePaperSize() {
    const size = PAPER_SIZES[state.paper];
    let w = size.width;
    let h = size.height;
    
    if (state.orientation === 'landscape') {
        w = size.height;
        h = size.width;
    }
    
    // Exact physical resolution
    canvas.width = w * DPI;
    canvas.height = h * DPI;
    
    // Display physical container dimensions
    paperContainer.style.width = `${canvas.width}px`;
    paperContainer.style.height = `${canvas.height}px`;
    
    render();
}

export function clearCanvas() {
    state.shapes = [];
    state.selectedShapeId = null;
    updateSelectedShapeUI();
    render();
}

export function deleteSelectedShape() {
    if(!state.selectedShapeId) return;
    state.shapes = state.shapes.filter(s => s.id !== state.selectedShapeId);
    state.selectedShapeId = null;
    updateSelectedShapeUI();
    render();
}

export function bringShapeToFront() {
    if(!state.selectedShapeId) return;
    const idx = state.shapes.findIndex(s => s.id === state.selectedShapeId);
    if (idx !== -1 && idx < state.shapes.length - 1) {
        const [shape] = state.shapes.splice(idx, 1);
        state.shapes.push(shape);
        render();
    }
}

export function sendShapeToBack() {
    if(!state.selectedShapeId) return;
    const idx = state.shapes.findIndex(s => s.id === state.selectedShapeId);
    if (idx > 0) {
        const [shape] = state.shapes.splice(idx, 1);
        state.shapes.unshift(shape);
        render();
    }
}

export function addShape(type, sizeInches) {
    let w = sizeInches;
    let h = sizeInches;
    if(type === 'rectangle' || type === 'oval') w *= 2; 

    const sizeXPx = inchesToPx(w);
    const sizeYPx = inchesToPx(h);

    const x = snap(canvas.width / 2 - sizeXPx / 2);
    const y = snap(canvas.height / 2 - sizeYPx / 2);
    
    const shapeObj = {
        id: Date.now().toString() + Math.floor(Math.random()*1000),
        type,
        widthInches: w,
        heightInches: h,
        stroke: state.currentStrokeStyle,
        strokeWidth: state.currentStrokeWidth,
        fill: state.currentFillEnabled ? state.currentFillStyle : 'transparent',
        x,
        y
    };
    
    if (type === 'text') {
        shapeObj.textContent = 'New Node';
        shapeObj.fontFamily = 'Arial, sans-serif';
        shapeObj.fontSize = 24; 
        shapeObj.heightInches = 24 / 72;
    }
    
    state.shapes.push(shapeObj);
    
    state.selectedShapeId = state.shapes[state.shapes.length - 1].id;
    updateSelectedShapeUI();
    render();
}

export function distributeShapes(numShapes, sizeInches, type) {
    let w = sizeInches;
    let h = sizeInches;
    if(type === 'rectangle' || type === 'oval') w *= 2; 
    
    let parentShape = state.selectedShapeId ? state.shapes.find(s => s.id === state.selectedShapeId) : null;
    let seedShape = null;

    let txtContent, txtFont, txtSize;

    if (parentShape) {
        let enclosingShapes = state.shapes.filter(s => 
            s.id !== parentShape.id && 
            parentShape.x >= s.x && 
            parentShape.y >= s.y && 
            parentShape.x + inchesToPx(parentShape.widthInches) <= s.x + inchesToPx(s.widthInches) &&
            parentShape.y + inchesToPx(parentShape.heightInches) <= s.y + inchesToPx(s.heightInches)
        );
        
        if (enclosingShapes.length > 0) {
            enclosingShapes.sort((a,b) => (a.widthInches * a.heightInches) - (b.widthInches * b.heightInches));
            seedShape = parentShape;
            parentShape = enclosingShapes[0];
            
            type = seedShape.type;
            w = seedShape.widthInches;
            h = seedShape.heightInches;
            state.currentShapeStyle = seedShape.stroke;
            
            // Text replication properties
            let txtStrokeWidth = seedShape.strokeWidth;
            if (type === 'text') {
                txtContent = seedShape.textContent;
                txtFont = seedShape.fontFamily;
                txtSize = seedShape.fontSize;
            }
            
            state.shapes = state.shapes.filter(s => s.id !== seedShape.id);
            state.selectedShapeId = parentShape.id; 
        } else {
            seedShape = parentShape;
            parentShape = null;
            
            type = seedShape.type;
            w = seedShape.widthInches;
            h = seedShape.heightInches;
            state.currentShapeStyle = seedShape.stroke;

            if (type === 'text') {
                txtContent = seedShape.textContent;
                txtFont = seedShape.fontFamily;
                txtSize = seedShape.fontSize;
            }
            
            state.shapes = state.shapes.filter(s => s.id !== seedShape.id);
            state.selectedShapeId = null;
        }
    }
    
    const sizeXPx = inchesToPx(w);
    const sizeYPx = inchesToPx(h);
    
    let parentX = 0;
    let parentY = 0;
    let parentWidth = canvas.width;
    let parentHeight = canvas.height;
    
    if (parentShape) {
        parentX = parentShape.x;
        parentY = parentShape.y;
        parentWidth = inchesToPx(parentShape.widthInches);
        parentHeight = inchesToPx(parentShape.heightInches);
    } else {
        let hInches = PAPER_SIZES[state.paper].height;
        if(state.orientation === 'landscape') hInches = PAPER_SIZES[state.paper].width;
        parentHeight = inchesToPx(hInches);
    }
    
    const gapPx = (parentWidth - (sizeXPx * numShapes)) / (numShapes + 1);
    
    let currentX = parentX + gapPx;
    const yPx = parentY + (parentHeight / 2) - (sizeYPx / 2); 
    
    for(let i = 0; i < numShapes; i++) {
        const shapeObj = {
            id: 'batch_' + Date.now().toString() + "_" + i,
            type: type,
            widthInches: w,
            heightInches: h,
            stroke: state.currentStrokeStyle,
            strokeWidth: seedShape ? txtStrokeWidth : state.currentStrokeWidth,
            fill: state.currentFillEnabled ? state.currentFillStyle : 'transparent',
            x: currentX, 
            y: yPx
        };
        
        if (type === 'text') {
            shapeObj.textContent = seedShape ? txtContent : 'New Node';
            shapeObj.fontFamily = seedShape ? txtFont : 'Arial, sans-serif';
            shapeObj.fontSize = seedShape ? txtSize : 24;
            if(!seedShape) shapeObj.heightInches = 24 / 72;
        }
        
        state.shapes.push(shapeObj);
        currentX += sizeXPx + gapPx;
    }
    
    render();
}
