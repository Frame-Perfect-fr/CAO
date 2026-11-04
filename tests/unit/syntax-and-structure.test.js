const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

describe('Syntaxe & Intégrité des Fichiers', () => {
    const rootDir = path.join(__dirname, '..', '..');

    test('Tous les fichiers sources critiques existent', () => {
        const requiredFiles = [
            'index.html',
            'style.css',
            'app.js',
            'canvas-engine.js',
            'furniture-library.js',
            'three-engine.js',
            'package.json',
            'favicon.svg'
        ];
        requiredFiles.forEach(file => {
            const p = path.join(rootDir, file);
            assert.ok(fs.existsSync(p), `Le fichier ${file} doit exister`);
            const stat = fs.statSync(p);
            assert.isAbove(stat.size, 10, `Le fichier ${file} ne doit pas être vide`);
        });
    });

    test('Syntaxe JavaScript valide sur app.js', () => {
        assert.doesNotThrow(() => {
            execSync(`node --check "${path.join(rootDir, 'app.js')}"`, { stdio: 'pipe' });
        }, 'app.js doit avoir une syntaxe JS valide');
    });

    test('Syntaxe JavaScript valide sur canvas-engine.js', () => {
        assert.doesNotThrow(() => {
            execSync(`node --check "${path.join(rootDir, 'canvas-engine.js')}"`, { stdio: 'pipe' });
        }, 'canvas-engine.js doit avoir une syntaxe JS valide');
    });

    test('Syntaxe JavaScript valide sur furniture-library.js', () => {
        assert.doesNotThrow(() => {
            execSync(`node --check "${path.join(rootDir, 'furniture-library.js')}"`, { stdio: 'pipe' });
        }, 'furniture-library.js doit avoir une syntaxe JS valide');
    });

    test('Syntaxe JavaScript valide sur three-engine.js', () => {
        assert.doesNotThrow(() => {
            execSync(`node --check "${path.join(rootDir, 'three-engine.js')}"`, { stdio: 'pipe' });
        }, 'three-engine.js doit avoir une syntaxe JS valide');
    });
});

