
var json;
if (json === undefined) {
    json = {};
    (function() {
        json.registerType = function(type_name, type) {
            assert.isTrue(name_to_type[type_name] === undefined);
            name_to_type[type_name] = type;
        };
        json.parse = function(string_data) {
            return JSON.parse(string_data, function(key, value) {
                if (typeof value !== "object") {
                    return value;
                }
                var type_name = value._type;
                var type = name_to_type[type_name];
                if (type === undefined) {
                    return value;
                }
                var new_value = new type();
                for (var property_name in value) {
                    if (value.hasOwnProperty(property_name)) {
                        new_value[property_name] = value[property_name];
                    }
                }
                return new_value;
            });
        };
        json.stringify = function(data_object) {
            return JSON.stringify(data_object);
        };

        var name_to_type = {};
        // register builtin mf types
        (function() {
            for (var i = 0; i < mf.serializableTypeNames.length; i++) {
                var type_name = mf.serializableTypeNames[i];
                _public.registerType(type_name, mf[type_name]);
            }
        })();
    })();
}
