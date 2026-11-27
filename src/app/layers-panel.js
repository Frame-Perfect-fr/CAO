/* ================================================================
   ScenoPlan — Layers & Elements Panel Controller
   ================================================================ */

export function setupLayersPanel(engine) {
    let activeSidebarTab = 'props';
    let currentLayerFilter = 'all';
    let layerSearchQuery = '';

    const tabBtnProps = document.getElementById('tab-btn-props');
    const tabBtnLayers = document.getElementById('tab-btn-layers');
    const propsContent = document.getElementById('properties-content');
    const layersContent = document.getElementById('layers-content');
    const layersListContainer = document.getElementById('layers-list');
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

    function updateLayerSelectionHighlight(element) {
        if (!layersListContainer) return;
        const rows = layersListContainer.querySelectorAll('.layer-row');
        rows.forEach(r => {
            const isMatch = element && r.dataset.uid === element.uid.toString();
            r.classList.toggle('selected', !!isMatch);
            if (isMatch && activeSidebarTab === 'layers') {
                r.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
        });
    }

    function renderLayersList() {
        if (!layersListContainer) return;

        const allElements = engine.elements || [];
        const q = layerSearchQuery.trim().toLowerCase();

        const filtered = allElements.filter(el => {
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

        const displayList = [...filtered].reverse();
        layersListContainer.innerHTML = '';

        displayList.forEach(el => {
            const isSelected = el === engine.selectedElement;
            const isHidden = !!el.hidden;
            const isLocked = !!el.locked;

            const row = document.createElement('div');
            row.className = `layer-row ${isSelected ? 'selected' : ''} ${isHidden ? 'is-hidden' : ''}`;
            row.dataset.uid = el.uid;

            const dot = document.createElement('span');
            dot.className = 'layer-dot';
            dot.style.backgroundColor = el.color || '#4A607A';

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

            const meta = document.createElement('span');
            meta.className = 'layer-meta';
            const wStr = el.width !== undefined ? el.width.toFixed(2) : '?';
            const hStr = el.height !== undefined ? el.height.toFixed(2) : '?';
            meta.textContent = `${wStr}×${hStr}m`;

            const actions = document.createElement('div');
            actions.className = 'layer-actions';

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

    return {
        getActiveTab: () => activeSidebarTab,
        renderLayersList,
        updateLayerSelectionHighlight
    };
}
