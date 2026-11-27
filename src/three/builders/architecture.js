/* ================================================================
   ScenoPlan — 3D Architecture Builders (Zones, Walls, Partitions)
   ================================================================ */

import * as THREE from 'three';

export function to3DCoords(x, y, width, height, sceneW, sceneH) {
    const cx = (x + width / 2) - (sceneW / 2);
    const cz = (y + height / 2) - (sceneH / 2);
    return { x: cx, z: cz };
}

export function create3DZone(el, sceneW, sceneH, zoneGroup) {
    const pos = to3DCoords(el.x, el.y, el.width, el.height, sceneW, sceneH);
    const rotRad = -((el.rotation || 0) * Math.PI) / 180;
    const colorHex = el.color ? parseInt(el.color.replace('#', '0x'), 16) : 0x5b73ff;

    const group = new THREE.Group();
    group.position.set(pos.x, 0, pos.z);
    group.rotation.y = rotRad;
    group.userData = { element: el };

    const isPolygon = el.shape === 'polygon' && Array.isArray(el.points) && el.points.length >= 3;

    // Flat translucent floor plane (depthWrite: false so objects inside are fully visible!)
    let zoneGeo;
    if (isPolygon) {
        const shape = new THREE.Shape();
        el.points.forEach((pt, idx) => {
            const sx = pt.x - el.width / 2;
            const sy = -(pt.y - el.height / 2);
            if (idx === 0) shape.moveTo(sx, sy);
            else shape.lineTo(sx, sy);
        });
        shape.closePath();
        zoneGeo = new THREE.ShapeGeometry(shape);
    } else {
        zoneGeo = new THREE.PlaneGeometry(el.width, el.height);
    }

    const zoneMat = new THREE.MeshStandardMaterial({
        color: colorHex,
        transparent: true,
        opacity: 0.15, // Low opacity for clean see-through view
        roughness: 0.8,
        metalness: 0.1,
        side: THREE.DoubleSide,
        depthWrite: false
    });
    const zoneMesh = new THREE.Mesh(zoneGeo, zoneMat);
    zoneMesh.rotation.x = -Math.PI / 2;
    zoneMesh.position.y = 0.005;
    zoneMesh.receiveShadow = true;
    group.add(zoneMesh);

    // Accent border line
    const borderMat = new THREE.LineBasicMaterial({
        color: colorHex,
        transparent: true,
        opacity: 0.75,
        linewidth: 2
    });
    if (isPolygon) {
        const borderPts = el.points.map(pt => new THREE.Vector3(pt.x - el.width / 2, 0.008, pt.y - el.height / 2));
        const borderGeo = new THREE.BufferGeometry().setFromPoints(borderPts);
        const borderLine = new THREE.LineLoop(borderGeo, borderMat);
        group.add(borderLine);
    } else {
        const borderGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(el.width, 0.015, el.height));
        const borderLine = new THREE.LineSegments(borderGeo, borderMat);
        borderLine.position.y = 0.008;
        group.add(borderLine);
    }

    zoneGroup.add(group);
}

export function create3DWall(el, sceneW, sceneH, wallGroup) {
    const pos = to3DCoords(el.x, el.y, el.width, el.height, sceneW, sceneH);
    const rotRad = -((el.rotation || 0) * Math.PI) / 180;
    const wallH = 2.5; // 2.50m full ceiling/wall height
    const wallThick = Math.max(el.height, 0.15); // Thickness
    const wallLen = Math.max(el.width, 0.15);    // Length

    const group = new THREE.Group();
    group.position.set(pos.x, 0, pos.z);
    group.rotation.y = rotRad;
    group.userData = { element: el };

    // Wall Body (Oriented along X in local space, extruded vertically on Y)
    const wallGeo = new THREE.BoxGeometry(wallLen, wallH, wallThick);
    const wallMat = new THREE.MeshStandardMaterial({
        color: 0xe0e4ea, // Clean architectural white plaster
        roughness: 0.8,
        metalness: 0.05
    });
    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.position.set(0, wallH / 2, 0);
    wall.castShadow = true;
    wall.receiveShadow = true;
    group.add(wall);

    // Subtle top molding trim
    const trimGeo = new THREE.BoxGeometry(wallLen, 0.04, wallThick + 0.02);
    const trimMat = new THREE.MeshStandardMaterial({ color: 0xccd2dc, roughness: 0.5 });
    const trim = new THREE.Mesh(trimGeo, trimMat);
    trim.position.set(0, wallH - 0.02, 0);
    group.add(trim);

    wallGroup.add(group);
}

export function buildPartition3D(group, w, d, colorHex, el) {
    const h = 2.4; // 2.40m standard modular exhibition partition height
    // Detect length and orientation:
    const isAlongX = w >= d;
    const length = isAlongX ? w : d;
    const thickness = 0.05; // 5cm panel thickness

    const panelMat = new THREE.MeshStandardMaterial({
        color: colorHex || 0xf4f6f8,
        roughness: 0.5,
        metalness: 0.05
    });
    const aluMat = new THREE.MeshStandardMaterial({
        color: 0xc8d2dc,
        metalness: 0.85,
        roughness: 0.25
    });
    const footMat = new THREE.MeshStandardMaterial({
        color: 0x22252a,
        metalness: 0.9,
        roughness: 0.2
    });

    // 1. Main vertical acoustic/melamine panel (standing tall on Y)
    const panelGeo = isAlongX 
        ? new THREE.BoxGeometry(length - 0.04, h - 0.06, thickness)
        : new THREE.BoxGeometry(thickness, h - 0.06, length - 0.04);
    const panel = new THREE.Mesh(panelGeo, panelMat);
    panel.position.set(0, h / 2, 0);
    group.add(panel);

    // 2. Aluminum outer frame (Left post, Right post, Top rail)
    const postR = 0.022;
    const postGeo = new THREE.CylinderGeometry(postR, postR, h, 8);
    
    if (isAlongX) {
        const p1 = new THREE.Mesh(postGeo, aluMat);
        p1.position.set(-length / 2 + 0.02, h / 2, 0);
        group.add(p1);

        const p2 = p1.clone();
        p2.position.x = length / 2 - 0.02;
        group.add(p2);

        const topRail = new THREE.Mesh(new THREE.BoxGeometry(length, 0.04, thickness + 0.01), aluMat);
        topRail.position.set(0, h - 0.02, 0);
        group.add(topRail);

        // 2 Flat perpendicular stabilizer feet on floor
        const footGeo = new THREE.BoxGeometry(0.06, 0.016, 0.45);
        [-length / 2 + 0.15, length / 2 - 0.15].forEach(fx => {
            const foot = new THREE.Mesh(footGeo, footMat);
            foot.position.set(fx, 0.008, 0);
            group.add(foot);
        });
    } else {
        // Oriented along Z
        const p1 = new THREE.Mesh(postGeo, aluMat);
        p1.position.set(0, h / 2, -length / 2 + 0.02);
        group.add(p1);

        const p2 = p1.clone();
        p2.position.z = length / 2 - 0.02;
        group.add(p2);

        const topRail = new THREE.Mesh(new THREE.BoxGeometry(thickness + 0.01, 0.04, length), aluMat);
        topRail.position.set(0, h - 0.02, 0);
        group.add(topRail);

        const footGeo = new THREE.BoxGeometry(0.45, 0.016, 0.06);
        [-length / 2 + 0.15, length / 2 - 0.15].forEach(fz => {
            const foot = new THREE.Mesh(footGeo, footMat);
            foot.position.set(0, 0.008, fz);
            group.add(foot);
        });
    }
}

export function buildPartitionCorner3D(group, w, d, colorHex) {
    const h = 2.4;
    const panelMat = new THREE.MeshStandardMaterial({ color: colorHex || 0xf4f6f8, roughness: 0.5 });
    const aluMat = new THREE.MeshStandardMaterial({ color: 0xc8d2dc, metalness: 0.85, roughness: 0.25 });

    // Center corner square post
    const cornerPost = new THREE.Mesh(new THREE.BoxGeometry(0.06, h, 0.06), aluMat);
    cornerPost.position.set(0, h / 2, 0);
    group.add(cornerPost);

    // Wing 1 (along X)
    const wing1 = new THREE.Mesh(new THREE.BoxGeometry(w / 2, h, 0.04), panelMat);
    wing1.position.set(w / 4 + 0.03, h / 2, 0);
    group.add(wing1);

    // Wing 2 (along Z at 90°)
    const wing2 = new THREE.Mesh(new THREE.BoxGeometry(0.04, h, d / 2), panelMat);
    wing2.position.set(0, h / 2, d / 4 + 0.03);
    group.add(wing2);
}
