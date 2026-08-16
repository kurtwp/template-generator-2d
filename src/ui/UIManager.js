import { state } from '../State.js';
import { deleteSelectedShape, bringShapeToFront, sendShapeToBack } from '../physics/LayoutEngine.js';
import { setupToolbarListeners } from './ToolbarUI.js';
import { setupPropertiesListeners, updateSelectedShapeUI } from './PropertiesUI.js';
import { undo, redo } from '../History.js';

export { updateSelectedShapeUI };

export function setupUIEventListeners() {
    setupToolbarListeners();
    setupPropertiesListeners();

    // Global Action Buttons
    document.getElementById('deleteShapeBtn').addEventListener('click', deleteSelectedShape);
    document.getElementById('sendBackBtn').addEventListener('click', sendShapeToBack);
    document.getElementById('bringFrontBtn').addEventListener('click', bringShapeToFront);

    // Global Keyboard Hooks
    const isTyping = () => ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName);

    window.addEventListener('keydown', (e) => {
        // Undo / Redo (don't hijack text editing)
        if ((e.ctrlKey || e.metaKey) && !isTyping()) {
            if (e.key === 'z' || e.key === 'Z') {
                if (e.shiftKey) {
                    redo();
                } else {
                    undo();
                }
                e.preventDefault();
                return;
            } else if (e.key === 'y' || e.key === 'Y') {
                redo();
                e.preventDefault();
                return;
            }
        }

        if (e.key === 'Escape') {
            if (state.activeTool === 'measure') {
                // Instantly break measuring state back to native cursor
                const cursorBtn = document.querySelector('[data-tool="cursor"]');
                if (cursorBtn) cursorBtn.click();
            }
        }

        if ((e.key === 'Delete' || e.key === 'Backspace') && state.selectedShapeIds.length > 0) {
            if (isTyping()) return;
            e.preventDefault();
            deleteSelectedShape();
        }
    });
}
