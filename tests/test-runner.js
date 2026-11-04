/**
 * ScenoPlan Test Suite Runner
 * Exécute tous les tests automatisés du projet sans dépendance externe.
 */

const fs = require('fs');
const path = require('path');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failures = [];

global.assert = {
    strictEqual(actual, expected, msg) {
        if (actual !== expected) {
            throw new Error(`${msg || 'Assertion failed'}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
        }
    },
    ok(value, msg) {
        if (!value) {
            throw new Error(`${msg || 'Assertion failed'}: expected truthy, got ${value}`);
        }
    },
    deepStrictEqual(actual, expected, msg) {
        const a = JSON.stringify(actual);
        const e = JSON.stringify(expected);
        if (a !== e) {
            throw new Error(`${msg || 'Assertion failed'}: expected ${e}, got ${a}`);
        }
    },
    isAbove(actual, min, msg) {
        if (actual <= min) {
            throw new Error(`${msg || 'Assertion failed'}: expected > ${min}, got ${actual}`);
        }
    },
    doesNotThrow(fn, msg) {
        try {
            fn();
        } catch (err) {
            throw new Error(`${msg || 'Unexpected throw'}: ${err.message}`);
        }
    }
};

global.test = function(name, fn) {
    totalTests++;
    try {
        fn();
        passedTests++;
        console.log(`  \x1b[32m✔\x1b[0m ${name}`);
    } catch (err) {
        failedTests++;
        console.log(`  \x1b[31m✖\x1b[0m ${name}`);
        failures.push({ name, error: err });
    }
};

global.describe = function(suiteName, fn) {
    console.log(`\n\x1b[1m\x1b[36m▶ Suite: ${suiteName}\x1b[0m`);
    fn();
};

async function runAllTests() {
    console.log('\x1b[1m\x1b[35m=======================================================');
    console.log('       🧪 SCENOPLAN AUTOMATED TEST SUITE              ');
    console.log('=======================================================\x1b[0m');

    const testFiles = [
        path.join(__dirname, 'unit', 'syntax-and-structure.test.js'),
        path.join(__dirname, 'unit', 'furniture-library.test.js'),
        path.join(__dirname, 'unit', 'canvas-engine.test.js'),
        path.join(__dirname, 'unit', 'dom-integrity.test.js'),
        path.join(__dirname, 'unit', 'browser-runtime.test.js')
    ];

    for (const file of testFiles) {
        if (fs.existsSync(file)) {
            require(file);
        }
    }

    console.log('\n\x1b[1m\x1b[35m=======================================================');
    console.log('                  RÉSULTATS DES TESTS                  ');
    console.log('=======================================================\x1b[0m');
    console.log(`Total tests : ${totalTests}`);
    console.log(`\x1b[32mRéussis     : ${passedTests}\x1b[0m`);
    if (failedTests > 0) {
        console.log(`\x1b[31mÉchoués     : ${failedTests}\x1b[0m\n`);
        failures.forEach((f, i) => {
            console.log(`\x1b[31m${i + 1}) ${f.name}\x1b[0m`);
            console.log(`   ${f.error.stack || f.error.message}\n`);
        });
        process.exit(1);
    } else {
        console.log(`\x1b[32mÉchoués     : 0\x1b[0m`);
        console.log('\x1b[1m\x1b[32m✨ TOUS LES TESTS SONT PASSÉS AVEC SUCCÈS !\x1b[0m\n');
        process.exit(0);
    }
}

runAllTests();
