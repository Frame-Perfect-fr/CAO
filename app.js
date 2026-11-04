/* ================================================================
   ScenoPlan — Application Controller
   Wires the UI together: library panel, properties panel, 
   toolbar actions, keyboard shortcuts.
   ================================================================ */

document.addEventListener('DOMContentLoaded', () => {
    // ─── Initialize Canvas Engine ──────────────────────────────────
    const engine = new CanvasEngine('main-canvas', 'canvas-container');
    engine.fitView();

    // ─── Build Library Panel ───────────────────────────────────────
    const libraryContainer = document.getElementById('library-categories');

    Object.entries(FURNITURE_LIBRARY).forEach(([catKey, category]) => {
        const catDiv = document.createElement('div');
        catDiv.className = 'library-category';
        catDiv.dataset.category = catKey;

        // Header
        const header = document.createElement('div');
        header.className = 'category-header';
        header.innerHTML = `
            <svg class="chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6,9 12,15 18,9"/></svg>
            <span class="category-icon">${category.icon}</span>
            <span>${category.name}</span>
        `;

        const itemsDiv = document.createElement('div');
        itemsDiv.className = 'category-items';

        category.items.forEach(item => {
            const itemEl = document.createElement('div');
            itemEl.className = 'library-item';
            itemEl.dataset.itemId = item.id;
            itemEl.dataset.category = catKey;
            itemEl.title = `${item.description}\n${item.width}m × ${item.height}m`;
            itemEl.draggable = true;

            // Preview canvas
            const previewCanvas = document.createElement('canvas');
            previewCanvas.width = 88;
            previewCanvas.height = 88;
            previewCanvas.style.width = '44px';
            previewCanvas.style.height = '44px';
            const previewCtx = previewCanvas.getContext('2d');
            previewCtx.scale(2, 2);
            renderFurniturePreview(previewCtx, item, 44);

            const previewDiv = document.createElement('div');
            previewDiv.className = 'library-item-preview';
            previewDiv.appendChild(previewCanvas);

            const nameSpan = document.createElement('span');
            nameSpan.className = 'library-item-name';
            nameSpan.textContent = item.name;

            const sizeSpan = document.createElement('span');
            sizeSpan.className = 'library-item-size';
            sizeSpan.textContent = `${item.width}×${item.height}m`;

            itemEl.appendChild(previewDiv);
            itemEl.appendChild(nameSpan);
            itemEl.appendChild(sizeSpan);

            // Drag events
            itemEl.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', JSON.stringify(item));
                e.dataTransfer.effectAllowed = 'copy';

                // Create drag image
                const ghost = document.createElement('div');
                ghost.className = 'drag-ghost';
                ghost.style.width = '60px';
                ghost.style.height = '40px';
                ghost.style.position = 'fixed';
                ghost.style.top = '-100px';
                document.body.appendChild(ghost);
                e.dataTransfer.setDragImage(ghost, 30, 20);
                setTimeout(() => ghost.remove(), 0);
            });

            // Click to add directly to scene center
            itemEl.addEventListener('click', () => {
                const center = engine.screenToScene(engine.canvas.width / 2, engine.canvas.height / 2);
                engine.addElement(item, center.x, center.y);
            });

            itemsDiv.appendChild(itemEl);
        });

        // Toggle collapse
        header.addEventListener('click', () => {
            header.classList.toggle('collapsed');
            itemsDiv.classList.toggle('collapsed');
        });

        catDiv.appendChild(header);
        catDiv.appendChild(itemsDiv);
        libraryContainer.appendChild(catDiv);
    });

    // ─── Canvas Drop Target ────────────────────────────────────────
    const canvasContainer = document.getElementById('canvas-container');

    canvasContainer.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';

        // Show drop preview
        try {
            const rect = engine.canvas.getBoundingClientRect();
            const sx = e.clientX - rect.left;
            const sy = e.clientY - rect.top;
            const scene = engine.screenToScene(sx, sy);
            // Can't read dataTransfer during dragover, so we use the preview state
        } catch (err) { /* ignore */ }
    });

    canvasContainer.addEventListener('drop', (e) => {
        e.preventDefault();
        try {
            const data = JSON.parse(e.dataTransfer.getData('text/plain'));
            const rect = engine.canvas.getBoundingClientRect();
            const sx = e.clientX - rect.left;
            const sy = e.clientY - rect.top;
            const scene = engine.screenToScene(sx, sy);
            engine.addElement(data, scene.x, scene.y);
        } catch (err) {
            console.error('Drop error:', err);
        }
    });

    canvasContainer.addEventListener('dragleave', () => {
        engine.dropPreview = null;
        engine.render();
    });

    // ─── Properties Panel & Layers Tab State ──────────────────────
    let activeSidebarTab = 'props';
    let currentLayerFilter = 'all';
    let layerSearchQuery = '';
    let layersListContainer = null;
    let renderLayersList = () => {};
    let updateLayerSelectionHighlight = () => {};

    const propsEmpty = document.querySelector('.props-empty');
    const propsElement = document.getElementById('props-element');
    const propsScene = document.getElementById('props-scene');

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

            // Status bar
            document.getElementById('status-selection').textContent = element.name || element.id;
            document.getElementById('status-dimensions').textContent = `${element.width.toFixed(2)}m × ${element.height.toFixed(2)}m`;
        } else {
            propsEmpty.style.display = 'flex';
            propsElement.style.display = 'none';

            document.getElementById('status-selection').textContent = 'Aucune sélection';
            document.getElementById('status-dimensions').textContent = '';
        }

        // Highlight matching row in layers list if open
        if (typeof updateLayerSelectionHighlight === 'function') {
            updateLayerSelectionHighlight(element);
        }
    }

    engine.onSelectionChange = updatePropertiesPanel;

    // Property inputs
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
            if (threeEngine && currentViewMode === '3d') {
                threeEngine.syncFrom2D(engine);
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

    // Property buttons
    document.getElementById('btn-duplicate').addEventListener('click', () => {
        if (engine.selectedElement) engine.duplicateElement(engine.selectedElement);
    });

    document.getElementById('btn-delete').addEventListener('click', () => {
        if (engine.selectedElement) engine.removeElement(engine.selectedElement);
    });

    // Scene properties
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

    // ─── Canvas Toolbar ────────────────────────────────────────────
    document.querySelectorAll('.canvas-tool[data-tool]').forEach(btn => {
        btn.addEventListener('click', () => {
            engine.setTool(btn.dataset.tool);
        });
    });

    document.getElementById('btn-zoom-in').addEventListener('click', () => {
        engine.setZoom(engine.zoom * 1.2);
    });

    document.getElementById('btn-zoom-out').addEventListener('click', () => {
        engine.setZoom(engine.zoom / 1.2);
    });

    document.getElementById('btn-zoom-fit').addEventListener('click', () => {
        engine.fitView();
    });

    document.getElementById('toggle-grid').addEventListener('change', (e) => {
        engine.showGrid = e.target.checked;
        engine.render();
    });

    document.getElementById('toggle-snap').addEventListener('change', (e) => {
        engine.snapToGrid = e.target.checked;
    });

    document.getElementById('toggle-dimensions').addEventListener('change', (e) => {
        engine.showDimensions = e.target.checked;
        engine.render();
    });

    // ─── Top Toolbar Actions ───────────────────────────────────────
    document.getElementById('btn-new').addEventListener('click', () => {
        if (engine.elements.length > 0 && !confirm('Créer un nouveau projet ? Les modifications non sauvegardées seront perdues.')) return;
        engine.clearAll();
        document.getElementById('project-name').value = 'Nouveau Projet';
        engine.sceneWidth = 30;
        engine.sceneHeight = 20;
        document.getElementById('scene-width').value = 30;
        document.getElementById('scene-height').value = 20;
        document.getElementById('stat-surface').textContent = '600 m²';
        engine.fitView();
    });

    document.getElementById('btn-save').addEventListener('click', () => {
        const json = engine.serialize();
        const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;

        const rawName = document.getElementById('project-name')?.value || 'Mon_Projet';
        const cleanName = rawName.trim().replace(/[/\\?%*:|"<>]/g, '_').replace(/\s+/g, '_') || 'Mon_Projet';
        a.download = `${cleanName}.sceno`;

        document.body.appendChild(a);
        a.click();

        // Delay URL revocation so the browser download manager can read filename & blob
        setTimeout(() => {
            if (a.parentNode) a.parentNode.removeChild(a);
            URL.revokeObjectURL(url);
        }, 2000);
    });

    document.getElementById('btn-load').addEventListener('click', () => {
        document.getElementById('file-input').click();
    });

    document.getElementById('file-input').addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => {
            engine.deserialize(ev.target.result);
            document.getElementById('scene-width').value = engine.sceneWidth;
            document.getElementById('scene-height').value = engine.sceneHeight;
            document.getElementById('stat-surface').textContent = `${(engine.sceneWidth * engine.sceneHeight).toFixed(0)} m²`;
            document.getElementById('stat-elements').textContent = engine.elements.length;
            if (threeEngine && (currentViewMode === '3d' || currentViewMode === 'split')) {
                threeEngine.syncFrom2D(engine);
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    });

    document.getElementById('btn-undo').addEventListener('click', () => engine.undo());
    document.getElementById('btn-redo').addEventListener('click', () => engine.redo());

    document.getElementById('btn-export-png').addEventListener('click', () => engine.exportPNG());
    document.getElementById('btn-export-pdf').addEventListener('click', () => engine.exportPDF());

    // Theme toggle
    document.getElementById('btn-theme').addEventListener('click', () => {
        const body = document.body;
        const current = body.dataset.theme;
        body.dataset.theme = current === 'dark' ? 'light' : 'dark';
        engine.render();
    });

    // ─── Context Menu ──────────────────────────────────────────────
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

    // ─── Keyboard Shortcuts ────────────────────────────────────────
    document.addEventListener('keydown', (e) => {
        // Don't trigger shortcuts when typing in inputs
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;

        const ctrl = e.ctrlKey || e.metaKey;

        switch (e.key.toLowerCase()) {
            case 'v':
                if (!ctrl) engine.setTool('select');
                break;
            case 'h':
                engine.setTool('pan');
                break;
            case 'm':
                engine.setTool('measure');
                break;
            case 'w':
                engine.setTool('wall');
                break;
            case 'z':
                if (ctrl) {
                    e.preventDefault();
                    engine.undo();
                } else {
                    engine.setTool('zone');
                }
                break;
            case 'y':
                if (ctrl) {
                    e.preventDefault();
                    engine.redo();
                }
                break;
            case 't':
                engine.setTool('text');
                break;
            case 'delete':
            case 'backspace':
                if (engine.selectedElement) {
                    e.preventDefault();
                    engine.removeElement(engine.selectedElement);
                }
                break;
            case 'd':
                if (ctrl && engine.selectedElement) {
                    e.preventDefault();
                    engine.duplicateElement(engine.selectedElement);
                }
                break;
            case 's':
                if (ctrl) {
                    e.preventDefault();
                    document.getElementById('btn-save').click();
                }
                break;
            case 'n':
                if (ctrl) {
                    e.preventDefault();
                    document.getElementById('btn-new').click();
                }
                break;
            case 'escape':
                engine.selectElement(null);
                engine.setTool('select');
                contextMenu.style.display = 'none';
                break;
            case '+':
            case '=':
                if (ctrl) {
                    e.preventDefault();
                    engine.setZoom(engine.zoom * 1.2);
                }
                break;
            case '-':
                if (ctrl) {
                    e.preventDefault();
                    engine.setZoom(engine.zoom / 1.2);
                }
                break;
            case '0':
                if (ctrl) {
                    e.preventDefault();
                    engine.fitView();
                }
                break;
        }
    });

    // ─── Library Search ────────────────────────────────────────────
    document.getElementById('library-search').addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        document.querySelectorAll('.library-category').forEach(cat => {
            let hasVisibleItems = false;
            cat.querySelectorAll('.library-item').forEach(item => {
                const name = item.querySelector('.library-item-name').textContent.toLowerCase();
                const title = (item.title || '').toLowerCase();
                const visible = !query || name.includes(query) || title.includes(query);
                item.style.display = visible ? '' : 'none';
                if (visible) hasVisibleItems = true;
            });
            cat.style.display = hasVisibleItems || !query ? '' : 'none';
            // Auto-expand matching categories
            if (query && hasVisibleItems) {
                cat.querySelector('.category-header').classList.remove('collapsed');
                cat.querySelector('.category-items').classList.remove('collapsed');
            }
        });
    });

    // ─── Stats Helper ──────────────────────────────────────────────
    function updateStats() {
        const statEl = document.getElementById('stat-elements');
        const statSurf = document.getElementById('stat-surface');
        const layersBadge = document.getElementById('layers-badge');
        if (statEl) statEl.textContent = engine.elements.length.toString();
        if (layersBadge) layersBadge.textContent = engine.elements.length.toString();
        if (statSurf) statSurf.textContent = `${(engine.sceneWidth * engine.sceneHeight).toFixed(0)} m²`;
    }

    // ─── Window Resize ─────────────────────────────────────────────
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            engine.resizeCanvas();
            if (threeEngine && (currentViewMode === '3d' || currentViewMode === 'split')) {
                threeEngine.onWindowResize();
            }
        }, 100);
    });

    // ─── 3D Engine & View Mode Integration ─────────────────────────
    let threeEngine = null;
    let currentViewMode = '2d';

    function initThreeEngine() {
        if (!threeEngine && window.ThreeEngine) {
            try {
                threeEngine = new window.ThreeEngine('three-container');
                window.sceno3D = threeEngine;
                setupThreeToolbar();
            } catch (err) {
                console.error('Erreur initialisation ThreeEngine:', err);
            }
        }
    }

    if (window.ThreeEngine) {
        initThreeEngine();
    } else {
        window.addEventListener('three-engine-ready', initThreeEngine);
    }

    const mode2dBtn = document.getElementById('mode-2d');
    const modeSplitBtn = document.getElementById('mode-split');
    const mode3dBtn = document.getElementById('mode-3d');
    const viewportsWrapper = document.getElementById('viewports-wrapper');
    const canvasToolbar = document.getElementById('canvas-toolbar');
    const statusBar = document.getElementById('status-bar');
    const threeContainer = document.getElementById('three-container');

    function switchViewMode(mode) {
        currentViewMode = mode;

        if (mode === 'split') {
            if (modeSplitBtn) modeSplitBtn.classList.add('active');
            if (mode2dBtn) mode2dBtn.classList.remove('active');
            if (mode3dBtn) mode3dBtn.classList.remove('active');
            if (viewportsWrapper) viewportsWrapper.classList.add('mode-split');

            canvasContainer.style.display = 'flex';
            canvasToolbar.style.display = 'flex';
            statusBar.style.display = 'flex';
            threeContainer.style.display = 'flex';

            engine.resizeCanvas();
            engine.render();

            if (!threeEngine && window.ThreeEngine) {
                initThreeEngine();
            }
            if (threeEngine) {
                threeEngine.onWindowResize();
                threeEngine.syncFrom2D(engine);
            }
        } else if (mode === '3d') {
            if (mode3dBtn) mode3dBtn.classList.add('active');
            if (mode2dBtn) mode2dBtn.classList.remove('active');
            if (modeSplitBtn) modeSplitBtn.classList.remove('active');
            if (viewportsWrapper) viewportsWrapper.classList.remove('mode-split');

            canvasContainer.style.display = 'none';
            canvasToolbar.style.display = 'none';
            statusBar.style.display = 'none';
            threeContainer.style.display = 'flex';

            if (!threeEngine && window.ThreeEngine) {
                initThreeEngine();
            }
            if (threeEngine) {
                threeEngine.onWindowResize();
                threeEngine.syncFrom2D(engine);
            }
        } else {
            // Plan 2D
            if (mode2dBtn) mode2dBtn.classList.add('active');
            if (mode3dBtn) mode3dBtn.classList.remove('active');
            if (modeSplitBtn) modeSplitBtn.classList.remove('active');
            if (viewportsWrapper) viewportsWrapper.classList.remove('mode-split');

            threeContainer.style.display = 'none';
            canvasContainer.style.display = 'flex';
            canvasToolbar.style.display = 'flex';
            statusBar.style.display = 'flex';
            engine.resizeCanvas();
            engine.render();
        }
    }

    if (mode2dBtn) mode2dBtn.addEventListener('click', () => switchViewMode('2d'));
    if (modeSplitBtn) modeSplitBtn.addEventListener('click', () => switchViewMode('split'));
    if (mode3dBtn) mode3dBtn.addEventListener('click', () => switchViewMode('3d'));

    // Real-time synchronization when modifying 2D elements
    engine.onElementsChange = () => {
        updateStats();
        if (typeof renderLayersList === 'function' && activeSidebarTab === 'layers') {
            renderLayersList();
        }
        if (threeEngine && (currentViewMode === '3d' || currentViewMode === 'split')) {
            threeEngine.syncFrom2D(engine);
        }
    };

    // Setup 3D Floating Toolbar Events
    function setupThreeToolbar() {
        // Camera Presets
        document.querySelectorAll('.three-overlay-toolbar [data-preset]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.three-overlay-toolbar [data-preset]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                if (threeEngine) {
                    threeEngine.setCameraPreset(btn.dataset.preset);
                }
            });
        });

        // Mode Visite Immersive ZQSD
        const walkBtn = document.getElementById('btn-three-walk');
        if (walkBtn) {
            walkBtn.addEventListener('click', () => {
                if (threeEngine) threeEngine.toggleWalkMode();
            });
        }
        const quitWalkBtn = document.getElementById('btn-quit-walk');
        if (quitWalkBtn) {
            quitWalkBtn.addEventListener('click', () => {
                if (threeEngine) threeEngine.stopWalkMode();
            });
        }

        // Live Show DMX
        const liveBtn = document.getElementById('btn-three-liveshow');
        const liveText = document.getElementById('liveshow-text');
        if (liveBtn && liveText) {
            liveBtn.addEventListener('click', () => {
                if (!threeEngine) return;
                const isActive = threeEngine.toggleLiveShow();
                liveBtn.classList.toggle('active', isActive);
                liveText.textContent = isActive ? 'Stop Show' : 'Live Show';
            });
        }

        // Revêtement de sol
        const floorSelect = document.getElementById('select-three-floor');
        if (floorSelect) {
            floorSelect.addEventListener('change', (e) => {
                if (threeEngine) threeEngine.setFloorTexture(e.target.value);
            });
        }

        // Lighting Toggle (Studio / Show Nuit)
        const lightBtn = document.getElementById('btn-three-lighting');
        const lightText = document.getElementById('lighting-mode-text');
        if (lightBtn && lightText) {
            lightBtn.addEventListener('click', () => {
                if (!threeEngine) return;
                const nextMode = threeEngine.lightingMode === 'studio' ? 'night' : 'studio';
                threeEngine.setLightingMode(nextMode);
                lightText.textContent = nextMode === 'night' ? 'Show Nuit' : 'Studio';
                lightBtn.classList.toggle('active', nextMode === 'night');
            });
        }

        // 3D Screenshot / Photo HD
        const screenshotBtn = document.getElementById('btn-three-screenshot');
        if (screenshotBtn) {
            screenshotBtn.addEventListener('click', () => {
                if (threeEngine) {
                    threeEngine.takeScreenshot();
                }
            });
        }
    }

    // Keyboard Shortcuts for Mode Switching (F2: 2D, F3: 3D, F4: Split)
    window.addEventListener('keydown', (e) => {
        if (e.key === 'F2') {
            e.preventDefault();
            switchViewMode('2d');
        } else if (e.key === 'F3') {
            e.preventDefault();
            switchViewMode('3d');
        } else if (e.key === 'F4') {
            e.preventDefault();
            switchViewMode('split');
        }
    });

    // ─── Default Scenography Demo Scene ───────────────────────────
    function loadDefaultDemoScene() {
        if (engine.elements.length > 0) return;

        // 1. Stage (Scène principale)
        engine.addElement({
            id: 'stage-large',
            name: 'Scène Principale (8×5m)',
            category: 'scene',
            shape: 'stage',
            width: 8.0,
            height: 5.0,
            color: '#2a2d36',
            description: 'Scène modulaire praticable'
        }, 11.0, 2.5);

        // 2. Pupitre / Lutrin & Orateur (PNJ)
        engine.addElement({
            id: 'podium',
            name: 'Pupitre orateur',
            category: 'scene',
            shape: 'rect',
            width: 0.8,
            height: 0.6,
            color: '#475569'
        }, 13.5, 4.0);

        engine.addElement({
            id: 'pnj-speaker',
            name: 'Orateur / Présentateur',
            category: 'characters',
            shape: 'person',
            width: 0.5,
            height: 0.5,
            color: '#ef4444'
        }, 14.5, 4.0);

        // 3. Éclairages avec Lyres asservies robotisées (faisceaux volumétriques)
        engine.addElement({
            id: 'lyre-beam-1',
            name: 'Lyre Beam Gauche',
            category: 'tech',
            shape: 'spotlight',
            width: 0.5,
            height: 0.5,
            color: '#00e5ff'
        }, 10.5, 3.0);

        engine.addElement({
            id: 'lyre-beam-2',
            name: 'Lyre Beam Droite',
            category: 'tech',
            shape: 'spotlight',
            width: 0.5,
            height: 0.5,
            color: '#3b82f6'
        }, 18.5, 3.0);

        // Projecteur PAR sur pied
        engine.addElement({
            id: 'par-stand-1',
            name: 'PAR 64 Face',
            category: 'tech',
            shape: 'spotlight',
            width: 0.6,
            height: 0.6,
            color: '#ffbe3b'
        }, 12.0, 7.5);

        // 4. Tables avec NOMS imprimés sur le plateau
        engine.addElement({
            id: 'table-rect-6p',
            name: 'Table VIP 1',
            category: 'tables',
            shape: 'rect',
            width: 2.2,
            height: 1.0,
            color: '#8b7355'
        }, 11.0, 10.5);

        // Laptop posé directement SUR la Table VIP 1
        engine.addElement({
            id: 'laptop-vip',
            name: 'PC Portable VIP',
            category: 'tech',
            shape: 'computer',
            width: 0.45,
            height: 0.35,
            color: '#475569'
        }, 11.8, 10.8);

        engine.addElement({
            id: 'table-rect-8p',
            name: 'Table Presse & Media',
            category: 'tables',
            shape: 'rect',
            width: 2.6,
            height: 1.0,
            color: '#705843'
        }, 16.0, 10.5);

        // Tour PC Gamer RGB posée directement SUR la Table Presse & Media
        engine.addElement({
            id: 'pc-gamer',
            name: 'Tour PC Gamer RGB',
            category: 'tech',
            shape: 'computer',
            width: 0.5,
            height: 0.3,
            color: '#181c24'
        }, 16.8, 10.8);

        engine.addElement({
            id: 'table-cocktail',
            name: 'Mange-debout Accueil',
            category: 'tables',
            shape: 'circle',
            width: 0.8,
            height: 0.8,
            color: '#d5cbbe'
        }, 8.0, 10.5);

        // Espace Gaming & Multimédia : TV avec plateau inférieur, Switch & 2 manettes
        engine.addElement({
            id: 'tv-stand-switch',
            name: 'TV avec Switch & 2 manettes',
            category: 'tech',
            shape: 'tv-switch',
            width: 1.4,
            height: 0.55,
            color: '#1e222b'
        }, 6.5, 7.5);

        // 5. Régie Technique avec PC & Ordinateurs portables + Technicien PNJ
        engine.addElement({
            id: 'desk-regie',
            name: 'Régie Technique Audio/Lumière',
            category: 'production',
            shape: 'rect',
            width: 3.0,
            height: 1.2,
            color: '#1f232b'
        }, 13.5, 14.5);

        engine.addElement({
            id: 'laptop',
            name: 'PC Portable Console Lumière',
            category: 'tech',
            shape: 'computer',
            width: 0.5,
            height: 0.4,
            color: '#334155'
        }, 13.8, 14.7);

        engine.addElement({
            id: 'desktop-pc',
            name: 'Station PC Régie Vidéo',
            category: 'tech',
            shape: 'computer',
            width: 0.8,
            height: 0.6,
            color: '#1e293b'
        }, 15.2, 14.7);

        engine.addElement({
            id: 'pnj-tech',
            name: 'Ingénieur Son & Lumière',
            category: 'characters',
            shape: 'person',
            width: 0.5,
            height: 0.5,
            color: '#1e293b'
        }, 14.5, 15.5);

        // 6. Sécurité & Contrôle d'accès (Agent de sécurité + Barrières Vauban)
        engine.addElement({
            id: 'pnj-security',
            name: 'Agent de Sécurité',
            category: 'characters',
            shape: 'person',
            width: 0.5,
            height: 0.5,
            color: '#d4e600'
        }, 6.5, 13.0);

        engine.addElement({
            id: 'barriere-vauban',
            name: 'Barrière Vauban Entrée',
            category: 'security',
            shape: 'barrier',
            width: 2.5,
            height: 0.5,
            color: '#a0aec0'
        }, 5.5, 14.0);

        // 7. Visiteur PNJ
        engine.addElement({
            id: 'pnj-visitor',
            name: 'Visiteur VIP',
            category: 'characters',
            shape: 'person',
            width: 0.5,
            height: 0.5,
            color: '#3b82f6'
        }, 8.0, 11.2);

        engine.render();
    }

    loadDefaultDemoScene();

    // ─── Initialize Stats ──────────────────────────────────────────
    document.getElementById('stat-elements').textContent = engine.elements.length.toString();
    document.getElementById('stat-surface').textContent = `${(engine.sceneWidth * engine.sceneHeight).toFixed(0)} m²`;

    // ─── Chair Rows Generator Controller (Phase 2.1) ───────────────
    const chairModal = document.getElementById('chair-generator-modal');
    const btnChairToolbar = document.getElementById('btn-chair-generator');
    const toolChairCanvas = document.getElementById('tool-chair-generator');
    const btnCloseChair = document.getElementById('btn-close-chair-modal');
    const btnCancelChair = document.getElementById('btn-cancel-chair-modal');
    const btnGenerateChairs = document.getElementById('btn-generate-chairs');

    // Inputs
    const inputRows = document.getElementById('cg-rows');
    const inputSeats = document.getElementById('cg-seats');
    const inputGapX = document.getElementById('cg-gap-x');
    const inputRowSpacing = document.getElementById('cg-row-spacing');
    const inputRotation = document.getElementById('cg-rotation');
    const inputHasAisle = document.getElementById('cg-has-aisle');
    const inputAisleWidth = document.getElementById('cg-aisle-width');
    const inputNumberSeats = document.getElementById('cg-number-seats');
    const inputColor = document.getElementById('cg-color');
    const groupAisleWidth = document.getElementById('group-aisle-width');

    // Summary Elements
    const badgeRows = document.getElementById('val-cg-rows');
    const badgeSeats = document.getElementById('val-cg-seats');
    const summaryTotal = document.getElementById('cg-summary-total');
    const summaryBlocks = document.getElementById('cg-summary-blocks');
    const summaryDims = document.getElementById('cg-summary-dims');
    const summaryArea = document.getElementById('cg-summary-area');
    const summaryErp = document.getElementById('cg-summary-erp');

    function openChairModal() {
        if (!chairModal) return;
        chairModal.style.display = 'flex';
        updateChairSummary();
    }

    function closeChairModal() {
        if (!chairModal) return;
        chairModal.style.display = 'none';
    }

    function updateChairSummary() {
        const rows = parseInt(inputRows.value, 10) || 8;
        const seats = parseInt(inputSeats.value, 10) || 12;
        const gapX = parseFloat(inputGapX.value) || 0.08;
        const rowSpacing = parseFloat(inputRowSpacing.value) || 0.95;
        const hasAisle = inputHasAisle.checked;
        const aisleWidth = hasAisle ? (parseFloat(inputAisleWidth.value) || 1.40) : 0;

        // Update badges
        badgeRows.textContent = rows.toString();
        badgeSeats.textContent = seats.toString();

        // Show/hide aisle width field
        if (groupAisleWidth) {
            groupAisleWidth.style.display = hasAisle ? 'flex' : 'none';
        }

        const totalSeats = rows * seats;
        const chairW = 0.45;
        const chairH = 0.45;

        let totalW = seats * chairW + (seats - 1) * gapX;
        if (hasAisle && seats > 1) {
            totalW += aisleWidth;
        }
        const totalH = (rows - 1) * rowSpacing + chairH;
        const area = totalW * totalH;

        summaryTotal.textContent = `${totalSeats} places`;
        
        if (hasAisle && seats > 1) {
            const h1 = Math.ceil(seats / 2);
            const h2 = seats - h1;
            summaryBlocks.textContent = `2 blocs (${rows * h1} + ${rows * h2} sièges)`;
        } else {
            summaryBlocks.textContent = `1 bloc continu de ${totalSeats} sièges`;
        }

        summaryDims.textContent = `${totalW.toFixed(2)} m × ${totalH.toFixed(2)} m`;
        summaryArea.textContent = `Surface : ~${Math.round(area)} m²`;

        // ERP validation status
        if (hasAisle) {
            if (aisleWidth >= 1.40) {
                summaryErp.textContent = 'Conforme ERP (2 UP)';
                summaryErp.className = 'metric-val success';
            } else if (aisleWidth >= 0.90) {
                summaryErp.textContent = 'Conforme ERP (1 UP)';
                summaryErp.className = 'metric-val';
                summaryErp.style.color = '#ffbe3b';
            } else {
                summaryErp.textContent = 'Attention: allée < 0.90m';
                summaryErp.className = 'metric-val';
                summaryErp.style.color = '#ff5555';
            }
        } else {
            summaryErp.textContent = seats > 16 ? 'Avertissement: >16 chaises sans allée' : 'Bloc continu standard';
            summaryErp.className = 'metric-val';
            summaryErp.style.color = seats > 16 ? '#ffbe3b' : 'var(--text-primary)';
        }
    }

    // Event listeners for inputs
    [inputRows, inputSeats, inputGapX, inputRowSpacing, inputAisleWidth, inputHasAisle].forEach(el => {
        if (el) {
            el.addEventListener('input', updateChairSummary);
            el.addEventListener('change', updateChairSummary);
        }
    });

    // Color presets
    document.querySelectorAll('.color-preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.color-preset-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            inputColor.value = btn.dataset.color;
        });
    });

    // Modal open/close triggers
    if (btnChairToolbar) btnChairToolbar.addEventListener('click', openChairModal);
    if (toolChairCanvas) toolChairCanvas.addEventListener('click', openChairModal);
    if (btnCloseChair) btnCloseChair.addEventListener('click', closeChairModal);
    if (btnCancelChair) btnCancelChair.addEventListener('click', closeChairModal);

    if (chairModal) {
        chairModal.addEventListener('click', (e) => {
            if (e.target === chairModal) closeChairModal();
        });
    }

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (chairModal && chairModal.style.display === 'flex') closeChairModal();
            if (bomModal && bomModal.style.display === 'flex') closeBOMModal();
        }
        // Shortcut Alt+C (Chaises)
        if (e.altKey && (e.key === 'c' || e.key === 'C')) {
            e.preventDefault();
            openChairModal();
        }
        // Shortcut Alt+B (BOM / Nomenclature)
        if (e.altKey && (e.key === 'b' || e.key === 'B')) {
            e.preventDefault();
            openBOMModal();
        }
    });

    // Helper escape html
    function escapeHtml(str) {
        if (!str) return '';
        return String(str).replace(/[&<>"']/g, m => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
        })[m]);
    }

    // ─── Modal Nomenclature Matériel (BOM) & Fiches Prestataires ───
    const bomModal = document.getElementById('bom-modal');
    const btnBomToolbar = document.getElementById('btn-bom-inventory');
    const toolBomCanvas = document.getElementById('tool-bom-inventory');
    const btnCloseBom = document.getElementById('btn-close-bom-modal');
    const btnExportBomCsv = document.getElementById('btn-export-bom-csv');
    const btnPrintBom = document.getElementById('btn-print-bom');
    const bomSearchInput = document.getElementById('bom-search');
    const bomTbody = document.getElementById('bom-tbody');
    const bomEmptyMsg = document.getElementById('bom-empty-msg');

    let currentBomFilter = 'all';
    let currentBomSearch = '';

    function openBOMModal() {
        if (!bomModal) return;
        renderBOMContent();
        bomModal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    function closeBOMModal() {
        if (!bomModal) return;
        bomModal.style.display = 'none';
        document.body.style.overflow = '';
    }

    function renderBOMContent() {
        if (typeof engine.getBOMInventory !== 'function') return;
        const bom = engine.getBOMInventory();

        // Update KPIs
        const totalItemsEl = document.getElementById('bom-total-items');
        const totalSeatsEl = document.getElementById('bom-total-seats');
        const totalLinearEl = document.getElementById('bom-total-linear');
        const occupiedAreaEl = document.getElementById('bom-occupied-area');
        const footerInfoEl = document.getElementById('bom-footer-info');

        if (totalItemsEl) totalItemsEl.textContent = bom.totalItems.toString();
        if (totalSeatsEl) totalSeatsEl.textContent = bom.totalSeats.toString();
        if (totalLinearEl) totalLinearEl.textContent = `${bom.totalLinear.toFixed(1)} m`;
        if (occupiedAreaEl) occupiedAreaEl.textContent = `${bom.totalOccupiedArea.toFixed(1)} m²`;

        const rawName = document.getElementById('project-name')?.value || 'Mon Projet';
        if (footerInfoEl) {
            footerInfoEl.textContent = `Projet : ${rawName} | Salle : ${bom.sceneWidth}×${bom.sceneHeight}m (${bom.sceneArea} m²) | Surface libre : ${bom.freeArea.toFixed(1)} m²`;
        }

        // Filter items
        const q = currentBomSearch.trim().toLowerCase();
        const filtered = bom.items.filter(item => {
            if (currentBomFilter !== 'all') {
                const cat = item.category.toLowerCase();
                if (currentBomFilter === 'chairs' && !cat.includes('assise') && !cat.includes('chaise')) return false;
                if (currentBomFilter === 'tables' && !cat.includes('table')) return false;
                if (currentBomFilter === 'scene' && !cat.includes('scène') && !cat.includes('structure')) return false;
                if (currentBomFilter === 'tech' && !cat.includes('audiovisuel') && !cat.includes('énergie') && !cat.includes('tech')) return false;
                if (currentBomFilter === 'safety' && !cat.includes('sécurité') && !cat.includes('cloison') && !cat.includes('barrière')) return false;
            }
            if (q) {
                const name = (item.name || '').toLowerCase();
                const id = (item.id || '').toLowerCase();
                const cat = (item.category || '').toLowerCase();
                if (!name.includes(q) && !id.includes(q) && !cat.includes(q)) return false;
            }
            return true;
        });

        if (!bomTbody) return;
        bomTbody.innerHTML = '';

        if (filtered.length === 0) {
            if (bomEmptyMsg) bomEmptyMsg.style.display = 'block';
            return;
        }

        if (bomEmptyMsg) bomEmptyMsg.style.display = 'none';

        filtered.forEach(item => {
            const tr = document.createElement('tr');

            // Color dot
            const tdColor = document.createElement('td');
            const pill = document.createElement('span');
            pill.className = 'bom-color-pill';
            pill.style.backgroundColor = item.color || '#4A607A';
            tdColor.appendChild(pill);

            // Designation
            const tdName = document.createElement('td');
            tdName.innerHTML = `<strong>${escapeHtml(item.name)}</strong>`;
            if (item.sampleNames && item.sampleNames.length > 0 && item.sampleNames[0] !== item.name) {
                tdName.innerHTML += `<div style="font-size:10.5px;color:var(--text-muted);margin-top:2px;">Ex: ${item.sampleNames.map(s => escapeHtml(s)).join(', ')}</div>`;
            }

            // Category
            const tdCat = document.createElement('td');
            const catBadge = document.createElement('span');
            catBadge.className = 'bom-cat-badge';
            catBadge.textContent = item.category;
            tdCat.appendChild(catBadge);

            // Dimensions
            const tdDim = document.createElement('td');
            tdDim.className = 'bom-dim-text';
            tdDim.textContent = `${item.width.toFixed(2)} × ${item.height.toFixed(2)} m`;

            // Quantity
            const tdQty = document.createElement('td');
            tdQty.className = 'text-center';
            const qtyBadge = document.createElement('span');
            qtyBadge.className = 'bom-qty-badge';
            qtyBadge.textContent = item.count.toString();
            tdQty.appendChild(qtyBadge);

            // Total Metric
            const tdMetric = document.createElement('td');
            tdMetric.className = 'text-right bom-metric-text';
            tdMetric.textContent = item.isLinear ? `${item.totalLength.toFixed(2)} m lin.` : `${item.totalArea.toFixed(2)} m²`;

            tr.appendChild(tdColor);
            tr.appendChild(tdName);
            tr.appendChild(tdCat);
            tr.appendChild(tdDim);
            tr.appendChild(tdQty);
            tr.appendChild(tdMetric);

            bomTbody.appendChild(tr);
        });
    }

    if (btnBomToolbar) btnBomToolbar.addEventListener('click', openBOMModal);
    if (toolBomCanvas) toolBomCanvas.addEventListener('click', openBOMModal);
    if (btnCloseBom) btnCloseBom.addEventListener('click', closeBOMModal);

    if (btnExportBomCsv) {
        btnExportBomCsv.addEventListener('click', () => {
            if (typeof engine.downloadBOMCSV === 'function') {
                engine.downloadBOMCSV();
            }
        });
    }

    if (btnPrintBom) {
        btnPrintBom.addEventListener('click', () => {
            if (typeof engine.printBOMTechnicalSheet === 'function') {
                engine.printBOMTechnicalSheet();
            }
        });
    }

    if (bomModal) {
        bomModal.addEventListener('click', (e) => {
            if (e.target === bomModal) closeBOMModal();
        });
    }

    if (bomSearchInput) {
        bomSearchInput.addEventListener('input', (e) => {
            currentBomSearch = (e.target ? e.target.value : bomSearchInput.value) || '';
            renderBOMContent();
        });
    }

    document.querySelectorAll('.bom-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            document.querySelectorAll('.bom-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            currentBomFilter = chip.dataset.bomCat || 'all';
            renderBOMContent();
        });
    });

    // Generate Action
    if (btnGenerateChairs) {
        btnGenerateChairs.addEventListener('click', () => {
            const config = {
                rows: parseInt(inputRows.value, 10) || 8,
                seatsPerRow: parseInt(inputSeats.value, 10) || 12,
                gapX: parseFloat(inputGapX.value) || 0.08,
                rowSpacing: parseFloat(inputRowSpacing.value) || 0.95,
                rotation: parseInt(inputRotation.value, 10) || 180,
                hasAisle: inputHasAisle.checked,
                aisleWidth: parseFloat(inputAisleWidth.value) || 1.40,
                numberSeats: inputNumberSeats.checked,
                color: inputColor.value || '#4A607A'
            };

            if (typeof engine.generateChairBlock !== 'function') {
                alert("Le moteur du plan 2D a été mis à jour. Veuillez recharger la page avec Ctrl + F5 pour vider le cache.");
                return;
            }

            const result = engine.generateChairBlock(config);
            closeChairModal();

            // Feedback console / log
            console.log(`%c🪑 Parterre de ${result.totalChairs} chaises généré avec succès ! (Annulable avec Ctrl+Z)`, 'color: #4cd964; font-weight: bold;');
        });
    }

    // ─── Calques & Liste des éléments (Layers Panel) ───────────────
    const tabBtnProps = document.getElementById('tab-btn-props');
    const tabBtnLayers = document.getElementById('tab-btn-layers');
    const propsContent = document.getElementById('properties-content');
    const layersContent = document.getElementById('layers-content');
    layersListContainer = document.getElementById('layers-list');
    const layersSearchInput = document.getElementById('layers-search');
    const layersSearchClear = document.getElementById('layers-search-clear');
    const layersEmptyState = document.getElementById('layers-empty-state');
    const layersVisibleCount = document.getElementById('layers-visible-count');

    function switchSidebarTab(tab) {
        activeSidebarTab = tab;
        if (tab === 'props') {
            if (tabBtnProps) tabBtnProps.classList.add('active');
            if (tabBtnLayers) tabBtnLayers.classList.remove('active');
            if (propsContent) propsContent.style.display = 'block';
            if (layersContent) layersContent.style.display = 'none';
        } else {
            if (tabBtnProps) tabBtnProps.classList.remove('active');
            if (tabBtnLayers) tabBtnLayers.classList.add('active');
            if (propsContent) propsContent.style.display = 'none';
            if (layersContent) layersContent.style.display = 'flex';
            renderLayersList();
        }
    }

    if (tabBtnProps) tabBtnProps.addEventListener('click', () => switchSidebarTab('props'));
    if (tabBtnLayers) tabBtnLayers.addEventListener('click', () => switchSidebarTab('layers'));

    updateLayerSelectionHighlight = function(element) {
        if (!layersListContainer) return;
        const rows = layersListContainer.querySelectorAll('.layer-row');
        rows.forEach(r => {
            const isMatch = element && r.dataset.uid === element.uid.toString();
            r.classList.toggle('selected', !!isMatch);
            if (isMatch && activeSidebarTab === 'layers') {
                r.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
        });
    };

    renderLayersList = function() {
        if (!layersListContainer) return;

        const allElements = engine.elements || [];
        const q = layerSearchQuery.trim().toLowerCase();

        // Filter elements
        const filtered = allElements.filter(el => {
            // Category filter
            if (currentLayerFilter !== 'all') {
                const cat = (el.category || el.shape || '').toLowerCase();
                const id = (el.id || '').toLowerCase();

                if (currentLayerFilter === 'chairs') {
                    const isChair = el.shape === 'chair' || cat === 'chairs' || id.startsWith('chair');
                    if (!isChair) return false;
                } else if (currentLayerFilter === 'tables') {
                    const isTable = cat === 'tables' || id.includes('table');
                    if (!isTable) return false;
                } else if (currentLayerFilter === 'scene') {
                    const isScene = cat === 'scene' || id.includes('scene') || id.includes('podium') || id.includes('truss') || id.includes('curtain') || id.includes('backdrop');
                    if (!isScene) return false;
                } else if (currentLayerFilter === 'tech') {
                    const isTech = cat === 'tech' || id.includes('light') || id.includes('par') || id.includes('tv') || id.includes('speaker') || id.includes('pc') || id.includes('switch');
                    if (!isTech) return false;
                } else if (currentLayerFilter === 'other') {
                    const isChair = el.shape === 'chair' || cat === 'chairs' || id.startsWith('chair');
                    const isTable = cat === 'tables' || id.includes('table');
                    const isScene = cat === 'scene' || id.includes('scene') || id.includes('podium') || id.includes('truss') || id.includes('curtain');
                    const isTech = cat === 'tech' || id.includes('light') || id.includes('par') || id.includes('tv') || id.includes('speaker') || id.includes('pc') || id.includes('switch');
                    if (isChair || isTable || isScene || isTech) return false;
                }
            }

            // Text search
            if (q) {
                const name = (el.name || '').toLowerCase();
                const id = (el.id || '').toLowerCase();
                const cat = (el.category || '').toLowerCase();
                if (!name.includes(q) && !id.includes(q) && !cat.includes(q)) {
                    return false;
                }
            }
            return true;
        });

        // Update counts & badge
        if (layersVisibleCount) {
            layersVisibleCount.textContent = `${filtered.length} ${filtered.length > 1 ? 'éléments' : 'élément'}`;
        }
        const badge = document.getElementById('layers-badge');
        if (badge) badge.textContent = allElements.length.toString();

        if (filtered.length === 0) {
            layersListContainer.innerHTML = '';
            if (layersEmptyState) layersEmptyState.style.display = 'flex';
            return;
        }

        if (layersEmptyState) layersEmptyState.style.display = 'none';

        // Render top layer first (reversed array)
        const displayList = [...filtered].reverse();
        layersListContainer.innerHTML = '';

        displayList.forEach(el => {
            const isSelected = el === engine.selectedElement;
            const isHidden = !!el.hidden;
            const isLocked = !!el.locked;

            const row = document.createElement('div');
            row.className = `layer-row ${isSelected ? 'selected' : ''} ${isHidden ? 'is-hidden' : ''}`;
            row.dataset.uid = el.uid;

            // Dot color
            const dot = document.createElement('span');
            dot.className = 'layer-dot';
            dot.style.backgroundColor = el.color || '#4A607A';

            // Editable Name Input (real-time 2D update)
            const nameInput = document.createElement('input');
            nameInput.type = 'text';
            nameInput.className = 'layer-name-input';
            nameInput.value = el.name || el.id || 'Élément';
            nameInput.title = 'Cliquer pour modifier le nom en direct';

            nameInput.addEventListener('click', (e) => e.stopPropagation());
            nameInput.addEventListener('input', (e) => {
                el.name = e.target.value;
                engine.render();
                if (engine.selectedElement === el) {
                    const propName = document.getElementById('prop-name');
                    if (propName) propName.value = el.name;
                    const statusSel = document.getElementById('status-selection');
                    if (statusSel) statusSel.textContent = el.name;
                }
            });
            nameInput.addEventListener('change', () => {
                engine.saveUndoState();
            });

            // Dimension meta tag
            const meta = document.createElement('span');
            meta.className = 'layer-meta';
            const wStr = el.width !== undefined ? el.width.toFixed(2) : '?';
            const hStr = el.height !== undefined ? el.height.toFixed(2) : '?';
            meta.textContent = `${wStr}×${hStr}m`;

            // Action buttons container
            const actions = document.createElement('div');
            actions.className = 'layer-actions';

            // Focus/Center button
            const btnFocus = document.createElement('button');
            btnFocus.className = 'layer-btn';
            btnFocus.title = 'Centrer la vue sur cet élément';
            btnFocus.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/></svg>`;
            btnFocus.addEventListener('click', (e) => {
                e.stopPropagation();
                engine.selectElement(el);
                if (typeof engine.panToElement === 'function') {
                    engine.panToElement(el);
                }
            });

            // Visibility toggle button
            const btnVisibility = document.createElement('button');
            btnVisibility.className = `layer-btn ${isHidden ? 'is-hidden' : ''}`;
            btnVisibility.title = isHidden ? 'Afficher' : 'Masquer';
            btnVisibility.innerHTML = isHidden 
                ? `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`
                : `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
            btnVisibility.addEventListener('click', (e) => {
                e.stopPropagation();
                engine.setElementHidden(el, !el.hidden);
                renderLayersList();
            });

            // Lock toggle button
            const btnLock = document.createElement('button');
            btnLock.className = `layer-btn ${isLocked ? 'is-locked' : ''}`;
            btnLock.title = isLocked ? 'Déverrouiller' : 'Verrouiller';
            btnLock.innerHTML = isLocked
                ? `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`
                : `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>`;
            btnLock.addEventListener('click', (e) => {
                e.stopPropagation();
                engine.setElementLocked(el, !el.locked);
                renderLayersList();
            });

            // Delete button
            const btnDelete = document.createElement('button');
            btnDelete.className = 'layer-btn danger';
            btnDelete.title = 'Supprimer l\'élément';
            btnDelete.innerHTML = `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3,6 5,6 21,6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>`;
            btnDelete.addEventListener('click', (e) => {
                e.stopPropagation();
                engine.removeElement(el);
            });

            actions.appendChild(btnFocus);
            actions.appendChild(btnVisibility);
            actions.appendChild(btnLock);
            actions.appendChild(btnDelete);

            row.appendChild(dot);
            row.appendChild(nameInput);
            row.appendChild(meta);
            row.appendChild(actions);

            // Row click: select & pan to element
            row.addEventListener('click', () => {
                engine.selectElement(el);
                if (typeof engine.panToElement === 'function') {
                    engine.panToElement(el);
                }
                updateLayerSelectionHighlight(el);
            });

            layersListContainer.appendChild(row);
        });
    }

    // Search and Filter Events
    if (layersSearchInput) {
        layersSearchInput.addEventListener('input', (e) => {
            layerSearchQuery = e.target.value;
            if (layersSearchClear) {
                layersSearchClear.style.display = layerSearchQuery.length > 0 ? 'block' : 'none';
            }
            renderLayersList();
        });
    }

    if (layersSearchClear) {
        layersSearchClear.addEventListener('click', () => {
            layersSearchInput.value = '';
            layerSearchQuery = '';
            layersSearchClear.style.display = 'none';
            renderLayersList();
        });
    }

    document.querySelectorAll('.layer-chip').forEach(chip => {
        chip.addEventListener('click', () => {
            document.querySelectorAll('.layer-chip').forEach(c => c.classList.remove('active'));
            chip.classList.add('active');
            currentLayerFilter = chip.dataset.category || 'all';
            renderLayersList();
        });
    });

    console.log('%c🎭 ScenoPlan — Conception Scénographique 2D/3D', 'color: #6c8cff; font-size: 16px; font-weight: bold;');
    console.log('%cRaccourcis: F2=Plan 2D, F3=Rendu 3D, V=Sélection, H=Déplacer vue, M=Mesurer, W=Mur, Z=Zone, T=Texte, Alt+C=Parterre chaises, Suppr=Supprimer', 'color: #8b90a0;');
});
