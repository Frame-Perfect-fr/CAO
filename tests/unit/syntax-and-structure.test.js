const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function walkJsFiles(dir) {
    const results = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            results.push(...walkJsFiles(full));
        } else if (entry.name.endsWith('.js')) {
            results.push(full);
        }
    }
    return results;
}

describe('Syntaxe, Structure ES Modules & Polices Locales', () => {
    const rootDir = path.join(__dirname, '..', '..');
    const srcDir = path.join(rootDir, 'src');
    const html = fs.readFileSync(path.join(rootDir, 'index.html'), 'utf8');
    const styleCss = fs.readFileSync(path.join(rootDir, 'style.css'), 'utf8');

    test('Tous les fichiers sources critiques et modules ESM existent', () => {
        const requiredFiles = [
            'index.html',
            'style.css',
            'package.json',
            'vite.config.js',
            'favicon.svg',
            'src/package.json',
            'src/catalog/index.js',
            'src/catalog/furniture-data.js',
            'src/catalog/color-utils.js',
            'src/catalog/render-2d.js',
            'src/canvas/index.js',
            'src/canvas/canvas-engine.js',
            'src/canvas/bom.js',
            'src/canvas/chair-generator.js',
            'src/three/index.js',
            'src/three/three-engine.js',
            'src/three/chair-instancing.js',
            'src/three/floor-textures.js',
            'src/three/builders/architecture.js',
            'src/three/builders/furniture.js',
            'src/three/builders/lighting.js',
            'src/three/builders/characters-and-tech.js',
            'src/app/main.js',
            'src/app/library-panel.js',
            'src/app/properties-panel.js',
            'src/app/layers-panel.js',
            'src/app/chair-modal.js',
            'src/app/bom-modal.js',
            'src/app/view-modes.js',
            'src/app/demo-scene.js',
            'lib/exporters/GLTFExporter.js',
            'lib/exporters/OBJExporter.js',
            'lib/utils/TextureUtils.js'
        ];
        requiredFiles.forEach(file => {
            const p = path.join(rootDir, file);
            assert.ok(fs.existsSync(p), `Le fichier ${file} doit exister`);
            const stat = fs.statSync(p);
            assert.isAbove(stat.size, 10, `Le fichier ${file} ne doit pas être vide`);
        });
    });

    test('Syntaxe JavaScript valide sur tous les modules src/**/*.js', () => {
        const jsFiles = walkJsFiles(srcDir);
        assert.isAbove(jsFiles.length, 15, 'Doit contenir les modules ES découpés sous src/');
        for (const file of jsFiles) {
            const rel = path.relative(rootDir, file);
            assert.doesNotThrow(() => {
                execSync(`node --check "${file}"`, { stdio: 'pipe' });
            }, `${rel} doit avoir une syntaxe JS valide`);
        }
    });

    test('index.html charge l entrypoint ES module sans scripts globaux obsolètes', () => {
        assert.ok(
            html.includes('type="module"') && html.includes('./src/app/main.js'),
            'index.html doit charger ./src/app/main.js en type="module"'
        );
        ['furniture-library.js', 'canvas-engine.js', 'three-engine.js', 'app.js'].forEach(legacy => {
            assert.ok(!html.includes(`"${legacy}`), `index.html ne doit plus charger ${legacy}`);
        });

        const srcPkg = JSON.parse(fs.readFileSync(path.join(srcDir, 'package.json'), 'utf8'));
        assert.strictEqual(srcPkg.type, 'module', 'src/package.json doit déclarer type: module');
    });

    test('Aucun lien externe Google Fonts dans index.html (RGPD & offline)', () => {
        assert.ok(!html.includes('fonts.googleapis.com'), 'Aucune référence à fonts.googleapis.com autorisée');
        assert.ok(!html.includes('fonts.gstatic.com'), 'Aucune référence à fonts.gstatic.com autorisée');
    });

    test('Polices locales Inter et JetBrains Mono déclarées en @font-face et fichiers .woff2 valides présents', () => {
        assert.ok(styleCss.includes('@font-face'), 'style.css doit déclarer des règles @font-face');
        assert.ok(styleCss.includes('font-display: swap'), 'font-display: swap requis');

        ['300', '400', '500', '600', '700'].forEach(w => {
            const regex = new RegExp(`font-family:\\s*'Inter'[\\s\\S]*?font-weight:\\s*${w}`, 'm');
            assert.ok(regex.test(styleCss), `@font-face Inter weight ${w} doit être présent`);
        });

        ['400', '500'].forEach(w => {
            const regex = new RegExp(`font-family:\\s*'JetBrains Mono'[\\s\\S]*?font-weight:\\s*${w}`, 'm');
            assert.ok(regex.test(styleCss), `@font-face JetBrains Mono weight ${w} doit être présent`);
        });

        const fontUrls = [...styleCss.matchAll(/url\(['"]?\.?\/fonts\/([^'")]+)['"]?\)/g)].map(m => m[1]);
        const uniqueFonts = [...new Set(fontUrls)];
        assert.isAbove(uniqueFonts.length, 3, 'Au moins 4 fichiers .woff2 (latin + latin-ext) doivent être référencés');

        for (const fontFile of uniqueFonts) {
            const fullPath = path.join(rootDir, 'public', 'fonts', fontFile);
            assert.ok(fs.existsSync(fullPath), `Le fichier de police public/fonts/${fontFile} doit exister`);
            const buf = fs.readFileSync(fullPath);
            assert.isAbove(buf.length, 5000, `La police ${fontFile} ne doit pas être vide`);
            assert.strictEqual(buf.subarray(0, 4).toString('ascii'), 'wOF2', `${fontFile} doit être un vrai fichier WOFF2`);
        }
    });
});
