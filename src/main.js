import { initLayoutEngine, updatePaperSize, addShape } from './physics/LayoutEngine.js';
import { setupUIEventListeners } from './ui/UIManager.js';
import { initInputManager } from './interactions/InputManager.js';
import { initRenderer, render } from './physics/Renderer.js';
import { saveState } from './History.js';

function init() {
    const canvas = document.getElementById('designCanvas');
    const ctx = canvas.getContext('2d');

    // Initialize modules with DOM dependencies
    initRenderer(canvas, ctx);
    initLayoutEngine(canvas);
    initInputManager(canvas);

    updatePaperSize(); // Sets canvas dimensions and physically boots layout bounds
    setupUIEventListeners();
    
    saveState(); // Capture the pristine empty canvas so undo can return to it

    // Add an initial shape to make it welcoming
    addShape('cross', 1.0);
    render();
}

window.addEventListener('DOMContentLoaded', init);
