import { state } from '../State.js';
import { updatePaperSize, clearCanvas, addShape, addImageShape, distributeShapes } from '../physics/LayoutEngine.js';
import { render } from '../physics/Renderer.js';
import { exportProject, importProject } from '../physics/StorageManager.js';
import { updateSelectedShapeUI } from './PropertiesUI.js';

export function setupToolbarListeners() {
    document.getElementById('paperSize').addEventListener('change', (e) => {
        state.paper = e.target.value;
        updatePaperSize();
    });

    document.getElementById('orientation').addEventListener('change', (e) => {
        state.orientation = e.target.value;
        updatePaperSize();
    });

    document.getElementById('snapIncrement').addEventListener('change', (e) => {
        state.snapIncrement = parseFloat(e.target.value);
        render();
    });

    document.getElementById('gridStyle').addEventListener('change', (e) => {
        state.gridStyle = e.target.value;
        render();
    });

    const toggleGridBtn = document.getElementById('toggleGridBtn');
    toggleGridBtn.addEventListener('click', () => {
        state.showGrid = !state.showGrid;
        if (state.showGrid) {
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

    const distributeOrientationBtn = document.getElementById('distributeOrientationBtn');
    distributeOrientationBtn.addEventListener('click', () => {
        state.distributeDirection = state.distributeDirection === 'horizontal' ? 'vertical' : 'horizontal';
        const horizIcon = document.getElementById('distOrientationHoriz');
        const vertIcon = document.getElementById('distOrientationVert');

        if (state.distributeDirection === 'horizontal') {
            horizIcon.classList.remove('hidden');
            vertIcon.classList.add('hidden');
        } else {
            horizIcon.classList.add('hidden');
            vertIcon.classList.remove('hidden');
        }
    });

    document.getElementById('distributeBtn').addEventListener('click', () => {
        const shapeCountInput = document.getElementById('shapeCount');
        const distributeSizeSelect = document.getElementById('distributeSize');
        const count = parseInt(shapeCountInput.value, 10);
        const sizeInches = parseFloat(distributeSizeSelect.value);
        if (count > 0) {
            distributeShapes(count, sizeInches, state.currentShapeType, state.distributeDirection);
        }
    });

    document.getElementById('clearCanvasBtn').addEventListener('click', () => {
        if (confirm("Are you sure you want to clear the entire canvas?")) {
            clearCanvas();
        }
    });

    const imageInput = document.getElementById('imageInput');
    document.getElementById('addImageBtn').addEventListener('click', () => imageInput.click());
    imageInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            addImageShape(e.target.files[0]);
            imageInput.value = ''; // Reset for next use
        }
    });

    // Project Persistence
    const projectFileInput = document.getElementById('projectFileInput');
    document.getElementById('saveProjectBtn').addEventListener('click', () => exportProject());
    document.getElementById('loadProjectBtn').addEventListener('click', () => projectFileInput.click());
    projectFileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            importProject(e.target.files[0]);
            projectFileInput.value = ''; // Reset
        }
    });

    document.getElementById('clearProjectBtn').addEventListener('click', () => {
        if (confirm("Are you sure you want to delete EVERY object from the canvas?")) {
            clearCanvas();
        }
    });

    // Default Styling Configs
    document.getElementById('defaultStrokeColor').addEventListener('input', (e) => state.currentStrokeStyle = e.target.value);
    document.getElementById('defaultStrokeWidth').addEventListener('input', (e) => state.currentStrokeWidth = Math.max(1, parseInt(e.target.value) || 1));
    document.getElementById('defaultFillColor').addEventListener('input', (e) => state.currentFillStyle = e.target.value);
    document.getElementById('defaultFillNone').addEventListener('change', (e) => state.currentFillEnabled = !e.target.checked);
}
