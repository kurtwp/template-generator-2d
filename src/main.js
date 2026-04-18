import { updatePaperSize, addShape } from './physics/LayoutEngine.js';
import { setupUIEventListeners } from './ui/UIManager.js';
import { setupInputListeners } from './interactions/InputManager.js';
import { render } from './physics/Renderer.js';

function init() {
    updatePaperSize(); // Sets canvas dimensions and physically boots layout bounds
    setupUIEventListeners();
    setupInputListeners();
    
    // Add an initial shape to make it welcoming
    addShape('cross', 1.0);
    render();
}

window.addEventListener('DOMContentLoaded', init);
