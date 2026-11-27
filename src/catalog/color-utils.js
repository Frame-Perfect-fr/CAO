/* ================================================================
   ScenoPlan — Catalog Geometry & Color Utilities
   ================================================================ */

export function computePolygonArea(points) {
    if (!Array.isArray(points) || points.length < 3) return 0;
    let area = 0;
    for (let i = 0; i < points.length; i++) {
        const j = (i + 1) % points.length;
        area += points[i].x * points[j].y;
        area -= points[j].x * points[i].y;
    }
    return Math.abs(area) / 2;
}

export function computePolygonCentroid(points) {
    if (!Array.isArray(points) || points.length === 0) return { x: 0, y: 0 };
    let signedArea = 0;
    let cx = 0;
    let cy = 0;
    for (let i = 0; i < points.length; i++) {
        const j = (i + 1) % points.length;
        const cross = points[i].x * points[j].y - points[j].x * points[i].y;
        signedArea += cross;
        cx += (points[i].x + points[j].x) * cross;
        cy += (points[i].y + points[j].y) * cross;
    }
    signedArea *= 0.5;
    if (Math.abs(signedArea) < 1e-6) {
        const sum = points.reduce((acc, p) => ({ x: acc.x + p.x, y: acc.y + p.y }), { x: 0, y: 0 });
        return { x: sum.x / points.length, y: sum.y / points.length };
    }
    return { x: cx / (6 * signedArea), y: cy / (6 * signedArea) };
}

export function roundedRect(ctx, x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
}

export function adjustBrightness(hex, amount) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    // Handle hex with alpha
    const baseHex = hex.substring(0, 6);
    let r = parseInt(baseHex.substring(0, 2), 16);
    let g = parseInt(baseHex.substring(2, 4), 16);
    let b = parseInt(baseHex.substring(4, 6), 16);
    r = Math.max(0, Math.min(255, r + amount));
    g = Math.max(0, Math.min(255, g + amount));
    b = Math.max(0, Math.min(255, b + amount));
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export function getContrastColor(hex) {
    hex = hex.replace('#', '');
    if (hex.length === 3) hex = hex.split('').map(c => c + c).join('');
    const baseHex = hex.substring(0, 6);
    const r = parseInt(baseHex.substring(0, 2), 16);
    const g = parseInt(baseHex.substring(2, 4), 16);
    const b = parseInt(baseHex.substring(4, 6), 16);
    const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return lum > 0.5 ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.85)';
}
