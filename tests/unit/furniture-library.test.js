const fs = require('fs');
const path = require('path');
const vm = require('vm');

describe('Bibliothèque de Mobilier & Rendu 2D', () => {
    const furnitureCode = fs.readFileSync(path.join(__dirname, '..', '..', 'furniture-library.js'), 'utf8');

    // Context execution
    const sandbox = {
        console,
        Math,
        Array,
        Object,
        String,
        Number,
        parseInt,
        parseFloat
    };
    vm.createContext(sandbox);
    const exportsObj = vm.runInContext(furnitureCode + '\n;({ FURNITURE_LIBRARY, getContrastColor, adjustBrightness })', sandbox);
    const { FURNITURE_LIBRARY, getContrastColor, adjustBrightness } = exportsObj;

    test('FURNITURE_LIBRARY est défini avec des catégories valides', () => {
        assert.ok(FURNITURE_LIBRARY, 'FURNITURE_LIBRARY doit être défini');
        const categories = Object.keys(FURNITURE_LIBRARY);
        assert.isAbove(categories.length, 3, 'Doit contenir au moins 4 catégories');
        assert.ok(categories.includes('chairs'), 'Catégorie chairs présente');
        assert.ok(categories.includes('tables'), 'Catégorie tables présente');
        assert.ok(categories.includes('scene'), 'Catégorie scene présente');
        assert.ok(categories.includes('tech'), 'Catégorie tech présente');
    });

    test('Tous les éléments du catalogue ont des dimensions et formes valides', () => {
        let totalItems = 0;
        for (const [catKey, cat] of Object.entries(FURNITURE_LIBRARY)) {
            assert.ok(cat.name, `Catégorie ${catKey} doit avoir un nom`);
            assert.ok(Array.isArray(cat.items), `Catégorie ${catKey} doit contenir un tableau items`);
            cat.items.forEach(item => {
                totalItems++;
                assert.ok(item.id, `Item ${item.id || 'sans-id'} doit avoir un id unique`);
                assert.ok(item.name, `Item ${item.id} doit avoir un nom`);
                assert.isAbove(item.width, 0, `Item ${item.id} largeur > 0`);
                assert.isAbove(item.height, 0, `Item ${item.id} profondeur/hauteur > 0`);
                assert.ok(item.shape, `Item ${item.id} doit avoir une forme (shape)`);
                assert.ok(item.color, `Item ${item.id} doit avoir une couleur`);
                assert.strictEqual(item.category, catKey, `Item ${item.id} catégorie correspond`);
            });
        }
        assert.isAbove(totalItems, 20, 'Le catalogue doit compter plus de 20 éléments');
    });

    test('Le meuble TV avec Nintendo Switch et manettes Pro est bien présent', () => {
        const techItems = FURNITURE_LIBRARY.tech.items;
        const tvSwitch = techItems.find(i => i.id === 'tv-stand-switch');
        assert.ok(tvSwitch, 'L élément tv-stand-switch doit exister dans tech');
        assert.strictEqual(tvSwitch.shape, 'tv-switch');
        assert.strictEqual(tvSwitch.width, 1.4);
        assert.strictEqual(tvSwitch.height, 0.55);
    });

    test('Fonctions utilitaires graphiques getContrastColor et adjustBrightness', () => {
        assert.strictEqual(typeof getContrastColor, 'function');
        assert.ok(getContrastColor('#000000').includes('255'), 'Noir -> texte blanc ou clair');
        assert.ok(getContrastColor('#FFFFFF').includes('0,0,0'), 'Blanc -> texte sombre');

        assert.strictEqual(typeof adjustBrightness, 'function');
        const brighter = adjustBrightness('#202020', 20);
        assert.ok(brighter.startsWith('#'), 'Retourne une couleur hex');
    });
});
