/* ================================================================
   ScenoPlan — 3D Engine (Three.js)
   Full 3D visualization of stage layouts, architectural walls,
   instanced chair rows, and detailed event furniture models.
   ================================================================ */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createProceduralFloorTexture } from './floor-textures.js';
import {
    isStandardChairElement,
    buildInstancedChairBatches,
    expandInstancedMeshesForExport
} from './chair-instancing.js';
import {
    to3DCoords,
    create3DZone,
    create3DWall,
    buildPartition3D,
    buildPartitionCorner3D
} from './builders/architecture.js';
import {
    buildVaubanBarrier3D,
    buildHerasFence3D,
    buildBackdrop3D,
    buildStage3D,
    buildPodiumLutrin3D,
    buildRectTable3D,
    buildRoundTable3D,
    buildChair3D,
    buildArmchairSofa3D,
    buildBench3D,
    buildPouf3D,
    buildStandExpo3D,
    buildTotem3D,
    buildTent3D,
    buildTruss3D,
    buildTechDesk3D,
    buildBuffetBar3D,
    buildSpeaker3D,
    buildFloorSpeakerWedge3D,
    buildGenerator3D,
    buildDistributionBox3D,
    buildPlant3D,
    buildLedScreen3D,
    buildFlagOriflamme3D,
    buildEasel3D,
    buildMobileToilet3D,
    buildExtinguisher3D,
    buildJerseyBlock3D,
    buildCone3D,
    buildBeltStanchions3D,
    buildArcDesk3D,
    buildVehicle3D,
    buildGenericStyledPiece
} from './builders/furniture.js';
import {
    buildLyreMovingHead3D,
    buildParLightStand3D,
    buildFollowspot3D,
    buildSpotlightFixture3D
} from './builders/lighting.js';
import {
    buildHumanPNJ3D,
    buildComputerDevice3D,
    buildTvSwitchStand3D
} from './builders/characters-and-tech.js';

export class ThreeEngine {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.lights = {};
        this.furnitureGroup = null;
        this.stageFloorGroup = null;
        this.wallGroup = null;
        this.zoneGroup = null;
        this.lightingMode = 'studio'; // 'studio' | 'night'
        this.isInitialized = false;
        this.animationFrameId = null;

        // Scene floor properties
        this.floorType = 'studio'; // 'studio' | 'parquet' | 'carpet-red' | 'carpet-blue' | 'concrete' | 'grass'
        this.stageFloorMesh = null;
        this.gridHelperMesh = null;
        this.sceneWidth = 30;
        this.sceneHeight = 20;

        // Live Show DMX Simulation
        this.isLiveShow = false;
        this.liveFixtures = [];

        // Mode Visite Immersive (First-Person ZQSD)
        this.isWalkMode = false;
        this.walkKeys = { forward: false, backward: false, left: false, right: false };
        this.walkEuler = new THREE.Euler(0, 0, 0, 'YXZ');
        this.isMouseDown = false;
        this.prevMousePos = { x: 0, y: 0 };
        this.lastTime = performance.now();

        // Interactive raycaster
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.tooltipEl = null;

        this.init();
    }

    init() {
        if (this.isInitialized) return;

        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x111317);
        this.scene.fog = new THREE.FogExp2(0x111317, 0.012);

        const aspect = this.container.clientWidth / this.container.clientHeight || 1;
        this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
        this.camera.position.set(0, 16, 24);

        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: false,
            powerPreference: 'high-performance',
            preserveDrawingBuffer: true
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.15;

        this.container.appendChild(this.renderer.domElement);

        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.06;
        this.controls.screenSpacePanning = true;
        this.controls.maxPolarAngle = Math.PI / 2 - 0.02;
        this.controls.minDistance = 2;
        this.controls.maxDistance = 160;
        this.controls.target.set(0, 0, 0);

        this.stageFloorGroup = new THREE.Group();
        this.scene.add(this.stageFloorGroup);

        this.zoneGroup = new THREE.Group();
        this.scene.add(this.zoneGroup);

        this.furnitureGroup = new THREE.Group();
        this.scene.add(this.furnitureGroup);

        this.wallGroup = new THREE.Group();
        this.scene.add(this.wallGroup);

        this.setupLighting();
        this.createTooltip();

        window.addEventListener('resize', () => this.onWindowResize());
        this.renderer.domElement.addEventListener('mousemove', (e) => {
            this.onMouseMove(e);
            this.onWalkMouseMove(e);
        });
        this.renderer.domElement.addEventListener('mousedown', (e) => this.onWalkMouseDown(e));
        window.addEventListener('mouseup', () => this.onWalkMouseUp());
        this.renderer.domElement.addEventListener('mouseleave', () => {
            this.hideTooltip();
            this.onWalkMouseUp();
        });

        window.addEventListener('keydown', (e) => this.onWalkKeyDown(e));
        window.addEventListener('keyup', (e) => this.onWalkKeyUp(e));

        this.isInitialized = true;
        this.animate();
    }

    createTooltip() {
        this.tooltipEl = document.createElement('div');
        this.tooltipEl.className = 'three-tooltip';
        this.tooltipEl.style.display = 'none';
        this.container.appendChild(this.tooltipEl);
    }

    setupLighting() {
        this.lights.ambient = new THREE.AmbientLight(0xffffff, 0.7);
        this.scene.add(this.lights.ambient);

        this.lights.dirLight = new THREE.DirectionalLight(0xfff7ee, 1.5);
        this.lights.dirLight.position.set(18, 28, 20);
        this.lights.dirLight.castShadow = true;
        this.lights.dirLight.shadow.mapSize.width = 2048;
        this.lights.dirLight.shadow.mapSize.height = 2048;
        this.lights.dirLight.shadow.camera.near = 0.5;
        this.lights.dirLight.shadow.camera.far = 120;
        const d = 35;
        this.lights.dirLight.shadow.camera.left = -d;
        this.lights.dirLight.shadow.camera.right = d;
        this.lights.dirLight.shadow.camera.top = d;
        this.lights.dirLight.shadow.camera.bottom = -d;
        this.lights.dirLight.shadow.bias = -0.0004;
        this.scene.add(this.lights.dirLight);

        this.lights.fillLight = new THREE.DirectionalLight(0x9bc2ff, 0.5);
        this.lights.fillLight.position.set(-18, 20, -18);
        this.scene.add(this.lights.fillLight);

        this.lights.spot1 = new THREE.SpotLight(0x3377ff, 0, 45, Math.PI / 5, 0.35, 1);
        this.lights.spot1.position.set(-12, 16, 12);
        this.scene.add(this.lights.spot1);

        this.lights.spot2 = new THREE.SpotLight(0xff4422, 0, 45, Math.PI / 5, 0.35, 1);
        this.lights.spot2.position.set(12, 16, 12);
        this.scene.add(this.lights.spot2);
    }

    setLightingMode(mode) {
        this.lightingMode = mode;
        if (mode === 'night') {
            this.scene.background.set(0x07080b);
            this.scene.fog.color.set(0x07080b);
            this.lights.ambient.intensity = 0.22;
            this.lights.dirLight.intensity = 0.4;
            this.lights.dirLight.color.set(0x8fa3c7);
            this.lights.fillLight.intensity = 0.15;
            this.lights.spot1.intensity = 8.5;
            this.lights.spot2.intensity = 7.5;
        } else {
            this.scene.background.set(0x111317);
            this.scene.fog.color.set(0x111317);
            this.lights.ambient.intensity = 0.7;
            this.lights.dirLight.intensity = 1.5;
            this.lights.dirLight.color.set(0xfff7ee);
            this.lights.fillLight.intensity = 0.5;
            this.lights.spot1.intensity = 0;
            this.lights.spot2.intensity = 0;
        }
    }

    buildFloor(sceneWidth = 30, sceneHeight = 20) {
        this.clearGroup(this.stageFloorGroup);
        this.sceneWidth = sceneWidth;
        this.sceneHeight = sceneHeight;

        const groundGeo = new THREE.PlaneGeometry(300, 300);
        const groundMat = new THREE.MeshStandardMaterial({
            color: 0x0c0e12,
            roughness: 0.95,
            metalness: 0.05
        });
        const ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -0.02;
        ground.receiveShadow = true;
        this.stageFloorGroup.add(ground);

        const stageGeo = new THREE.BoxGeometry(sceneWidth, 0.04, sceneHeight);
        const stageMat = new THREE.MeshStandardMaterial({
            color: 0x1a1d24,
            roughness: 0.7,
            metalness: 0.15
        });
        this.stageFloorMesh = new THREE.Mesh(stageGeo, stageMat);
        this.stageFloorMesh.position.set(0, -0.02, 0);
        this.stageFloorMesh.receiveShadow = true;
        this.stageFloorGroup.add(this.stageFloorMesh);

        this.gridHelperMesh = new THREE.GridHelper(Math.max(sceneWidth, sceneHeight), Math.max(sceneWidth, sceneHeight), 0x3d4454, 0x222630);
        this.gridHelperMesh.position.y = 0.002;
        this.stageFloorGroup.add(this.gridHelperMesh);

        const borderGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(sceneWidth, 0.05, sceneHeight));
        const borderMat = new THREE.LineBasicMaterial({ color: 0x5b73ff, linewidth: 2 });
        const borderLine = new THREE.LineSegments(borderGeo, borderMat);
        borderLine.position.y = -0.01;
        this.stageFloorGroup.add(borderLine);

        this.applyFloorTexture();
    }

    setFloorTexture(type) {
        this.floorType = type;
        this.applyFloorTexture();
    }

    applyFloorTexture() {
        if (!this.stageFloorMesh) return;

        const w = this.sceneWidth || 30;
        const h = this.sceneHeight || 20;

        if (this.floorType === 'studio') {
            this.stageFloorMesh.material.map = null;
            this.stageFloorMesh.material.color.set(0x1a1d24);
            this.stageFloorMesh.material.roughness = 0.7;
            this.stageFloorMesh.material.metalness = 0.15;
            this.stageFloorMesh.material.needsUpdate = true;
            if (this.gridHelperMesh) this.gridHelperMesh.visible = true;
            return;
        }

        const texture = createProceduralFloorTexture(this.floorType, w, h);
        if (texture) {
            this.stageFloorMesh.material.map = texture;
            this.stageFloorMesh.material.color.set(0xffffff);

            if (this.floorType === 'parquet') {
                this.stageFloorMesh.material.roughness = 0.32;
                this.stageFloorMesh.material.metalness = 0.08;
            } else if (this.floorType.startsWith('carpet')) {
                this.stageFloorMesh.material.roughness = 0.95;
                this.stageFloorMesh.material.metalness = 0.0;
            } else if (this.floorType === 'concrete') {
                this.stageFloorMesh.material.roughness = 0.65;
                this.stageFloorMesh.material.metalness = 0.12;
            } else if (this.floorType === 'grass') {
                this.stageFloorMesh.material.roughness = 0.92;
                this.stageFloorMesh.material.metalness = 0.0;
            }

            this.stageFloorMesh.material.needsUpdate = true;
            if (this.gridHelperMesh) this.gridHelperMesh.visible = false;
        }
    }

    /**
     * Synchronizes 2D elements from the canvas engine into 3D objects,
     * batching multiple standard chairs into THREE.InstancedMesh draw calls.
     */
    syncFrom2D(canvasEngine) {
        if (!this.isInitialized) this.init();

        const sceneW = canvasEngine.sceneWidth || 30;
        const sceneH = canvasEngine.sceneHeight || 20;

        this.buildFloor(sceneW, sceneH);

        this.liveFixtures = [];
        this.clearGroup(this.zoneGroup);
        this.clearGroup(this.furnitureGroup);
        this.clearGroup(this.wallGroup);

        const elements = canvasEngine.elements || [];
        const chairElements = [];

        elements.forEach(el => {
            if (el.hidden) return;
            if (this.isZoneElement(el)) {
                create3DZone(el, sceneW, sceneH, this.zoneGroup);
            } else if (this.isWallElement(el)) {
                create3DWall(el, sceneW, sceneH, this.wallGroup);
            } else if (el.isText) {
                // Text marker omitted in 3D
            } else if (isStandardChairElement(el)) {
                chairElements.push(el);
            } else {
                this.create3DFurniture(el, sceneW, sceneH, elements);
            }
        });

        if (chairElements.length > 0) {
            const { batchedGroups, unbatchedElements } = buildInstancedChairBatches(
                chairElements,
                (chairEl) => this.computeElementElevation(chairEl, elements),
                (x, y, w, h, sw, sh) => this.to3DCoords(x, y, w, h, sw, sh),
                sceneW,
                sceneH
            );
            batchedGroups.forEach(group => this.furnitureGroup.add(group));
            unbatchedElements.forEach(el => this.create3DFurniture(el, sceneW, sceneH, elements));
        }

        this.lights.spot1.target.position.set(0, 0, 0);
        this.lights.spot2.target.position.set(0, 0, 0);
        this.scene.add(this.lights.spot1.target);
        this.scene.add(this.lights.spot2.target);
    }

    isZoneElement(el) {
        return el.isZone === true ||
               el.id === 'zone' ||
               el.shape === 'carpet' ||
               el.category === 'zone' ||
               (typeof el.name === 'string' && el.name.toLowerCase().startsWith('zone'));
    }

    isWallElement(el) {
        return el.isWall === true ||
               el.id === 'wall' ||
               el.category === 'walls' ||
               (typeof el.name === 'string' && el.name.toLowerCase().startsWith('mur'));
    }

    clearGroup(group) {
        while (group.children.length > 0) {
            const child = group.children[0];
            group.remove(child);
            child.traverse((obj) => {
                if (obj.geometry) obj.geometry.dispose();
                if (obj.material) {
                    if (Array.isArray(obj.material)) obj.material.forEach(m => m.dispose());
                    else obj.material.dispose();
                }
                if (obj.isInstancedMesh && typeof obj.dispose === 'function') {
                    obj.dispose();
                }
            });
        }
    }

    to3DCoords(x, y, width, height, sceneW, sceneH) {
        return to3DCoords(x, y, width, height, sceneW, sceneH);
    }

    computeElementElevation(el, allElements = []) {
        if (el.elevation !== undefined && el.elevation !== null && !isNaN(el.elevation)) {
            return Math.max(0, parseFloat(el.elevation));
        }

        const id = (el.id || '').toLowerCase();
        const cat = (el.category || '').toLowerCase();
        const shape = (el.shape || '').toLowerCase();

        if (cat === 'scene' && (shape === 'stage' || id.includes('stage') || id.includes('estrade'))) {
            return 0;
        }

        const cx = el.x + el.width / 2;
        const cy = el.y + el.height / 2;

        let elevation = 0;

        allElements.forEach(other => {
            if (other === el) return;
            const otherCat = (other.category || '').toLowerCase();
            const otherShape = (other.shape || '').toLowerCase();
            const otherId = (other.id || '').toLowerCase();

            const isStage = otherCat === 'scene' || otherShape === 'stage' || otherId.includes('stage') || otherId.includes('estrade');
            if (isStage) {
                if (cx >= other.x && cx <= other.x + other.width &&
                    cy >= other.y && cy <= other.y + other.height) {
                    let stageH = other.height3D || 0.6;
                    if (other.width >= 10) stageH = 0.8;
                    else if (other.width <= 4) stageH = 0.4;
                    if (stageH > elevation) {
                        elevation = stageH;
                    }
                }
            }
        });

        allElements.forEach(other => {
            if (other === el) return;
            const otherCat = (other.category || '').toLowerCase();
            const otherShape = (other.shape || '').toLowerCase();
            const otherId = (other.id || '').toLowerCase();

            const isTable = otherCat === 'tables' || otherId.includes('table');
            const isDesk = otherId.includes('desk') || otherId.includes('regie') || otherId.includes('accueil');
            const isBuffet = otherCat === 'buffets' || otherId.includes('buffet') || otherId.includes('bar');
            const isPodium = otherId === 'podium' || otherId.includes('pupitre');

            if (isTable || isDesk || isBuffet || isPodium) {
                const margin = 0.08;
                if (cx >= other.x - margin && cx <= other.x + other.width + margin &&
                    cy >= other.y - margin && cy <= other.y + other.height + margin) {

                    let tableSurfaceH = 0.74;
                    if (otherShape === 'circle' || otherId.includes('round') || otherId.includes('mange') || otherId.includes('cocktail')) {
                        const radius = Math.min(other.width, other.height) / 2;
                        const isStanding = otherId.includes('mange') || otherId.includes('cocktail') || radius < 0.45;
                        tableSurfaceH = isStanding ? 1.10 : 0.75;
                    } else if (isDesk) {
                        tableSurfaceH = 0.75;
                    } else if (isBuffet) {
                        tableSurfaceH = 1.05;
                    } else if (isPodium) {
                        tableSurfaceH = 1.15;
                    }

                    let tableBaseY = 0;
                    allElements.forEach(stageCandidate => {
                        if (stageCandidate === other || stageCandidate === el) return;
                        const sCat = (stageCandidate.category || '').toLowerCase();
                        const sShape = (stageCandidate.shape || '').toLowerCase();
                        const sId = (stageCandidate.id || '').toLowerCase();
                        if (sCat === 'scene' || sShape === 'stage' || sId.includes('stage') || sId.includes('estrade')) {
                            const ocx = other.x + other.width / 2;
                            const ocy = other.y + other.height / 2;
                            if (ocx >= stageCandidate.x && ocx <= stageCandidate.x + stageCandidate.width &&
                                ocy >= stageCandidate.y && ocy <= stageCandidate.y + stageCandidate.height) {
                                let sH = stageCandidate.height3D || 0.6;
                                if (stageCandidate.width >= 10) sH = 0.8;
                                else if (stageCandidate.width <= 4) sH = 0.4;
                                tableBaseY = Math.max(tableBaseY, sH);
                            }
                        }
                    });

                    const isTabletopCandidate = shape === 'computer' || id.includes('laptop') || id.includes('desktop') ||
                                                id.includes('pc') || id.includes('gamer') || id.includes('ordinateur') ||
                                                id.includes('plant') || id.includes('flower') || id.includes('pot') ||
                                                id.includes('screen') || id.includes('tv') || id.includes('mic') ||
                                                (el.width <= other.width * 0.95 && el.height <= other.height * 0.95 && cat !== 'chairs');

                    if (isTabletopCandidate) {
                        const candidateTopY = tableBaseY + tableSurfaceH;
                        if (candidateTopY > elevation) {
                            elevation = candidateTopY;
                        }
                    }
                }
            }
        });

        return elevation;
    }

    create3DFurniture(el, sceneW, sceneH, allElements = []) {
        const pos = this.to3DCoords(el.x, el.y, el.width, el.height, sceneW, sceneH);
        const rotRad = -((el.rotation || 0) * Math.PI) / 180;
        const colorHex = el.color ? parseInt(el.color.replace('#', '0x'), 16) : 0x7c8ba1;
        const elevation = this.computeElementElevation(el, allElements);

        const group = new THREE.Group();
        group.position.set(pos.x, elevation, pos.z);
        group.rotation.y = rotRad;
        group.userData = { element: el };

        const shape = el.shape || 'rect';
        const id = (el.id || '').toLowerCase();
        const cat = (el.category || '').toLowerCase();
        const w = Math.max(el.width, 0.05);
        const d = Math.max(el.height, 0.05);

        if (id.includes('partition-corner') || id.includes('cloison-angle')) {
            buildPartitionCorner3D(group, w, d, colorHex);
        } else if (id.includes('partition') || id.includes('cloison')) {
            buildPartition3D(group, w, d, colorHex, el);
        } else if (shape === 'barrier' || id.includes('vauban') || id.includes('barriere-vauban') || (cat === 'security' && id.includes('barriere'))) {
            buildVaubanBarrier3D(group, w, d, colorHex);
        } else if (shape === 'fence' || id.includes('heras') || id.includes('cloture')) {
            buildHerasFence3D(group, w, d, colorHex);
        } else if (shape === 'backdrop' || id.includes('fond') || id.includes('backdrop') || cat === 'backgrounds') {
            buildBackdrop3D(group, w, d, colorHex, el);
        } else if (shape === 'tent' || id.includes('tente') || id.includes('barnum') || (cat === 'production' && id.includes('tent'))) {
            buildTent3D(group, w, d, colorHex);
        } else if (shape === 'stand' || (cat === 'expo' && id.includes('stand'))) {
            buildStandExpo3D(group, w, d, colorHex, el);
        } else if (id.includes('totem')) {
            buildTotem3D(group, w, d, colorHex);
        } else if (shape === 'barrier-belt' || id.includes('potelet') || id.includes('sangle')) {
            buildBeltStanchions3D(group, w, d, colorHex);
        } else if (shape === 'cone' || id.includes('cone')) {
            buildCone3D(group, w, d);
        } else if (shape === 'vehicle' || id.includes('ambulance') || id.includes('vehicle')) {
            buildVehicle3D(group, w, d, colorHex);
        } else if (id.includes('toilet') || id.includes('wc') || id.includes('sanitaire')) {
            buildMobileToilet3D(group, w, d);
        } else if (id.includes('extincteur') || id.includes('extinguisher')) {
            buildExtinguisher3D(group, w, d);
        } else if (id.includes('jersey')) {
            buildJerseyBlock3D(group, w, d, colorHex);
        } else if (cat === 'scene' || id.includes('stage') || id.includes('estrade') || shape === 'stage') {
            buildStage3D(group, w, d, colorHex, el);
        } else if (id === 'podium' || id.includes('pupitre')) {
            buildPodiumLutrin3D(group, w, d, colorHex);
        } else if (shape === 'chair' || (cat === 'chairs' && (id === 'chair' || el.seats === 1))) {
            buildChair3D(group, w, d, colorHex, el);
        } else if (id.includes('armchair') || id.includes('sofa') || id.includes('fauteuil') || id.includes('canape')) {
            buildArmchairSofa3D(group, w, d, colorHex, el);
        } else if (id.includes('bench') || id.includes('banc')) {
            buildBench3D(group, w, d, colorHex);
        } else if (id.includes('pouf')) {
            buildPouf3D(group, w, d, colorHex);
        } else if (shape === 'circle' || id.includes('round') || id.includes('mange-debout') || id.includes('cocktail')) {
            buildRoundTable3D(group, w, d, colorHex, el);
        } else if (shape === 'arc' || id.includes('bar-curved') || id.includes('accueil') || id.includes('reception')) {
            buildArcDesk3D(group, w, d, colorHex);
        } else if (cat === 'tables' || id.includes('table')) {
            buildRectTable3D(group, w, d, colorHex, el);
        } else if (cat === 'buffets' || id.includes('buffet') || id.includes('bar')) {
            buildBuffetBar3D(group, w, d, colorHex, el);
        } else if (id.includes('truss') || shape === 'truss') {
            buildTruss3D(group, w, d, colorHex);
        } else if (id.includes('regie') || id.includes('desk') || (cat === 'production' && id.includes('pc'))) {
            buildTechDesk3D(group, w, d, colorHex, el);
        } else if (id.includes('speaker-floor') || id.includes('retour')) {
            buildFloorSpeakerWedge3D(group, w, d);
        } else if (id.includes('speaker') || id.includes('enceinte')) {
            buildSpeaker3D(group, w, d);
        } else if (id.includes('generator') || id.includes('electrogene')) {
            buildGenerator3D(group, w, d);
        } else if (id.includes('distribution') || id.includes('tgbt')) {
            buildDistributionBox3D(group, w, d);
        } else if (shape === 'person' || id.includes('pnj') || cat === 'characters') {
            buildHumanPNJ3D(group, w, d, colorHex, el);
        } else if (shape === 'computer' || id.includes('laptop') || id.includes('desktop') || id.includes('ordinateur')) {
            buildComputerDevice3D(group, w, d, colorHex, el);
        } else if (id.includes('lyre') || (shape === 'spotlight' && id.includes('beam'))) {
            buildLyreMovingHead3D(group, w, d, colorHex, this.liveFixtures);
        } else if (id.includes('par-stand') || (shape === 'spotlight' && id.includes('stand'))) {
            buildParLightStand3D(group, w, d, colorHex, this.liveFixtures);
        } else if (id.includes('followspot') || id.includes('poursuite')) {
            buildFollowspot3D(group, w, d, this.liveFixtures);
        } else if (shape === 'spotlight' || id.includes('spot') || id.includes('light')) {
            buildSpotlightFixture3D(group, w, d, colorHex);
        } else if (id.includes('switch') || shape === 'tv-switch') {
            buildTvSwitchStand3D(group, w, d, colorHex, el);
        } else if (id.includes('plant') || id.includes('plante')) {
            buildPlant3D(group, w, d);
        } else if (id.includes('screen') || id.includes('tv') || id.includes('ecran')) {
            buildLedScreen3D(group, w, d, colorHex);
        } else if (id.includes('flag') || id.includes('oriflamme')) {
            buildFlagOriflamme3D(group, w, d, colorHex);
        } else if (id.includes('easel') || id.includes('chevalet')) {
            buildEasel3D(group, w, d);
        } else {
            buildGenericStyledPiece(group, w, d, colorHex, el);
        }

        group.traverse(child => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                child.userData = { element: el };
            }
        });

        this.furnitureGroup.add(group);
    }

    // ─── Camera Presets ─────────────────────────────────────────────

    setCameraPreset(presetName) {
        if (this.isWalkMode) this.stopWalkMode();

        const t = this.controls.target;
        t.set(0, 0, 0);

        switch (presetName) {
            case 'isometric':
                this.camera.position.set(0, 16, 24);
                break;
            case 'top':
                this.camera.position.set(0, 32, 0.001);
                break;
            case 'human':
                this.camera.position.set(0, 1.70, 16);
                t.set(0, 1.4, 0);
                break;
            case 'stage-front':
                this.camera.position.set(0, 7, 20);
                t.set(0, 0.8, 0);
                break;
        }
        this.controls.update();
    }

    // ─── Live Show DMX Simulation ───────────────────────────────────

    toggleLiveShow() {
        this.isLiveShow = !this.isLiveShow;
        if (this.isLiveShow && this.lightingMode === 'studio') {
            this.setLightingMode('night');
            const lightText = document.getElementById('lighting-mode-text');
            const lightBtn = document.getElementById('btn-three-lighting');
            if (lightText) lightText.textContent = 'Show Nuit';
            if (lightBtn) lightBtn.classList.add('active');
        }

        if (!this.isLiveShow) {
            this.liveFixtures.forEach(f => {
                if (f.mat && f.origColor) {
                    f.mat.color.set(f.origColor);
                    f.mat.opacity = 0.25;
                }
                if (f.type === 'movinghead') {
                    if (f.yoke) f.yoke.rotation.y = 0;
                    if (f.head) f.head.rotation.x = f.origTilt || -0.55;
                }
            });
        }

        return this.isLiveShow;
    }

    // ─── Mode Visite Immersive (First-Person ZQSD) ───────────────────

    toggleWalkMode() {
        if (this.isWalkMode) {
            this.stopWalkMode();
        } else {
            this.startWalkMode();
        }
    }

    startWalkMode() {
        this.isWalkMode = true;
        this.controls.enabled = false;
        this.camera.position.y = 1.70;

        const dir = new THREE.Vector3();
        this.camera.getWorldDirection(dir);
        this.walkEuler.y = Math.atan2(-dir.x, -dir.z);
        this.walkEuler.x = Math.asin(Math.max(-0.95, Math.min(0.95, dir.y)));
        this.walkEuler.z = 0;
        this.camera.quaternion.setFromEuler(this.walkEuler);

        const hud = document.getElementById('three-walk-hud');
        if (hud) hud.style.display = 'flex';
        const walkBtnText = document.getElementById('walk-btn-text');
        if (walkBtnText) walkBtnText.textContent = 'Quitter ZQSD';
        const walkBtn = document.getElementById('btn-three-walk');
        if (walkBtn) walkBtn.classList.add('active');
    }

    stopWalkMode() {
        if (!this.isWalkMode) return;
        this.isWalkMode = false;
        this.controls.enabled = true;
        this.walkKeys = { forward: false, backward: false, left: false, right: false };

        const forwardVec = new THREE.Vector3(0, 0, -5).applyQuaternion(this.camera.quaternion);
        this.controls.target.copy(this.camera.position).add(forwardVec);
        this.controls.update();

        const hud = document.getElementById('three-walk-hud');
        if (hud) hud.style.display = 'none';
        const walkBtnText = document.getElementById('walk-btn-text');
        if (walkBtnText) walkBtnText.textContent = 'Visite ZQSD';
        const walkBtn = document.getElementById('btn-three-walk');
        if (walkBtn) walkBtn.classList.remove('active');
    }

    onWalkKeyDown(e) {
        if (!this.isWalkMode) return;
        if (e.key === 'Escape') {
            this.stopWalkMode();
            return;
        }
        const code = e.code;
        if (code === 'KeyW' || code === 'KeyZ' || code === 'ArrowUp') {
            this.walkKeys.forward = true;
            e.preventDefault();
        } else if (code === 'KeyS' || code === 'ArrowDown') {
            this.walkKeys.backward = true;
            e.preventDefault();
        } else if (code === 'KeyA' || code === 'KeyQ' || code === 'ArrowLeft') {
            this.walkKeys.left = true;
            e.preventDefault();
        } else if (code === 'KeyD' || code === 'ArrowRight') {
            this.walkKeys.right = true;
            e.preventDefault();
        }
    }

    onWalkKeyUp(e) {
        if (!this.isWalkMode) return;
        const code = e.code;
        if (code === 'KeyW' || code === 'KeyZ' || code === 'ArrowUp') {
            this.walkKeys.forward = false;
        } else if (code === 'KeyS' || code === 'ArrowDown') {
            this.walkKeys.backward = false;
        } else if (code === 'KeyA' || code === 'KeyQ' || code === 'ArrowLeft') {
            this.walkKeys.left = false;
        } else if (code === 'KeyD' || code === 'ArrowRight') {
            this.walkKeys.right = false;
        }
    }

    onWalkMouseDown(e) {
        if (!this.isWalkMode) return;
        this.isMouseDown = true;
        this.prevMousePos = { x: e.clientX, y: e.clientY };
    }

    onWalkMouseUp() {
        this.isMouseDown = false;
    }

    onWalkMouseMove(e) {
        if (!this.isWalkMode || !this.isMouseDown) return;

        const dx = e.clientX - this.prevMousePos.x;
        const dy = e.clientY - this.prevMousePos.y;
        this.prevMousePos = { x: e.clientX, y: e.clientY };

        this.walkEuler.y -= dx * 0.0035;
        this.walkEuler.x = Math.max(-1.35, Math.min(1.35, this.walkEuler.x - dy * 0.0035));
        this.camera.quaternion.setFromEuler(this.walkEuler);
    }

    // ─── Raycasting & Tooltips ──────────────────────────────────────

    onMouseMove(e) {
        if (this.isWalkMode) return;

        const rect = this.renderer.domElement.getBoundingClientRect();
        this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);
        const intersects = this.raycaster.intersectObjects(this.furnitureGroup.children, true);

        if (intersects.length > 0) {
            const hit = intersects[0];
            let el = hit.object.userData.element;
            if (!el && hit.object.isInstancedMesh && hit.instanceId !== undefined && Array.isArray(hit.object.userData.elements)) {
                const perEl = hit.object.userData.instancesPerElement || 1;
                el = hit.object.userData.elements[Math.floor(hit.instanceId / perEl)];
            }
            if (el) {
                this.showTooltip(e.clientX, e.clientY, el);
                this.container.style.cursor = 'pointer';
                return;
            }
        }

        this.hideTooltip();
        this.container.style.cursor = 'default';
    }

    showTooltip(screenX, screenY, el) {
        if (!this.tooltipEl) return;
        this.tooltipEl.innerHTML = `
            <div class="tooltip-title">${el.name || 'Élément'}</div>
            <div class="tooltip-details">${el.width}m × ${el.height}m</div>
        `;
        this.tooltipEl.style.left = `${screenX + 16}px`;
        this.tooltipEl.style.top = `${screenY + 16}px`;
        this.tooltipEl.style.display = 'block';
    }

    hideTooltip() {
        if (this.tooltipEl) {
            this.tooltipEl.style.display = 'none';
        }
    }

    // ─── Instant Screenshot ─────────────────────────────────────────

    takeScreenshot() {
        this.renderer.render(this.scene, this.camera);
        const dataUrl = this.renderer.domElement.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `scenoplan-3d-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
    }

    buildExportScene() {
        const exportScene = new THREE.Scene();
        exportScene.name = 'ScenoPlan_Export';

        if (this.stageFloorGroup) exportScene.add(this.stageFloorGroup.clone(true));
        if (this.zoneGroup) exportScene.add(this.zoneGroup.clone(true));
        if (this.wallGroup) exportScene.add(this.wallGroup.clone(true));
        if (this.furnitureGroup) exportScene.add(this.furnitureGroup.clone(true));

        const cleanup = expandInstancedMeshesForExport(exportScene);
        exportScene.updateMatrixWorld(true);
        return { exportScene, cleanup };
    }

    async exportGLB(filename) {
        if (!this.scene) return;
        let cleanup = () => {};
        try {
            const { GLTFExporter } = await import('three/addons/exporters/GLTFExporter.js');
            const exporter = new GLTFExporter();
            const built = this.buildExportScene();
            cleanup = built.cleanup;

            const options = {
                binary: true,
                embedImages: true,
                onlyVisible: true
            };

            const rawName = filename || (document.getElementById('project-name')?.value || 'ScenoPlan_3D');
            const cleanName = rawName.trim().replace(/[/\\?%*:|"<>]/g, '_').replace(/\s+/g, '_') || 'ScenoPlan_3D';
            const finalFilename = cleanName.endsWith('.glb') ? cleanName : `${cleanName}.glb`;

            exporter.parse(
                built.exportScene,
                (glbArrayBuffer) => {
                    cleanup();
                    const blob = new Blob([glbArrayBuffer], { type: 'model/gltf-binary' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = finalFilename;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    setTimeout(() => URL.revokeObjectURL(url), 1500);
                    console.log(`%c📦 Maquette 3D universelle GLB exportée : ${finalFilename} (${(blob.size / (1024 * 1024)).toFixed(2)} Mo)`, 'color: #4cd964; font-weight: bold;');
                },
                (error) => {
                    cleanup();
                    console.error('Erreur lors de l\'exportation GLB:', error);
                    alert('Erreur lors de l\'exportation 3D : ' + error.message);
                },
                options
            );
        } catch (err) {
            cleanup();
            console.error('Erreur chargement exporteur GLB:', err);
            alert('Impossible de charger l\'exportateur 3D : ' + err.message);
        }
    }

    async exportOBJ(filename) {
        if (!this.scene) return;
        let cleanup = () => {};
        try {
            const { OBJExporter } = await import('three/addons/exporters/OBJExporter.js');
            const exporter = new OBJExporter();
            const built = this.buildExportScene();
            cleanup = built.cleanup;

            const rawName = filename || (document.getElementById('project-name')?.value || 'ScenoPlan_3D');
            const cleanName = rawName.trim().replace(/[/\\?%*:|"<>]/g, '_').replace(/\s+/g, '_') || 'ScenoPlan_3D';
            const finalFilename = cleanName.endsWith('.obj') ? cleanName : `${cleanName}.obj`;

            const result = exporter.parse(built.exportScene);
            cleanup();

            const blob = new Blob([result], { type: 'text/plain;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = finalFilename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(url), 1500);
        } catch (err) {
            cleanup();
            console.error('Erreur chargement exporteur OBJ:', err);
            alert('Impossible de charger l\'exportateur OBJ : ' + err.message);
        }
    }

    // ─── Render Loop ────────────────────────────────────────────────

    animate() {
        this.animationFrameId = requestAnimationFrame(() => this.animate());

        const now = performance.now();
        const dt = Math.min((now - this.lastTime) / 1000, 0.1);
        this.lastTime = now;

        if (this.isWalkMode) {
            const moveSpeed = 4.8 * dt;
            let moveX = 0;
            let moveZ = 0;

            if (this.walkKeys.forward) moveZ -= 1;
            if (this.walkKeys.backward) moveZ += 1;
            if (this.walkKeys.left) moveX -= 1;
            if (this.walkKeys.right) moveX += 1;

            if (moveX !== 0 || moveZ !== 0) {
                const len = Math.hypot(moveX, moveZ);
                moveX /= len;
                moveZ /= len;

                const sinY = Math.sin(this.walkEuler.y);
                const cosY = Math.cos(this.walkEuler.y);

                const worldX = (moveX * cosY + moveZ * sinY) * moveSpeed;
                const worldZ = (-moveX * sinY + moveZ * cosY) * moveSpeed;

                this.camera.position.x += worldX;
                this.camera.position.z += worldZ;

                const limitX = (this.sceneWidth || 30) / 2 + 10;
                const limitZ = (this.sceneHeight || 20) / 2 + 10;
                this.camera.position.x = Math.max(-limitX, Math.min(limitX, this.camera.position.x));
                this.camera.position.z = Math.max(-limitZ, Math.min(limitZ, this.camera.position.z));
            }

            this.camera.position.y = 1.70;
        } else {
            this.controls.update();
        }

        if (this.isLiveShow && this.liveFixtures.length > 0) {
            const time = now * 0.0018;

            this.liveFixtures.forEach((f, idx) => {
                if (f.type === 'movinghead') {
                    f.yoke.rotation.y = Math.sin(time * 1.5 + f.phase) * 1.15;
                    f.head.rotation.x = f.origTilt + Math.sin(time * 2.2 + f.phase * 0.8) * 0.42;
                    const hue = (time * 0.08 + idx * 0.28) % 1.0;
                    f.mat.color.setHSL(hue, 1.0, 0.55);
                    f.mat.opacity = 0.24 + Math.sin(time * 4 + f.phase) * 0.06;
                } else if (f.type === 'par') {
                    const hue = (0.12 + Math.sin(time * 0.5 + f.phase) * 0.04) % 1.0;
                    f.mat.color.setHSL(hue, 0.95, 0.6);
                    f.mat.opacity = 0.20 + Math.sin(time * 3 + f.phase) * 0.08;
                } else if (f.type === 'followspot') {
                    f.cannon.rotation.y = Math.sin(time * 0.8 + f.phase) * 0.25;
                    f.mat.opacity = 0.30 + Math.sin(time * 2 + f.phase) * 0.05;
                }
            });
        }

        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        if (!this.renderer || !this.camera) return;
        const w = this.container.clientWidth;
        const h = this.container.clientHeight;
        if (w === 0 || h === 0) return;
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
    }

    destroy() {
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
        }
        this.clearGroup(this.stageFloorGroup);
        this.clearGroup(this.zoneGroup);
        this.clearGroup(this.furnitureGroup);
        this.clearGroup(this.wallGroup);
        if (this.renderer) {
            this.renderer.dispose();
            if (this.renderer.domElement.parentElement) {
                this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
            }
        }
    }
}
