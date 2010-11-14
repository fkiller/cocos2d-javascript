exports.stdio = {
    print: function() {
        if (console) {
            console.log.apply(console, arguments);
        } else {
            // TODO
        }
    }
};
