/* ================================================================
   ScenoPlan — Bill of Materials (BOM) & Technical Sheets
   ================================================================ */

export function computeBOMInventory(elements, sceneWidth, sceneHeight) {
    const inventory = {};
    let totalItems = 0;
    let totalSeats = 0;
    let totalLinear = 0;
    let totalOccupiedArea = 0;

    for (const el of elements) {
        if (el.hidden) continue;
        totalItems++;

        if (el.shape === 'chair' || el.category === 'chairs' || (el.id && el.id.startsWith('chair'))) {
            totalSeats++;
        } else if (el.seats && typeof el.seats === 'number') {
            totalSeats += el.seats;
        }

        const isLinear = el.isWall || el.shape === 'barrier' || el.shape === 'fence' ||
            (el.id && (el.id.includes('barrier') || el.id.includes('vauban') || el.id.includes('heras') || el.id.includes('wall')));
        const length = Math.max(el.width || 0, el.height || 0);
        if (isLinear) {
            totalLinear += length;
        }

        const area = (el.width || 0) * (el.height || 0);
        totalOccupiedArea += area;

        const wVal = (el.width || 0).toFixed(2);
        const hVal = (el.height || 0).toFixed(2);
        const key = `${el.id || el.shape}_${wVal}x${hVal}`;

        if (!inventory[key]) {
            let techCat = el.category || 'Mobilier';
            if (el.isWall || el.shape === 'barrier' || el.shape === 'fence') {
                techCat = 'Cloisons & Sécurité';
            } else if (techCat === 'chairs') {
                techCat = 'Assises';
            } else if (techCat === 'tables') {
                techCat = 'Tables';
            } else if (techCat === 'scene') {
                techCat = 'Scène & Structures';
            } else if (techCat === 'tech') {
                techCat = 'Audiovisuel & Énergie';
            } else if (techCat === 'deco') {
                techCat = 'Décoration';
            } else if (techCat === 'people') {
                techCat = 'Personnel & Public';
            }

            inventory[key] = {
                id: el.id || el.shape,
                name: el.description || el.name || el.id || 'Élément',
                category: techCat,
                width: el.width || 0,
                height: el.height || 0,
                color: el.color || '#4A607A',
                shape: el.shape,
                isLinear: isLinear,
                count: 0,
                totalLength: 0,
                totalArea: 0,
                sampleNames: []
            };
        }

        inventory[key].count++;
        if (isLinear) inventory[key].totalLength += length;
        inventory[key].totalArea += area;
        if (el.name && inventory[key].sampleNames.length < 3 && !inventory[key].sampleNames.includes(el.name)) {
            inventory[key].sampleNames.push(el.name);
        }
    }

    const sortedItems = Object.values(inventory).sort((a, b) => {
        if (a.category !== b.category) return a.category.localeCompare(b.category);
        return b.count - a.count;
    });

    return {
        items: sortedItems,
        totalItems,
        totalSeats,
        totalLinear,
        totalOccupiedArea,
        sceneWidth,
        sceneHeight,
        sceneArea: sceneWidth * sceneHeight,
        freeArea: Math.max(0, (sceneWidth * sceneHeight) - totalOccupiedArea)
    };
}

export function formatBOMCSV(bom, rawProjectName = 'Projet') {
    const projectName = rawProjectName.replace(/;/g, ' ').trim();
    const dateStr = new Date().toLocaleDateString('fr-FR');

    let csv = '\uFEFF'; // UTF-8 BOM pour ouverture directe Excel
    csv += `ScenoPlan - Nomenclature Matériel & Fiche Technique\n`;
    csv += `Projet;${projectName};Date;${dateStr}\n`;
    csv += `Surface Salle;${bom.sceneArea.toFixed(1)} m²;Emprise Mobilier;${bom.totalOccupiedArea.toFixed(1)} m²;Surface Libre;${bom.freeArea.toFixed(1)} m²\n`;
    csv += `Total Éléments Posés;${bom.totalItems};Places Assises Totales;${bom.totalSeats};Linéaire Barrières & Cloisons;${bom.totalLinear.toFixed(2)} m\n\n`;

    csv += `Catégorie;Désignation;Identifiant;Dimensions Unitaires (L x P m);Quantité;Linéaire / Surface Totale;Exemples d'étiquettes\n`;

    for (const item of bom.items) {
        const dimStr = `${item.width.toFixed(2)} × ${item.height.toFixed(2)}`;
        const metricStr = item.isLinear ? `${item.totalLength.toFixed(2)} m lin.` : `${item.totalArea.toFixed(2)} m²`;
        const samplesStr = item.sampleNames.join(', ');
        csv += `"${item.category}";"${item.name}";"${item.id}";"${dimStr}";${item.count};"${metricStr}";"${samplesStr}"\n`;
    }

    return csv;
}

export function downloadBOMCSVFile(bom, rawName = 'Nomenclature') {
    const csv = formatBOMCSV(bom, rawName);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const cleanName = rawName.trim().replace(/[/\\?%*:|"<>]/g, '_').replace(/\s+/g, '_') || 'Projet';
    a.href = url;
    a.download = `Nomenclature_${cleanName}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function openBOMPrintSheet(bom, projectName = 'Mon Projet Scénographique') {
    const dateStr = new Date().toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    let rowsHtml = '';
    bom.items.forEach(item => {
        const dimStr = `${item.width.toFixed(2)} × ${item.height.toFixed(2)} m`;
        const metricStr = item.isLinear ? `${item.totalLength.toFixed(2)} m lin.` : `${item.totalArea.toFixed(2)} m²`;
        rowsHtml += `
            <tr>
                <td style="display:flex;align-items:center;gap:8px;">
                    <span style="display:inline-block;width:12px;height:12px;border-radius:3px;background:${item.color};border:1px solid rgba(0,0,0,0.2);"></span>
                    <strong>${item.name}</strong>
                </td>
                <td><span style="background:#f0f2f5;padding:2px 6px;border-radius:3px;font-size:10px;">${item.category}</span></td>
                <td style="font-family:monospace;font-size:11px;">${dimStr}</td>
                <td style="text-align:center;font-weight:bold;font-size:13px;color:#1a365d;">${item.count}</td>
                <td style="text-align:right;font-family:monospace;">${metricStr}</td>
            </tr>
        `;
    });

    const printWin = window.open('', '_blank');
    if (!printWin) {
        alert("Veuillez autoriser les fenêtres pop-up pour imprimer la fiche technique.");
        return;
    }

    printWin.document.write(`
        <!DOCTYPE html>
        <html lang="fr">
        <head>
            <meta charset="UTF-8">
            <title>Fiche Technique & Nomenclature - ${projectName}</title>
            <style>
                @page { size: A4 landscape; margin: 12mm; }
                body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                    color: #1a202c;
                    margin: 0;
                    padding: 15px;
                    font-size: 11px;
                    background: #fff;
                }
                .header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    border-bottom: 2px solid #2d3748;
                    padding-bottom: 10px;
                    margin-bottom: 12px;
                }
                .title { font-size: 18px; font-weight: 700; margin: 0 0 4px 0; color: #1a365d; }
                .subtitle { font-size: 11px; color: #718096; margin: 0; }
                .meta { text-align: right; font-size: 10.5px; color: #4a5568; line-height: 1.4; }
                .kpis {
                    display: grid;
                    grid-template-columns: repeat(5, 1fr);
                    gap: 10px;
                    margin-bottom: 15px;
                }
                .kpi {
                    border: 1px solid #e2e8f0;
                    background: #f7fafc;
                    border-radius: 6px;
                    padding: 8px;
                    text-align: center;
                }
                .kpi-val { font-size: 16px; font-weight: 700; color: #2b6cb0; }
                .kpi-lbl { font-size: 9.5px; text-transform: uppercase; color: #718096; margin-top: 2px; font-weight: 600; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                th {
                    background: #edf2f7;
                    text-align: left;
                    padding: 7px 8px;
                    font-size: 10px;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                    border-bottom: 2px solid #cbd5e0;
                    color: #4a5568;
                }
                td { padding: 6px 8px; border-bottom: 1px solid #e2e8f0; vertical-align: middle; }
                tr:nth-child(even) td { background: #fcfdfd; }
                .signatures {
                    display: flex;
                    justify-content: space-between;
                    margin-top: 25px;
                    page-break-inside: avoid;
                }
                .sig-box {
                    width: 44%;
                    border: 1px dashed #a0aec0;
                    border-radius: 6px;
                    padding: 10px 12px;
                    min-height: 60px;
                    font-size: 10px;
                    color: #4a5568;
                    background: #fafafa;
                }
            </style>
        </head>
        <body>
            <div class="header">
                <div>
                    <h1 class="title">📋 Fiche Technique & Nomenclature Matériel</h1>
                    <p class="subtitle">ScenoPlan — Conception Scénographique & Fiches Prestataires</p>
                </div>
                <div class="meta">
                    <div><strong>Projet :</strong> ${projectName}</div>
                    <div><strong>Édité le :</strong> ${dateStr}</div>
                    <div><strong>Salle / Scène :</strong> ${bom.sceneWidth}m × ${bom.sceneHeight}m (${bom.sceneArea} m²)</div>
                </div>
            </div>

            <div class="kpis">
                <div class="kpi">
                    <div class="kpi-val">${bom.totalItems}</div>
                    <div class="kpi-lbl">Total Matériel Posé</div>
                </div>
                <div class="kpi">
                    <div class="kpi-val">${bom.totalSeats}</div>
                    <div class="kpi-lbl">Places Assises Totales</div>
                </div>
                <div class="kpi">
                    <div class="kpi-val">${bom.totalLinear.toFixed(1)} m</div>
                    <div class="kpi-lbl">Linéaire Cloisons / Barrières</div>
                </div>
                <div class="kpi">
                    <div class="kpi-val">${bom.totalOccupiedArea.toFixed(1)} m²</div>
                    <div class="kpi-lbl">Emprise Mobilier</div>
                </div>
                <div class="kpi">
                    <div class="kpi-val">${bom.freeArea.toFixed(1)} m²</div>
                    <div class="kpi-lbl">Surface Libre Dégagée</div>
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Désignation Matériel</th>
                        <th>Catégorie</th>
                        <th>Dimensions (L × P)</th>
                        <th style="text-align:center;">Quantité</th>
                        <th style="text-align:right;">Linéaire / Surface Totale</th>
                    </tr>
                </thead>
                <tbody>
                    ${rowsHtml}
                </tbody>
            </table>

            <div class="signatures">
                <div class="sig-box">
                    <strong>Régie Générale / Responsable Technique</strong><br>
                    Nom, date et signature pour accord :
                </div>
                <div class="sig-box">
                    <strong>Prestataire Audiovisuel / Fournisseur Mobilier</strong><br>
                    Bon de prise en charge et livraison :
                </div>
            </div>
        </body>
        </html>
    `);
    printWin.document.close();
    printWin.focus();
    setTimeout(() => printWin.print(), 300);
}
