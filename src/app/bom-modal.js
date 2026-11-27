/* ================================================================
   ScenoPlan — Bill of Materials (BOM) Modal Controller
   ================================================================ */

function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/[&<>"']/g, m => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    })[m]);
}

export function setupBomModal(engine) {
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

            const tdColor = document.createElement('td');
            const pill = document.createElement('span');
            pill.className = 'bom-color-pill';
            pill.style.backgroundColor = item.color || '#4A607A';
            tdColor.appendChild(pill);

            const tdName = document.createElement('td');
            tdName.innerHTML = `<strong>${escapeHtml(item.name)}</strong>`;
            if (item.sampleNames && item.sampleNames.length > 0 && item.sampleNames[0] !== item.name) {
                tdName.innerHTML += `<div style="font-size:10.5px;color:var(--text-muted);margin-top:2px;">Ex: ${item.sampleNames.map(s => escapeHtml(s)).join(', ')}</div>`;
            }

            const tdCat = document.createElement('td');
            const catBadge = document.createElement('span');
            catBadge.className = 'bom-cat-badge';
            catBadge.textContent = item.category;
            tdCat.appendChild(catBadge);

            const tdDim = document.createElement('td');
            tdDim.className = 'bom-dim-text';
            tdDim.textContent = `${item.width.toFixed(2)} × ${item.height.toFixed(2)} m`;

            const tdQty = document.createElement('td');
            tdQty.className = 'text-center';
            const qtyBadge = document.createElement('span');
            qtyBadge.className = 'bom-qty-badge';
            qtyBadge.textContent = item.count.toString();
            tdQty.appendChild(qtyBadge);

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

    return {
        bomModal,
        openBOMModal,
        closeBOMModal
    };
}
