/*global exports*/
/*jslint white: true, undef: true, nomen: true, bitwise: true, regexp: true, newcap: true */

function getListeners(obj, eventName) {
    if (!obj.js_listeners_) {
        obj.js_listeners_ = {};
    }
    if (!eventName) {
        return obj.js_listeners_;
    }
    if (!obj.js_listeners_[eventName]) {
        obj.js_listeners_[eventName] = {};
    }
    return obj.js_listeners_[eventName];
}

var eventID = 0;
exports.EventListener = function (source, eventName, handler) {
    this.source = source;
    this.eventName = eventName;
    this.handler = handler;
    this.id = ++eventID;

    getListeners(source, eventName)[this.id] = this;
};

/**
 * Register an event handler
 */
exports.addListener = function (source, eventName, handler) {
    return new exports.EventListener(source, eventName, handler);
};

/**
 * Trigger an event
 */
exports.trigger = function (source, eventName) {
    var listeners = getListeners(source, eventName),
        args = Array.prototype.slice.call(arguments, 2),
        eventID,
        l;

    for (eventID in listeners) {
        if (listeners.hasOwnProperty(eventID)) {
            l = listeners[eventID];
            if (l) {
                l.handler.apply(undefined, args);
            }
        }
    }
};

/**
 * Remove a previously registered event handler
 */
exports.removeListener = function (listener) {
    delete getListeners(listener.source, listener.eventName)[listener.eventID];
};

/**
 * Remove a all event handlers for a given event
 */
exports.clearListeners = function (source, eventName) {
    var listeners = getListeners(source, eventName),
        eventID;


    for (eventID in listeners) {
        if (listeners.hasOwnProperty(eventID)) {
            var l = listeners[eventID];
            if (l) {
                exports.removeListener(l);
            }
        }
    }
};

/**
 * Remove all event handlers on an object
 */
exports.clearInstanceListeners = function (source, eventName) {
    var listeners = getListeners(source),
        eventID;

    for (eventName in listeners) {
        if (listeners.hasOwnProperty(eventName)) {
            var el = listeners[eventName];
            for (eventID in el) {
                if (el.hasOwnProperty(eventID)) {
                    var l = el[eventID];
                    if (l) {
                        exports.removeListener(l);
                    }
                }
            }
        }
    }
};
