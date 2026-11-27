/* ================================================================
   ScenoPlan — Procedural 3D Floor Texture Generator
   ================================================================ */

import * as THREE from 'three';

export function createProceduralFloorTexture(type, sceneW, sceneH) {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    if (type === 'parquet') {
        ctx.fillStyle = '#b3773a';
        ctx.fillRect(0, 0, 512, 512);

        const numPlanks = 8;
        const plankH = 512 / numPlanks;
        const plankTones = ['#a2672d', '#b97e41', '#ab7034', '#965b21', '#bd8246', '#ae7337'];

        for (let i = 0; i < numPlanks; i++) {
            ctx.fillStyle = plankTones[i % plankTones.length];
            ctx.fillRect(0, i * plankH, 512, plankH);

            ctx.strokeStyle = 'rgba(60, 32, 10, 0.15)';
            ctx.lineWidth = 1.2;
            for (let g = 0; g < 6; g++) {
                ctx.beginPath();
                const gy = i * plankH + (g + 1) * (plankH / 7) + (Math.sin(g) * 3);
                ctx.moveTo(0, gy);
                ctx.bezierCurveTo(128, gy + 4, 384, gy - 4, 512, gy + 2);
                ctx.stroke();
            }

            ctx.fillStyle = '#3a1f0a';
            ctx.fillRect(0, (i + 1) * plankH - 2, 512, 2.5);

            const endX = ((i * 197) % 400) + 50;
            ctx.fillRect(endX, i * plankH, 2.5, plankH);
        }
    } else if (type === 'carpet-red') {
        ctx.fillStyle = '#8f1228';
        ctx.fillRect(0, 0, 512, 512);

        for (let x = 0; x < 512; x += 4) {
            ctx.fillStyle = x % 8 === 0 ? 'rgba(255, 120, 150, 0.08)' : 'rgba(0, 0, 0, 0.12)';
            ctx.fillRect(x, 0, 2, 512);
        }
        for (let y = 0; y < 512; y += 4) {
            ctx.fillStyle = y % 8 === 0 ? 'rgba(255, 120, 150, 0.08)' : 'rgba(0, 0, 0, 0.12)';
            ctx.fillRect(0, y, 512, 2);
        }
    } else if (type === 'carpet-blue') {
        ctx.fillStyle = '#173663';
        ctx.fillRect(0, 0, 512, 512);

        for (let x = 0; x < 512; x += 4) {
            ctx.fillStyle = x % 8 === 0 ? 'rgba(120, 180, 255, 0.08)' : 'rgba(0, 0, 0, 0.14)';
            ctx.fillRect(x, 0, 2, 512);
        }
        for (let y = 0; y < 512; y += 4) {
            ctx.fillStyle = y % 8 === 0 ? 'rgba(120, 180, 255, 0.08)' : 'rgba(0, 0, 0, 0.14)';
            ctx.fillRect(0, y, 512, 2);
        }
    } else if (type === 'concrete') {
        ctx.fillStyle = '#888e99';
        ctx.fillRect(0, 0, 512, 512);

        for (let p = 0; p < 1800; p++) {
            const px = Math.random() * 512;
            const py = Math.random() * 512;
            const pr = Math.random() * 2 + 0.5;
            ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255, 255, 255, 0.12)' : 'rgba(20, 25, 30, 0.15)';
            ctx.beginPath();
            ctx.arc(px, py, pr, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.strokeStyle = '#4e545e';
        ctx.lineWidth = 3;
        ctx.strokeRect(0, 0, 512, 512);
        ctx.beginPath();
        ctx.moveTo(256, 0); ctx.lineTo(256, 512);
        ctx.moveTo(0, 256); ctx.lineTo(512, 256);
        ctx.stroke();
    } else if (type === 'grass') {
        ctx.fillStyle = '#326c27';
        ctx.fillRect(0, 0, 512, 512);

        for (let b = 0; b < 2400; b++) {
            const bx = Math.random() * 512;
            const by = Math.random() * 512;
            const bl = Math.random() * 7 + 4;
            const shade = Math.random();
            ctx.strokeStyle = shade > 0.6 ? '#478f36' : (shade > 0.3 ? '#25541b' : '#57a842');
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.moveTo(bx, by);
            ctx.lineTo(bx + (Math.random() - 0.5) * 4, by - bl);
            ctx.stroke();
        }
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    const repX = Math.max(1, Math.round(sceneW / 2.5));
    const repY = Math.max(1, Math.round(sceneH / 2.5));
    texture.repeat.set(repX, repY);
    return texture;
}
