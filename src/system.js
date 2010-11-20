exports.stdio = {
    print: function() {
        if (console) {
            console.log.apply(console, arguments);
        } else {
            // TODO
        }
    }
};

exports.console = {
    log: function() {
        if (window.console) {
            window.console.log.apply(window.console, arguments);
        }
    }
}
