window.print = undefined;

var tests = [
    '/modules/1.0/absolute',
    '/modules/1.0/cyclic',
    '/modules/1.0/determinism',
    '/modules/1.0/exactExports',
    '/modules/1.0/hasOwnProperty',
    '/modules/1.0/method',
    '/modules/1.0/missing',
    '/modules/1.0/monkeys',
    '/modules/1.0/nested',
    '/modules/1.0/relative',
    '/modules/1.0/transitive'
];

for (var i = 0; i < tests.length; i++) {
    var test = tests[i];
    console.log('* Running Test: ', test);
    require.paths.push(test);
    require('program');
    //console.log('Finished Test: ', test);
    require.paths.splice(require.paths.indexOf(test), 1);
};
