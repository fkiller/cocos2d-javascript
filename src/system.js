exports.stdio = {
    print: function() {
        if (console) {
            console.log.apply(console, arguments);
        } else {
            // TODO
        }
    }
};

if (window.console) {
    exports.console = window.console
} else {
    exports.console = {
        log: function(){}
    }
}
