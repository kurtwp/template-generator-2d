import { state } from '../State.js';
import { render } from '../physics/Renderer.js';
import { saveState } from '../History.js';
import { alignSelectedShapes } from '../physics/LayoutEngine.js';

// Selected Element UI
const selectedElementSection = document.getElementById('selectedElementSection');
const selectedDimensionSection = document.getElementById('selectedDimensionSection');
const selectedTextSection = document.getElementById('selectedTextSection');
const selectedShapeTextInput = document.getElementById('selectedShapeText');
const selectedShapeFont = document.getElementById('selectedShapeFont');
const selectedShapeFontSize = document.getElementById('selectedShapeFontSize');
const selectedShapeWInput = document.getElementById('selectedShapeW');
const selectedShapeHInput = document.getElementById('selectedShapeH');
const selectedShapeRotationInput = document.getElementById('selectedShapeRotation');
const constrainProportionsInput = document.getElementById('constrainProportions');
const alignmentSection = document.getElementById('alignmentSection');

// Color DOM
const selectedShapeStroke = document.getElementById('selectedShapeStroke');
const selectedShapeStrokeWidth = document.getElementById('selectedShapeStrokeWidth');
const selectedShapeFillVal = document.getElementById('selectedShapeFillVal');
const selectedShapeFillNone = document.getElementById('selectedShapeFillNone');

export function updateSelectedShapeUI() {
    if (state.selectedShapeIds.length > 0) {
        selectedElementSection.classList.remove('hidden');

        if (state.selectedShapeIds.length === 1) {
            alignmentSection.classList.add('hidden');
            const shape = state.shapes.find(s => s.id === state.selectedShapeIds[0]);
            if (shape) {
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
                    selectedShapeRotationInput.value = shape.rotation || 0;
                }

                selectedShapeStroke.value = shape.stroke || '#000000';
                selectedShapeStrokeWidth.value = shape.strokeWidth ?? 1;
                if (shape.fill === 'transparent' || !shape.fill) {
                    selectedShapeFillNone.checked = true;
                    selectedShapeFillVal.value = '#ffffff';
                } else {
                    selectedShapeFillNone.checked = false;
                    selectedShapeFillVal.value = shape.fill;
                }
            }
        } else {
            selectedDimensionSection.classList.add('hidden');
            selectedTextSection.classList.add('hidden');
            alignmentSection.classList.remove('hidden');

            const shape = state.shapes.find(s => s.id === state.selectedShapeIds[0]);
            if (shape) {
                selectedShapeStroke.value = shape.stroke || '#000000';
                selectedShapeStrokeWidth.value = shape.strokeWidth ?? 1;
                selectedShapeFillNone.checked = shape.fill === 'transparent' || !shape.fill;
            }
        }
    } else {
        selectedElementSection.classList.add('hidden');
        alignmentSection.classList.add('hidden');
    }
}

export function setupPropertiesListeners() {
    document.querySelectorAll('.align-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const type = e.currentTarget.dataset.align;
            alignSelectedShapes(type);
        });
    });

    const updateSelectedFill = () => {
        if (state.selectedShapeIds.length === 0) return;
        state.selectedShapeIds.forEach(id => {
            const shape = state.shapes.find(s => s.id === id);
            if (shape) {
                shape.fill = !selectedShapeFillNone.checked ? selectedShapeFillVal.value : 'transparent';
            }
        });
        render();
    };

    selectedShapeFillVal.addEventListener('change', () => { updateSelectedFill(); saveState(); });
    selectedShapeFillNone.addEventListener('change', () => { updateSelectedFill(); saveState(); });

    selectedShapeStroke.addEventListener('change', (e) => {
        if (state.selectedShapeIds.length === 0) return;
        state.selectedShapeIds.forEach(id => {
            const shape = state.shapes.find(s => s.id === id);
            if (shape) shape.stroke = e.target.value;
        });
        render();
        saveState();
    });

    selectedShapeStrokeWidth.addEventListener('change', (e) => {
        if (state.selectedShapeIds.length === 0) return;
        state.selectedShapeIds.forEach(id => {
            const shape = state.shapes.find(s => s.id === id);
            if (shape) shape.strokeWidth = Math.max(0, parseInt(e.target.value) || 0);
        });
        render();
        saveState();
    });

    selectedShapeTextInput.addEventListener('change', (e) => {
        if (state.selectedShapeIds.length !== 1) return;
        const shape = state.shapes.find(s => s.id === state.selectedShapeIds[0]);
        if (shape && shape.type === 'text') {
            shape.textContent = e.target.value;
            render();
            saveState();
        }
    });

    selectedShapeFont.addEventListener('change', (e) => {
        if (state.selectedShapeIds.length === 0) return;
        state.selectedShapeIds.forEach(id => {
            const shape = state.shapes.find(s => s.id === id);
            if (shape && shape.type === 'text') shape.fontFamily = e.target.value;
        });
        render();
        saveState();
    });

    selectedShapeFontSize.addEventListener('change', (e) => {
        if (state.selectedShapeIds.length === 0) return;
        const val = parseInt(e.target.value, 10);
        if (val > 0) {
            state.selectedShapeIds.forEach(id => {
                const shape = state.shapes.find(s => s.id === id);
                if (shape && shape.type === 'text') {
                    shape.fontSize = val;
                    shape.heightInches = val / 72;
                }
            });
            render();
            saveState();
        }
    });

    selectedShapeWInput.addEventListener('change', (e) => {
        if (state.selectedShapeIds.length !== 1) return;
        const val = parseFloat(e.target.value);
        if (val > 0) {
            const shape = state.shapes.find(s => s.id === state.selectedShapeIds[0]);
            if (shape) {
                if (constrainProportionsInput.checked) {
                    const ratio = shape.heightInches / shape.widthInches;
                    shape.heightInches = val * ratio;
                    selectedShapeHInput.value = shape.heightInches.toFixed(3).replace(/\.?0+$/, '');
                }
                shape.widthInches = val;
                render();
                saveState();
            }
        }
    });

    selectedShapeHInput.addEventListener('change', (e) => {
        if (state.selectedShapeIds.length !== 1) return;
        const val = parseFloat(e.target.value);
        if (val > 0) {
            const shape = state.shapes.find(s => s.id === state.selectedShapeIds[0]);
            if (shape) {
                if (constrainProportionsInput.checked) {
                    const ratio = shape.widthInches / shape.heightInches;
                    shape.widthInches = val * ratio;
                    selectedShapeWInput.value = shape.widthInches.toFixed(3).replace(/\.?0+$/, '');
                }
                shape.heightInches = val;
                render();
                saveState();
            }
        }
    });

    selectedShapeRotationInput.addEventListener('change', (e) => {
        if (state.selectedShapeIds.length === 0) return;
        const val = parseFloat(e.target.value) || 0;
        state.selectedShapeIds.forEach(id => {
            const shape = state.shapes.find(s => s.id === id);
            if (shape) shape.rotation = val;
        });
        render();
        saveState();
    });
}
