/* ================================================================
   ScenoPlan — 3D Characters (PNJ) & Tech / Gaming Builders
   ================================================================ */

import * as THREE from 'three';

export function buildTvSwitchStand3D(group, w, d, colorHex, el) {
    const standH = 0.50; // Hauteur du meuble
    const legH = 0.14;   // Hauteur des pieds sous le plateau inférieur
    const woodDark = new THREE.MeshStandardMaterial({ color: 0x181a20, roughness: 0.45, metalness: 0.2 });
    const shelfMat = new THREE.MeshStandardMaterial({ color: 0x222631, roughness: 0.5, metalness: 0.15 });
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x2b313d, roughness: 0.3, metalness: 0.85 });
    const screenFrameMat = new THREE.MeshStandardMaterial({ color: 0x0c0e12, roughness: 0.3, metalness: 0.8 });
    const screenDisplayMat = new THREE.MeshBasicMaterial({ color: 0x0c1e38 });
    const switchBodyMat = new THREE.MeshStandardMaterial({ color: 0x15181e, roughness: 0.6 });
    const joyconBlueMat = new THREE.MeshStandardMaterial({ color: 0x00c3e3, roughness: 0.35 });
    const joyconRedMat = new THREE.MeshStandardMaterial({ color: 0xff3c28, roughness: 0.35 });
    const ctrlMat = new THREE.MeshStandardMaterial({ color: 0x1e222b, roughness: 0.45, metalness: 0.3 });
    const gripMat = new THREE.MeshStandardMaterial({ color: 0x13151a, roughness: 0.85 });
    const dpadMat = new THREE.MeshStandardMaterial({ color: 0x4a5568, roughness: 0.5 });
    const stickMat = new THREE.MeshStandardMaterial({ color: 0x0a0c10, roughness: 0.7 });

    // 1. MEUBLE TV AVEC PLATEAU INFÉRIEUR (ÉTAGÈRE) & SUPÉRIEUR
    // 4 Pieds métalliques au sol
    const legGeo = new THREE.CylinderGeometry(0.016, 0.016, legH, 12);
    const legPositions = [
        [-w * 0.44, -d * 0.40],
        [w * 0.44, -d * 0.40],
        [-w * 0.44, d * 0.40],
        [w * 0.44, d * 0.40]
    ];
    legPositions.forEach(([lx, lz]) => {
        const leg = new THREE.Mesh(legGeo, metalMat);
        leg.position.set(lx, legH / 2, lz);
        group.add(leg);
    });

    // Plateau inférieur (étagère en dessous)
    const lowerShelf = new THREE.Mesh(new THREE.BoxGeometry(w - 0.04, 0.024, d - 0.04), shelfMat);
    lowerShelf.position.set(0, legH + 0.012, 0);
    group.add(lowerShelf);

    // 4 Montants verticaux entre l'étagère et le plateau supérieur
    const pillarH = standH - (legH + 0.024);
    const pillarGeo = new THREE.CylinderGeometry(0.014, 0.014, pillarH, 12);
    legPositions.forEach(([lx, lz]) => {
        const pillar = new THREE.Mesh(pillarGeo, metalMat);
        pillar.position.set(lx, legH + 0.024 + pillarH / 2, lz);
        group.add(pillar);
    });

    // Plateau supérieur principal (support TV)
    const topShelf = new THREE.Mesh(new THREE.BoxGeometry(w, 0.03, d), woodDark);
    topShelf.position.set(0, standH - 0.015, 0);
    group.add(topShelf);

    // 2. ÉCRAN DE TÉLÉVISION 55 POUCES
    const tvGroup = new THREE.Group();
    const tvZ = -d * 0.16;
    tvGroup.position.set(0, standH, tvZ);
    group.add(tvGroup);

    // Pied TV central
    const tvBase = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.012, 0.20), metalMat);
    tvBase.position.set(0, 0.006, 0);
    tvGroup.add(tvBase);

    const tvStem = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.20, 0.04), metalMat);
    tvStem.position.set(0, 0.10, -0.02);
    tvGroup.add(tvStem);

    // Châssis TV
    const tvW = Math.min(w * 0.88, 1.25);
    const tvH = 0.72;
    const tvChassis = new THREE.Mesh(new THREE.BoxGeometry(tvW, tvH, 0.028), screenFrameMat);
    tvChassis.position.set(0, 0.18 + tvH / 2, -0.02);
    tvGroup.add(tvChassis);

    // Dalle d'écran avec rétroéclairage lumineux
    const display = new THREE.Mesh(new THREE.PlaneGeometry(tvW - 0.024, tvH - 0.024), screenDisplayMat);
    display.position.set(0, 0.18 + tvH / 2, -0.005);
    tvGroup.add(display);

    // Éléments visuels graphiques sur l'écran (Nintendo Switch split rouge / bleu)
    const glowLeft = new THREE.Mesh(new THREE.PlaneGeometry((tvW - 0.03) / 2, tvH - 0.03), new THREE.MeshBasicMaterial({ color: 0x0055aa }));
    glowLeft.position.set(- (tvW - 0.03) / 4, 0.18 + tvH / 2, -0.004);
    tvGroup.add(glowLeft);

    const glowRight = new THREE.Mesh(new THREE.PlaneGeometry((tvW - 0.03) / 2, tvH - 0.03), new THREE.MeshBasicMaterial({ color: 0xaa2222 }));
    glowRight.position.set((tvW - 0.03) / 4, 0.18 + tvH / 2, -0.004);
    tvGroup.add(glowRight);

    // LED témoin sous l'écran
    const tvLed = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.004, 0.004), new THREE.MeshBasicMaterial({ color: 0xffffff }));
    tvLed.position.set(0, 0.176, -0.005);
    tvGroup.add(tvLed);

    // 3. CONSOLE NINTENDO SWITCH AVEC JOY-CONS SUR SON DOCK
    const switchGroup = new THREE.Group();
    switchGroup.position.set(-w * 0.24, standH, d * 0.12);
    group.add(switchGroup);

    // Dock noir
    const dock = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.10, 0.055), switchBodyMat);
    dock.position.set(0, 0.05, 0);
    switchGroup.add(dock);

    // Diode verte du dock
    const dockLed = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.006, 0.004), new THREE.MeshBasicMaterial({ color: 0x00e676 }));
    dockLed.position.set(-0.07, 0.02, 0.029);
    switchGroup.add(dockLed);

    // Console insérée dans le dock qui dépasse
    const swTablet = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.016), new THREE.MeshStandardMaterial({ color: 0x08090c, roughness: 0.2 }));
    swTablet.position.set(0, 0.085, 0);
    switchGroup.add(swTablet);

    // Joy-Con Gauche (Bleu Néon)
    const jcLeft = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.078, 0.018), joyconBlueMat);
    jcLeft.position.set(-0.076, 0.085, 0);
    switchGroup.add(jcLeft);

    // Stick gauche
    const stickL = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.008, 12), stickMat);
    stickL.rotation.x = Math.PI / 2;
    stickL.position.set(-0.076, 0.10, 0.01);
    switchGroup.add(stickL);

    // Joy-Con Droit (Rouge Néon)
    const jcRight = new THREE.Mesh(new THREE.BoxGeometry(0.032, 0.078, 0.018), joyconRedMat);
    jcRight.position.set(0.076, 0.085, 0);
    switchGroup.add(jcRight);

    // Stick droit
    const stickR = new THREE.Mesh(new THREE.CylinderGeometry(0.007, 0.007, 0.008, 12), stickMat);
    stickR.rotation.x = Math.PI / 2;
    stickR.position.set(0.076, 0.07, 0.01);
    switchGroup.add(stickR);

    // 4. DEUX MANETTES DE JEU (SWITCH PRO CONTROLLERS)
    [
        { x: w * 0.08, rot: -0.15 },
        { x: w * 0.28, rot: 0.15 }
    ].forEach(cfg => {
        const ctrlGroup = new THREE.Group();
        ctrlGroup.position.set(cfg.x, standH, d * 0.12);
        ctrlGroup.rotation.y = cfg.rot;
        group.add(ctrlGroup);

        // Corps principal de la manette
        const body = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.026, 0.075), ctrlMat);
        body.position.set(0, 0.013, 0);
        ctrlGroup.add(body);

        // Poignées ergonomiques gauche et droite
        [-0.052, 0.052].forEach((hx, idx) => {
            const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.012, 0.065, 12), gripMat);
            grip.rotation.x = 0.35;
            grip.rotation.z = idx === 0 ? 0.35 : -0.35;
            grip.position.set(hx, 0.010, 0.03);
            ctrlGroup.add(grip);
        });

        // D-Pad (Croix directionnelle à gauche)
        const dpadV = new THREE.Mesh(new THREE.BoxGeometry(0.006, 0.004, 0.020), dpadMat);
        dpadV.position.set(-0.028, 0.027, 0.008);
        ctrlGroup.add(dpadV);

        const dpadH = new THREE.Mesh(new THREE.BoxGeometry(0.020, 0.004, 0.006), dpadMat);
        dpadH.position.set(-0.028, 0.027, 0.008);
        ctrlGroup.add(dpadH);

        // Stick analogique gauche (en haut)
        const cStick1 = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.008, 12), stickMat);
        cStick1.position.set(-0.028, 0.028, -0.015);
        ctrlGroup.add(cStick1);

        // Stick analogique droit (en bas)
        const cStick2 = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.008, 12), stickMat);
        cStick2.position.set(0.022, 0.028, 0.012);
        ctrlGroup.add(cStick2);

        // 4 Boutons ABXY (en haut à droite)
        const btnMat = new THREE.MeshStandardMaterial({ color: 0x333b4d, roughness: 0.5 });
        [
            [-0.006, -0.015], // Y
            [0.006, -0.015],  // A
            [0, -0.021],      // X
            [0, -0.009]       // B
        ].forEach(([bx, bz]) => {
            const btn = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.004, 8), btnMat);
            btn.position.set(0.028 + bx, 0.027, bz);
            ctrlGroup.add(btn);
        });

        // 4 Petites LEDs vertes de joueur
        [-0.012, -0.004, 0.004, 0.012].forEach((lx, lIdx) => {
            const led = new THREE.Mesh(new THREE.BoxGeometry(0.002, 0.002, 0.002), lIdx === 0 ? new THREE.MeshBasicMaterial({ color: 0x00e676 }) : new THREE.MeshBasicMaterial({ color: 0x112211 }));
            led.position.set(lx, 0.027, 0.032);
            ctrlGroup.add(led);
        });
    });
}

export function buildHumanPNJ3D(group, w, d, colorHex, el) {
    const id = (el?.id || '').toLowerCase();
    const isSecurity = id.includes('security') || id.includes('securite');
    const isTech = id.includes('tech') || id.includes('regie');
    const isSpeaker = id.includes('speaker') || id.includes('orateur') || id.includes('presentateur');
    const isSeated = id.includes('seated') || id.includes('assis');

    // Materials
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xdca88c, roughness: 0.65 });
    const hairMat = new THREE.MeshStandardMaterial({ color: 0x241d1a, roughness: 0.8 });
    const shoesMat = new THREE.MeshStandardMaterial({ color: 0x141619, roughness: 0.7 });

    let pantsColor = 0x28374d; // Blue jeans/chinos
    let shirtColor = colorHex || 0x3d70b2;

    if (isSecurity) {
        pantsColor = 0x14161a;
        shirtColor = 0xd4e600; // Fluorescent safety yellow/lime
    } else if (isTech) {
        pantsColor = 0x151618;
        shirtColor = 0x151618; // Full stagehand crew black
    } else if (isSpeaker) {
        pantsColor = 0x22252e;
        shirtColor = 0x1f232b; // Dark tailored suit blazer
    }

    const pantsMat = new THREE.MeshStandardMaterial({ color: pantsColor, roughness: 0.7 });
    const shirtMat = new THREE.MeshStandardMaterial({ color: shirtColor, roughness: 0.6 });
    const whiteShirtMat = new THREE.MeshStandardMaterial({ color: 0xf5f7fa, roughness: 0.4 });
    const reflectiveMat = new THREE.MeshStandardMaterial({ color: 0xe0e6ed, roughness: 0.1, metalness: 0.8 });

    if (isSeated) {
        // ─── SEATED PNJ (Sitting on chair/bench) ───
        const seatH = 0.45;
        // Shoes
        [-0.09, 0.09].forEach(sx => {
            const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.06, 0.16), shoesMat);
            shoe.position.set(sx, 0.03, 0.32);
            group.add(shoe);

            // Vertical lower legs
            const calf = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.04, seatH - 0.04, 10), pantsMat);
            calf.position.set(sx, seatH / 2, 0.30);
            group.add(calf);

            // Horizontal thighs
            const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.048, 0.34, 10), pantsMat);
            thigh.rotation.x = Math.PI / 2;
            thigh.position.set(sx, seatH + 0.02, 0.15);
            group.add(thigh);
        });

        // Pelvis
        const pelvis = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.12, 0.22), pantsMat);
        pelvis.position.set(0, seatH + 0.05, 0);
        group.add(pelvis);

        // Torso
        const torso = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.48, 0.20), shirtMat);
        torso.position.set(0, seatH + 0.32, 0);
        group.add(torso);

        // Neck & Head
        const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.045, 0.07, 10), skinMat);
        neck.position.set(0, seatH + 0.58, 0);
        group.add(neck);

        const head = new THREE.Mesh(new THREE.SphereGeometry(0.095, 16, 14), skinMat);
        head.position.set(0, seatH + 0.70, 0);
        group.add(head);

        const hair = new THREE.Mesh(new THREE.SphereGeometry(0.10, 16, 14, 0, Math.PI * 2, 0, Math.PI * 0.55), hairMat);
        hair.position.set(0, seatH + 0.71, -0.01);
        group.add(hair);

        // Arms resting on thighs
        [-0.18, 0.18].forEach(ax => {
            const arm = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.035, 0.36, 8), shirtMat);
            arm.position.set(ax, seatH + 0.34, 0.08);
            arm.rotation.x = 0.45;
            group.add(arm);
        });

    } else {
        // ─── STANDING PNJ (Realistic 1.75m silhouette) ───
        // 1. Shoes
        [-0.09, 0.09].forEach(sx => {
            const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.06, 0.20), shoesMat);
            shoe.position.set(sx, 0.03, 0.02);
            group.add(shoe);
        });

        // 2. Legs (Pants)
        const legH = 0.74;
        const legGeo = new THREE.CylinderGeometry(0.052, 0.044, legH, 10);
        [-0.09, 0.09].forEach(lx => {
            const leg = new THREE.Mesh(legGeo, pantsMat);
            leg.position.set(lx, legH / 2 + 0.06, 0);
            group.add(leg);
        });

        // 3. Pelvis & Belt
        const pelvis = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.12, 0.19), pantsMat);
        pelvis.position.set(0, 0.84, 0);
        group.add(pelvis);

        const belt = new THREE.Mesh(new THREE.BoxGeometry(0.31, 0.035, 0.20), new THREE.MeshStandardMaterial({ color: 0x111111 }));
        belt.position.set(0, 0.89, 0);
        group.add(belt);

        // 4. Torso
        const torsoH = 0.52;
        const torso = new THREE.Mesh(new THREE.BoxGeometry(0.34, torsoH, 0.21), shirtMat);
        torso.position.set(0, 0.89 + torsoH / 2, 0);
        group.add(torso);

        // Security details (high-vis reflective bands & radio badge)
        if (isSecurity) {
            // Horizontal reflective tape on chest and back
            const strip1 = new THREE.Mesh(new THREE.BoxGeometry(0.345, 0.04, 0.215), reflectiveMat);
            strip1.position.set(0, 1.05, 0);
            group.add(strip1);

            const strip2 = new THREE.Mesh(new THREE.BoxGeometry(0.345, 0.04, 0.215), reflectiveMat);
            strip2.position.set(0, 1.25, 0);
            group.add(strip2);

            // Radio walkie-talkie clip on left chest
            const radio = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.07, 0.03), new THREE.MeshStandardMaterial({ color: 0x0f1114 }));
            radio.position.set(-0.11, 1.30, 0.11);
            group.add(radio);

            const antenna = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.08, 6), new THREE.MeshStandardMaterial({ color: 0x000000 }));
            antenna.position.set(-0.12, 1.37, 0.11);
            group.add(antenna);
        }

        // Speaker details (White dress shirt collar, tie, and microphone held in hand)
        if (isSpeaker) {
            const collar = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.10, 0.02), whiteShirtMat);
            collar.position.set(0, 1.38, 0.107);
            group.add(collar);

            const tie = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.24, 0.015), new THREE.MeshStandardMaterial({ color: 0x881111 }));
            tie.position.set(0, 1.25, 0.113);
            group.add(tie);
        }

        // Tech details (Headset & comms pack)
        if (isTech) {
            const commPack = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.09, 0.03), new THREE.MeshStandardMaterial({ color: 0x22262d }));
            commPack.position.set(0.16, 0.88, 0);
            group.add(commPack);
        }

        // 5. Neck & Head
        const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.046, 0.08, 10), skinMat);
        neck.position.set(0, 1.44, 0);
        group.add(neck);

        const head = new THREE.Mesh(new THREE.SphereGeometry(0.098, 18, 14), skinMat);
        head.position.set(0, 1.57, 0);
        group.add(head);

        const hair = new THREE.Mesh(new THREE.SphereGeometry(0.103, 18, 14, 0, Math.PI * 2, 0, Math.PI * 0.55), hairMat);
        hair.position.set(0, 1.58, -0.01);
        group.add(hair);

        // Tech Intercom Headset on head
        if (isTech) {
            const bandMat = new THREE.MeshStandardMaterial({ color: 0x1f2228, metalness: 0.8 });
            const headBand = new THREE.Mesh(new THREE.TorusGeometry(0.102, 0.01, 8, 18, Math.PI), bandMat);
            headBand.rotation.z = Math.PI;
            headBand.rotation.x = Math.PI / 2;
            headBand.position.set(0, 1.62, 0);
            group.add(headBand);

            // Ear cup
            const earCup = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.02, 10), bandMat);
            earCup.rotation.z = Math.PI / 2;
            earCup.position.set(0.10, 1.57, 0);
            group.add(earCup);

            // Boom microphone curving to mouth
            const boom = new THREE.Mesh(new THREE.CylinderGeometry(0.003, 0.003, 0.10, 6), bandMat);
            boom.rotation.z = -0.5;
            boom.rotation.x = 0.5;
            boom.position.set(0.08, 1.53, 0.06);
            group.add(boom);
        }

        // 6. Arms & Hands
        const armH = 0.58;
        const armGeo = new THREE.CylinderGeometry(0.042, 0.038, armH, 8);
        const handGeo = new THREE.SphereGeometry(0.038, 8, 8);

        // Left arm (standing naturally at side)
        const leftArm = new THREE.Mesh(armGeo, shirtMat);
        leftArm.position.set(-0.21, 1.15, 0);
        group.add(leftArm);

        const leftHand = new THREE.Mesh(handGeo, skinMat);
        leftHand.position.set(-0.21, 0.83, 0);
        group.add(leftHand);

        // Right arm
        if (isSpeaker) {
            // Speaker holding microphone up
            const rightArmUpper = new THREE.Mesh(new THREE.CylinderGeometry(0.042, 0.038, 0.30, 8), shirtMat);
            rightArmUpper.rotation.x = 0.45;
            rightArmUpper.position.set(0.20, 1.25, 0.08);
            group.add(rightArmUpper);

            const rightArmFore = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.035, 0.28, 8), shirtMat);
            rightArmFore.rotation.x = 1.35;
            rightArmFore.position.set(0.18, 1.28, 0.22);
            group.add(rightArmFore);

            const micHandle = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.01, 0.16, 8), new THREE.MeshStandardMaterial({ color: 0x111111 }));
            micHandle.rotation.x = 0.4;
            micHandle.position.set(0.16, 1.38, 0.26);
            group.add(micHandle);

            const micBall = new THREE.Mesh(new THREE.SphereGeometry(0.022, 10, 8), new THREE.MeshStandardMaterial({ color: 0xc4cbd4, metalness: 0.9 }));
            micBall.position.set(0.16, 1.44, 0.28);
            group.add(micBall);

        } else {
            // Regular right arm at side
            const rightArm = new THREE.Mesh(armGeo, shirtMat);
            rightArm.position.set(0.21, 1.15, 0);
            group.add(rightArm);

            const rightHand = new THREE.Mesh(handGeo, skinMat);
            rightHand.position.set(0.21, 0.83, 0);
            group.add(rightHand);
        }
    }
}

export function buildComputerDevice3D(group, w, d, colorHex, el) {
    const id = (el?.id || '').toLowerCase();
    if (id.includes('gamer')) {
        buildGamerPCTower3D(group, w, d, colorHex, el);
        return;
    }

    const isDesktop = id.includes('desktop') || id.includes('tour') || id.includes('station');
    const metalMat = new THREE.MeshStandardMaterial({ color: 0x1f232b, roughness: 0.35, metalness: 0.8 });
    const darkPlast = new THREE.MeshStandardMaterial({ color: 0x121418, roughness: 0.6 });
    const screenMat = new THREE.MeshBasicMaterial({ color: 0x0091ff }); // Luminous GUI display glow

    if (isDesktop) {
        // ─── DESKTOP WORKSTATION (Monitor + Stand + Keyboard + Mouse + Tower) ───
        const standH = 0.18;
        const scrW = 0.58;
        const scrH = 0.34;

        // 1. Widescreen 27" Monitor
        const monitorGroup = new THREE.Group();
        monitorGroup.position.set(0, 0, 0);
        group.add(monitorGroup);

        // Screen stand base
        const basePlate = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.015, 20), metalMat);
        basePlate.position.set(0, 0.008, 0);
        monitorGroup.add(basePlate);

        // Articulated neck
        const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, standH + scrH / 2, 10), metalMat);
        neck.position.set(0, (standH + scrH / 2) / 2, -0.04);
        monitorGroup.add(neck);

        // Screen frame
        const frame = new THREE.Mesh(new THREE.BoxGeometry(scrW, scrH, 0.02), darkPlast);
        frame.position.set(0, standH + scrH / 2, 0);
        monitorGroup.add(frame);

        // Glowing display panel
        const panel = new THREE.Mesh(new THREE.PlaneGeometry(scrW - 0.025, scrH - 0.025), screenMat);
        panel.position.set(0, standH + scrH / 2, 0.011);
        monitorGroup.add(panel);

        // 2. Keyboard
        const kbW = 0.42;
        const kbD = 0.13;
        const keyboard = new THREE.Mesh(new THREE.BoxGeometry(kbW, 0.012, kbD), metalMat);
        keyboard.position.set(0, 0.006, 0.18);
        group.add(keyboard);

        const keys = new THREE.Mesh(new THREE.BoxGeometry(kbW - 0.02, 0.004, kbD - 0.02), darkPlast);
        keys.position.set(0, 0.014, 0.18);
        group.add(keys);

        // 3. Mouse & Mousepad
        const pad = new THREE.Mesh(new THREE.PlaneGeometry(0.20, 0.18), new THREE.MeshStandardMaterial({ color: 0x1a2130, roughness: 0.9 }));
        pad.rotation.x = -Math.PI / 2;
        pad.position.set(0.30, 0.001, 0.18);
        group.add(pad);

        const mouse = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.025, 0.10), darkPlast);
        mouse.position.set(0.30, 0.013, 0.18);
        group.add(mouse);

        // 4. ATX PC Tower Unit
        const towerW = 0.18;
        const towerH = 0.42;
        const towerD = 0.40;
        const tower = new THREE.Mesh(new THREE.BoxGeometry(towerW, towerH, towerD), metalMat);
        tower.position.set(-0.42, towerH / 2, 0);
        group.add(tower);

        // Front RGB/status light on tower
        const led = new THREE.Mesh(new THREE.BoxGeometry(towerW - 0.04, 0.015, 0.005), new THREE.MeshBasicMaterial({ color: 0x00e1ff }));
        led.position.set(-0.42, towerH * 0.85, towerD / 2 + 0.003);
        group.add(led);

    } else {
        // ─── LAPTOP (Ordinateur Portable Régie) ───
        const lapW = 0.36;
        const lapD = 0.25;
        const lapH = 0.014;

        // 1. Lower chassis / base body
        const base = new THREE.Mesh(new THREE.BoxGeometry(lapW, lapH, lapD), metalMat);
        base.position.set(0, lapH / 2, 0);
        group.add(base);

        // Keyboard area
        const kbArea = new THREE.Mesh(new THREE.BoxGeometry(lapW * 0.88, 0.002, lapD * 0.48), darkPlast);
        kbArea.position.set(0, lapH + 0.001, -lapD * 0.14);
        group.add(kbArea);

        // Trackpad
        const trackpad = new THREE.Mesh(new THREE.BoxGeometry(lapW * 0.32, 0.001, lapD * 0.28), new THREE.MeshStandardMaterial({ color: 0x2e3540, roughness: 0.3 }));
        trackpad.position.set(0, lapH + 0.001, lapD * 0.28);
        group.add(trackpad);

        // 2. Open Screen Lid (Angled back 110°)
        const screenGroup = new THREE.Group();
        screenGroup.position.set(0, lapH, -lapD / 2);
        screenGroup.rotation.x = -0.38; // Tilted back
        group.add(screenGroup);

        const lidH = lapD * 0.95;
        const lid = new THREE.Mesh(new THREE.BoxGeometry(lapW, lidH, 0.008), metalMat);
        lid.position.set(0, lidH / 2, 0);
        screenGroup.add(lid);

        // Glowing screen panel
        const panel = new THREE.Mesh(new THREE.PlaneGeometry(lapW * 0.92, lidH * 0.88), screenMat);
        panel.position.set(0, lidH / 2, 0.005);
        screenGroup.add(panel);

        // Tiny webcam dot
        const cam = new THREE.Mesh(new THREE.CircleGeometry(0.003, 8), new THREE.MeshBasicMaterial({ color: 0x00ff88 }));
        cam.position.set(0, lidH * 0.96, 0.005);
        screenGroup.add(cam);
    }
}

export function buildGamerPCTower3D(group, w, d, colorHex, el) {
    const isSetup = el?.id?.includes('setup');
    const caseW = 0.22;
    const caseH = 0.48;
    const caseD = 0.45;

    const darkAlu = new THREE.MeshStandardMaterial({ color: 0x121418, roughness: 0.35, metalness: 0.85 });
    const darkMesh = new THREE.MeshStandardMaterial({ color: 0x1a1e24, roughness: 0.7 });
    const glassMat = new THREE.MeshStandardMaterial({ 
        color: 0x0c1018, 
        transparent: true, 
        opacity: 0.45, 
        roughness: 0.08, 
        metalness: 0.9,
        side: THREE.DoubleSide
    });

    // ARGB LED Materials
    const rgbCyan = new THREE.MeshBasicMaterial({ color: 0x00f0ff });
    const rgbMagenta = new THREE.MeshBasicMaterial({ color: 0xff0088 });
    const rgbPurple = new THREE.MeshBasicMaterial({ color: 0xa820ff });

    const towerGroup = new THREE.Group();
    towerGroup.position.set(isSetup ? 0.38 : 0, 0, 0);
    group.add(towerGroup);

    // 1. Chassis Outer Base & Feet
    const baseFeetGeo = new THREE.BoxGeometry(caseW, 0.02, 0.05);
    [-caseD / 2 + 0.05, caseD / 2 - 0.05].forEach(fz => {
        const foot = new THREE.Mesh(baseFeetGeo, darkAlu);
        foot.position.set(0, 0.01, fz);
        towerGroup.add(foot);
    });

    // Bottom, Top, Back Panels
    const botPanel = new THREE.Mesh(new THREE.BoxGeometry(caseW, 0.015, caseD), darkAlu);
    botPanel.position.set(0, 0.027, 0);
    towerGroup.add(botPanel);

    const topPanel = new THREE.Mesh(new THREE.BoxGeometry(caseW, 0.015, caseD), darkAlu);
    topPanel.position.set(0, caseH - 0.008, 0);
    towerGroup.add(topPanel);

    const backPanel = new THREE.Mesh(new THREE.BoxGeometry(caseW, caseH - 0.04, 0.015), darkAlu);
    backPanel.position.set(0, caseH / 2, -caseD / 2 + 0.008);
    towerGroup.add(backPanel);

    // Right side metal door
    const rightPanel = new THREE.Mesh(new THREE.BoxGeometry(0.012, caseH - 0.04, caseD - 0.02), darkAlu);
    rightPanel.position.set(caseW / 2 - 0.006, caseH / 2, 0);
    towerGroup.add(rightPanel);

    // Left side: TEMPERED GLASS PANEL (Verre trempé translucide laissant voir l'intérieur)
    const glass = new THREE.Mesh(new THREE.BoxGeometry(0.006, caseH - 0.04, caseD - 0.02), glassMat);
    glass.position.set(-caseW / 2 + 0.003, caseH / 2, 0);
    towerGroup.add(glass);

    // Thumbscrews on glass corners
    const screwGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.008, 8);
    screwGeo.rotateZ(Math.PI / 2);
    [[-caseD / 2 + 0.03, 0.06], [caseD / 2 - 0.03, 0.06], [-caseD / 2 + 0.03, caseH - 0.06], [caseD / 2 - 0.03, caseH - 0.06]].forEach(([sz, sy]) => {
        const screw = new THREE.Mesh(screwGeo, darkAlu);
        screw.position.set(-caseW / 2, sy, sz);
        towerGroup.add(screw);
    });

    // 2. Power Supply Shroud
    const shroud = new THREE.Mesh(new THREE.BoxGeometry(caseW - 0.02, 0.09, caseD - 0.04), darkAlu);
    shroud.position.set(0.005, 0.065, 0);
    towerGroup.add(shroud);

    // 3. Motherboard PCB inside
    const mobo = new THREE.Mesh(new THREE.BoxGeometry(0.005, 0.28, 0.26), new THREE.MeshStandardMaterial({ color: 0x11161d, roughness: 0.6 }));
    mobo.position.set(caseW / 2 - 0.025, 0.26, -0.02);
    towerGroup.add(mobo);

    // 4. Graphics Card (GPU) with illuminated ARGB edge
    const gpu = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.045, 0.24), darkAlu);
    gpu.position.set(0.03, 0.22, 0.01);
    towerGroup.add(gpu);

    const gpuRgb = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.015, 0.22), rgbCyan);
    gpuRgb.position.set(-0.018, 0.22, 0.01);
    towerGroup.add(gpuRgb);

    // 5. Watercooling AIO CPU Block with circular RGB Halo
    const aioBlock = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.02, 16), darkAlu);
    aioBlock.rotation.z = Math.PI / 2;
    aioBlock.position.set(caseW / 2 - 0.045, 0.31, -0.04);
    towerGroup.add(aioBlock);

    const aioRing = new THREE.Mesh(new THREE.TorusGeometry(0.02, 0.004, 8, 20), rgbMagenta);
    aioRing.rotation.y = Math.PI / 2;
    aioRing.position.set(caseW / 2 - 0.056, 0.31, -0.04);
    towerGroup.add(aioRing);

    // 6. Glowing ARGB RAM Sticks
    [-0.01, 0.005].forEach((rz, idx) => {
        const ram = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.04, 0.008), idx === 0 ? rgbPurple : rgbCyan);
        ram.position.set(caseW / 2 - 0.04, 0.32, rz);
        towerGroup.add(ram);
    });

    // 7. FRONT PANEL with 3 Triple 120mm ARGB Fans (Ventilateurs ARGB en façade)
    const frontPanel = new THREE.Mesh(new THREE.BoxGeometry(caseW, caseH - 0.04, 0.02), darkMesh);
    frontPanel.position.set(0, caseH / 2, caseD / 2 - 0.01);
    towerGroup.add(frontPanel);

    const fanColors = [rgbCyan, rgbMagenta, rgbPurple];
    [-0.11, 0.01, 0.13].forEach((fy, idx) => {
        const fanRing = new THREE.Mesh(new THREE.TorusGeometry(0.045, 0.006, 8, 24), fanColors[idx]);
        fanRing.position.set(0, caseH / 2 + fy, caseD / 2 + 0.002);
        towerGroup.add(fanRing);

        const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.015, 0.015, 0.005, 12), darkAlu);
        hub.rotation.x = Math.PI / 2;
        hub.position.set(0, caseH / 2 + fy, caseD / 2 + 0.003);
        towerGroup.add(hub);
    });

    // Rear 120mm exhaust fan with ARGB
    const rearFan = new THREE.Mesh(new THREE.TorusGeometry(0.042, 0.005, 8, 24), rgbCyan);
    rearFan.position.set(0.02, caseH - 0.12, -caseD / 2 + 0.018);
    towerGroup.add(rearFan);

    // Top power button with ARGB ring
    const pwrBtn = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.006, 0.005, 12), rgbCyan);
    pwrBtn.position.set(caseW / 2 - 0.03, caseH, caseD / 2 - 0.04);
    towerGroup.add(pwrBtn);

    // 8. If SETUP GAMER: Add 34" Curved Ultrawide Display, RGB Keyboard & Mouse
    if (isSetup) {
        const monW = 0.82;
        const monH = 0.38;
        const monGroup = new THREE.Group();
        monGroup.position.set(-0.16, 0, 0);
        group.add(monGroup);

        // Base stand
        const baseStand = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.015, 24), darkAlu);
        baseStand.position.set(0, 0.008, -0.05);
        monGroup.add(baseStand);

        const neck = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.28, 0.04), darkAlu);
        neck.position.set(0, 0.14, -0.08);
        neck.rotation.x = 0.1;
        monGroup.add(neck);

        // Screen frame
        const monFrame = new THREE.Mesh(new THREE.BoxGeometry(monW, monH, 0.02), darkAlu);
        monFrame.position.set(0, 0.30, 0);
        monGroup.add(monFrame);

        // Glowing display wallpaper
        const screenPanel = new THREE.Mesh(new THREE.PlaneGeometry(monW - 0.025, monH - 0.025), new THREE.MeshBasicMaterial({ color: 0x00d2ff }));
        screenPanel.position.set(0, 0.30, 0.011);
        monGroup.add(screenPanel);

        // RGB Mechanical Keyboard
        const kb = new THREE.Mesh(new THREE.BoxGeometry(0.44, 0.014, 0.14), darkAlu);
        kb.position.set(-0.16, 0.007, 0.22);
        group.add(kb);

        const keys = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.006, 0.12), new THREE.MeshBasicMaterial({ color: 0x221133 }));
        keys.position.set(-0.16, 0.016, 0.22);
        group.add(keys);

        // Gaming Mouse & Pad with RGB edge
        const pad = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.003, 0.26), new THREE.MeshStandardMaterial({ color: 0x141820, roughness: 0.9 }));
        pad.position.set(-0.10, 0.002, 0.22);
        group.add(pad);

        const mouse = new THREE.Mesh(new THREE.BoxGeometry(0.065, 0.028, 0.11), darkAlu);
        mouse.position.set(0.18, 0.015, 0.22);
        group.add(mouse);

        const mouseRgb = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.004, 0.06), rgbMagenta);
        mouseRgb.position.set(0.18, 0.029, 0.22);
        group.add(mouseRgb);
    }
}
