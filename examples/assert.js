var assert = function() {
    var _public = {};
    _public.isTrue = function(value) {
        if (value !== true) {
            throw "AssertionFailure";
        }
    };
    function make_type_checker(type_name) {
        return function(value) {
            _public.isTrue(typeof value === type_name);
        };
    }
    _public.isBoolean = make_type_checker("boolean");
    _public.isNumber = make_type_checker("number");
    _public.isString = make_type_checker("string");
    _public.isFunction = make_type_checker("function");
    return _public;
}();
