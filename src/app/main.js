/* ================================================================
   ScenoPlan — Application Controller Entry Point
   Wires the UI together: library panel, properties panel,
   layers panel, modals, toolbar actions, 2D/3D view modes, shortcuts.
   ================================================================ */

import { CanvasEngine } from '../canvas/index.js';
import { setupLibraryPanel } from './library-panel.js';
import { setupPropertiesPanel } from './properties-panel.js';
import { setupLayersPanel } from './layers-panel.js';
import { setupChairModal } from './chair-modal.js';
import { setupBomModal } from './bom-modal.js';
import { setupViewModes } from './view-modes.js';
import { loadDefaultDemoScene } from './demo-scene.js';

export function initApp() {
    // 1. Initialize 2D Canvas Engine
    const engine = new CanvasEngine('main-canvas', 'canvas-container');
    engine.fitView();

    // 2. Initialize View Modes & 3D Controller
    const viewModes = setupViewModes(engine);

    // 3. Build Library Panel & Drop Target
    setupLibraryPanel(engine);

    // 4. Setup Layers Panel & Properties Panel
    const layersPanel = setupLayersPanel(engine);
    const { contextMenu } = setupPropertiesPanel(engine, {
        onElevationChange: () => viewModes.syncThreeIf3D(),
        onLayerHighlight: (element) => layersPanel.updateLayerSelectionHighlight(element)
    });

    // 5. Setup Modals
    const { chairModal, openChairModal, closeChairModal } = setupChairModal(engine);
    const { bomModal, openBOMModal, closeBOMModal } = setupBomModal(engine);

    // 6. Stats & Real-time 2D->3D Sync
    function updateStats() {
        const statEl = document.getElementById('stat-elements');
        const statSurf = document.getElementById('stat-surface');
        const layersBadge = document.getElementById('layers-badge');
        if (statEl) statEl.textContent = engine.elements.length.toString();
        if (layersBadge) layersBadge.textContent = engine.elements.length.toString();
        if (statSurf) statSurf.textContent = `${(engine.sceneWidth * engine.sceneHeight).toFixed(0)} m²`;
    }

    engine.onElementsChange = () => {
        updateStats();
        if (layersPanel.getActiveTab() === 'layers') {
            layersPanel.renderLayersList();
        }
        viewModes.syncThreeIfVisible();
    };

    // 7. Canvas Toolbar
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

    // 8. Top Toolbar Actions
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
            viewModes.syncThreeIfVisible();
        };
        reader.readAsText(file);
        e.target.value = '';
    });

    document.getElementById('btn-undo').addEventListener('click', () => engine.undo());
    document.getElementById('btn-redo').addEventListener('click', () => engine.redo());

    document.getElementById('btn-export-png').addEventListener('click', () => engine.exportPNG());
    document.getElementById('btn-export-pdf').addEventListener('click', () => engine.exportPDF());

    const btnExportGlb = document.getElementById('btn-export-glb');
    if (btnExportGlb) {
        btnExportGlb.addEventListener('click', async () => {
            const te = await viewModes.ensureThreeEngine();
            if (te) {
                te.syncFrom2D(engine);
                te.exportGLB();
            } else {
                alert("Le moteur 3D n'a pas pu être initialisé (WebGL indisponible).");
            }
        });
    }

    document.getElementById('btn-theme').addEventListener('click', () => {
        const body = document.body;
        const current = body.dataset.theme;
        body.dataset.theme = current === 'dark' ? 'light' : 'dark';
        engine.render();
    });

    // 9. Keyboard Shortcuts
    document.addEventListener('keydown', (e) => {
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
            case 'p':
                if (!ctrl) engine.setTool('polygon-zone');
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
            case 'enter':
                if (engine.isDrawingPolygonZone && engine.polygonPoints.length >= 3) {
                    e.preventDefault();
                    engine.finishPolygonZone();
                }
                break;
            case 'delete':
            case 'backspace':
                if (engine.isDrawingPolygonZone && e.key.toLowerCase() === 'backspace') {
                    e.preventDefault();
                    engine.undoLastPolygonPoint();
                } else if (engine.selectedElement) {
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

    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (chairModal && chairModal.style.display === 'flex') closeChairModal();
            if (bomModal && bomModal.style.display === 'flex') closeBOMModal();
        }
        if (e.altKey && (e.key === 'c' || e.key === 'C')) {
            e.preventDefault();
            openChairModal();
        }
        if (e.altKey && (e.key === 'b' || e.key === 'B')) {
            e.preventDefault();
            openBOMModal();
        }
    });

    // 10. Window Resize
    let resizeTimeout;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            engine.resizeCanvas();
            const te = viewModes.getThreeEngine();
            const mode = viewModes.getCurrentViewMode();
            if (te && (mode === '3d' || mode === 'split')) {
                te.onWindowResize();
            }
        }, 100);
    });

    // 11. Default Demo Scene & Initial Stats
    loadDefaultDemoScene(engine);
    updateStats();

    console.log('%c🎭 ScenoPlan — Conception Scénographique 2D/3D', 'color: #6c8cff; font-size: 16px; font-weight: bold;');
    console.log('%cRaccourcis: F2=Plan 2D, F3=Rendu 3D, V=Sélection, H=Déplacer vue, M=Mesurer, W=Mur, Z=Zone, P=Zone polygonale, T=Texte, Alt+C=Parterre chaises, Suppr=Supprimer', 'color: #8b90a0;');

    return engine;
}

if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => initApp());
    } else {
        initApp();
    }
}
