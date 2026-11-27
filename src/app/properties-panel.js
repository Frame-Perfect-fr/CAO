/* ================================================================
   ScenoPlan — Properties Panel, Scene Settings & Context Menu
   ================================================================ */

export function setupPropertiesPanel(engine, { onElevationChange, onLayerHighlight } = {}) {
    const propsEmpty = document.querySelector('.props-empty');
    const propsElement = document.getElementById('props-element');

    function updatePropertiesPanel(element) {
        if (element) {
            propsEmpty.style.display = 'none';
            propsElement.style.display = 'block';

            document.getElementById('prop-name').value = element.name || '';
            document.getElementById('prop-type').textContent = element.description || element.id;
            document.getElementById('prop-x').value = element.x.toFixed(2);
            document.getElementById('prop-y').value = element.y.toFixed(2);
            document.getElementById('prop-elevation').value = element.elevation !== undefined && element.elevation !== null ? element.elevation : '';
            document.getElementById('prop-width').value = element.width.toFixed(2);
            document.getElementById('prop-height').value = element.height.toFixed(2);
            document.getElementById('prop-rotation').value = Math.round(element.rotation || 0);
            document.getElementById('prop-color').value = element.color.substring(0, 7);
            document.getElementById('prop-opacity').value = element.opacity !== undefined ? element.opacity : 1;
            document.getElementById('prop-locked').checked = element.locked || false;

            document.getElementById('status-selection').textContent = element.name || element.id;
            document.getElementById('status-dimensions').textContent = `${element.width.toFixed(2)}m × ${element.height.toFixed(2)}m`;
        } else {
            propsEmpty.style.display = 'flex';
            propsElement.style.display = 'none';

            document.getElementById('status-selection').textContent = 'Aucune sélection';
            document.getElementById('status-dimensions').textContent = '';
        }

        if (typeof onLayerHighlight === 'function') {
            onLayerHighlight(element);
        }
    }

    engine.onSelectionChange = updatePropertiesPanel;

    document.getElementById('prop-name').addEventListener('change', (e) => {
        if (engine.selectedElement) {
            engine.updateElement(engine.selectedElement, { name: e.target.value });
        }
    });

    document.getElementById('prop-x').addEventListener('change', (e) => {
        if (engine.selectedElement) {
            engine.updateElement(engine.selectedElement, { x: parseFloat(e.target.value) });
        }
    });

    document.getElementById('prop-y').addEventListener('change', (e) => {
        if (engine.selectedElement) {
            engine.updateElement(engine.selectedElement, { y: parseFloat(e.target.value) });
        }
    });

    document.getElementById('prop-elevation').addEventListener('change', (e) => {
        if (engine.selectedElement) {
            const val = e.target.value.trim();
            engine.updateElement(engine.selectedElement, { elevation: val === '' ? undefined : parseFloat(val) });
            if (typeof onElevationChange === 'function') {
                onElevationChange();
            }
        }
    });

    document.getElementById('prop-width').addEventListener('change', (e) => {
        if (engine.selectedElement) {
            engine.updateElement(engine.selectedElement, { width: parseFloat(e.target.value) });
        }
    });

    document.getElementById('prop-height').addEventListener('change', (e) => {
        if (engine.selectedElement) {
            engine.updateElement(engine.selectedElement, { height: parseFloat(e.target.value) });
        }
    });

    document.getElementById('prop-rotation').addEventListener('change', (e) => {
        if (engine.selectedElement) {
            engine.updateElement(engine.selectedElement, { rotation: parseFloat(e.target.value) });
        }
    });

    document.getElementById('prop-color').addEventListener('input', (e) => {
        if (engine.selectedElement) {
            engine.updateElement(engine.selectedElement, { color: e.target.value });
        }
    });

    document.getElementById('prop-opacity').addEventListener('input', (e) => {
        if (engine.selectedElement) {
            engine.updateElement(engine.selectedElement, { opacity: parseFloat(e.target.value) });
        }
    });

    document.getElementById('prop-locked').addEventListener('change', (e) => {
        if (engine.selectedElement) {
            engine.updateElement(engine.selectedElement, { locked: e.target.checked });
        }
    });

    document.getElementById('btn-duplicate').addEventListener('click', () => {
        if (engine.selectedElement) engine.duplicateElement(engine.selectedElement);
    });

    document.getElementById('btn-delete').addEventListener('click', () => {
        if (engine.selectedElement) engine.removeElement(engine.selectedElement);
    });

    document.getElementById('scene-width').addEventListener('change', (e) => {
        engine.sceneWidth = parseFloat(e.target.value) || 30;
        document.getElementById('stat-surface').textContent = `${(engine.sceneWidth * engine.sceneHeight).toFixed(0)} m²`;
        engine.fitView();
    });

    document.getElementById('scene-height').addEventListener('change', (e) => {
        engine.sceneHeight = parseFloat(e.target.value) || 20;
        document.getElementById('stat-surface').textContent = `${(engine.sceneWidth * engine.sceneHeight).toFixed(0)} m²`;
        engine.fitView();
    });

    document.getElementById('scene-grid-size').addEventListener('change', (e) => {
        engine.gridSize = parseFloat(e.target.value);
        engine.render();
    });

    // Context Menu
    const contextMenu = document.getElementById('context-menu');

    contextMenu.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.dataset.action;
            const el = engine.selectedElement;
            if (!el) return;

            switch (action) {
                case 'duplicate':
                    engine.duplicateElement(el);
                    break;
                case 'bring-front':
                    engine.bringToFront(el);
                    break;
                case 'send-back':
                    engine.sendToBack(el);
                    break;
                case 'lock':
                    engine.updateElement(el, { locked: !el.locked });
                    updatePropertiesPanel(el);
                    break;
                case 'delete':
                    engine.removeElement(el);
                    break;
            }
            contextMenu.style.display = 'none';
        });
    });

    document.addEventListener('click', (e) => {
        if (!contextMenu.contains(e.target)) {
            contextMenu.style.display = 'none';
        }
    });

    return {
        updatePropertiesPanel,
        contextMenu
    };
}
