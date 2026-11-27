const path = require('path');
const { register } = require('node:module');
const { pathToFileURL } = require('url');

registerAsyncSuite(async () => {
    const rootDir = path.join(__dirname, '..', '..');
    const libDirUrl = pathToFileURL(path.join(rootDir, 'lib')).href;
    const threeModuleUrl = pathToFileURL(path.join(rootDir, 'lib', 'three.module.js')).href;

    // Register ESM hook so Node 20/22 resolves 'three' and 'three/addons/*' directly from ./lib without requiring node_modules
    const loaderSource = `
        export async function resolve(specifier, context, nextResolve) {
            if (specifier === 'three') {
                return { shortCircuit: true, url: ${JSON.stringify(threeModuleUrl)}, format: 'module' };
            }
            if (specifier.startsWith('three/addons/')) {
                const sub = specifier.slice('three/addons/'.length);
                return { shortCircuit: true, url: ${JSON.stringify(libDirUrl + '/')} + sub, format: 'module' };
            }
            return nextResolve(specifier, context);
        }
        export async function load(url, context, nextLoad) {
            if (url.startsWith(${JSON.stringify(libDirUrl)}) && url.endsWith('.js')) {
                return nextLoad(url, { ...context, format: 'module' });
            }
            return nextLoad(url, context);
        }
    `;
    register('data:text/javascript,' + encodeURIComponent(loaderSource));

    const THREE = await import('three');
    const { GLTFExporter } = await import('three/addons/exporters/GLTFExporter.js');
    const { OBJExporter } = await import('three/addons/exporters/OBJExporter.js');
    const instancingUrl = pathToFileURL(path.join(rootDir, 'src', 'three', 'chair-instancing.js')).href;
    const threeEngineUrl = pathToFileURL(path.join(rootDir, 'src', 'three', 'three-engine.js')).href;

    const {
        isStandardChairElement,
        buildInstancedChairBatches,
        expandInstancedMeshesForExport
    } = await import(instancingUrl);
    const { ThreeEngine } = await import(threeEngineUrl);

    function makeChair(i, x, y, color = '#4A607A', rotation = 180) {
        return {
            id: 'chair',
            name: `A-${i + 1}`,
            category: 'chairs',
            shape: 'chair',
            width: 0.45,
            height: 0.45,
            x,
            y,
            rotation,
            color
        };
    }

    await describe('Instancing 3D (THREE.InstancedMesh) & Export GLB / OBJ', async () => {
        test('isStandardChairElement identifie uniquement les chaises standard', () => {
            assert.strictEqual(isStandardChairElement(makeChair(0, 1, 1)), true);
            assert.strictEqual(isStandardChairElement({ id: 'custom', category: 'chairs', seats: 1 }), true);
            assert.strictEqual(isStandardChairElement({ id: 'table-rect-6', category: 'tables', shape: 'rect' }), false);
            assert.strictEqual(isStandardChairElement({ id: 'sofa-2', category: 'chairs', shape: 'rect-rounded' }), false);
            assert.strictEqual(isStandardChairElement({ id: 'stage-large', category: 'scene', shape: 'stage' }), false);
        });

        test('buildInstancedChairBatches regroupe >= 2 chaises en 3 InstancedMesh (assise, dossier, 4 pieds)', () => {
            const chairs = [];
            for (let r = 0; r < 4; r++) {
                for (let c = 0; c < 12; c++) {
                    chairs.push(makeChair(r * 12 + c, c * 0.53, r * 0.95, r === 0 ? '#8B3A3A' : '#4A607A'));
                }
            }

            const { batchedGroups, unbatchedElements } = buildInstancedChairBatches(
                chairs,
                () => 0,
                (x, y, w, h, sw, sh) => ({ x: (x + w / 2) - sw / 2, z: (y + h / 2) - sh / 2 }),
                30,
                20
            );

            assert.strictEqual(unbatchedElements.length, 0, 'Toutes les 48 chaises doivent être batchées');
            assert.strictEqual(batchedGroups.length, 1, '1 seul groupe batch pour les chaises 0.45x0.45');

            const batchGroup = batchedGroups[0];
            assert.strictEqual(batchGroup.children.length, 3, 'Exactement 3 InstancedMesh (assises, dossiers, pieds)');

            const [seatsMesh, backsMesh, legsMesh] = batchGroup.children;
            assert.strictEqual(seatsMesh.isInstancedMesh, true);
            assert.strictEqual(backsMesh.isInstancedMesh, true);
            assert.strictEqual(legsMesh.isInstancedMesh, true);

            assert.strictEqual(seatsMesh.count, 48);
            assert.strictEqual(backsMesh.count, 48);
            assert.strictEqual(legsMesh.count, 48 * 4);

            // Verify per-instance color & raycast element mapping
            const c0 = new THREE.Color();
            const c12 = new THREE.Color();
            seatsMesh.getColorAt(0, c0);
            seatsMesh.getColorAt(12, c12);
            assert.ok(c0.getHexString() !== c12.getHexString(), 'Les couleurs par instance doivent être préservées');
            assert.strictEqual(seatsMesh.userData.elements[0].name, 'A-1');
            assert.strictEqual(legsMesh.userData.instancesPerElement, 4);

            // Dispose cleanly
            batchGroup.traverse((obj) => {
                if (obj.geometry) obj.geometry.dispose();
                if (obj.material) obj.material.dispose();
                if (obj.isInstancedMesh) obj.dispose();
            });
        });

        test('Une chaise isolée reste en unbatchedElements sans InstancedMesh', () => {
            const single = [makeChair(0, 5, 5)];
            const { batchedGroups, unbatchedElements } = buildInstancedChairBatches(
                single,
                () => 0,
                (x, y, w, h, sw, sh) => ({ x: (x + w / 2) - sw / 2, z: (y + h / 2) - sh / 2 }),
                30,
                20
            );
            assert.strictEqual(batchedGroups.length, 0);
            assert.strictEqual(unbatchedElements.length, 1);
        });

        test('expandInstancedMeshesForExport convertit InstancedMesh et permet export OBJ sans perte', () => {
            const chairs = [makeChair(0, 2, 2, '#4A607A'), makeChair(1, 3, 2, '#8B3A3A'), makeChair(2, 4, 2, '#4A607A')];
            const { batchedGroups } = buildInstancedChairBatches(
                chairs,
                () => 0,
                (x, y, w, h, sw, sh) => ({ x: (x + w / 2) - sw / 2, z: (y + h / 2) - sh / 2 }),
                30,
                20
            );

            const exportScene = new THREE.Scene();
            exportScene.add(batchedGroups[0].clone(true));

            const cleanup = expandInstancedMeshesForExport(exportScene);
            exportScene.updateMatrixWorld(true);

            let instCount = 0;
            let meshCount = 0;
            exportScene.traverse(obj => {
                if (obj.isInstancedMesh) instCount++;
                else if (obj.isMesh) meshCount++;
            });

            assert.strictEqual(instCount, 0, 'Aucun InstancedMesh restant après expansion');
            assert.strictEqual(meshCount, 3 * 6, '3 chaises x (1 assise + 1 dossier + 4 pieds) = 18 Mesh');

            const objExporter = new OBJExporter();
            const objText = objExporter.parse(exportScene);
            const objObjects = objText.match(/^o /gm) || [];
            assert.strictEqual(objObjects.length, 18, 'OBJExporter doit exporter les 18 maillages des 3 chaises');

            cleanup();
        });

        await testAsync('GLTFExporter exporte une scène avec chaises instanciées expandées en GLB valide', async () => {
            const prevFileReader = global.FileReader;
            global.FileReader = class MockFileReader {
                readAsArrayBuffer(blob) {
                    blob.arrayBuffer().then((buf) => {
                        this.result = buf;
                        if (typeof this.onloadend === 'function') this.onloadend();
                        if (typeof this.onload === 'function') this.onload({ target: this });
                    });
                }
            };

            try {
                const chairs = [makeChair(0, 1, 1, '#4A607A'), makeChair(1, 2, 1, '#8B3A3A')];
                const { batchedGroups } = buildInstancedChairBatches(
                    chairs,
                    () => 0,
                    (x, y, w, h, sw, sh) => ({ x: (x + w / 2) - sw / 2, z: (y + h / 2) - sh / 2 }),
                    30,
                    20
                );

                const exportScene = new THREE.Scene();
                exportScene.add(batchedGroups[0].clone(true));
                const cleanup = expandInstancedMeshesForExport(exportScene);

                const gltfExporter = new GLTFExporter();
                const glb = await new Promise((resolve, reject) => {
                    gltfExporter.parse(exportScene, resolve, reject, { binary: true, onlyVisible: true });
                });
                cleanup();

                assert.ok(glb instanceof ArrayBuffer, 'GLTFExporter doit retourner un ArrayBuffer binaire');
                const magic = Buffer.from(glb, 0, 4).toString('ascii');
                assert.strictEqual(magic, 'glTF', 'En-tête binaire GLB valide');
                assert.isAbove(glb.byteLength, 500, 'Le fichier GLB exporté doit contenir la géométrie des chaises');
            } finally {
                global.FileReader = prevFileReader;
            }
        });

        test('clearGroup dispose proprement les InstancedMesh sans erreur lors de rebuild', () => {
            const chairs = [makeChair(0, 1, 1), makeChair(1, 2, 1)];
            const { batchedGroups } = buildInstancedChairBatches(
                chairs,
                () => 0,
                (x, y, w, h, sw, sh) => ({ x: (x + w / 2) - sw / 2, z: (y + h / 2) - sh / 2 }),
                30,
                20
            );
            const group = new THREE.Group();
            group.add(batchedGroups[0]);

            let disposedEvents = 0;
            group.traverse(obj => {
                if (obj.isInstancedMesh) {
                    obj.addEventListener('dispose', () => { disposedEvents++; });
                }
            });

            ThreeEngine.prototype.clearGroup.call({}, group);
            assert.strictEqual(group.children.length, 0, 'Le groupe doit être vidé');
            assert.strictEqual(disposedEvents, 3, 'Les 3 InstancedMesh doivent recevoir dispose()');
        });
    });
});
