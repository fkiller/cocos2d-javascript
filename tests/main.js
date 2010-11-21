var params = window.location.search;
if (params) {
    var name = params.split('=')[1];
    require(name);
} else {
    var c = document.getElementById('cocos2d-tests');
    with (c.style) {
        textAlign = 'center';
        fontSize = '20pt';
        lineHeight = c.clientHeight + 'px';
    }
    c.appendChild(document.createTextNode('Select a test to run'));
}
