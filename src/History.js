import { state } from './State.js';
import { render } from './physics/Renderer.js';
import { updateSelectedShapeUI } from './ui/UIManager.js';

let history = [];
let historyIndex = -1;

export function saveState() {
    // Clone the shapes, stripping out the raw `img` objects since they can't be cloned safely
    // and aren't necessary for state (they can be re-loaded or kept on the shape reference if we shallow copy properties, 
    // but a deep clone is safer for history).
    const clonedShapes = state.shapes.map(s => {
        const { img, ...serializableShape } = s;
        return JSON.parse(JSON.stringify(serializableShape));
    });

    // If we're not at the end of the history, discard the future
    if (historyIndex < history.length - 1) {
        history = history.slice(0, historyIndex + 1);
    }

    history.push(clonedShapes);
    
    // Cap history length to prevent memory leaks
    if (history.length > 50) {
        history.shift();
    } else {
        historyIndex++;
    }
}

export function undo() {
    if (historyIndex > 0) {
        historyIndex--;
        restoreState(history[historyIndex]);
    }
}

export function redo() {
    if (historyIndex < history.length - 1) {
        historyIndex++;
        restoreState(history[historyIndex]);
    }
}

function restoreState(savedShapes) {
    state.selectedShapeIds = [];
    
    // Restore shapes, preserving Image objects if they already existed in the current state
    state.shapes = savedShapes.map(savedShape => {
        const currentShape = state.shapes.find(s => s.id === savedShape.id);
        const newShape = { ...savedShape };
        
        if (newShape.type === 'image' && newShape.src) {
            // If the image was already loaded, reuse the HTMLImageElement
            if (currentShape && currentShape.img) {
                newShape.img = currentShape.img;
            } else {
                // Otherwise we need to rebuild it
                const img = new Image();
                img.onload = () => {
                    newShape.img = img;
                    render();
                };
                img.onerror = () => render();
                img.src = newShape.src;
            }
        }
        return newShape;
    });

    updateSelectedShapeUI();
    render();
}
