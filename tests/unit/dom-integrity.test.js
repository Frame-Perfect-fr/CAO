const fs = require('fs');
const path = require('path');

function readAllJsInDir(dir) {
    let content = '';
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            content += readAllJsInDir(full);
        } else if (entry.name.endsWith('.js')) {
            content += '\n' + fs.readFileSync(full, 'utf8');
        }
    }
    return content;
}

describe('Intégrité du DOM HTML & Concordance des Sélecteurs', () => {
    const rootDir = path.join(__dirname, '..', '..');
    const html = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
    const appModulesCode = readAllJsInDir(path.join(rootDir, 'src', 'app'));
    const canvasModulesCode = readAllJsInDir(path.join(rootDir, 'src', 'canvas'));

    test('Tous les document.getElementById des modules src/app/* existent dans index.html', () => {
        const idRegex = /getElementById\(['"]([^'"]+)['"]\)/g;
        let match;
        const missing = [];
        while ((match = idRegex.exec(appModulesCode)) !== null) {
            const id = match[1];
            const p1 = `id="${id}"`;
            const p2 = `id='${id}'`;
            if (!html.includes(p1) && !html.includes(p2)) {
                missing.push(id);
            }
        }
        assert.deepStrictEqual(missing, [], `IDs introuvables dans index.html: ${missing.join(', ')}`);
    });

    test('Tous les document.getElementById des modules src/canvas/* existent dans index.html', () => {
        const idRegex = /getElementById\(['"]([^'"]+)['"]\)/g;
        let match;
        const missing = [];
        while ((match = idRegex.exec(canvasModulesCode)) !== null) {
            const id = match[1];
            const p1 = `id="${id}"`;
            const p2 = `id='${id}'`;
            if (!html.includes(p1) && !html.includes(p2)) {
                missing.push(id);
            }
        }
        assert.deepStrictEqual(missing, [], `IDs de src/canvas introuvables: ${missing.join(', ')}`);
    });

    test('Pas d IDs dupliqués dans index.html', () => {
        const idAttrRegex = /\bid=["']([^"']+)["']/g;
        let match;
        const seen = new Set();
        const duplicates = [];
        while ((match = idAttrRegex.exec(html)) !== null) {
            const id = match[1];
            if (seen.has(id)) {
                duplicates.push(id);
            }
            seen.add(id);
        }
        assert.deepStrictEqual(duplicates, [], `IDs dupliqués détectés dans index.html: ${duplicates.join(', ')}`);
    });

    test('Les éléments d interface des Calques et Chaises sont présents', () => {
        const requiredIds = [
            'tab-btn-props',
            'tab-btn-layers',
            'properties-content',
            'layers-content',
            'layers-list',
            'layers-search',
            'layers-badge',
            'chair-generator-modal',
            'cg-rows',
            'cg-seats',
            'cg-has-aisle',
            'cg-aisle-width',
            'btn-generate-chairs',
            'bom-modal',
            'btn-bom-inventory',
            'tool-bom-inventory',
            'btn-close-bom-modal',
            'btn-export-bom-csv',
            'btn-print-bom',
            'bom-search',
            'bom-tbody',
            'btn-export-glb',
            'btn-three-export-glb'
        ];
        requiredIds.forEach(id => {
            assert.ok(html.includes(`id="${id}"`), `L ID requis #${id} doit être présent dans index.html`);
        });
    });
});
