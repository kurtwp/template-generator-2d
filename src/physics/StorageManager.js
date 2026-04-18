import { state } from '../State.js';
import { updatePaperSize } from './LayoutEngine.js';
import { render } from './Renderer.js';
import { updateSelectedShapeUI } from '../ui/UIManager.js';

export function exportProject() {
    // Create a deep copy of the state but omit transient UI properties
    const projectData = {
        version: '1.0',
        timestamp: Date.now(),
        settings: {
            paper: state.paper,
            orientation: state.orientation,
            snapIncrement: state.snapIncrement,
            gridStyle: state.gridStyle,
            showGrid: state.showGrid,
            currentStrokeStyle: state.currentStrokeStyle,
            currentStrokeWidth: state.currentStrokeWidth,
            currentFillStyle: state.currentFillStyle,
            currentFillEnabled: state.currentFillEnabled
        },
        shapes: state.shapes.map(s => {
            // Clone the shape object but remove the 'img' DOM reference
            const { img, ...serializableShape } = s;
            return serializableShape;
        })
    };

    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `template_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

export function importProject(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const data = JSON.parse(e.target.result);
            
            // Apply settings
            if (data.settings) {
                Object.assign(state, data.settings);
            }
            
            // Restore shapes
            state.shapes = data.shapes || [];
            state.selectedShapeIds = [];
            
            // Reconstruct image objects for rendering
            state.shapes.forEach(shape => {
                if (shape.type === 'image' && shape.src) {
                    const img = new Image();
                    img.onload = () => {
                        shape.img = img;
                        render();
                    };
                    img.src = shape.src;
                }
            });
            
            // Re-sync canvas dimensions and UI
            updatePaperSize(); // This calls render()
            updateSelectedShapeUI();
            
        } catch (err) {
            console.error("Failed to load template:", err);
            alert("Invalid template file format.");
        }
    };
    reader.readAsText(file);
}
