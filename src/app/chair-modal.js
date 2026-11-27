/* ================================================================
   ScenoPlan — Chair Rows Generator Modal Controller
   ================================================================ */

export function setupChairModal(engine) {
    const chairModal = document.getElementById('chair-generator-modal');
    const btnChairToolbar = document.getElementById('btn-chair-generator');
    const toolChairCanvas = document.getElementById('tool-chair-generator');
    const btnCloseChair = document.getElementById('btn-close-chair-modal');
    const btnCancelChair = document.getElementById('btn-cancel-chair-modal');
    const btnGenerateChairs = document.getElementById('btn-generate-chairs');

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

        badgeRows.textContent = rows.toString();
        badgeSeats.textContent = seats.toString();

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

    [inputRows, inputSeats, inputGapX, inputRowSpacing, inputAisleWidth, inputHasAisle].forEach(el => {
        if (el) {
            el.addEventListener('input', updateChairSummary);
            el.addEventListener('change', updateChairSummary);
        }
    });

    document.querySelectorAll('.color-preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.color-preset-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            inputColor.value = btn.dataset.color;
        });
    });

    if (btnChairToolbar) btnChairToolbar.addEventListener('click', openChairModal);
    if (toolChairCanvas) toolChairCanvas.addEventListener('click', openChairModal);
    if (btnCloseChair) btnCloseChair.addEventListener('click', closeChairModal);
    if (btnCancelChair) btnCancelChair.addEventListener('click', closeChairModal);

    if (chairModal) {
        chairModal.addEventListener('click', (e) => {
            if (e.target === chairModal) closeChairModal();
        });
    }

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
            console.log(`%c🪑 Parterre de ${result.totalChairs} chaises généré avec succès ! (Annulable avec Ctrl+Z)`, 'color: #4cd964; font-weight: bold;');
        });
    }

    return {
        chairModal,
        openChairModal,
        closeChairModal
    };
}
