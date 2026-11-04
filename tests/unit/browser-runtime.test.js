const fs = require('fs');
const path = require('path');
const vm = require('vm');

describe('Simulation Runtime Navigateur (End-to-End)', () => {
    const rootDir = path.join(__dirname, '..', '..');
    const html = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
    const furnitureCode = fs.readFileSync(path.join(rootDir, 'furniture-library.js'), 'utf8');
    const canvasCode = fs.readFileSync(path.join(rootDir, 'canvas-engine.js'), 'utf8');
    const appCode = fs.readFileSync(path.join(rootDir, 'app.js'), 'utf8');

    // Parse all HTML elements with ID
    const idMap = new Map();
    const idRegex = /<([a-zA-Z0-9]+)[^>]*\bid=["']([^"']+)["'][^>]*>/g;
    let m;
    while ((m = idRegex.exec(html)) !== null) {
        idMap.set(m[2], m[1]);
    }

    function createMockElement(tagName, id = '', className = '') {
        const el = {
            tagName: tagName.toUpperCase(),
            id,
            className,
            classList: {
                _classes: new Set(className ? className.split(/\s+/) : []),
                add(...cls) { cls.forEach(c => this._classes.add(c)); },
                remove(...cls) { cls.forEach(c => this._classes.delete(c)); },
                toggle(c, force) {
                    if (force === true) this._classes.add(c);
                    else if (force === false) this._classes.delete(c);
                    else if (this._classes.has(c)) this._classes.delete(c);
                    else this._classes.add(c);
                },
                contains(c) { return this._classes.has(c); }
            },
            style: {},
            dataset: {},
            children: [],
            childNodes: [],
            value: '',
            checked: false,
            textContent: '',
            innerHTML: '',
            _listeners: {},
            addEventListener(type, cb) {
                this._listeners[type] = this._listeners[type] || [];
                this._listeners[type].push(cb);
            },
            removeEventListener() {},
            dispatchEvent(e) {
                if (!e.target) e.target = this;
                if (this._listeners[e.type]) {
                    this._listeners[e.type].forEach(cb => cb(e));
                }
            },
            appendChild(child) {
                this.children.push(child);
                this.childNodes.push(child);
                return child;
            },
            removeChild(child) {
                const idx = this.children.indexOf(child);
                if (idx !== -1) this.children.splice(idx, 1);
                return child;
            },
            querySelectorAll(sel) {
                return [];
            },
            querySelector(sel) {
                return null;
            },
            getBoundingClientRect() {
                return { left: 0, top: 0, width: 1200, height: 800 };
            },
            getContext() {
                return {
                    save() {}, restore() {}, translate() {}, rotate() {}, scale() {},
                    setTransform() {}, beginPath() {}, closePath() {}, moveTo() {}, lineTo() {},
                    arc() {}, ellipse() {}, rect() {}, fill() {}, stroke() {}, strokeRect() {},
                    fillRect() {}, clearRect() {}, fillText() {}, strokeText() {}, clip() {},
                    quadraticCurveTo() {}, bezierCurveTo() {}, setLineDash() {},
                    measureText: () => ({ width: 40 }),
                    drawImage() {}
                };
            },
            focus() {},
            blur() {},
            scrollIntoView() {}
        };
        return el;
    }

    const elementsById = new Map();
    for (const [id, tag] of idMap.entries()) {
        const el = createMockElement(tag, id);
        if (id === 'project-name') el.value = 'Projet Test';
        if (id === 'scene-width') el.value = '30';
        if (id === 'scene-height') el.value = '20';
        if (id === 'cg-rows') el.value = '4';
        if (id === 'cg-seats') el.value = '6';
        if (id === 'cg-has-aisle') el.checked = true;
        if (id === 'cg-aisle-width') el.value = '1.40';
        if (id === 'cg-number-seats') el.checked = true;
        if (id === 'cg-rotation') el.value = '180';
        elementsById.set(id, el);
    }

    const doc = {
        getElementById(id) {
            return elementsById.get(id) || null;
        },
        querySelector(sel) {
            if (sel.startsWith('#')) return this.getElementById(sel.slice(1));
            return createMockElement('div');
        },
        querySelectorAll() { return []; },
        createElement(tag) { return createMockElement(tag); },
        addEventListener(type, cb) {
            if (type === 'DOMContentLoaded') this._readyCb = cb;
        },
        removeEventListener() {},
        documentElement: createMockElement('html'),
        body: createMockElement('body')
    };

    const win = {
        document: doc,
        window: null,
        addEventListener() {},
        removeEventListener() {},
        dispatchEvent() {},
        devicePixelRatio: 1,
        innerWidth: 1200,
        innerHeight: 800,
        console: { log() {}, warn() {}, error(...args) { runtimeErrors.push(args.join(' ')); } },
        setTimeout: (fn) => setTimeout(fn, 0),
        clearTimeout() {},
        setInterval: () => 1,
        clearInterval() {},
        requestAnimationFrame: (cb) => setTimeout(cb, 16),
        alert() {},
        prompt: () => 'Test',
        confirm: () => true,
        open: () => ({ document: { write() {} } }),
        getComputedStyle: () => ({ getPropertyValue: () => '#181b22' })
    };
    win.window = win;

    const runtimeErrors = [];

    const context = vm.createContext({
        window: win,
        document: doc,
        getComputedStyle: win.getComputedStyle,
        console: win.console,
        setTimeout, clearTimeout, setInterval, clearInterval,
        requestAnimationFrame: win.requestAnimationFrame,
        alert: win.alert, prompt: win.prompt, confirm: win.confirm,
        CustomEvent: class CustomEvent { constructor(n) { this.type = n; } },
        Event: class Event { constructor(n) { this.type = n; } },
        Math, JSON, Date, Array, Object, String, Number, Boolean, Set, Map,
        parseInt, parseFloat, isNaN, isFinite
    });

    test('Chargement sans erreur des scripts et déclenchement DOMContentLoaded', () => {
        assert.doesNotThrow(() => {
            vm.runInContext(furnitureCode, context);
            vm.runInContext(canvasCode, context);
            vm.runInContext(appCode, context);
            if (doc._readyCb) doc._readyCb();
        }, 'Le démarrage complet de l application ne doit lever aucune exception');

        assert.deepStrictEqual(runtimeErrors, [], `Aucune erreur console.error pendant le démarrage: ${runtimeErrors.join('; ')}`);
    });

    test('Interaction avec les onglets Propriétés / Calques', () => {
        const tabBtnLayers = doc.getElementById('tab-btn-layers');
        const tabBtnProps = doc.getElementById('tab-btn-props');
        assert.ok(tabBtnLayers, 'Bouton onglet calques présent');
        assert.ok(tabBtnProps, 'Bouton onglet propriétés présent');

        assert.doesNotThrow(() => {
            tabBtnLayers.dispatchEvent({ type: 'click' });
            tabBtnProps.dispatchEvent({ type: 'click' });
        }, 'La bascule entre onglets ne doit pas lever d exception');
    });

    test('Déclenchement du Générateur de Parterre depuis l interface', () => {
        const btnGenerate = doc.getElementById('btn-generate-chairs');
        assert.ok(btnGenerate, 'Bouton générer parterre présent');

        assert.doesNotThrow(() => {
            btnGenerate.dispatchEvent({ type: 'click' });
        }, 'Le clic sur générer parterre ne doit pas lever d exception');
    });

    test('Ouverture, filtrage et fermeture du Modal Nomenclature (BOM)', () => {
        const btnBom = doc.getElementById('btn-bom-inventory');
        const btnClose = doc.getElementById('btn-close-bom-modal');
        const bomModal = doc.getElementById('bom-modal');

        assert.ok(btnBom, 'Bouton nomenclature BOM présent');
        assert.ok(btnClose, 'Bouton fermeture BOM présent');
        assert.ok(bomModal, 'Modal BOM présent');

        assert.doesNotThrow(() => {
            btnBom.dispatchEvent({ type: 'click' });
            assert.strictEqual(bomModal.style.display, 'flex', 'Modal BOM doit être ouvert');

            const searchInput = doc.getElementById('bom-search');
            if (searchInput) {
                searchInput.value = 'Chaise';
                searchInput.dispatchEvent({ type: 'input' });
            }

            btnClose.dispatchEvent({ type: 'click' });
            assert.strictEqual(bomModal.style.display, 'none', 'Modal BOM doit être fermé');
        }, 'L interaction avec la nomenclature BOM ne doit pas lever d exception');
    });
});
