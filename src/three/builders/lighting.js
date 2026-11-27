/* ================================================================
   ScenoPlan — 3D Stage Lighting Fixture Builders
   ================================================================ */

import * as THREE from 'three';

export function buildLyreMovingHead3D(group, w, d, colorHex, liveFixtures) {
    const fixtureColor = 0x16181d;
    const beamColor = colorHex || 0x00d9ff; // Vibrant stage cyan or custom color
    const baseMat = new THREE.MeshStandardMaterial({ color: fixtureColor, roughness: 0.4, metalness: 0.6 });
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x2b303a, roughness: 0.3, metalness: 0.8 });
    const lensMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.1, metalness: 0.9, transparent: true, opacity: 0.85 });
    const displayMat = new THREE.MeshBasicMaterial({ color: 0x0077ff });

    // 1. Heavy Base
    const baseH = 0.10;
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.34, baseH, 0.32), baseMat);
    base.position.set(0, baseH / 2, 0);
    group.add(base);

    // Rubber feet
    const footGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.015, 8);
    const footMat = new THREE.MeshStandardMaterial({ color: 0x0a0b0d, roughness: 0.9 });
    [[-0.14, -0.13], [0.14, -0.13], [-0.14, 0.13], [0.14, 0.13]].forEach(([fx, fz]) => {
        const foot = new THREE.Mesh(footGeo, footMat);
        foot.position.set(fx, 0.008, fz);
        group.add(foot);
    });

    // Digital LCD Display & DMX panel
    const lcd = new THREE.Mesh(new THREE.PlaneGeometry(0.09, 0.04), displayMat);
    lcd.position.set(0, baseH / 2, 0.161);
    group.add(lcd);

    // Carry handles on sides
    [-0.171, 0.171].forEach(hx => {
        const handle = new THREE.Mesh(new THREE.BoxGeometry(0.015, 0.03, 0.12), metalMat);
        handle.position.set(hx, baseH / 2, 0);
        group.add(handle);
    });

    // 2. Pan Turret (Rotating round platter)
    const platter = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.14, 0.035, 24), baseMat);
    platter.position.set(0, baseH + 0.018, 0);
    group.add(platter);

    // 3. Yoke (Fourche en U)
    const yokeGroup = new THREE.Group();
    yokeGroup.position.set(0, baseH + 0.035, 0);
    group.add(yokeGroup);

    const yokeArmGeo = new THREE.BoxGeometry(0.045, 0.26, 0.08);
    const leftArm = new THREE.Mesh(yokeArmGeo, baseMat);
    leftArm.position.set(-0.125, 0.13, 0);
    yokeGroup.add(leftArm);

    const rightArm = leftArm.clone();
    rightArm.position.x = 0.125;
    yokeGroup.add(rightArm);

    const yokeCross = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.04, 0.08), baseMat);
    yokeCross.position.set(0, 0.02, 0);
    yokeGroup.add(yokeCross);

    // 4. Moving Head Enclosure (Tilted 35° upwards toward the stage)
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.20, 0);
    headGroup.rotation.x = -0.55; // Tilt angle
    yokeGroup.add(headGroup);

    // Main aerodynamic barrel/pod
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.095, 0.115, 0.28, 20), baseMat);
    barrel.position.set(0, 0, 0);
    headGroup.add(barrel);

    // Front lens ring & optical glass
    const lensRing = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.095, 0.03, 20), metalMat);
    lensRing.position.set(0, 0.145, 0);
    headGroup.add(lensRing);

    const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.088, 0.088, 0.01, 20), lensMat);
    lens.position.set(0, 0.155, 0);
    headGroup.add(lens);

    // Cooling ventilation fins
    const finGeo = new THREE.BoxGeometry(0.21, 0.01, 0.06);
    [-0.04, 0, 0.04].forEach(fy => {
        const fin = new THREE.Mesh(finGeo, metalMat);
        fin.position.set(0, fy, 0);
        headGroup.add(fin);
    });

    // 5. Volumetric Light Beam Cone (Theatrical atmospheric haze effect)
    const beamLen = 7.5;
    const beamR = 1.35;
    // ConeGeometry points +Y, so we orient along the lens axis (+Y)
    const coneGeo = new THREE.ConeGeometry(beamR, beamLen, 32, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({
        color: beamColor,
        transparent: true,
        opacity: 0.26,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });
    const beamCone = new THREE.Mesh(coneGeo, beamMat);
    beamCone.rotation.x = Math.PI; // Invert cone so apex is at the lens
    beamCone.position.set(0, 0.16 + beamLen / 2, 0);
    headGroup.add(beamCone);

    // Inner intense beam core
    const coreGeo = new THREE.ConeGeometry(beamR * 0.45, beamLen, 24, 1, true);
    const coreMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        transparent: true,
        opacity: 0.20,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });
    const beamCore = new THREE.Mesh(coreGeo, coreMat);
    beamCore.rotation.x = Math.PI;
    beamCore.position.set(0, 0.16 + beamLen / 2, 0);
    headGroup.add(beamCore);

    // Register for Live Show dynamic DMX animation
    liveFixtures.push({
        type: 'movinghead',
        yoke: yokeGroup,
        head: headGroup,
        cone: beamCone,
        core: beamCore,
        mat: beamMat,
        origColor: beamColor,
        origTilt: -0.55,
        phase: liveFixtures.length * 1.35
    });
}

export function buildParLightStand3D(group, w, d, colorHex, liveFixtures) {
    const standH = 2.15;
    const beamColor = colorHex || 0xffd27d; // Warm stage tungsten
    const blackMetal = new THREE.MeshStandardMaterial({ color: 0x181a1f, roughness: 0.35, metalness: 0.8 });
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xcfd6e0, roughness: 0.2, metalness: 0.95 });

    // 1. Folding Tripod Legs on Ground
    for (let i = 0; i < 3; i++) {
        const angle = (i * Math.PI * 2) / 3;
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.013, 0.013, 0.78, 8), blackMetal);
        leg.position.set(Math.cos(angle) * 0.26, 0.32, Math.sin(angle) * 0.26);
        leg.rotation.z = 0.62;
        leg.rotation.y = angle;
        group.add(leg);

        // Rubber floor pad
        const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.02, 8), blackMetal);
        pad.position.set(Math.cos(angle) * 0.52, 0.01, Math.sin(angle) * 0.52);
        group.add(pad);
    }

    // 2. Telescopic Central Mast
    const lowerMast = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, 1.2, 12), blackMetal);
    lowerMast.position.set(0, 0.6, 0);
    group.add(lowerMast);

    const clamp = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, 0.06, 12), chromeMat);
    clamp.position.set(0, 1.18, 0);
    group.add(clamp);

    const upperMast = new THREE.Mesh(new THREE.CylinderGeometry(0.017, 0.017, 1.1, 12), chromeMat);
    upperMast.position.set(0, 1.65, 0);
    group.add(upperMast);

    // 3. Top Mounting Yoke & PAR Fixture
    const fixtureGroup = new THREE.Group();
    fixtureGroup.position.set(0, standH, 0);
    fixtureGroup.rotation.x = 0.45; // Angled down toward stage
    group.add(fixtureGroup);

    // U-Yoke mounting bracket
    const yoke = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.02, 0.04), blackMetal);
    fixtureGroup.add(yoke);

    // PAR Can Cylindrical Body
    const canGeo = new THREE.CylinderGeometry(0.12, 0.09, 0.30, 20);
    const can = new THREE.Mesh(canGeo, blackMetal);
    can.rotation.x = Math.PI / 2;
    fixtureGroup.add(can);

    // Rear cooling handle
    const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.14, 8), chromeMat);
    handle.position.set(0, 0, -0.17);
    fixtureGroup.add(handle);

    // Front lens aperture
    const lensMat = new THREE.MeshBasicMaterial({ color: beamColor });
    const lens = new THREE.Mesh(new THREE.CircleGeometry(0.115, 20), lensMat);
    lens.position.set(0, 0, 0.151);
    fixtureGroup.add(lens);

    // 4 Barndoors (Coupe-flux)
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x121417, roughness: 0.5 });
    const doorGeoH = new THREE.BoxGeometry(0.24, 0.008, 0.10);
    const doorGeoV = new THREE.BoxGeometry(0.008, 0.24, 0.10);

    // Top door
    const dTop = new THREE.Mesh(doorGeoH, doorMat);
    dTop.position.set(0, 0.14, 0.19);
    dTop.rotation.x = -0.38;
    fixtureGroup.add(dTop);

    // Bottom door
    const dBot = new THREE.Mesh(doorGeoH, doorMat);
    dBot.position.set(0, -0.14, 0.19);
    dBot.rotation.x = 0.38;
    fixtureGroup.add(dBot);

    // Left door
    const dLeft = new THREE.Mesh(doorGeoV, doorMat);
    dLeft.position.set(-0.14, 0, 0.19);
    dLeft.rotation.y = 0.38;
    fixtureGroup.add(dLeft);

    // Right door
    const dRight = new THREE.Mesh(doorGeoV, doorMat);
    dRight.position.set(0.14, 0, 0.19);
    dRight.rotation.y = -0.38;
    fixtureGroup.add(dRight);

    // 4. Volumetric Light Beam Cone
    const beamLen = 6.0;
    const beamR = 1.6;
    const coneGeo = new THREE.ConeGeometry(beamR, beamLen, 24, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({
        color: beamColor,
        transparent: true,
        opacity: 0.22,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });
    const beam = new THREE.Mesh(coneGeo, beamMat);
    beam.rotation.x = -Math.PI / 2; // Aim along +Z
    beam.position.set(0, 0, 0.16 + beamLen / 2);
    fixtureGroup.add(beam);

    // Register for Live Show
    liveFixtures.push({
        type: 'par',
        fixture: fixtureGroup,
        cone: beam,
        mat: beamMat,
        origColor: beamColor,
        origTilt: 0.45,
        phase: liveFixtures.length * 1.15
    });
}

export function buildFollowspot3D(group, w, d, liveFixtures) {
    const standH = 1.45;
    const gunLen = 1.05;
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x1f232a, roughness: 0.35, metalness: 0.7 });
    const metalMat = new THREE.MeshStandardMaterial({ color: 0xcfd6e2, roughness: 0.25, metalness: 0.9 });
    const gripMat = new THREE.MeshStandardMaterial({ color: 0x111215, roughness: 0.8 });

    // Heavy Wide Tripod Base with Levelers
    for (let i = 0; i < 3; i++) {
        const angle = (i * Math.PI * 2) / 3;
        const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.82, 8), bodyMat);
        leg.position.set(Math.cos(angle) * 0.35, 0.28, Math.sin(angle) * 0.35);
        leg.rotation.z = 0.65;
        leg.rotation.y = angle;
        group.add(leg);
    }

    // Heavy center pedestal & crank housing
    const pedestal = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, standH, 16), bodyMat);
    pedestal.position.set(0, standH / 2, 0);
    group.add(pedestal);

    const crank = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.14, 0.10), metalMat);
    crank.position.set(0, standH * 0.6, 0);
    group.add(crank);

    // Cannon Pivot Group (Fluid swivel head)
    const cannonGroup = new THREE.Group();
    cannonGroup.position.set(0, standH + 0.12, 0);
    cannonGroup.rotation.x = 0.15; // Slightly angled down
    group.add(cannonGroup);

    // Barrel main long housing
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.14, gunLen, 24), bodyMat);
    barrel.rotation.x = Math.PI / 2;
    cannonGroup.add(barrel);

    // Front lens cone
    const lensCone = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.12, 0.14, 24), metalMat);
    lensCone.rotation.x = Math.PI / 2;
    lensCone.position.set(0, 0, gunLen / 2 + 0.07);
    cannonGroup.add(lensCone);

    // Bright optical front glass
    const glass = new THREE.Mesh(new THREE.CircleGeometry(0.135, 24), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    glass.position.set(0, 0, gunLen / 2 + 0.141);
    cannonGroup.add(glass);

    // Top Color Gel Cassette / Magazine
    const gelMag = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.14, 0.32), bodyMat);
    gelMag.position.set(0, 0.16, 0.15);
    cannonGroup.add(gelMag);

    // Dual Rear Steering Handles for the operator
    [-0.14, 0.14].forEach(hx => {
        const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.16, 8), metalMat);
        arm.position.set(hx, 0, -gunLen / 2 - 0.08);
        arm.rotation.x = Math.PI / 2;
        cannonGroup.add(arm);

        const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.12, 8), gripMat);
        grip.position.set(hx, -0.05, -gunLen / 2 - 0.14);
        cannonGroup.add(grip);
    });

    // Powerful Focused Volumetric Beam Cone
    const beamLen = 9.0;
    const beamR = 1.5;
    const beamMat = new THREE.MeshBasicMaterial({
        color: 0xfff3db,
        transparent: true,
        opacity: 0.32,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });
    const beam = new THREE.Mesh(new THREE.ConeGeometry(beamR, beamLen, 24, 1, true), beamMat);
    beam.rotation.x = -Math.PI / 2;
    beam.position.set(0, 0, gunLen / 2 + 0.14 + beamLen / 2);
    cannonGroup.add(beam);

    // Register for Live Show
    liveFixtures.push({
        type: 'followspot',
        cannon: cannonGroup,
        cone: beam,
        mat: beamMat,
        origColor: 0xfff3db,
        origTilt: 0.35,
        phase: liveFixtures.length * 1.5
    });
}

export function buildSpotlightFixture3D(group, w, d, colorHex) {
    const fixtureMat = new THREE.MeshStandardMaterial({ color: 0x1f2329, roughness: 0.4, metalness: 0.6 });
    const beamColor = colorHex || 0x64b5f6;

    // Base plate or clamp
    const base = new THREE.Mesh(new THREE.BoxGeometry(w, 0.04, d), fixtureMat);
    base.position.set(0, 0.02, 0);
    group.add(base);

    // Yoke & spot canister
    const yoke = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 0.25, 8), fixtureMat);
    yoke.position.set(0, 0.16, 0);
    group.add(yoke);

    const spotBody = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.08, 0.28, 16), fixtureMat);
    spotBody.rotation.x = 0.55;
    spotBody.position.set(0, 0.32, 0.06);
    group.add(spotBody);

    // Beam
    const beamLen = 4.5;
    const cone = new THREE.Mesh(new THREE.ConeGeometry(1.2, beamLen, 20, 1, true), new THREE.MeshBasicMaterial({
        color: beamColor,
        transparent: true,
        opacity: 0.22,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    }));
    cone.rotation.x = -Math.PI / 2 + 0.55;
    cone.position.set(0, 0.32 + Math.sin(0.55) * (beamLen / 2), 0.06 + Math.cos(0.55) * (beamLen / 2));
    group.add(cone);
}
