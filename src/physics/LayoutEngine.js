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
    state.selectedShapeIds = [];
    updateSelectedShapeUI();
    render();
}

export function deleteSelectedShape() {
    if (state.selectedShapeIds.length === 0) return;
    state.shapes = state.shapes.filter(s => !state.selectedShapeIds.includes(s.id));
    state.selectedShapeIds = [];
    updateSelectedShapeUI();
    render();
}

export function bringShapeToFront() {
    if (state.selectedShapeIds.length === 0) return;

    // Process backwards to maintain relative stack order
    const toMove = state.shapes.filter(s => state.selectedShapeIds.includes(s.id));
    state.shapes = state.shapes.filter(s => !state.selectedShapeIds.includes(s.id));
    state.shapes.push(...toMove);
    render();
}

export function sendShapeToBack() {
    if (state.selectedShapeIds.length === 0) return;

    // Process forwards to maintain relative stack order
    const toMove = state.shapes.filter(s => state.selectedShapeIds.includes(s.id));
    state.shapes = state.shapes.filter(s => !state.selectedShapeIds.includes(s.id));
    state.shapes.unshift(...toMove);
    render();
}

export function addShape(type, sizeInches) {
    let w = sizeInches;
    let h = sizeInches;
    if (type === 'rectangle' || type === 'oval') w *= 2;

    const sizeXPx = inchesToPx(w);
    const sizeYPx = inchesToPx(h);

    const x = snap(canvas.width / 2 - sizeXPx / 2);
    const y = snap(canvas.height / 2 - sizeYPx / 2);

    const shapeObj = {
        id: Date.now().toString() + Math.floor(Math.random() * 1000),
        type,
        widthInches: w,
        heightInches: h,
        stroke: state.currentStrokeStyle,
        strokeWidth: state.currentStrokeWidth,
        fill: state.currentFillEnabled ? state.currentFillStyle : 'transparent',
        x,
        y,
        rotation: 0
    };

    if (type === 'text') {
        shapeObj.textContent = 'New Node';
        shapeObj.fontFamily = 'Arial, sans-serif';
        shapeObj.fontSize = 24;
        shapeObj.heightInches = 24 / 72;
    }

    state.shapes.push(shapeObj);

    state.selectedShapeIds = [shapeObj.id];
    updateSelectedShapeUI();
    render();
}

export function alignSelectedShapes(type) {
    if (state.selectedShapeIds.length < 2) return;
    const selectedShapes = state.shapes.filter(s => state.selectedShapeIds.includes(s.id));

    if (type === 'left') {
        const minX = Math.min(...selectedShapes.map(s => s.x));
        selectedShapes.forEach(s => s.x = minX);
    } else if (type === 'right') {
        const maxX = Math.max(...selectedShapes.map(s => s.x + inchesToPx(s.widthInches)));
        selectedShapes.forEach(s => s.x = maxX - inchesToPx(s.widthInches));
    } else if (type === 'center') {
        const centerX = selectedShapes.reduce((sum, s) => sum + (s.x + inchesToPx(s.widthInches) / 2), 0) / selectedShapes.length;
        selectedShapes.forEach(s => s.x = centerX - inchesToPx(s.widthInches) / 2);
    } else if (type === 'top') {
        const minY = Math.min(...selectedShapes.map(s => s.y));
        selectedShapes.forEach(s => s.y = minY);
    }
    updateSelectedShapeUI();
    render();
}

export function addImageShape(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            const aspect = img.width / img.height;
            const wInches = 2; // Default starting size
            const hInches = wInches / aspect;

            const shapeObj = {
                id: Date.now().toString() + Math.floor(Math.random() * 1000),
                type: 'image',
                src: e.target.result,
                img: img, // Cache the actual image object for rendering
                widthInches: wInches,
                heightInches: hInches,
                stroke: 'transparent',
                fill: 'transparent',
                x: snap(canvas.width / 2 - inchesToPx(wInches) / 2),
                y: snap(canvas.height / 2 - inchesToPx(hInches) / 2),
                rotation: 0
            };

            state.shapes.push(shapeObj);
            state.selectedShapeIds = [shapeObj.id];
            updateSelectedShapeUI();
            render();
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

export function distributeShapes(numShapes, sizeInches, type) {
    let w = sizeInches;
    let h = sizeInches;
    if (type === 'rectangle' || type === 'oval') w *= 2;

    let parentShape = state.selectedShapeIds.length > 0 ? state.shapes.find(s => s.id === state.selectedShapeIds[0]) : null;
    let seedShape = null;

    let txtContent, txtFont, txtSize, txtStrokeWidth, rotation = 0;

    if (parentShape) {
        // Find if this shape is inside another shape
        let enclosingShapes = state.shapes.filter(s =>
            s.id !== parentShape.id &&
            parentShape.x >= s.x &&
            parentShape.y >= s.y &&
            parentShape.x + inchesToPx(parentShape.widthInches) <= s.x + inchesToPx(s.widthInches) &&
            parentShape.y + inchesToPx(parentShape.heightInches) <= s.y + inchesToPx(s.heightInches)
        );

        if (enclosingShapes.length > 0) {
            enclosingShapes.sort((a, b) => (a.widthInches * a.heightInches) - (b.widthInches * b.heightInches));
            seedShape = parentShape;
            parentShape = enclosingShapes[0];

            type = seedShape.type;
            w = seedShape.widthInches;
            h = seedShape.heightInches;
            state.currentStrokeStyle = seedShape.stroke;
            rotation = seedShape.rotation || 0;
            txtStrokeWidth = seedShape.strokeWidth;

            // Text replication properties
            if (type === 'text') {
                txtContent = seedShape.textContent;
                txtFont = seedShape.fontFamily;
                txtSize = seedShape.fontSize;
            }

            state.shapes = state.shapes.filter(s => s.id !== seedShape.id);
            state.selectedShapeIds = [parentShape.id];
        } else {
            seedShape = parentShape;
            parentShape = null;

            type = seedShape.type;
            w = seedShape.widthInches;
            h = seedShape.heightInches;
            state.currentStrokeStyle = seedShape.stroke;
            rotation = seedShape.rotation || 0;
            txtStrokeWidth = seedShape.strokeWidth;

            if (type === 'text') {
                txtContent = seedShape.textContent;
                txtFont = seedShape.fontFamily;
                txtSize = seedShape.fontSize;
            }

            state.shapes = state.shapes.filter(s => s.id !== seedShape.id);
            state.selectedShapeIds = [];
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
        if (state.orientation === 'landscape') hInches = PAPER_SIZES[state.paper].width;
        parentHeight = inchesToPx(hInches);
    }

    const gapPx = (parentWidth - (sizeXPx * numShapes)) / (numShapes + 1);

    let currentX = parentX + gapPx;
    const yPx = parentY + (parentHeight / 2) - (sizeYPx / 2);

    for (let i = 0; i < numShapes; i++) {
        const shapeObj = {
            id: 'batch_' + Date.now().toString() + "_" + i,
            type: type,
            widthInches: w,
            heightInches: h,
            stroke: state.currentStrokeStyle,
            strokeWidth: seedShape ? txtStrokeWidth : state.currentStrokeWidth,
            fill: state.currentFillEnabled ? state.currentFillStyle : 'transparent',
            x: currentX,
            y: yPx,
            rotation: rotation
        };

        if (type === 'text') {
            shapeObj.textContent = seedShape ? txtContent : 'New Node';
            shapeObj.fontFamily = seedShape ? txtFont : 'Arial, sans-serif';
            shapeObj.fontSize = seedShape ? txtSize : 24;
            if (!seedShape) shapeObj.heightInches = 24 / 72;
        }

        state.shapes.push(shapeObj);
        currentX += sizeXPx + gapPx;
    }

    render();
}
