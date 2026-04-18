import { state } from '../State.js';
import { updatePaperSize, deleteSelectedShape, addShape, addImageShape, distributeShapes, clearCanvas, bringShapeToFront, sendShapeToBack, alignSelectedShapes } from '../physics/LayoutEngine.js';
import { render } from '../physics/Renderer.js';

const paperSelect = document.getElementById('paperSize');
const orientationSelect = document.getElementById('orientation');
const snapSelect = document.getElementById('snapIncrement');
const gridStyleSelect = document.getElementById('gridStyle');
const toggleGridBtn = document.getElementById('toggleGridBtn');
const clearCanvasBtn = document.getElementById('clearCanvasBtn');
const distributeBtn = document.getElementById('distributeBtn');
const shapeCountInput = document.getElementById('shapeCount');
const distributeSizeSelect = document.getElementById('distributeSize');

// Selected Element UI
const selectedElementSection = document.getElementById('selectedElementSection');
const selectedDimensionSection = document.getElementById('selectedDimensionSection');
const selectedTextSection = document.getElementById('selectedTextSection');
const selectedShapeTextInput = document.getElementById('selectedShapeText');
const selectedShapeFont = document.getElementById('selectedShapeFont');
const selectedShapeFontSize = document.getElementById('selectedShapeFontSize');
const selectedShapeWInput = document.getElementById('selectedShapeW');
const selectedShapeHInput = document.getElementById('selectedShapeH');
const constrainProportionsInput = document.getElementById('constrainProportions');
const deleteShapeBtn = document.getElementById('deleteShapeBtn');
const sendBackBtn = document.getElementById('sendBackBtn');
const bringFrontBtn = document.getElementById('bringFrontBtn');
const alignmentSection = document.getElementById('alignmentSection');
const addImageBtn = document.getElementById('addImageBtn');
const imageInput = document.getElementById('imageInput');

// Color DOM
const defaultStrokeColor = document.getElementById('defaultStrokeColor');
const defaultStrokeWidth = document.getElementById('defaultStrokeWidth');
const defaultFillColor = document.getElementById('defaultFillColor');
const defaultFillEnabled = document.getElementById('defaultFillEnabled');
const selectedShapeStroke = document.getElementById('selectedShapeStroke');
const selectedShapeStrokeWidth = document.getElementById('selectedShapeStrokeWidth');
const selectedShapeFillVal = document.getElementById('selectedShapeFillVal');
const selectedShapeFillEnabled = document.getElementById('selectedShapeFillEnabled');

export function updateSelectedShapeUI() {
    if(state.selectedShapeIds.length > 0) {
        selectedElementSection.classList.remove('hidden');
        
        if(state.selectedShapeIds.length === 1) {
            const shape = state.shapes.find(s => s.id === state.selectedShapeIds[0]);
            if(shape) {
                if (shape.type === 'text') {
                    selectedDimensionSection.classList.add('hidden');
                    selectedTextSection.classList.remove('hidden');
                    selectedShapeTextInput.value = shape.textContent || '';
                    selectedShapeFont.value = shape.fontFamily || 'Arial, sans-serif';
                    selectedShapeFontSize.value = shape.fontSize || 24;
                } else {
                    selectedDimensionSection.classList.remove('hidden');
                    selectedTextSection.classList.add('hidden');
                    selectedShapeWInput.value = shape.widthInches.toFixed(3).replace(/\.?0+$/, '');
                    selectedShapeHInput.value = shape.heightInches.toFixed(3).replace(/\.?0+$/, '');
                }

                selectedShapeStroke.value = shape.stroke || '#000000';
                selectedShapeStrokeWidth.value = shape.strokeWidth ?? 1;
                if(shape.fill === 'transparent' || !shape.fill) {
                    selectedShapeFillEnabled.checked = false;
                    selectedShapeFillVal.value = '#ffffff';
                } else {
                    selectedShapeFillEnabled.checked = true;
                    selectedShapeFillVal.value = shape.fill;
                }
            }
        } else {
            // Multi-select view hide scalar inputs
            selectedDimensionSection.classList.add('hidden');
            selectedTextSection.classList.add('hidden');
            alignmentSection.classList.remove('hidden');
            
            // Show arbitrary styling based on the first element
            const shape = state.shapes.find(s => s.id === state.selectedShapeIds[0]);
            if(shape) {
                selectedShapeStroke.value = shape.stroke || '#000000';
                selectedShapeStrokeWidth.value = shape.strokeWidth ?? 1;
                if(shape.fill === 'transparent' || !shape.fill) {
                    selectedShapeFillEnabled.checked = false;
                } else {
                    selectedShapeFillEnabled.checked = true;
                }
            }
        }
    } else {
        selectedElementSection.classList.add('hidden');
        alignmentSection.classList.add('hidden');
    }
}

export function setupUIEventListeners() {
    paperSelect.addEventListener('change', (e) => {
        state.paper = e.target.value;
        updatePaperSize();
    });

    orientationSelect.addEventListener('change', (e) => {
        state.orientation = e.target.value;
        updatePaperSize();
    });

    snapSelect.addEventListener('change', (e) => {
        state.snapIncrement = parseFloat(e.target.value);
        render(); 
    });

    gridStyleSelect.addEventListener('change', (e) => {
        state.gridStyle = e.target.value;
        render();
    });

    toggleGridBtn.addEventListener('click', () => {
        state.showGrid = !state.showGrid;
        if(state.showGrid) {
            toggleGridBtn.textContent = 'Visible On';
            toggleGridBtn.classList.remove('text-slate-400', 'bg-slate-800');
            toggleGridBtn.classList.add('text-indigo-400', 'bg-indigo-500/10');
        } else {
            toggleGridBtn.textContent = 'Visible Off';
            toggleGridBtn.classList.remove('text-indigo-400', 'bg-indigo-500/10');
            toggleGridBtn.classList.add('text-slate-400', 'bg-slate-800');
        }
        render();
    });

    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.tool-btn').forEach(b => {
                b.classList.remove('bg-brand-600', 'border-brand-500', 'text-white', 'shadow-[0_0_15px_rgba(59,130,246,0.2)]');
                b.classList.add('bg-slate-800', 'border-slate-600', 'text-slate-300');
            });
            const clicked = e.target.closest('button');
            clicked.classList.remove('bg-slate-800', 'border-slate-600', 'text-slate-300');
            clicked.classList.add('bg-brand-600', 'border-brand-500', 'text-white', 'shadow-[0_0_15px_rgba(59,130,246,0.2)]');
            
            state.activeTool = clicked.dataset.tool;
            if (state.activeTool !== 'measure') {
                state.measureCursor = { start: null, end: null };
            } else {
                state.selectedShapeIds = []; 
                updateSelectedShapeUI();
            }
            render();
        });
    });

    document.querySelectorAll('.shape-type-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.shape-type-btn').forEach(b => {
                b.classList.remove('bg-brand-600', 'border-brand-500', 'text-white', 'shadow-[0_0_15px_rgba(59,130,246,0.2)]');
                b.classList.add('bg-slate-800', 'border-slate-600', 'text-slate-300');
            });
            const clicked = e.target.closest('button');
            clicked.classList.remove('bg-slate-800', 'border-slate-600', 'text-slate-300');
            clicked.classList.add('bg-brand-600', 'border-brand-500', 'text-white', 'shadow-[0_0_15px_rgba(59,130,246,0.2)]');
            state.currentShapeType = clicked.dataset.type;
        });
    });

    document.querySelectorAll('.add-shape-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const sizeInches = parseFloat(e.target.dataset.size);
            addShape(state.currentShapeType, sizeInches);
        });
    });

    distributeBtn.addEventListener('click', () => {
        const count = parseInt(shapeCountInput.value, 10);
        const sizeInches = parseFloat(distributeSizeSelect.value);
        if (count > 0) {
            distributeShapes(count, sizeInches, state.currentShapeType);
        }
    });
    
    // Global Keyboard Hooks
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (state.activeTool === 'measure') {
                // Instantly break measuring state back to native cursor
                const cursorBtn = document.querySelector('[data-tool="cursor"]');
                if (cursorBtn) cursorBtn.click();
            }
        }
        
        if ((e.key === 'Delete' || e.key === 'Backspace') && state.selectedShapeIds.length > 0) {
            if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) return;
            deleteSelectedShape();
        }
    });

    clearCanvasBtn.addEventListener('click', () => {
        if(confirm("Are you sure you want to clear the entire canvas?")) {
            clearCanvas();
        }
    });

    deleteShapeBtn.addEventListener('click', deleteSelectedShape);
    sendBackBtn.addEventListener('click', sendShapeToBack);
    bringFrontBtn.addEventListener('click', bringShapeToFront);

    addImageBtn.addEventListener('click', () => imageInput.click());
    imageInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            addImageShape(e.target.files[0]);
            imageInput.value = ''; // Reset for next use
        }
    });

    document.querySelectorAll('.align-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const type = e.currentTarget.dataset.align;
            alignSelectedShapes(type);
        });
    });

    // Default Styling Configs
    defaultStrokeColor.addEventListener('input', (e) => state.currentStrokeStyle = e.target.value);
    defaultStrokeWidth.addEventListener('input', (e) => state.currentStrokeWidth = Math.max(1, parseInt(e.target.value) || 1));
    defaultFillColor.addEventListener('input', (e) => state.currentFillStyle = e.target.value);
    defaultFillEnabled.addEventListener('change', (e) => state.currentFillEnabled = e.target.checked);

    // Selected Styling Sync
    const updateSelectedFill = () => {
        if(state.selectedShapeIds.length === 0) return;
        state.selectedShapeIds.forEach(id => {
            const shape = state.shapes.find(s => s.id === id);
            if(shape) {
                shape.fill = selectedShapeFillEnabled.checked ? selectedShapeFillVal.value : 'transparent';
            }
        });
        render();
    };
    
    selectedShapeStroke.addEventListener('input', (e) => {
        if(state.selectedShapeIds.length === 0) return;
        state.selectedShapeIds.forEach(id => {
            const shape = state.shapes.find(s => s.id === id);
            if(shape) {
                shape.stroke = e.target.value;
            }
        });
        render();
    });

    selectedShapeStrokeWidth.addEventListener('input', (e) => {
        if(state.selectedShapeIds.length === 0) return;
        state.selectedShapeIds.forEach(id => {
            const shape = state.shapes.find(s => s.id === id);
            if(shape) {
                shape.strokeWidth = Math.max(0, parseInt(e.target.value) || 0);
            }
        });
        render();
    });

    selectedShapeFillVal.addEventListener('input', updateSelectedFill);
    selectedShapeFillEnabled.addEventListener('change', updateSelectedFill);

    selectedShapeTextInput.addEventListener('input', (e) => {
        if(state.selectedShapeIds.length !== 1) return;
        const shape = state.shapes.find(s => s.id === state.selectedShapeIds[0]);
        if(shape && shape.type === 'text') {
            shape.textContent = e.target.value;
            render();
        }
    });

    selectedShapeFont.addEventListener('change', (e) => {
        if(state.selectedShapeIds.length === 0) return;
        state.selectedShapeIds.forEach(id => {
            const shape = state.shapes.find(s => s.id === id);
            if(shape && shape.type === 'text') shape.fontFamily = e.target.value;
        });
        render();
    });

    selectedShapeFontSize.addEventListener('change', (e) => {
        if(state.selectedShapeIds.length === 0) return;
        const val = parseInt(e.target.value, 10);
        if(val > 0) {
            state.selectedShapeIds.forEach(id => {
                const shape = state.shapes.find(s => s.id === id);
                if(shape && shape.type === 'text') {
                    shape.fontSize = val;
                    // Keep hit box height perfectly synced up with logical points math (72pt = 1 inch)
                    shape.heightInches = val / 72;
                }
            });
            render();
        }
    });

    selectedShapeWInput.addEventListener('change', (e) => {
        if(state.selectedShapeIds.length !== 1) return;
        const val = parseFloat(e.target.value);
        if(val > 0) {
            const shape = state.shapes.find(s => s.id === state.selectedShapeIds[0]);
            if(shape) {
                if(constrainProportionsInput.checked) {
                    const ratio = shape.heightInches / shape.widthInches;
                    shape.heightInches = val * ratio;
                    selectedShapeHInput.value = shape.heightInches.toFixed(3).replace(/\.?0+$/, '');
                }
                shape.widthInches = val;
                render();
            }
        }
    });

    selectedShapeHInput.addEventListener('change', (e) => {
        if(state.selectedShapeIds.length !== 1) return;
        const val = parseFloat(e.target.value);
        if(val > 0) {
            const shape = state.shapes.find(s => s.id === state.selectedShapeIds[0]);
            if(shape) {
                if(constrainProportionsInput.checked) {
                    const ratio = shape.widthInches / shape.heightInches;
                    shape.widthInches = val * ratio;
                    selectedShapeWInput.value = shape.widthInches.toFixed(3).replace(/\.?0+$/, '');
                }
                shape.heightInches = val;
                render();
            }
        }
    });
}
