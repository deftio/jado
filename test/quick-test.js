#!/usr/bin/env node

/**
 * Quick smoke test for jado
 * Run with: node test/quick-test.js
 */

const jado = require('../src/jado.js');

let passed = 0;
let failed = 0;

function test(name, fn) {
    try {
        fn();
        console.log(`✓ ${name}`);
        passed++;
    } catch (e) {
        console.log(`✗ ${name}: ${e.message}`);
        failed++;
    }
}

function assert(condition, message) {
    if (!condition) {
        throw new Error(message || 'Assertion failed');
    }
}

function deepEqual(a, b) {
    return JSON.stringify(a) === JSON.stringify(b);
}

console.log('Running jado quick tests...\n');

// Test map
test('map on array', () => {
    const result = jado.map([1, 2, 3], x => x * 2);
    assert(deepEqual(result, [2, 4, 6]), 'Expected [2, 4, 6]');
});

test('map on singleton', () => {
    const result = jado.map(5, x => x * 2);
    assert(result === 10, 'Expected 10');
});

test('map on object', () => {
    const result = jado.map({a: 1, b: 2}, x => x * 2);
    assert(deepEqual(result, {a: 2, b: 4}), 'Expected {a: 2, b: 4}');
});

// Test filter
test('filter on array', () => {
    const result = jado.filter([1, 2, 3, 4], x => x > 2);
    assert(deepEqual(result, [3, 4]), 'Expected [3, 4]');
});

test('filter on object', () => {
    const result = jado.filter({a: 1, b: 3, c: 2}, x => x > 2);
    assert(deepEqual(result, {b: 3}), 'Expected {b: 3}');
});

// Test reduce
test('reduce on array', () => {
    const result = jado.reduce([1, 2, 3], (a, b) => a + b, 0);
    assert(result === 6, 'Expected 6');
});

test('reduce on singleton', () => {
    const result = jado.reduce(5, (a, b) => a + b, 10);
    assert(result === 15, 'Expected 15');
});

// Test cset
test('counting set basic operations', () => {
    const c = jado.cset();
    c.add('a');
    c.add('a');
    c.add('b');
    
    assert(c.cnt('a') === 2, 'Expected count of a to be 2');
    assert(c.cnt('b') === 1, 'Expected count of b to be 1');
    assert(c.ttl() === 3, 'Expected total to be 3');
});

test('counting set statistics', () => {
    const c = jado.cset();
    c.add('a');
    c.add('a');
    c.add('b');
    c.add('b');
    
    assert(c.avg() === 2, 'Expected average to be 2');
    assert(deepEqual(c.keys().sort(), ['a', 'b']), 'Expected keys [a, b]');
});

// Test version
test('version function exists', () => {
    const v = jado.version();
    assert(v.version === '1.0.7', 'Expected version 1.0.7');
    assert(v.license === 'BSD-2 Clause', 'Expected BSD-2 license');
});

// Test typeOf
test('typeOf identifies types correctly', () => {
    assert(jado.typeOf([]) === 'array', 'Expected array');
    assert(jado.typeOf({}) === 'object', 'Expected object');
    assert(jado.typeOf(1) === 'number', 'Expected number');
    assert(jado.typeOf('test') === 'string', 'Expected string');
    assert(jado.typeOf(null) === 'null', 'Expected null');
});

// Test path operations
test('p2v navigates simple paths', () => {
    const data = {
        users: {
            admin: {
                name: 'Alice',
                age: 30
            }
        }
    };
    
    assert(jado.p2v(data, 'users/admin/name') === 'Alice', 'Expected Alice');
    assert(jado.p2v(data, 'users/admin/age') === 30, 'Expected 30');
    assert(jado.p2v(data, 'users/nobody') === undefined, 'Expected undefined for non-existent path');
});

test('p2v navigates array indices', () => {
    const data = {
        items: ['a', 'b', 'c'],
        nested: {
            list: [1, 2, 3]
        }
    };
    
    assert(jado.p2v(data, 'items/0') === 'a', 'Expected a');
    assert(jado.p2v(data, 'items/2') === 'c', 'Expected c');
    assert(jado.p2v(data, 'nested/list/1') === 2, 'Expected 2');
});

test('p2v handles array paths', () => {
    const data = {
        'config/settings': {  // Key with slash
            theme: 'dark'
        },
        normal: {
            key: 'value'
        }
    };
    
    // Array path for key with special char
    assert(jado.p2v(data, ['config/settings', 'theme']) === 'dark', 'Expected dark');
    // Array path for normal navigation
    assert(jado.p2v(data, ['normal', 'key']) === 'value', 'Expected value');
});

test('strToPath converts string to array', () => {
    const path1 = jado.strToPath('users/admin/name');
    assert(deepEqual(path1, ['users', 'admin', 'name']), 'Expected array path');
    
    const path2 = jado.strToPath('a/b/c/d');
    assert(deepEqual(path2, ['a', 'b', 'c', 'd']), 'Expected array path');
});

test('pathToStr converts array to string', () => {
    const str1 = jado.pathToStr(['users', 'admin', 'name']);
    assert(str1 === 'users/admin/name', 'Expected string path');
    
    const str2 = jado.pathToStr(['a', 'b', 'c']);
    assert(str2 === 'a/b/c', 'Expected string path');
});

test('path operations handle escaped delimiters', () => {
    // Test escaping in strToPath
    const escaped = jado.strToPath('config\\/settings/theme');
    assert(deepEqual(escaped, ['config/settings', 'theme']), 'Expected escaped slash in key');
    
    // Test escaping in pathToStr
    const str = jado.pathToStr(['config/settings', 'theme']);
    assert(str === 'config\\/settings/theme', 'Expected escaped slash in output');
});

test('p2v works with custom delimiters', () => {
    const data = {
        users: {
            admin: {
                name: 'Alice'
            }
        }
    };
    
    // Using dot as delimiter
    assert(jado.p2v(data, 'users.admin.name', '.') === 'Alice', 'Expected Alice with dot delimiter');
    
    // Using pipe as delimiter  
    assert(jado.p2v(data, 'users|admin|name', '|') === 'Alice', 'Expected Alice with pipe delimiter');
});

// Summary
console.log('\n' + '='.repeat(40));
console.log(`Tests: ${passed} passed, ${failed} failed`);
if (failed === 0) {
    console.log('✓ All tests passed!');
    process.exit(0);
} else {
    console.log('✗ Some tests failed');
    process.exit(1);
}