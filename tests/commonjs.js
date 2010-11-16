window.print = undefined;

var tests = [
    '/commonjs/modules/1.0/absolute',
    '/commonjs/modules/1.0/cyclic',
    '/commonjs/modules/1.0/determinism',
    '/commonjs/modules/1.0/exactExports',
    '/commonjs/modules/1.0/hasOwnProperty',
    '/commonjs/modules/1.0/method',
    '/commonjs/modules/1.0/missing',
    '/commonjs/modules/1.0/monkeys',
    '/commonjs/modules/1.0/nested',
    '/commonjs/modules/1.0/relative',
    '/commonjs/modules/1.0/transitive'
];

for (var i = 0; i < tests.length; i++) {
    var test = tests[i];
    console.log('* Running Test: ', test);
    require.paths.push(test);
    require('program');
    //console.log('Finished Test: ', test);
    require.paths.splice(require.paths.indexOf(test), 1);
};
