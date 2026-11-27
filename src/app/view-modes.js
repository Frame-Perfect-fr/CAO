/* ================================================================
   ScenoPlan — 2D / Split / 3D View Mode & ThreeEngine Controller
   ================================================================ */

export function setupViewModes(engine) {
    let threeEngine = null;
    let threeInitPromise = null;
    let threeToolbarReady = false;
    let currentViewMode = '2d';

    const mode2dBtn = document.getElementById('mode-2d');
    const modeSplitBtn = document.getElementById('mode-split');
    const mode3dBtn = document.getElementById('mode-3d');
    const viewportsWrapper = document.getElementById('viewports-wrapper');
    const canvasContainer = document.getElementById('canvas-container');
    const canvasToolbar = document.getElementById('canvas-toolbar');
    const statusBar = document.getElementById('status-bar');
    const threeContainer = document.getElementById('three-container');

    function setupThreeToolbar() {
        if (threeToolbarReady) return;
        threeToolbarReady = true;

        document.querySelectorAll('.three-overlay-toolbar [data-preset]').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.three-overlay-toolbar [data-preset]').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                if (threeEngine) {
                    threeEngine.setCameraPreset(btn.dataset.preset);
                }
            });
        });

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

        const floorSelect = document.getElementById('select-three-floor');
        if (floorSelect) {
            floorSelect.addEventListener('change', (e) => {
                if (threeEngine) threeEngine.setFloorTexture(e.target.value);
            });
        }

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

        const screenshotBtn = document.getElementById('btn-three-screenshot');
        if (screenshotBtn) {
            screenshotBtn.addEventListener('click', () => {
                if (threeEngine) {
                    threeEngine.takeScreenshot();
                }
            });
        }

        const exportGlbBtn = document.getElementById('btn-three-export-glb');
        if (exportGlbBtn) {
            exportGlbBtn.addEventListener('click', () => {
                if (threeEngine) {
                    threeEngine.exportGLB();
                }
            });
        }
    }

    async function ensureThreeEngine() {
        if (threeEngine) return threeEngine;
        if (!threeInitPromise) {
            threeInitPromise = (async () => {
                try {
                    const { ThreeEngine } = await import('../three/index.js');
                    if (typeof window !== 'undefined') {
                        window.ThreeEngine = ThreeEngine;
                    }
                    threeEngine = new ThreeEngine('three-container');
                    if (typeof window !== 'undefined') {
                        window.sceno3D = threeEngine;
                        window.dispatchEvent(new CustomEvent('three-engine-ready'));
                    }
                    setupThreeToolbar();
                    if (engine) {
                        threeEngine.syncFrom2D(engine);
                    }
                    return threeEngine;
                } catch (err) {
                    console.error('Erreur initialisation ThreeEngine:', err);
                    return null;
                }
            })();
        }
        return threeInitPromise;
    }

    function syncThreeIfVisible() {
        if (threeEngine && (currentViewMode === '3d' || currentViewMode === 'split')) {
            threeEngine.syncFrom2D(engine);
        }
    }

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

            ensureThreeEngine().then((te) => {
                if (!te) return;
                te.onWindowResize();
                te.syncFrom2D(engine);
                requestAnimationFrame(() => te.onWindowResize());
                setTimeout(() => te.onWindowResize(), 60);
            });
        } else if (mode === '3d') {
            if (mode3dBtn) mode3dBtn.classList.add('active');
            if (mode2dBtn) mode2dBtn.classList.remove('active');
            if (modeSplitBtn) modeSplitBtn.classList.remove('active');
            if (viewportsWrapper) viewportsWrapper.classList.remove('mode-split');

            canvasContainer.style.display = 'none';
            canvasToolbar.style.display = 'none';
            statusBar.style.display = 'none';
            threeContainer.style.display = 'flex';

            ensureThreeEngine().then((te) => {
                if (!te) return;
                te.onWindowResize();
                te.syncFrom2D(engine);
                requestAnimationFrame(() => te.onWindowResize());
                setTimeout(() => te.onWindowResize(), 60);
            });
        } else {
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

    setupThreeToolbar();

    // Eagerly initialize ThreeEngine in real browser environments with WebGL support
    if (typeof window !== 'undefined' && typeof window.WebGLRenderingContext !== 'undefined') {
        ensureThreeEngine();
    }

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

    return {
        getThreeEngine: () => threeEngine,
        ensureThreeEngine,
        getCurrentViewMode: () => currentViewMode,
        switchViewMode,
        syncThreeIfVisible,
        syncThreeIf3D: () => {
            if (threeEngine && currentViewMode === '3d') {
                threeEngine.syncFrom2D(engine);
            }
        }
    };
}
