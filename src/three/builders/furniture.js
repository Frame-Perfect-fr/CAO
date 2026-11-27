/* ================================================================
   ScenoPlan — 3D Furniture & Event Equipment Builders
   ================================================================ */

import * as THREE from 'three';

export function buildVaubanBarrier3D(group, w, d, colorHex) {
    const h = 1.1;
    const metalMat = new THREE.MeshStandardMaterial({ color: 0xc4cbd4, metalness: 0.88, roughness: 0.28 });
    const tubeR = 0.019;

    const topRail = new THREE.Mesh(new THREE.CylinderGeometry(tubeR, tubeR, w - 0.1, 8), metalMat);
    topRail.rotation.z = Math.PI / 2;
    topRail.position.set(0, h - 0.04, 0);
    group.add(topRail);

    const botRail = topRail.clone();
    botRail.position.set(0, 0.22, 0);
    group.add(botRail);

    const sideGeo = new THREE.CylinderGeometry(tubeR, tubeR, h - 0.2, 8);
    const leftPost = new THREE.Mesh(sideGeo, metalMat);
    leftPost.position.set(-w / 2 + 0.05, (h - 0.2) / 2 + 0.16, 0);
    group.add(leftPost);

    const rightPost = leftPost.clone();
    rightPost.position.x = w / 2 - 0.05;
    group.add(rightPost);

    const barGeo = new THREE.CylinderGeometry(0.007, 0.007, h - 0.32, 6);
    const count = Math.max(5, Math.floor(w / 0.13));
    const step = (w - 0.22) / (count - 1);
    for (let i = 0; i < count; i++) {
        const bar = new THREE.Mesh(barGeo, metalMat);
        bar.position.set(-w / 2 + 0.11 + i * step, (h - 0.32) / 2 + 0.22, 0);
        group.add(bar);
    }

    const footGeo = new THREE.CylinderGeometry(0.016, 0.016, 0.48, 8);
    const f1 = new THREE.Mesh(footGeo, metalMat);
    f1.rotation.x = Math.PI / 2;
    f1.position.set(-w / 2 + 0.18, 0.05, 0);
    group.add(f1);

    const f2 = f1.clone();
    f2.position.x = w / 2 - 0.18;
    group.add(f2);
}

export function buildHerasFence3D(group, w, d, colorHex) {
    const h = 2.0;
    const metalMat = new THREE.MeshStandardMaterial({ color: 0xb0bac5, metalness: 0.9, roughness: 0.3 });
    const concreteMat = new THREE.MeshStandardMaterial({ color: 0x33363d, roughness: 0.95 });

    const blockGeo = new THREE.BoxGeometry(0.2, 0.12, 0.65);
    const b1 = new THREE.Mesh(blockGeo, concreteMat);
    b1.position.set(-w / 2 + 0.12, 0.06, 0);
    group.add(b1);

    const b2 = b1.clone();
    b2.position.x = w / 2 - 0.12;
    group.add(b2);

    const postGeo = new THREE.CylinderGeometry(0.022, 0.022, h, 8);
    const p1 = new THREE.Mesh(postGeo, metalMat);
    p1.position.set(-w / 2 + 0.12, h / 2, 0);
    group.add(p1);

    const p2 = p1.clone();
    p2.position.x = w / 2 - 0.12;
    group.add(p2);

    const topCross = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, w - 0.24, 8), metalMat);
    topCross.rotation.z = Math.PI / 2;
    topCross.position.set(0, h - 0.04, 0);
    group.add(topCross);

    const botCross = topCross.clone();
    botCross.position.set(0, 0.18, 0);
    group.add(botCross);

    const wire = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.24, h - 0.24), new THREE.MeshStandardMaterial({
        color: 0x8895a2,
        metalness: 0.7,
        roughness: 0.35,
        wireframe: true,
        side: THREE.DoubleSide
    }));
    wire.position.set(0, h / 2 + 0.05, 0);
    group.add(wire);
}

export function buildBackdrop3D(group, w, d, colorHex, el) {
    const h = 2.8;
    const isGreen = el.id?.includes('fond-vert') || colorHex === 0x00FF00 || colorHex === 0x228B22;
    const fabricColor = isGreen ? 0x00e639 : colorHex;
    const standMat = new THREE.MeshStandardMaterial({ color: 0x181a1f, metalness: 0.7, roughness: 0.4 });

    const postGeo = new THREE.CylinderGeometry(0.022, 0.022, h, 8);
    const p1 = new THREE.Mesh(postGeo, standMat);
    p1.position.set(-w / 2 + 0.06, h / 2, 0);
    group.add(p1);

    const p2 = p1.clone();
    p2.position.x = w / 2 - 0.06;
    group.add(p2);

    const legGeo = new THREE.CylinderGeometry(0.014, 0.014, 0.65, 8);
    [-1, 1].forEach(dir => {
        const legX = dir * (w / 2 - 0.06);
        const leg1 = new THREE.Mesh(legGeo, standMat);
        leg1.rotation.z = dir * 0.45;
        leg1.position.set(legX - dir * 0.15, 0.25, 0);
        group.add(leg1);
    });

    const cross = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, w, 8), standMat);
    cross.rotation.z = Math.PI / 2;
    cross.position.set(0, h - 0.02, 0);
    group.add(cross);

    const fabric = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.1, h - 0.12, 16, 8), new THREE.MeshStandardMaterial({
        color: fabricColor,
        roughness: 0.85,
        metalness: 0.05,
        side: THREE.DoubleSide
    }));
    fabric.position.set(0, (h - 0.12) / 2 + 0.06, 0.01);
    group.add(fabric);
}

export function buildStage3D(group, w, d, colorHex, el) {
    let stageH = el.height3D || 0.6;
    if (w >= 10) stageH = 0.8;
    else if (w <= 4) stageH = 0.4;

    const stageGeo = new THREE.BoxGeometry(w, stageH, d);
    const topDeckMat = new THREE.MeshStandardMaterial({ color: 0x23262e, roughness: 0.5, metalness: 0.2 });
    const skirtingMat = new THREE.MeshStandardMaterial({ color: 0x111215, roughness: 0.9, metalness: 0.05 });

    const materials = [skirtingMat, skirtingMat, topDeckMat, skirtingMat, skirtingMat, skirtingMat];
    const stage = new THREE.Mesh(stageGeo, materials);
    stage.position.set(0, stageH / 2, 0);
    group.add(stage);

    const trim = new THREE.LineSegments(new THREE.EdgesGeometry(stageGeo), new THREE.LineBasicMaterial({ color: 0x8a99ad, linewidth: 2 }));
    trim.position.copy(stage.position);
    group.add(trim);

    // Steps
    const stepW = 1.0;
    const stepD = 0.35;
    const stepH = stageH / 2;
    const step1 = new THREE.Mesh(new THREE.BoxGeometry(stepW, stepH, stepD), new THREE.MeshStandardMaterial({ color: 0x2d323b, roughness: 0.6 }));
    step1.position.set(w / 2 - stepW / 2 - 0.2, stepH / 2, d / 2 + stepD / 2);
    group.add(step1);
}

export function buildPodiumLutrin3D(group, w, d, colorHex) {
    const podH = 1.15;
    const woodMat = new THREE.MeshStandardMaterial({ color: 0x3d434d, roughness: 0.4 });
    const metalMat = new THREE.MeshStandardMaterial({ color: 0xccd6e0, metalness: 0.9, roughness: 0.2 });

    const base = new THREE.Mesh(new THREE.BoxGeometry(w * 0.9, 0.04, d * 0.9), woodMat);
    base.position.set(0, 0.02, 0);
    group.add(base);

    const col = new THREE.Mesh(new THREE.BoxGeometry(w * 0.45, podH, d * 0.45), woodMat);
    col.position.set(0, podH / 2, 0);
    group.add(col);

    const deskTop = new THREE.Mesh(new THREE.BoxGeometry(w, 0.03, d), woodMat);
    deskTop.rotation.x = -0.25;
    deskTop.position.set(0, podH, 0);
    group.add(deskTop);

    const mic = new THREE.Mesh(new THREE.CylinderGeometry(0.005, 0.005, 0.28, 8), metalMat);
    mic.rotation.x = -0.4;
    mic.position.set(0.1, podH + 0.12, -0.05);
    group.add(mic);
}

export function createTableTopTexture(label, w, d, baseColorHex, isRound = false) {
    const canvas = document.createElement('canvas');
    const cw = 1024;
    const ch = isRound ? 1024 : Math.max(512, Math.min(1024, Math.round(1024 * (d / Math.max(w, 0.1)))));
    canvas.width = cw;
    canvas.height = ch;
    const ctx = canvas.getContext('2d');

    // Base table surface color
    const hexStr = '#' + ((baseColorHex || 0xd5cbbe) & 0xffffff).toString(16).padStart(6, '0');
    ctx.fillStyle = hexStr;
    ctx.fillRect(0, 0, cw, ch);

    // Realistic table surface shading & edge bevel
    ctx.save();
    if (isRound) {
        ctx.beginPath();
        ctx.arc(cw / 2, ch / 2, cw / 2 - 24, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.22)';
        ctx.lineWidth = 28;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(cw / 2, ch / 2, cw / 2 - 40, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
        ctx.lineWidth = 8;
        ctx.stroke();
    } else {
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.25)';
        ctx.lineWidth = 24;
        ctx.strokeRect(12, 12, cw - 24, ch - 24);

        ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
        ctx.lineWidth = 6;
        ctx.strokeRect(28, 28, cw - 56, ch - 56);
    }
    ctx.restore();

    // Print table name/label clearly on top
    const text = (label && label.trim().length > 0) ? label.trim() : 'Table';
    ctx.save();
    ctx.translate(cw / 2, ch / 2);

    // Contrast placard badge plate (very clear from high and oblique angles)
    const textLen = text.length;
    const badgeW = Math.min(cw * 0.86, Math.max(340, textLen * 32 + 80));
    const badgeH = Math.min(ch * 0.48, 120);

    // Soft drop shadow
    ctx.shadowColor = 'rgba(0, 0, 0, 0.35)';
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 6;

    // Badge plate fill
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 5;

    if (ctx.roundRect) {
        ctx.beginPath();
        ctx.roundRect(-badgeW / 2, -badgeH / 2, badgeW, badgeH, 20);
        ctx.fill();
        ctx.shadowColor = 'transparent';
        ctx.stroke();
    } else {
        ctx.beginPath();
        ctx.rect(-badgeW / 2, -badgeH / 2, badgeW, badgeH);
        ctx.fill();
        ctx.shadowColor = 'transparent';
        ctx.stroke();
    }

    // Inner subtle accent frame
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 2.5;
    if (ctx.roundRect) {
        ctx.beginPath();
        ctx.roundRect(-badgeW / 2 + 8, -badgeH / 2 + 8, badgeW - 16, badgeH - 16, 14);
        ctx.stroke();
    }

    // High contrast bold label text
    ctx.fillStyle = '#0f172a';
    const fontSize = Math.min(52, Math.floor(badgeW / (textLen * 0.72)));
    ctx.font = `bold ${Math.max(28, fontSize)}px "Inter", "Segoe UI", -apple-system, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 0, 0);

    ctx.restore();

    const tex = new THREE.CanvasTexture(canvas);
    tex.anisotropy = 16;
    return tex;
}

export function buildRectTable3D(group, w, d, colorHex, el) {
    const tableH = 0.74;
    const topThick = 0.038;
    const baseColor = colorHex || 0x8b7355;
    const tableName = el?.name || el?.label || 'Table rectangulaire';

    const sideMat = new THREE.MeshStandardMaterial({
        color: baseColor,
        roughness: 0.42,
        metalness: 0.08
    });
    const topTex = createTableTopTexture(tableName, w, d, baseColor, false);
    const topMat = new THREE.MeshStandardMaterial({
        map: topTex,
        roughness: 0.38,
        metalness: 0.08
    });

    // Box materials: [+X, -X, +Y (top), -Y (bottom), +Z, -Z]
    const topMaterials = [sideMat, sideMat, topMat, sideMat, sideMat, sideMat];
    const tableTop = new THREE.Mesh(new THREE.BoxGeometry(w, topThick, d), topMaterials);
    tableTop.position.set(0, tableH - topThick / 2, 0);
    group.add(tableTop);

    const legH = tableH - topThick;
    const legGeo = new THREE.CylinderGeometry(0.022, 0.022, legH, 12);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x22242a, metalness: 0.85, roughness: 0.25 });

    const insetX = w / 2 - 0.08;
    const insetZ = d / 2 - 0.08;
    [[-insetX, -insetZ], [insetX, -insetZ], [-insetX, insetZ], [insetX, insetZ]].forEach(([lx, lz]) => {
        const leg = new THREE.Mesh(legGeo, legMat);
        leg.position.set(lx, legH / 2, lz);
        group.add(leg);
    });

    const apron = new THREE.Mesh(new THREE.BoxGeometry(w - 0.2, 0.04, d - 0.2), new THREE.MeshStandardMaterial({ color: 0x1b1c20, metalness: 0.8 }));
    apron.position.set(0, tableH - topThick - 0.02, 0);
    group.add(apron);
}

export function buildRoundTable3D(group, w, d, colorHex, el) {
    const radius = Math.min(w, d) / 2;
    const isStanding = el?.id?.includes('mange') || el?.id?.includes('cocktail') || radius < 0.45;
    const tableH = isStanding ? 1.10 : 0.75;
    const topThick = 0.035;
    const baseColor = colorHex || 0xd5cbbe;
    const tableName = el?.name || el?.label || (isStanding ? 'Mange-debout' : 'Table ronde');

    const sideMat = new THREE.MeshStandardMaterial({
        color: baseColor,
        roughness: 0.38,
        metalness: 0.08
    });
    const topTex = createTableTopTexture(tableName, radius * 2, radius * 2, baseColor, true);
    const topMat = new THREE.MeshStandardMaterial({
        map: topTex,
        roughness: 0.35,
        metalness: 0.08
    });

    // Cylinder materials: [side, top (+Y), bottom (-Y)]
    const cylMaterials = [sideMat, topMat, sideMat];
    const top = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, topThick, 32), cylMaterials);
    top.position.set(0, tableH - topThick / 2, 0);
    group.add(top);

    const colH = tableH - topThick;
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xdde5ed, metalness: 0.95, roughness: 0.15 });
    const col = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, colH, 16), chromeMat);
    col.position.set(0, colH / 2, 0);
    group.add(col);

    const baseR = Math.min(radius * 0.75, 0.32);
    const base = new THREE.Mesh(new THREE.CylinderGeometry(baseR, baseR, 0.02, 32), chromeMat);
    base.position.set(0, 0.01, 0);
    group.add(base);
}

export function buildChair3D(group, w, d, colorHex, el) {
    const seatH = 0.45;
    const cushionMat = new THREE.MeshStandardMaterial({ color: colorHex || 0x3d4b60, roughness: 0.55 });
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x1c1e24, metalness: 0.8, roughness: 0.3 });

    const seat = new THREE.Mesh(new THREE.BoxGeometry(w * 0.85, 0.045, d * 0.85), cushionMat);
    seat.position.set(0, seatH, 0);
    group.add(seat);

    const legH = seatH;
    const legGeo = new THREE.CylinderGeometry(0.014, 0.011, legH, 8);
    const lx = (w * 0.85) / 2 - 0.04;
    const lz = (d * 0.85) / 2 - 0.04;
    [[-lx, -lz], [lx, -lz], [-lx, lz], [lx, lz]].forEach(([px, pz]) => {
        const leg = new THREE.Mesh(legGeo, frameMat);
        leg.position.set(px, legH / 2, pz);
        group.add(leg);
    });

    const backH = 0.42;
    const back = new THREE.Mesh(new THREE.BoxGeometry(w * 0.82, backH, 0.035), cushionMat);
    back.position.set(0, seatH + backH / 2 + 0.02, -lz);
    back.rotation.x = 0.12;
    group.add(back);
}

export function buildArmchairSofa3D(group, w, d, colorHex, el) {
    const seatH = 0.42;
    const fabricMat = new THREE.MeshStandardMaterial({ color: colorHex || 0x5a4a75, roughness: 0.65 });
    const feetMat = new THREE.MeshStandardMaterial({ color: 0x1f2126, roughness: 0.3 });

    const cushion = new THREE.Mesh(new THREE.BoxGeometry(w * 0.88, 0.16, d * 0.85), fabricMat);
    cushion.position.set(0, seatH, 0.02);
    group.add(cushion);

    const armH = 0.26;
    const armW = 0.12;
    const armGeo = new THREE.BoxGeometry(armW, armH, d);
    const leftArm = new THREE.Mesh(armGeo, fabricMat);
    leftArm.position.set(-w / 2 + armW / 2, seatH + armH / 4, 0);
    group.add(leftArm);

    const rightArm = leftArm.clone();
    rightArm.position.x = w / 2 - armW / 2;
    group.add(rightArm);

    const backH = 0.46;
    const back = new THREE.Mesh(new THREE.BoxGeometry(w, backH, 0.15), fabricMat);
    back.position.set(0, seatH + backH / 2, -d / 2 + 0.08);
    group.add(back);

    const footGeo = new THREE.CylinderGeometry(0.025, 0.015, 0.12, 8);
    const fx = w / 2 - 0.08;
    const fz = d / 2 - 0.08;
    [[-fx, -fz], [fx, -fz], [-fx, fz], [fx, fz]].forEach(([x, z]) => {
        const foot = new THREE.Mesh(footGeo, feetMat);
        foot.position.set(x, 0.06, z);
        group.add(foot);
    });
}

export function buildBench3D(group, w, d, colorHex) {
    const benchH = 0.45;
    const top = new THREE.Mesh(new THREE.BoxGeometry(w, 0.04, d), new THREE.MeshStandardMaterial({ color: colorHex || 0x6e7b68, roughness: 0.5 }));
    top.position.set(0, benchH, 0);
    group.add(top);

    const frameMat = new THREE.MeshStandardMaterial({ color: 0x22242a, metalness: 0.8 });
    const legGeo = new THREE.BoxGeometry(0.04, benchH - 0.04, d * 0.85);
    [-w / 2 + 0.15, w / 2 - 0.15].forEach(lx => {
        const leg = new THREE.Mesh(legGeo, frameMat);
        leg.position.set(lx, (benchH - 0.04) / 2, 0);
        group.add(leg);
    });
}

export function buildPouf3D(group, w, d, colorHex) {
    const h = 0.42;
    const radius = Math.min(w, d) / 2;
    const poufMat = new THREE.MeshStandardMaterial({ color: colorHex || 0x7c5a5a, roughness: 0.7 });
    const pouf = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, h, 24), poufMat);
    pouf.position.set(0, h / 2, 0);
    group.add(pouf);
}

export function buildStandExpo3D(group, w, d, colorHex, el) {
    const wallH = 2.5;
    const wallMat = new THREE.MeshStandardMaterial({ color: 0xf0f3f6, roughness: 0.5 });
    const aluMat = new THREE.MeshStandardMaterial({ color: 0xccd6e0, metalness: 0.85, roughness: 0.2 });

    const backWall = new THREE.Mesh(new THREE.BoxGeometry(w, wallH, 0.05), wallMat);
    backWall.position.set(0, wallH / 2, -d / 2 + 0.025);
    group.add(backWall);

    const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.05, wallH, d), wallMat);
    leftWall.position.set(-w / 2 + 0.025, wallH / 2, 0);
    group.add(leftWall);

    const rightWall = leftWall.clone();
    rightWall.position.x = w / 2 - 0.025;
    group.add(rightWall);

    const fascia = new THREE.Mesh(new THREE.BoxGeometry(w, 0.35, 0.05), aluMat);
    fascia.position.set(0, wallH - 0.175, d / 2 - 0.025);
    group.add(fascia);
}

export function buildTotem3D(group, w, d, colorHex) {
    const h = 2.0;
    const totemMat = new THREE.MeshStandardMaterial({ color: 0x1f232b, metalness: 0.6 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.08), totemMat);
    body.position.set(0, h / 2 + 0.02, 0);
    group.add(body);

    const base = new THREE.Mesh(new THREE.BoxGeometry(w * 1.2, 0.03, 0.45), totemMat);
    base.position.set(0, 0.015, 0);
    group.add(base);
}

export function buildTent3D(group, w, d, colorHex) {
    const poleH = 2.2;
    const roofH = 1.1;
    const frameMat = new THREE.MeshStandardMaterial({ color: 0xe5eaf0, metalness: 0.85, roughness: 0.2 });
    const canvasMat = new THREE.MeshStandardMaterial({ color: 0xfafcff, roughness: 0.7, side: THREE.DoubleSide });

    const poleGeo = new THREE.CylinderGeometry(0.028, 0.028, poleH, 8);
    const px = w / 2 - 0.06;
    const pz = d / 2 - 0.06;
    [[-px, -pz], [px, -pz], [-px, pz], [px, pz]].forEach(([x, z]) => {
        const pole = new THREE.Mesh(poleGeo, frameMat);
        pole.position.set(x, poleH / 2, z);
        group.add(pole);
    });

    const beamGeoX = new THREE.CylinderGeometry(0.022, 0.022, w, 8);
    const b1 = new THREE.Mesh(beamGeoX, frameMat);
    b1.rotation.z = Math.PI / 2;
    b1.position.set(0, poleH, -pz);
    group.add(b1);

    const b2 = b1.clone();
    b2.position.z = pz;
    group.add(b2);

    const roof = new THREE.Mesh(new THREE.ConeGeometry(Math.sqrt(w * w + d * d) / 2, roofH, 4), canvasMat);
    roof.rotation.y = Math.PI / 4;
    roof.position.set(0, poleH + roofH / 2, 0);
    group.add(roof);
}

export function buildTruss3D(group, w, d, colorHex) {
    const trussW = 0.35;
    const trussMat = new THREE.MeshStandardMaterial({ color: 0xd8e0e8, metalness: 0.9, roughness: 0.2 });
    const length = Math.max(w, d);
    const elevation = 4.2;
    const isAlongX = w >= d;

    const tubeGeo = new THREE.CylinderGeometry(0.02, 0.02, length, 8);
    const off = trussW / 2;
    [[-off, -off], [off, -off], [-off, off], [off, off]].forEach(([ox, oz]) => {
        const tube = new THREE.Mesh(tubeGeo, trussMat);
        if (isAlongX) {
            tube.rotation.z = Math.PI / 2;
            tube.position.set(0, elevation + ox, oz);
        } else {
            tube.rotation.x = Math.PI / 2;
            tube.position.set(ox, elevation + oz, 0);
        }
        group.add(tube);
    });

    const spotBodyGeo = new THREE.CylinderGeometry(0.08, 0.12, 0.25, 12);
    const spotMat = new THREE.MeshStandardMaterial({ color: 0x1f2124, metalness: 0.6 });
    [-length / 3, length / 3].forEach(pos => {
        const spot = new THREE.Mesh(spotBodyGeo, spotMat);
        spot.rotation.x = Math.PI / 3;
        if (isAlongX) spot.position.set(pos, elevation - 0.2, 0);
        else spot.position.set(0, elevation - 0.2, pos);
        group.add(spot);
    });
}

export function buildTechDesk3D(group, w, d, colorHex, el) {
    const deskH = 0.75;
    const deskMat = new THREE.MeshStandardMaterial({ color: 0x22252a, roughness: 0.5 });
    const screenMat = new THREE.MeshStandardMaterial({ color: 0x15171c, metalness: 0.7, roughness: 0.2 });
    const glassMat = new THREE.MeshBasicMaterial({ color: 0x2a5588 });

    const table = new THREE.Mesh(new THREE.BoxGeometry(w, 0.04, d), deskMat);
    table.position.set(0, deskH, 0);
    group.add(table);

    const legGeo = new THREE.BoxGeometry(0.04, deskH, d * 0.8);
    const l1 = new THREE.Mesh(legGeo, deskMat);
    l1.position.set(-w / 2 + 0.1, deskH / 2, 0);
    group.add(l1);

    const l2 = l1.clone();
    l2.position.x = w / 2 - 0.1;
    group.add(l2);

    const scrW = Math.min(w / 3.2, 0.6);
    const scrH = 0.35;
    const scrGeo = new THREE.BoxGeometry(scrW, scrH, 0.02);

    [-scrW * 1.1, 0, scrW * 1.1].forEach((offX, idx) => {
        const monitor = new THREE.Mesh(scrGeo, screenMat);
        const rot = idx === 0 ? 0.2 : idx === 2 ? -0.2 : 0;
        monitor.rotation.y = rot;
        monitor.position.set(offX, deskH + scrH / 2 + 0.08, -d / 4);
        group.add(monitor);

        const panel = new THREE.Mesh(new THREE.PlaneGeometry(scrW * 0.9, scrH * 0.85), glassMat);
        panel.position.set(0, 0, 0.012);
        monitor.add(panel);
    });
}

export function buildBuffetBar3D(group, w, d, colorHex, el) {
    const barH = 1.05;
    const woodMat = new THREE.MeshStandardMaterial({ color: colorHex || 0x5a4a3a, roughness: 0.4 });
    const topMat = new THREE.MeshStandardMaterial({ color: 0x242830, roughness: 0.25 });

    const front = new THREE.Mesh(new THREE.BoxGeometry(w, barH, d), woodMat);
    front.position.set(0, barH / 2, 0);
    group.add(front);

    const top = new THREE.Mesh(new THREE.BoxGeometry(w + 0.06, 0.04, d + 0.06), topMat);
    top.position.set(0, barH + 0.02, 0);
    group.add(top);
}

export function buildSpeaker3D(group, w, d) {
    const tripodH = 1.4;
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x1f2126, metalness: 0.8 });
    const boxMat = new THREE.MeshStandardMaterial({ color: 0x141518, roughness: 0.7 });

    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, tripodH, 8), metalMat);
    pole.position.set(0, tripodH / 2, 0);
    group.add(pole);

    for (let i = 0; i < 3; i++) {
        const angle = (i * Math.PI * 2) / 3;
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.7, 8), metalMat);
        leg.position.set(Math.cos(angle) * 0.22, 0.25, Math.sin(angle) * 0.22);
        leg.rotation.z = 0.55;
        leg.rotation.y = angle;
        group.add(leg);
    }

    const spk = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.62, 0.35), boxMat);
    spk.position.set(0, tripodH + 0.31, 0);
    group.add(spk);
}

export function buildFloorSpeakerWedge3D(group, w, d) {
    const boxMat = new THREE.MeshStandardMaterial({ color: 0x15171a, roughness: 0.8 });
    const wedge = new THREE.Mesh(new THREE.BoxGeometry(w, 0.32, d), boxMat);
    wedge.rotation.x = -Math.PI / 6; // 30° angled back towards performer
    wedge.position.set(0, 0.16, 0);
    group.add(wedge);
}

export function buildGenerator3D(group, w, d) {
    const genH = 1.1;
    const genMat = new THREE.MeshStandardMaterial({ color: 0xd1b026, roughness: 0.4 });
    const blackMat = new THREE.MeshStandardMaterial({ color: 0x1f2126, roughness: 0.6 });

    const body = new THREE.Mesh(new THREE.BoxGeometry(w, genH * 0.8, d), genMat);
    body.position.set(0, genH * 0.45, 0);
    group.add(body);

    const frame = new THREE.Mesh(new THREE.BoxGeometry(w + 0.05, 0.1, d + 0.05), blackMat);
    frame.position.set(0, 0.05, 0);
    group.add(frame);
}

export function buildDistributionBox3D(group, w, d) {
    const boxH = 0.85;
    const orangeMat = new THREE.MeshStandardMaterial({ color: 0xed6a12, roughness: 0.4 });
    const box = new THREE.Mesh(new THREE.BoxGeometry(w, boxH, d), orangeMat);
    box.position.set(0, boxH / 2, 0);
    group.add(box);
}

export function buildPlant3D(group, w, d) {
    const potMat = new THREE.MeshStandardMaterial({ color: 0x3e4450, roughness: 0.3 });
    const leafMat = new THREE.MeshStandardMaterial({ color: 0x228b3b, roughness: 0.8 });

    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.18, 0.45, 16), potMat);
    pot.position.set(0, 0.225, 0);
    group.add(pot);

    const sphereGeo = new THREE.SphereGeometry(0.28, 10, 8);
    const clusterPos = [[0, 0.68, 0], [-0.14, 0.58, 0.1], [0.14, 0.6, -0.08], [0.08, 0.52, 0.16]];
    clusterPos.forEach(([cx, cy, cz]) => {
        const leaf = new THREE.Mesh(sphereGeo, leafMat);
        leaf.position.set(cx, cy, cz);
        group.add(leaf);
    });
}

export function buildLedScreen3D(group, w, d, colorHex) {
    const screenH = Math.max(d, 1.2);
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x181a1f, metalness: 0.8 });
    const glowMat = new THREE.MeshBasicMaterial({ color: 0x2477cc });

    const frame = new THREE.Mesh(new THREE.BoxGeometry(w, screenH, 0.06), frameMat);
    frame.position.set(0, 1.0 + screenH / 2, 0);
    group.add(frame);

    const display = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.08, screenH - 0.08), glowMat);
    display.position.set(0, 0, 0.032);
    frame.add(display);

    const poleGeo = new THREE.CylinderGeometry(0.03, 0.03, 1.0, 8);
    const baseGeo = new THREE.BoxGeometry(0.12, 0.02, 0.6);
    [-w / 3, w / 3].forEach(px => {
        const p = new THREE.Mesh(poleGeo, frameMat);
        p.position.set(px, 0.5, 0);
        group.add(p);

        const b = new THREE.Mesh(baseGeo, frameMat);
        b.position.set(px, 0.01, 0);
        group.add(b);
    });
}

export function buildFlagOriflamme3D(group, w, d, colorHex) {
    const h = 3.0;
    const poleMat = new THREE.MeshStandardMaterial({ color: 0x22242a, metalness: 0.8 });
    const flagMat = new THREE.MeshStandardMaterial({ color: colorHex || 0x2a75d3, side: THREE.DoubleSide, roughness: 0.7 });

    // Pole
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, h, 8), poleMat);
    pole.position.set(-w / 4, h / 2, 0);
    group.add(pole);

    // Curved cloth banner
    const cloth = new THREE.Mesh(new THREE.PlaneGeometry(w * 0.8, h * 0.75), flagMat);
    cloth.position.set(w * 0.15, h * 0.58, 0);
    group.add(cloth);

    // Ground base
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 0.03, 16), poleMat);
    base.position.set(-w / 4, 0.015, 0);
    group.add(base);
}

export function buildEasel3D(group, w, d) {
    const h = 1.8;
    const metalMat = new THREE.MeshStandardMaterial({ color: 0xccd6e0, metalness: 0.8 });
    const boardMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });

    const board = new THREE.Mesh(new THREE.BoxGeometry(w, 0.95, 0.03), boardMat);
    board.position.set(0, h * 0.65, 0);
    group.add(board);

    const legGeo = new THREE.CylinderGeometry(0.012, 0.012, h, 8);
    [-w / 2 + 0.05, w / 2 - 0.05].forEach(lx => {
        const leg = new THREE.Mesh(legGeo, metalMat);
        leg.position.set(lx, h / 2, 0);
        group.add(leg);
    });
}

export function buildMobileToilet3D(group, w, d) {
    const h = 2.3;
    const plasticMat = new THREE.MeshStandardMaterial({ color: 0x2b6cb0, roughness: 0.4 });
    const roofMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.3 });

    const body = new THREE.Mesh(new THREE.BoxGeometry(w, h * 0.85, d), plasticMat);
    body.position.set(0, (h * 0.85) / 2, 0);
    group.add(body);

    const roof = new THREE.Mesh(new THREE.ConeGeometry(Math.max(w, d) * 0.7, 0.35, 4), roofMat);
    roof.rotation.y = Math.PI / 4;
    roof.position.set(0, h * 0.85 + 0.175, 0);
    group.add(roof);
}

export function buildExtinguisher3D(group, w, d) {
    const h = 0.65;
    const redMat = new THREE.MeshStandardMaterial({ color: 0xd91e18, roughness: 0.3 });
    const blackMat = new THREE.MeshStandardMaterial({ color: 0x1f2124, roughness: 0.8 });

    const tank = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, h, 16), redMat);
    tank.position.set(0, h / 2, 0);
    group.add(tank);

    const handle = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 0.03), blackMat);
    handle.position.set(0, h + 0.04, 0);
    group.add(handle);
}

export function buildJerseyBlock3D(group, w, d, colorHex) {
    const h = 0.82;
    const mat = new THREE.MeshStandardMaterial({ color: colorHex || 0xd13b2e, roughness: 0.6 });
    const block = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    block.position.set(0, h / 2, 0);
    group.add(block);
}

export function buildCone3D(group, w, d) {
    const coneH = 0.7;
    const orangeMat = new THREE.MeshStandardMaterial({ color: 0xff5500, roughness: 0.45 });
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3 });

    const base = new THREE.Mesh(new THREE.BoxGeometry(w, 0.03, d), orangeMat);
    base.position.set(0, 0.015, 0);
    group.add(base);

    const cone = new THREE.Mesh(new THREE.ConeGeometry(w * 0.38, coneH, 16), orangeMat);
    cone.position.set(0, coneH / 2 + 0.03, 0);
    group.add(cone);

    const stripe = new THREE.Mesh(new THREE.CylinderGeometry(w * 0.22, w * 0.28, 0.14, 16), whiteMat);
    stripe.position.set(0, coneH * 0.52, 0);
    group.add(stripe);
}

export function buildBeltStanchions3D(group, w, d, colorHex) {
    const poleH = 0.95;
    const poleMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9, roughness: 0.2 });
    const strapMat = new THREE.MeshStandardMaterial({ color: 0x990000, roughness: 0.6 });

    const postGeo = new THREE.CylinderGeometry(0.025, 0.025, poleH, 12);
    const baseGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.03, 16);

    const p1 = new THREE.Mesh(postGeo, poleMat);
    p1.position.set(-w / 2 + 0.1, poleH / 2, 0);
    group.add(p1);
    const b1 = new THREE.Mesh(baseGeo, poleMat);
    b1.position.set(-w / 2 + 0.1, 0.015, 0);
    group.add(b1);

    const p2 = p1.clone();
    p2.position.x = w / 2 - 0.1;
    group.add(p2);
    const b2 = b1.clone();
    b2.position.x = w / 2 - 0.1;
    group.add(b2);

    const strap = new THREE.Mesh(new THREE.BoxGeometry(w - 0.2, 0.05, 0.01), strapMat);
    strap.position.set(0, poleH * 0.88, 0);
    group.add(strap);
}

export function buildArcDesk3D(group, w, d, colorHex) {
    const deskH = 1.1;
    const deskMat = new THREE.MeshStandardMaterial({ color: colorHex || 0x4a5568, roughness: 0.4 });
    const topMat = new THREE.MeshStandardMaterial({ color: 0x22252e, roughness: 0.25 });

    const body = new THREE.Mesh(new THREE.CylinderGeometry(w / 2, w / 2, deskH, 24, 1, false, 0, Math.PI), deskMat);
    body.position.set(0, deskH / 2, 0);
    group.add(body);

    const top = new THREE.Mesh(new THREE.CylinderGeometry(w / 2 + 0.04, w / 2 + 0.04, 0.035, 24, 1, false, 0, Math.PI), topMat);
    top.position.set(0, deskH + 0.018, 0);
    group.add(top);
}

export function buildVehicle3D(group, w, d, colorHex) {
    const bodyH = 1.35;
    const bodyMat = new THREE.MeshStandardMaterial({ color: colorHex || 0xcc2222, roughness: 0.4 });
    const glassMat = new THREE.MeshStandardMaterial({ color: 0x141d24, metalness: 0.8, roughness: 0.1 });
    const wheelMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.9 });

    const body = new THREE.Mesh(new THREE.BoxGeometry(w, bodyH * 0.65, d), bodyMat);
    body.position.set(0, bodyH * 0.45, 0);
    group.add(body);

    const cab = new THREE.Mesh(new THREE.BoxGeometry(w * 0.88, bodyH * 0.45, d * 0.55), glassMat);
    cab.position.set(0, bodyH * 0.85, -d * 0.1);
    group.add(cab);

    const wheelGeo = new THREE.CylinderGeometry(0.28, 0.28, 0.14, 16);
    const wx = w / 2;
    const wz = d / 2 - 0.5;
    [[-wx, -wz], [wx, -wz], [-wx, wz], [wx, wz]].forEach(([x, z]) => {
        const wheel = new THREE.Mesh(wheelGeo, wheelMat);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(x, 0.28, z);
        group.add(wheel);
    });

    const beacon = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.12, 12), new THREE.MeshBasicMaterial({ color: 0x0088ff }));
    beacon.position.set(0, bodyH * 1.15, 0);
    group.add(beacon);
}

export function buildGenericStyledPiece(group, w, d, colorHex, el) {
    const h = el.height3D || 0.75;
    const boxGeo = new THREE.BoxGeometry(w, h, d);
    const boxMat = new THREE.MeshStandardMaterial({ color: colorHex, roughness: 0.45, metalness: 0.15 });
    const mesh = new THREE.Mesh(boxGeo, boxMat);
    mesh.position.set(0, h / 2, 0);
    group.add(mesh);

    const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(boxGeo),
        new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.25 })
    );
    edges.position.copy(mesh.position);
    group.add(edges);
}
