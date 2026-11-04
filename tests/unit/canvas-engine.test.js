const fs = require('fs');
const path = require('path');
const vm = require('vm');

describe('Moteur Canvas 2D & Logique Métier', () => {
    const furnitureCode = fs.readFileSync(path.join(__dirname, '..', '..', 'furniture-library.js'), 'utf8');
    const canvasCode = fs.readFileSync(path.join(__dirname, '..', '..', 'canvas-engine.js'), 'utf8');

    function createEngineInstance() {
        const fakeCtx = {
            save() {}, restore() {}, translate() {}, rotate() {}, scale() {},
            setTransform() {}, beginPath() {}, closePath() {}, moveTo() {}, lineTo() {},
            arc() {}, ellipse() {}, rect() {}, fill() {}, stroke() {}, strokeRect() {},
            fillRect() {}, clearRect() {}, fillText() {}, strokeText() {},
            setLineDash() {}, clip() {}, quadraticCurveTo() {}, bezierCurveTo() {},
            measureText: () => ({ width: 40 }),
            drawImage() {}
        };

        const fakeCanvas = {
            width: 1200,
            height: 800,
            style: {},
            getBoundingClientRect: () => ({ left: 0, top: 0, width: 1200, height: 800 }),
            getContext: () => fakeCtx,
            addEventListener() {},
            removeEventListener() {}
        };

        const fakeContainer = {
            clientWidth: 1200,
            clientHeight: 800,
            className: '',
            classList: { add() {}, remove() {}, toggle() {}, contains: () => false },
            appendChild() {},
            getBoundingClientRect: () => ({ left: 0, top: 0, width: 1200, height: 800 }),
            addEventListener() {}
        };

        const fakeDocument = {
            getElementById: (id) => {
                if (id === 'plan-canvas') return fakeCanvas;
                if (id === 'canvas-container') return fakeContainer;
                return {
                    value: id === 'project-name' ? 'Mon Projet' : '30',
                    style: {},
                    textContent: '',
                    classList: { add() {}, remove() {}, toggle() {} },
                    addEventListener() {}
                };
            },
            querySelectorAll: () => [],
            createElement: () => ({
                width: 100, height: 100,
                getContext: () => fakeCtx,
                toDataURL: () => 'data:image/png;base64,mock'
            })
        };

        const sandbox = {
            console,
            Math,
            Array,
            Object,
            String,
            Number,
            parseInt,
            parseFloat,
            document: fakeDocument,
            window: {
                devicePixelRatio: 1,
                addEventListener() {},
                removeEventListener() {},
                getComputedStyle: () => ({ getPropertyValue: () => '#181b22' })
            },
            getComputedStyle: () => ({ getPropertyValue: () => '#181b22' })
        };

        vm.createContext(sandbox);
        vm.runInContext(furnitureCode, sandbox);
        const CanvasEngine = vm.runInContext(canvasCode + '\n;CanvasEngine', sandbox);

        const engine = new CanvasEngine('plan-canvas', 'canvas-container');
        return { engine, sandbox };
    }

    test('Initialisation correcte de CanvasEngine', () => {
        const { engine } = createEngineInstance();
        assert.ok(engine, 'L instance CanvasEngine doit être créée');
        assert.strictEqual(engine.sceneWidth, 30);
        assert.strictEqual(engine.sceneHeight, 20);
        assert.strictEqual(engine.elements.length, 0);
    });

    test('Ajout, duplication et suppression d éléments (CRUD)', () => {
        const { engine } = createEngineInstance();

        // Add
        const template = { id: 'table', name: 'Table Régie', width: 2, height: 1, color: '#333333', shape: 'rect' };
        const el = engine.addElement(template, 5, 5);
        assert.strictEqual(engine.elements.length, 1);
        assert.strictEqual(el.name, 'Table Régie');

        // Duplicate
        const dup = engine.duplicateElement(el);
        assert.strictEqual(engine.elements.length, 2);
        assert.ok(dup.uid !== el.uid, 'Le duplicata doit avoir un UID unique');
        assert.strictEqual(dup.x, el.x + 0.5);

        // Remove
        engine.removeElement(dup);
        assert.strictEqual(engine.elements.length, 1);
        engine.removeElement(el);
        assert.strictEqual(engine.elements.length, 0);
    });

    test('Gestion des calques : masquage, verrouillage, ordre et centrage', () => {
        const { engine } = createEngineInstance();
        const template1 = { id: 'chair-1', name: 'A-1', width: 0.45, height: 0.45, color: '#4A607A', shape: 'chair' };
        const template2 = { id: 'chair-2', name: 'A-2', width: 0.45, height: 0.45, color: '#4A607A', shape: 'chair' };
        const el1 = engine.addElement(template1, 2, 2);
        const el2 = engine.addElement(template2, 3, 2);

        // Masquage
        engine.setElementHidden(el1, true);
        assert.strictEqual(el1.hidden, true);
        assert.strictEqual(engine.hitTest(2.2, 2.2), null, 'Un élément masqué ne doit pas être cliquable');

        // Verrouillage
        engine.setElementLocked(el2, true);
        assert.strictEqual(el2.locked, true);

        // Réorganisation d ordre
        assert.strictEqual(engine.elements[0], el1);
        assert.strictEqual(engine.elements[1], el2);
        engine.moveElementLayer(el1, 1);
        assert.strictEqual(engine.elements[0], el2);
        assert.strictEqual(engine.elements[1], el1);

        // Pan to element
        engine.panToElement(el2);
        assert.ok(typeof engine.panX === 'number' && !isNaN(engine.panX));
    });

    test('Undo / Redo restaure fidèlement l état', () => {
        const { engine } = createEngineInstance();
        const t = { id: 'chair', name: 'Chaise 1', width: 0.45, height: 0.45, color: '#4A607A', shape: 'chair' };

        engine.addElement(t, 2, 2);
        assert.strictEqual(engine.elements.length, 1);

        engine.addElement(t, 4, 4);
        assert.strictEqual(engine.elements.length, 2);

        engine.undo();
        assert.strictEqual(engine.elements.length, 1);

        engine.redo();
        assert.strictEqual(engine.elements.length, 2);
    });

    test('Générateur automatique de rangées de chaises (Parterre)', () => {
        const { engine } = createEngineInstance();

        const result = engine.generateChairBlock({
            rows: 4,
            seatsPerRow: 6,
            hasAisle: true,
            aisleWidth: 1.40,
            numberSeats: true
        });

        assert.strictEqual(result.totalChairs, 24, '4 rangées de 6 = 24 chaises');
        assert.strictEqual(engine.elements.length, 24);

        // Vérification numérotation (A-1..A-6, B-1..)
        const chair1 = engine.elements[0];
        const chair6 = engine.elements[5];
        const chair7 = engine.elements[6];
        assert.strictEqual(chair1.name, 'A-1');
        assert.strictEqual(chair6.name, 'A-6');
        assert.strictEqual(chair7.name, 'B-1');

        // Annulation atomique en 1 seul Ctrl+Z
        engine.undo();
        assert.strictEqual(engine.elements.length, 0, 'Undo atomique doit retirer les 24 chaises d un coup');
    });

    test('Sérialisation et désérialisation JSON', () => {
        const { engine } = createEngineInstance();
        engine.addElement({ id: 'scene', name: 'Scène 6x4', width: 6, height: 4, color: '#2C3E50', shape: 'rect' }, 10, 5);

        const json = engine.serialize();
        assert.ok(json.includes('Scène 6x4'));

        const newInstance = createEngineInstance().engine;
        const success = newInstance.deserialize(json);
        assert.strictEqual(success, true);
        assert.strictEqual(newInstance.elements.length, 1);
        assert.strictEqual(newInstance.elements[0].name, 'Scène 6x4');
    });

    test('Nomenclature & Inventaire Matériel (getBOMInventory)', () => {
        const { engine } = createEngineInstance();

        // Add 10 chairs, 2 tables with seats, 1 vauban barrier (2m), 1 light
        for (let i = 0; i < 10; i++) {
            engine.addElement({ id: 'chair', name: `A-${i+1}`, category: 'chairs', shape: 'chair', width: 0.45, height: 0.45, color: '#4A607A' }, i, 2);
        }
        engine.addElement({ id: 'table-rect-6', name: 'Table 1', category: 'tables', shape: 'rect', width: 2, height: 1, seats: 6, color: '#888888' }, 2, 5);
        engine.addElement({ id: 'table-rect-6', name: 'Table 2', category: 'tables', shape: 'rect', width: 2, height: 1, seats: 6, color: '#888888' }, 5, 5);
        engine.addElement({ id: 'barrier-vauban', name: 'Barrière Vauban', category: 'deco', shape: 'barrier', width: 2.5, height: 0.5, isWall: false, color: '#aaaaaa' }, 0, 10);
        engine.addElement({ id: 'par-stand', name: 'Projecteur PAR', category: 'tech', shape: 'stand', width: 0.8, height: 0.8, color: '#333333' }, 0, 0);

        const bom = engine.getBOMInventory();

        assert.strictEqual(bom.totalItems, 14, '10 chaises + 2 tables + 1 barrière + 1 projecteur = 14');
        assert.strictEqual(bom.totalSeats, 22, '10 chaises + 2 x 6 places sur tables = 22');
        assert.strictEqual(bom.totalLinear, 2.5, 'Linéaire barrière = 2.5m');
        assert.isAbove(bom.totalOccupiedArea, 5, 'Surface occupée positive');
        assert.isAbove(bom.freeArea, 500, 'Surface libre calculée');

        // Grouped items
        const chairGroup = bom.items.find(i => i.id === 'chair');
        assert.ok(chairGroup, 'Groupe de chaises présent');
        assert.strictEqual(chairGroup.count, 10);

        const tableGroup = bom.items.find(i => i.id === 'table-rect-6');
        assert.ok(tableGroup, 'Groupe de tables présent');
        assert.strictEqual(tableGroup.count, 2);
    });

    test('Export CSV de la Nomenclature avec encodage UTF-8 BOM', () => {
        const { engine } = createEngineInstance();
        engine.addElement({ id: 'chair', name: 'Chaise VIP', category: 'chairs', shape: 'chair', width: 0.45, height: 0.45, color: '#4A607A' }, 2, 2);

        const csv = engine.exportBOMCSV();
        assert.ok(csv.startsWith('\uFEFF'), 'Doit démarrer par le BOM UTF-8 pour Excel');
        assert.ok(csv.includes('Nomenclature Matériel'), 'En-tête présent');
        assert.ok(csv.includes('Chaise VIP') || csv.includes('chair'), 'Élément listé dans le CSV');
    });
});
