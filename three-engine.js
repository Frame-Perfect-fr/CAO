/* ================================================================
   ScenoPlan — 3D Engine (Three.js)
   Full 3D visualization of stage layouts, architectural walls,
   and detailed event furniture models.
   ================================================================ */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

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

        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x111317);
        this.scene.fog = new THREE.FogExp2(0x111317, 0.012);

        // Camera
        const aspect = this.container.clientWidth / this.container.clientHeight || 1;
        this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 1000);
        this.camera.position.set(0, 16, 24);

        // Renderer
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

        // Orbit Controls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.06;
        this.controls.screenSpacePanning = true;
        this.controls.maxPolarAngle = Math.PI / 2 - 0.02; // Keep camera above floor
        this.controls.minDistance = 2;
        this.controls.maxDistance = 160;
        this.controls.target.set(0, 0, 0);

        // Scene Hierarchy Groups
        this.stageFloorGroup = new THREE.Group();
        this.scene.add(this.stageFloorGroup);

        this.zoneGroup = new THREE.Group();
        this.scene.add(this.zoneGroup);

        this.furnitureGroup = new THREE.Group();
        this.scene.add(this.furnitureGroup);

        this.wallGroup = new THREE.Group();
        this.scene.add(this.wallGroup);

        // Lighting & UI Tooltip
        this.setupLighting();
        this.createTooltip();

        // Event Listeners
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

        // Walk Controls Keyboard Listeners
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
        // Soft Ambient Light
        this.lights.ambient = new THREE.AmbientLight(0xffffff, 0.7);
        this.scene.add(this.lights.ambient);

        // Main Directional Light (Warm White)
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

        // Fill Light
        this.lights.fillLight = new THREE.DirectionalLight(0x9bc2ff, 0.5);
        this.lights.fillLight.position.set(-18, 20, -18);
        this.scene.add(this.lights.fillLight);

        // Spotlights (Show/Night Mode)
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
            // Studio Mode
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

        // 1. Surrounding Infinite Ground
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

        // 2. Active Stage Floor Plate
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

        // 3. Grid Helper
        this.gridHelperMesh = new THREE.GridHelper(Math.max(sceneWidth, sceneHeight), Math.max(sceneWidth, sceneHeight), 0x3d4454, 0x222630);
        this.gridHelperMesh.position.y = 0.002;
        this.stageFloorGroup.add(this.gridHelperMesh);

        // 4. Accent Perimeter Border
        const borderGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(sceneWidth, 0.05, sceneHeight));
        const borderMat = new THREE.LineBasicMaterial({ color: 0x5b73ff, linewidth: 2 });
        const borderLine = new THREE.LineSegments(borderGeo, borderMat);
        borderLine.position.y = -0.01;
        this.stageFloorGroup.add(borderLine);

        // Apply active floor coating
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

        const texture = this.createProceduralFloorTexture(this.floorType, w, h);
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

    createProceduralFloorTexture(type, sceneW, sceneH) {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        if (type === 'parquet') {
            // Warm varnished stage oak planks
            ctx.fillStyle = '#b3773a';
            ctx.fillRect(0, 0, 512, 512);

            const numPlanks = 8;
            const plankH = 512 / numPlanks;
            const plankTones = ['#a2672d', '#b97e41', '#ab7034', '#965b21', '#bd8246', '#ae7337'];

            for (let i = 0; i < numPlanks; i++) {
                ctx.fillStyle = plankTones[i % plankTones.length];
                ctx.fillRect(0, i * plankH, 512, plankH);

                // Wood grain lines
                ctx.strokeStyle = 'rgba(60, 32, 10, 0.15)';
                ctx.lineWidth = 1.2;
                for (let g = 0; g < 6; g++) {
                    ctx.beginPath();
                    const gy = i * plankH + (g + 1) * (plankH / 7) + (Math.sin(g) * 3);
                    ctx.moveTo(0, gy);
                    ctx.bezierCurveTo(128, gy + 4, 384, gy - 4, 512, gy + 2);
                    ctx.stroke();
                }

                // Dark groove joint between planks
                ctx.fillStyle = '#3a1f0a';
                ctx.fillRect(0, (i + 1) * plankH - 2, 512, 2.5);

                // Staggered vertical end joints
                const endX = ((i * 197) % 400) + 50;
                ctx.fillRect(endX, i * plankH, 2.5, plankH);
            }
        } else if (type === 'carpet-red') {
            // Luxurious crimson / ruby VIP red carpet
            ctx.fillStyle = '#8f1228';
            ctx.fillRect(0, 0, 512, 512);

            // Fine fabric weave pattern
            for (let x = 0; x < 512; x += 4) {
                ctx.fillStyle = x % 8 === 0 ? 'rgba(255, 120, 150, 0.08)' : 'rgba(0, 0, 0, 0.12)';
                ctx.fillRect(x, 0, 2, 512);
            }
            for (let y = 0; y < 512; y += 4) {
                ctx.fillStyle = y % 8 === 0 ? 'rgba(255, 120, 150, 0.08)' : 'rgba(0, 0, 0, 0.12)';
                ctx.fillRect(0, y, 512, 2);
            }
        } else if (type === 'carpet-blue') {
            // Deep royal / executive exhibition blue
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
            // Polished concrete exhibition tiles (4 large slabs)
            ctx.fillStyle = '#888e99';
            ctx.fillRect(0, 0, 512, 512);

            // Random aggregates and surface micro-pores
            for (let p = 0; p < 1800; p++) {
                const px = Math.random() * 512;
                const py = Math.random() * 512;
                const pr = Math.random() * 2 + 0.5;
                ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255, 255, 255, 0.12)' : 'rgba(20, 25, 30, 0.15)';
                ctx.beginPath();
                ctx.arc(px, py, pr, 0, Math.PI * 2);
                ctx.fill();
            }

            // Tile joints
            ctx.strokeStyle = '#4e545e';
            ctx.lineWidth = 3;
            ctx.strokeRect(0, 0, 512, 512);
            ctx.beginPath();
            ctx.moveTo(256, 0); ctx.lineTo(256, 512);
            ctx.moveTo(0, 256); ctx.lineTo(512, 256);
            ctx.stroke();
        } else if (type === 'grass') {
            // Natural turf / outdoor festival grass
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

    /**
     * Synchronizes 2D elements from the canvas engine into 3D objects
     */
    syncFrom2D(canvasEngine) {
        if (!this.isInitialized) this.init();

        const sceneW = canvasEngine.sceneWidth || 30;
        const sceneH = canvasEngine.sceneHeight || 20;

        // Rebuild stage floor
        this.buildFloor(sceneW, sceneH);

        // Clear existing 3D groups and live fixtures
        this.liveFixtures = [];
        this.clearGroup(this.zoneGroup);
        this.clearGroup(this.furnitureGroup);
        this.clearGroup(this.wallGroup);

        const elements = canvasEngine.elements || [];

        elements.forEach(el => {
            if (this.isZoneElement(el)) {
                this.create3DZone(el, sceneW, sceneH);
            } else if (this.isWallElement(el)) {
                this.create3DWall(el, sceneW, sceneH);
            } else if (el.isText) {
                // Text marker omitted in 3D
            } else {
                this.create3DFurniture(el, sceneW, sceneH, elements);
            }
        });

        // Set spotlight targets
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
            });
        }
    }

    to3DCoords(x, y, width, height, sceneW, sceneH) {
        const cx = (x + width / 2) - (sceneW / 2);
        const cz = (y + height / 2) - (sceneH / 2);
        return { x: cx, z: cz };
    }

    /**
     * Calculates the automatic 3D base elevation (Y) so that laptops, computers,
     * monitors, accessories, or objects placed over tables, desks, buffets or stages
     * sit cleanly ON the supporting surface instead of on the floor beneath.
     */
    computeElementElevation(el, allElements = []) {
        // User manual override in element properties if specified
        if (el.elevation !== undefined && el.elevation !== null && !isNaN(el.elevation)) {
            return Math.max(0, parseFloat(el.elevation));
        }

        const id = (el.id || '').toLowerCase();
        const cat = (el.category || '').toLowerCase();
        const shape = (el.shape || '').toLowerCase();

        // Stages themselves always start from the floor
        if (cat === 'scene' && (shape === 'stage' || id.includes('stage') || id.includes('estrade'))) {
            return 0;
        }

        // Center of current element in 2D scene meters
        const cx = el.x + el.width / 2;
        const cy = el.y + el.height / 2;

        let elevation = 0;

        // 1. Check if sitting on a Stage / Estrade
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

        // 2. Check if element sits on a Table, Desk, Buffet, or Podium
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

                    // Table surface height
                    let tableSurfaceH = 0.74; // standard table height
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

                    // Check if the supporting table itself is on a stage
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

                    // Only place on table if this item is a tabletop item OR smaller than the table
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

    // ─── 1. ZONES (Translucent Floor Surfaces - See-through!) ───────
    create3DZone(el, sceneW, sceneH) {
        const pos = this.to3DCoords(el.x, el.y, el.width, el.height, sceneW, sceneH);
        const rotRad = -((el.rotation || 0) * Math.PI) / 180;
        const colorHex = el.color ? parseInt(el.color.replace('#', '0x'), 16) : 0x5b73ff;

        const group = new THREE.Group();
        group.position.set(pos.x, 0, pos.z);
        group.rotation.y = rotRad;
        group.userData = { element: el };

        // Flat translucent floor plane (depthWrite: false so objects inside are fully visible!)
        const zoneGeo = new THREE.PlaneGeometry(el.width, el.height);
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
        const borderGeo = new THREE.EdgesGeometry(new THREE.BoxGeometry(el.width, 0.015, el.height));
        const borderMat = new THREE.LineBasicMaterial({
            color: colorHex,
            transparent: true,
            opacity: 0.75,
            linewidth: 2
        });
        const borderLine = new THREE.LineSegments(borderGeo, borderMat);
        borderLine.position.y = 0.008;
        group.add(borderLine);

        this.zoneGroup.add(group);
    }

    // ─── 2. ARCHITECTURAL WALLS (Extruded along Y axis) ────────────
    create3DWall(el, sceneW, sceneH) {
        const pos = this.to3DCoords(el.x, el.y, el.width, el.height, sceneW, sceneH);
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

        this.wallGroup.add(group);
    }

    // ─── 3. CLOISONS / PARTITIONS (Vertical Panels with Frame & Feet) ─
    buildPartition3D(group, w, d, colorHex, el) {
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

    // ─── 4. CLOISON D'ANGLE 90° (Corner Partition) ──────────────────
    buildPartitionCorner3D(group, w, d, colorHex) {
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

    // ─── 5. DISPATCHER DU MOBILIER DÉTAILLÉ ─────────────────────────
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

        // ─── Dedicated Model Matching for EVERY Item ───
        if (id.includes('partition-corner') || id.includes('cloison-angle')) {
            this.buildPartitionCorner3D(group, w, d, colorHex);
        } else if (id.includes('partition') || id.includes('cloison')) {
            this.buildPartition3D(group, w, d, colorHex, el);
        } else if (shape === 'barrier' || id.includes('vauban') || id.includes('barriere-vauban') || cat === 'security' && id.includes('barriere')) {
            this.buildVaubanBarrier3D(group, w, d, colorHex);
        } else if (shape === 'fence' || id.includes('heras') || id.includes('cloture')) {
            this.buildHerasFence3D(group, w, d, colorHex);
        } else if (shape === 'backdrop' || id.includes('fond') || id.includes('backdrop') || cat === 'backgrounds') {
            this.buildBackdrop3D(group, w, d, colorHex, el);
        } else if (shape === 'tent' || id.includes('tente') || id.includes('barnum') || cat === 'production' && id.includes('tent')) {
            this.buildTent3D(group, w, d, colorHex);
        } else if (shape === 'stand' || cat === 'expo' && id.includes('stand')) {
            this.buildStandExpo3D(group, w, d, colorHex, el);
        } else if (id.includes('totem')) {
            this.buildTotem3D(group, w, d, colorHex);
        } else if (shape === 'barrier-belt' || id.includes('potelet') || id.includes('sangle')) {
            this.buildBeltStanchions3D(group, w, d, colorHex);
        } else if (shape === 'cone' || id.includes('cone')) {
            this.buildCone3D(group, w, d);
        } else if (shape === 'vehicle' || id.includes('ambulance') || id.includes('vehicle')) {
            this.buildVehicle3D(group, w, d, colorHex);
        } else if (id.includes('toilet') || id.includes('wc') || id.includes('sanitaire')) {
            this.buildMobileToilet3D(group, w, d);
        } else if (id.includes('extincteur') || id.includes('extinguisher')) {
            this.buildExtinguisher3D(group, w, d);
        } else if (id.includes('jersey')) {
            this.buildJerseyBlock3D(group, w, d, colorHex);
        } else if (cat === 'scene' || id.includes('stage') || id.includes('estrade') || shape === 'stage') {
            this.buildStage3D(group, w, d, colorHex, el);
        } else if (id === 'podium' || id.includes('pupitre')) {
            this.buildPodiumLutrin3D(group, w, d, colorHex);
        } else if (shape === 'chair' || cat === 'chairs' && (id === 'chair' || el.seats === 1)) {
            this.buildChair3D(group, w, d, colorHex, el);
        } else if (id.includes('armchair') || id.includes('sofa') || id.includes('fauteuil') || id.includes('canape')) {
            this.buildArmchairSofa3D(group, w, d, colorHex, el);
        } else if (id.includes('bench') || id.includes('banc')) {
            this.buildBench3D(group, w, d, colorHex);
        } else if (id.includes('pouf')) {
            this.buildPouf3D(group, w, d, colorHex);
        } else if (shape === 'circle' || id.includes('round') || id.includes('mange-debout') || id.includes('cocktail')) {
            this.buildRoundTable3D(group, w, d, colorHex, el);
        } else if (shape === 'arc' || id.includes('bar-curved') || id.includes('accueil') || id.includes('reception')) {
            this.buildArcDesk3D(group, w, d, colorHex);
        } else if (cat === 'tables' || id.includes('table')) {
            this.buildRectTable3D(group, w, d, colorHex, el);
        } else if (cat === 'buffets' || id.includes('buffet') || id.includes('bar')) {
            this.buildBuffetBar3D(group, w, d, colorHex, el);
        } else if (id.includes('truss') || shape === 'truss') {
            this.buildTruss3D(group, w, d, colorHex);
        } else if (id.includes('regie') || id.includes('desk') || cat === 'production' && id.includes('pc')) {
            this.buildTechDesk3D(group, w, d, colorHex, el);
        } else if (id.includes('speaker-floor') || id.includes('retour')) {
            this.buildFloorSpeakerWedge3D(group, w, d);
        } else if (id.includes('speaker') || id.includes('enceinte')) {
            this.buildSpeaker3D(group, w, d);
        } else if (id.includes('generator') || id.includes('electrogene')) {
            this.buildGenerator3D(group, w, d);
        } else if (id.includes('distribution') || id.includes('tgbt')) {
            this.buildDistributionBox3D(group, w, d);
        } else if (shape === 'person' || id.includes('pnj') || cat === 'characters') {
            this.buildHumanPNJ3D(group, w, d, colorHex, el);
        } else if (shape === 'computer' || id.includes('laptop') || id.includes('desktop') || id.includes('ordinateur')) {
            this.buildComputerDevice3D(group, w, d, colorHex, el);
        } else if (id.includes('lyre') || (shape === 'spotlight' && id.includes('beam'))) {
            this.buildLyreMovingHead3D(group, w, d, colorHex);
        } else if (id.includes('par-stand') || (shape === 'spotlight' && id.includes('stand'))) {
            this.buildParLightStand3D(group, w, d, colorHex);
        } else if (id.includes('followspot') || id.includes('poursuite')) {
            this.buildFollowspot3D(group, w, d);
        } else if (shape === 'spotlight' || id.includes('spot') || id.includes('light')) {
            this.buildSpotlightFixture3D(group, w, d, colorHex);
        } else if (id.includes('switch') || shape === 'tv-switch') {
            this.buildTvSwitchStand3D(group, w, d, colorHex, el);
        } else if (id.includes('plant') || id.includes('plante')) {
            this.buildPlant3D(group, w, d);
        } else if (id.includes('screen') || id.includes('tv') || id.includes('ecran')) {
            this.buildLedScreen3D(group, w, d, colorHex);
        } else if (id.includes('flag') || id.includes('oriflamme')) {
            this.buildFlagOriflamme3D(group, w, d, colorHex);
        } else if (id.includes('easel') || id.includes('chevalet')) {
            this.buildEasel3D(group, w, d);
        } else {
            this.buildGenericStyledPiece(group, w, d, colorHex, el);
        }

        // Enable shadow casting & receiving on all solid meshes
        group.traverse(child => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                child.userData = { element: el, rootGroup: group };
            }
        });

        this.furnitureGroup.add(group);
    }

    // ─── 6. MODÈLES MOBILIER SPÉCIFIQUES ─────────────────────────────

    // Barrière Vauban
    buildVaubanBarrier3D(group, w, d, colorHex) {
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

    // Clôture Heras
    buildHerasFence3D(group, w, d, colorHex) {
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

    // Fond Vert & Backdrops
    buildBackdrop3D(group, w, d, colorHex, el) {
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

    // Scène & Estrade
    buildStage3D(group, w, d, colorHex, el) {
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

    // Pupitre / Lutrin
    buildPodiumLutrin3D(group, w, d, colorHex) {
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

    // ─── Tabletop Name Texture Generator ────────────────────────
    createTableTopTexture(label, w, d, baseColorHex, isRound = false) {
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

    // Tables Rectangulaires avec nom imprimé sur le plateau
    buildRectTable3D(group, w, d, colorHex, el) {
        const tableH = 0.74;
        const topThick = 0.038;
        const baseColor = colorHex || 0x8b7355;
        const tableName = el?.name || el?.label || 'Table rectangulaire';

        const sideMat = new THREE.MeshStandardMaterial({
            color: baseColor,
            roughness: 0.42,
            metalness: 0.08
        });
        const topTex = this.createTableTopTexture(tableName, w, d, baseColor, false);
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

    // Tables Rondes / Mange-debout avec nom imprimé sur le plateau
    buildRoundTable3D(group, w, d, colorHex, el) {
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
        const topTex = this.createTableTopTexture(tableName, radius * 2, radius * 2, baseColor, true);
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

    // Chaises
    buildChair3D(group, w, d, colorHex, el) {
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

    // Fauteuils & Canapés
    buildArmchairSofa3D(group, w, d, colorHex, el) {
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

    // Banc
    buildBench3D(group, w, d, colorHex) {
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

    // Pouf
    buildPouf3D(group, w, d, colorHex) {
        const h = 0.42;
        const radius = Math.min(w, d) / 2;
        const poufMat = new THREE.MeshStandardMaterial({ color: colorHex || 0x7c5a5a, roughness: 0.7 });
        const pouf = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, h, 24), poufMat);
        pouf.position.set(0, h / 2, 0);
        group.add(pouf);
    }

    // Stand Expo
    buildStandExpo3D(group, w, d, colorHex, el) {
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

    // Totem d'affichage
    buildTotem3D(group, w, d, colorHex) {
        const h = 2.0;
        const totemMat = new THREE.MeshStandardMaterial({ color: 0x1f232b, metalness: 0.6 });
        const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.08), totemMat);
        body.position.set(0, h / 2 + 0.02, 0);
        group.add(body);

        const base = new THREE.Mesh(new THREE.BoxGeometry(w * 1.2, 0.03, 0.45), totemMat);
        base.position.set(0, 0.015, 0);
        group.add(base);
    }

    // Tente / Barnum
    buildTent3D(group, w, d, colorHex) {
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

    // Pont de Scène (Truss)
    buildTruss3D(group, w, d, colorHex) {
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

    // Régie Technique & Audio/Vidéo
    buildTechDesk3D(group, w, d, colorHex, el) {
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

    // Buffet & Bar
    buildBuffetBar3D(group, w, d, colorHex, el) {
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

    // Enceinte Sonore sur Trépied
    buildSpeaker3D(group, w, d) {
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

    // Retour de scène au sol (Floor wedge speaker)
    buildFloorSpeakerWedge3D(group, w, d) {
        const boxMat = new THREE.MeshStandardMaterial({ color: 0x15171a, roughness: 0.8 });
        const wedge = new THREE.Mesh(new THREE.BoxGeometry(w, 0.32, d), boxMat);
        wedge.rotation.x = -Math.PI / 6; // 30° angled back towards performer
        wedge.position.set(0, 0.16, 0);
        group.add(wedge);
    }

    // Groupe Électrogène
    buildGenerator3D(group, w, d) {
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

    // Armoire de Distribution Électrique TGBT
    buildDistributionBox3D(group, w, d) {
        const boxH = 0.85;
        const orangeMat = new THREE.MeshStandardMaterial({ color: 0xed6a12, roughness: 0.4 });
        const box = new THREE.Mesh(new THREE.BoxGeometry(w, boxH, d), orangeMat);
        box.position.set(0, boxH / 2, 0);
        group.add(box);
    }

    // Plante Décorative
    buildPlant3D(group, w, d) {
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

    // Meuble TV avec plateau inférieur, Écran TV 55", Nintendo Switch et 2 manettes
    buildTvSwitchStand3D(group, w, d, colorHex, el) {
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

    // Mur / Écran LED sur Pieds
    buildLedScreen3D(group, w, d, colorHex) {
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

    // Oriflamme / Beach Flag
    buildFlagOriflamme3D(group, w, d, colorHex) {
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

    // Chevalet de Conférence
    buildEasel3D(group, w, d) {
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

    // Cabine WC Mobile
    buildMobileToilet3D(group, w, d) {
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

    // Extincteur
    buildExtinguisher3D(group, w, d) {
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

    // Bloc Jersey (Béton / Sécurité)
    buildJerseyBlock3D(group, w, d, colorHex) {
        const h = 0.82;
        const mat = new THREE.MeshStandardMaterial({ color: colorHex || 0xd13b2e, roughness: 0.6 });
        const block = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
        block.position.set(0, h / 2, 0);
        group.add(block);
    }

    // Cône de Signalisation
    buildCone3D(group, w, d) {
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

    // Potelets à Sangle
    buildBeltStanchions3D(group, w, d, colorHex) {
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

    // Desk d'Accueil Arqué
    buildArcDesk3D(group, w, d, colorHex) {
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

    // Véhicule
    buildVehicle3D(group, w, d, colorHex) {
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

    // Fallback Stylisé
    buildGenericStyledPiece(group, w, d, colorHex, el) {
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

    // ─── 7. MODÈLES ÉCLAIRAGES AVEC VOLUMÉTRIQUE & MODÈLE RÉEL ─────

    // Lyre asservie robotisée (Moving Head Beam / Spot)
    buildLyreMovingHead3D(group, w, d, colorHex) {
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
        this.liveFixtures.push({
            type: 'movinghead',
            yoke: yokeGroup,
            head: headGroup,
            cone: beamCone,
            core: beamCore,
            mat: beamMat,
            origColor: beamColor,
            origTilt: -0.55,
            phase: this.liveFixtures.length * 1.35
        });
    }

    // Projecteur PAR 64 sur Pied Télescopique avec 4 Volets Coupe-flux (Barndoors)
    buildParLightStand3D(group, w, d, colorHex) {
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
        this.liveFixtures.push({
            type: 'par',
            fixture: fixtureGroup,
            cone: beam,
            mat: beamMat,
            origColor: beamColor,
            origTilt: 0.45,
            phase: this.liveFixtures.length * 1.15
        });
    }

    // Poursuite de spectacle (Followspot Cannon on Heavy Stand)
    buildFollowspot3D(group, w, d) {
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
        this.liveFixtures.push({
            type: 'followspot',
            cannon: cannonGroup,
            cone: beam,
            mat: beamMat,
            origColor: 0xfff3db,
            origTilt: 0.35,
            phase: this.liveFixtures.length * 1.5
        });
    }

    // Spot de Théâtre / Découpe Compacte
    buildSpotlightFixture3D(group, w, d, colorHex) {
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

    // ─── 8. MODÈLES PERSONNAGES & PNJ (HUMAN SILHOUETTES) ───────────

    buildHumanPNJ3D(group, w, d, colorHex, el) {
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

    // ─── 9. MODÈLES ORDINATEURS & STATIONS PC ─────────────────────────

    buildComputerDevice3D(group, w, d, colorHex, el) {
        const id = (el?.id || '').toLowerCase();
        if (id.includes('gamer')) {
            this.buildGamerPCTower3D(group, w, d, colorHex, el);
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

    // ─── 10. TOUR PC GAMER RGB AVEC PAROI VERRE TREMPÉ & COMPOSANTS ──
    buildGamerPCTower3D(group, w, d, colorHex, el) {
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

        // Restore original colors if turning off
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

        // Set eye-level height
        this.camera.position.y = 1.70;

        // Calculate horizontal direction camera is facing
        const dir = new THREE.Vector3();
        this.camera.getWorldDirection(dir);
        this.walkEuler.y = Math.atan2(-dir.x, -dir.z);
        this.walkEuler.x = Math.asin(Math.max(-0.95, Math.min(0.95, dir.y)));
        this.walkEuler.z = 0;
        this.camera.quaternion.setFromEuler(this.walkEuler);

        // Update UI HUD
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

        // Position orbit controls target 5m ahead of camera
        const forwardVec = new THREE.Vector3(0, 0, -5).applyQuaternion(this.camera.quaternion);
        this.controls.target.copy(this.camera.position).add(forwardVec);
        this.controls.update();

        // Update UI HUD
        const hud = document.getElementById('three-walk-hud');
        if (hud) hud.style.display = 'none';
        const walkBtnText = document.getElementById('walk-btn-text');
        if (walkBtnText) walkBtnText.textContent = 'Visite ZQSD';
        const walkBtn = document.getElementById('btn-three-walk');
        if (walkBtn) walkBtn.classList.remove('active');
    }

    onWalkKeyDown(e) {
        if (!this.isWalkMode) return;

        // Handle Escape to exit walk mode
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
            const hit = intersects[0].object;
            const el = hit.userData.element;
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

    // ─── Render Loop ────────────────────────────────────────────────

    animate() {
        this.animationFrameId = requestAnimationFrame(() => this.animate());

        const now = performance.now();
        const dt = Math.min((now - this.lastTime) / 1000, 0.1);
        this.lastTime = now;

        // 1. Walk Mode First-Person Kinematics
        if (this.isWalkMode) {
            const moveSpeed = 4.8 * dt; // meters per second
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

            // Fixed eye-level height
            this.camera.position.y = 1.70;
        } else {
            this.controls.update();
        }

        // 2. Live Show Dynamic DMX Animation
        if (this.isLiveShow && this.liveFixtures.length > 0) {
            const time = now * 0.0018;

            this.liveFixtures.forEach((f, idx) => {
                if (f.type === 'movinghead') {
                    // Pan sweeping oscillation (~120 degrees)
                    f.yoke.rotation.y = Math.sin(time * 1.5 + f.phase) * 1.15;

                    // Tilt scanning oscillation
                    f.head.rotation.x = f.origTilt + Math.sin(time * 2.2 + f.phase * 0.8) * 0.42;

                    // HSL dynamic rainbow cycle
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
        if (this.renderer) {
            this.renderer.dispose();
            if (this.renderer.domElement.parentElement) {
                this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
            }
        }
    }
}
