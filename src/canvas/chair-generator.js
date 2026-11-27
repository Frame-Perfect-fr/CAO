/* ================================================================
   ScenoPlan — Automatic Chair Block (Parterre) Generator
   ================================================================ */

/**
 * Generates chair row elements conforming to ERP aisle and numbering options.
 */
export function buildChairBlockElements(options = {}, allocUid, center) {
    const rows = Math.max(1, parseInt(options.rows, 10) || 8);
    const seatsPerRow = Math.max(1, parseInt(options.seatsPerRow, 10) || 12);
    const gapX = options.gapX !== undefined ? parseFloat(options.gapX) : 0.08;
    const rowSpacing = options.rowSpacing !== undefined ? parseFloat(options.rowSpacing) : 0.95;
    const hasAisle = options.hasAisle !== false;
    const aisleWidth = hasAisle ? (options.aisleWidth !== undefined ? parseFloat(options.aisleWidth) : 1.40) : 0;
    const numberSeats = options.numberSeats !== false;
    const color = options.color || '#4A607A';
    const rotation = options.rotation !== undefined ? parseInt(options.rotation, 10) : 180;

    const chairW = 0.45;
    const chairH = 0.45;

    const half1 = hasAisle ? Math.ceil(seatsPerRow / 2) : seatsPerRow;

    let totalW = seatsPerRow * chairW + (seatsPerRow - 1) * gapX;
    if (hasAisle && seatsPerRow > 1) {
        totalW += aisleWidth;
    }
    const totalH = (rows - 1) * rowSpacing + chairH;

    const cx = options.originX !== undefined ? options.originX : center.x;
    const cy = options.originY !== undefined ? options.originY : center.y;

    const startX = cx - totalW / 2;
    const startY = cy - totalH / 2;

    const newChairs = [];

    const getRowLetter = (idx) => {
        if (idx < 26) return String.fromCharCode(65 + idx);
        const first = String.fromCharCode(65 + Math.floor(idx / 26) - 1);
        const second = String.fromCharCode(65 + (idx % 26));
        return first + second;
    };

    for (let r = 0; r < rows; r++) {
        const rowLetter = getRowLetter(r);
        const rowY = startY + r * rowSpacing;

        for (let s = 0; s < seatsPerRow; s++) {
            let seatX = startX + s * (chairW + gapX);
            if (hasAisle && s >= half1) {
                seatX += aisleWidth;
            }

            const seatNum = s + 1;
            const chairName = numberSeats ? `${rowLetter}-${seatNum}` : 'Chaise';

            newChairs.push({
                id: 'chair',
                name: chairName,
                category: 'chairs',
                shape: 'chair',
                width: chairW,
                height: chairH,
                x: seatX,
                y: rowY,
                rotation: rotation,
                color: color,
                opacity: 1,
                locked: false,
                uid: allocUid(),
                row: rowLetter,
                seatIndex: seatNum
            });
        }
    }

    return {
        totalChairs: newChairs.length,
        rows,
        seatsPerRow,
        totalWidth: totalW,
        totalHeight: totalH,
        elements: newChairs
    };
}
