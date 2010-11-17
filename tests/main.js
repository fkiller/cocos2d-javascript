window.onload = function() {
    var params = window.location.search;
    var name = params.split('=')[1];
    require(name);
};
