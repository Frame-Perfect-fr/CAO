/* ================================================================
   ScenoPlan — 3D Chair Instancing & Export Expansion
   Batches standard chairs into THREE.InstancedMesh draw calls
   and expands InstancedMesh cleanly for GLB / OBJ export.
   ================================================================ */

import * as THREE from 'three';

const X_AXIS = new THREE.Vector3(1, 0, 0);
const Y_AXIS = new THREE.Vector3(0, 1, 0);
const UNIT_SCALE = new THREE.Vector3(1, 1, 1);

/**
 * Checks whether a 2D element maps to the standard 3D chair model
 * (matching the precedence in create3DFurniture).
 */
export function isStandardChairElement(el) {
    if (!el) return false;
    const shape = el.shape || 'rect';
    const id = (el.id || '').toLowerCase();
    const cat = (el.category || '').toLowerCase();

    if (
        id.includes('partition') || id.includes('cloison') ||
        shape === 'barrier' || id.includes('vauban') || id.includes('barriere-vauban') ||
        (cat === 'security' && id.includes('barriere')) ||
        shape === 'fence' || id.includes('heras') || id.includes('cloture') ||
        shape === 'backdrop' || id.includes('fond') || id.includes('backdrop') || cat === 'backgrounds' ||
        shape === 'tent' || id.includes('tente') || id.includes('barnum') || (cat === 'production' && id.includes('tent')) ||
        shape === 'stand' || (cat === 'expo' && id.includes('stand')) ||
        id.includes('totem') ||
        shape === 'barrier-belt' || id.includes('potelet') || id.includes('sangle') ||
        shape === 'cone' || id.includes('cone') ||
        shape === 'vehicle' || id.includes('ambulance') || id.includes('vehicle') ||
        id.includes('toilet') || id.includes('wc') || id.includes('sanitaire') ||
        id.includes('extincteur') || id.includes('extinguisher') ||
        id.includes('jersey') ||
        cat === 'scene' || id.includes('stage') || id.includes('estrade') || shape === 'stage' ||
        id === 'podium' || id.includes('pupitre')
    ) {
        return false;
    }

    return shape === 'chair' || (cat === 'chairs' && (id === 'chair' || el.seats === 1));
}

/**
 * Groups standard chairs by (width, height) and builds THREE.InstancedMesh batches
 * when >= 2 chairs share the same dimensions (3 InstancedMeshes per dimension bucket:
 * seats, backrests, and 4x legs).
 */
export function buildInstancedChairBatches(chairElements, computeElevationFn, to3DCoordsFn, sceneW, sceneH) {
    const buckets = new Map();
    for (const el of chairElements) {
        const w = Math.max(el.width || 0.45, 0.05);
        const d = Math.max(el.height || 0.45, 0.05);
        const key = `${w.toFixed(4)}x${d.toFixed(4)}`;
        if (!buckets.has(key)) buckets.set(key, []);
        buckets.get(key).push({ el, w, d });
    }

    const batchedGroups = [];
    const unbatchedElements = [];

    const chairPos = new THREE.Vector3();
    const chairQuat = new THREE.Quaternion();
    const chairMat4 = new THREE.Matrix4();
    const localMat4 = new THREE.Matrix4();
    const worldMat4 = new THREE.Matrix4();
    const backQuat = new THREE.Quaternion().setFromAxisAngle(X_AXIS, 0.12);
    const backPos = new THREE.Vector3();
    const tmpColor = new THREE.Color();

    for (const bucket of buckets.values()) {
        if (bucket.length < 2) {
            for (const item of bucket) unbatchedElements.push(item.el);
            continue;
        }

        const count = bucket.length;
        const { w, d } = bucket[0];
        const seatH = 0.45;
        const backH = 0.42;
        const lx = (w * 0.85) / 2 - 0.04;
        const lz = (d * 0.85) / 2 - 0.04;
        const legOffsets = [[-lx, -lz], [lx, -lz], [-lx, lz], [lx, lz]];

        const cushionMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.55 });
        const frameMat = new THREE.MeshStandardMaterial({ color: 0x1c1e24, metalness: 0.8, roughness: 0.3 });

        const seatGeo = new THREE.BoxGeometry(w * 0.85, 0.045, d * 0.85);
        const backGeo = new THREE.BoxGeometry(w * 0.82, backH, 0.035);
        const legGeo = new THREE.CylinderGeometry(0.014, 0.011, seatH, 8);

        const seatsMesh = new THREE.InstancedMesh(seatGeo, cushionMat, count);
        seatsMesh.name = 'InstancedChairSeats';
        const backsMesh = new THREE.InstancedMesh(backGeo, cushionMat, count);
        backsMesh.name = 'InstancedChairBacks';
        const legsMesh = new THREE.InstancedMesh(legGeo, frameMat, count * 4);
        legsMesh.name = 'InstancedChairLegs';

        const elementsList = [];

        for (let i = 0; i < count; i++) {
            const { el } = bucket[i];
            elementsList.push(el);

            const pos = to3DCoordsFn(el.x, el.y, el.width, el.height, sceneW, sceneH);
            const elevation = computeElevationFn(el);
            const rotRad = -((el.rotation || 0) * Math.PI) / 180;
            const colorHex = el.color ? parseInt(el.color.replace('#', '0x'), 16) : 0x3d4b60;
            tmpColor.setHex(Number.isFinite(colorHex) ? colorHex : 0x3d4b60);

            chairPos.set(pos.x, elevation, pos.z);
            chairQuat.setFromAxisAngle(Y_AXIS, rotRad);
            chairMat4.compose(chairPos, chairQuat, UNIT_SCALE);

            // Seat
            localMat4.makeTranslation(0, seatH, 0);
            worldMat4.multiplyMatrices(chairMat4, localMat4);
            seatsMesh.setMatrixAt(i, worldMat4);
            seatsMesh.setColorAt(i, tmpColor);

            // Backrest
            backPos.set(0, seatH + backH / 2 + 0.02, -lz);
            localMat4.compose(backPos, backQuat, UNIT_SCALE);
            worldMat4.multiplyMatrices(chairMat4, localMat4);
            backsMesh.setMatrixAt(i, worldMat4);
            backsMesh.setColorAt(i, tmpColor);

            // 4 Legs
            for (let j = 0; j < 4; j++) {
                const [px, pz] = legOffsets[j];
                localMat4.makeTranslation(px, seatH / 2, pz);
                worldMat4.multiplyMatrices(chairMat4, localMat4);
                legsMesh.setMatrixAt(i * 4 + j, worldMat4);
            }
        }

        [seatsMesh, backsMesh, legsMesh].forEach((mesh, idx) => {
            mesh.instanceMatrix.needsUpdate = true;
            if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            mesh.computeBoundingSphere();
            mesh.userData = {
                elements: elementsList,
                instancesPerElement: idx === 2 ? 4 : 1
            };
        });

        const batchGroup = new THREE.Group();
        batchGroup.name = 'InstancedChairsBatch';
        batchGroup.userData = { isChairBatch: true, count };
        batchGroup.add(seatsMesh, backsMesh, legsMesh);
        batchedGroups.push(batchGroup);
    }

    return { batchedGroups, unbatchedElements };
}

/**
 * Expands any THREE.InstancedMesh inside a cloned export scene into standard
 * THREE.Mesh nodes so both GLTFExporter (without requiring EXT_mesh_gpu_instancing)
 * and OBJExporter export all instances at their exact transforms and colors.
 * Returns a cleanup callback to dispose temporary materials created for export.
 */
export function expandInstancedMeshesForExport(root) {
    const instancedMeshes = [];
    root.traverse((obj) => {
        if (obj.isInstancedMesh) {
            instancedMeshes.push(obj);
        }
    });

    const createdMaterials = [];
    const instanceMat4 = new THREE.Matrix4();
    const pos = new THREE.Vector3();
    const quat = new THREE.Quaternion();
    const scl = new THREE.Vector3();
    const tmpColor = new THREE.Color();

    for (const instMesh of instancedMeshes) {
        const parent = instMesh.parent;
        if (!parent) continue;

        const group = new THREE.Group();
        group.name = instMesh.name || 'ExpandedInstances';
        group.position.copy(instMesh.position);
        group.quaternion.copy(instMesh.quaternion);
        group.scale.copy(instMesh.scale);

        const colorMatCache = new Map();

        for (let i = 0; i < instMesh.count; i++) {
            instMesh.getMatrixAt(i, instanceMat4);
            instanceMat4.decompose(pos, quat, scl);

            let mat = instMesh.material;
            if (instMesh.instanceColor) {
                instMesh.getColorAt(i, tmpColor);
                const hexKey = tmpColor.getHexString();
                if (colorMatCache.has(hexKey)) {
                    mat = colorMatCache.get(hexKey);
                } else {
                    if (Array.isArray(instMesh.material)) {
                        mat = instMesh.material.map(m => {
                            const cloned = m.clone();
                            if (cloned.color) cloned.color.copy(tmpColor);
                            createdMaterials.push(cloned);
                            return cloned;
                        });
                    } else {
                        mat = instMesh.material.clone();
                        if (mat.color) mat.color.copy(tmpColor);
                        createdMaterials.push(mat);
                    }
                    colorMatCache.set(hexKey, mat);
                }
            }

            const mesh = new THREE.Mesh(instMesh.geometry, mat);
            mesh.name = `${instMesh.name || 'instance'}_${i}`;
            mesh.position.copy(pos);
            mesh.quaternion.copy(quat);
            mesh.scale.copy(scl);
            group.add(mesh);
        }

        parent.remove(instMesh);
        parent.add(group);
        if (typeof instMesh.dispose === 'function') {
            instMesh.dispose();
        }
    }

    return () => {
        createdMaterials.forEach(m => m.dispose());
    };
}
