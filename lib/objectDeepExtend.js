(function() {
    "use strict";
    if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
        module.exports = deepExtend;
    } else {
        Object.deepExtend = deepExtend;
    }

    function deepExtend( /*obj_1, [obj_2], [obj_N]*/ ) {
        if (arguments.length < 1 || typeof arguments[0] !== 'object') {
            return false;
        }

        if (arguments.length < 2) return arguments[0];

        var target = arguments[0];

        // convert arguments to array and cut off target object
        var args = Array.prototype.slice.call(arguments, 1);

        var key, val, src, clone;

        args.forEach(function(obj) {
            if (typeof obj !== 'object') return;

            for (key in obj) {
                if (!(key in obj)) continue;

                src = target[key];
                val = obj[key];

                if (val === target) continue;

                if (typeof val !== 'object' || val === null) {
                    target[key] = val;
                    continue;
                }

                if (typeof src !== 'object' || src === null) {
                    clone = (Array.isArray(val)) ? [] : {};
                    target[key] = deepExtend(clone, val);
                    continue;
                }

                if (Array.isArray(val)) {
                    clone = (Array.isArray(src)) ? src : [];
                } else {
                    clone = (!Array.isArray(src)) ? src : {};
                }

                target[key] = deepExtend(clone, val);
            }
        });

        return target;
    }
    Object.deepExtend
})()