/**
 * A Map datastructure. Provides size() and isEmpty() among other methods.
 *
 * NOTE: this class is broken if anyone adds methods to Object.prototype
 *
 * Examples:
 * var map = new Map({"a": 1, "b": 2});
 * map.get("a"); // 1
 * map.put("a", 3);
 * map.get("a"); // 3
 * map.remove("b");
 * map.get("b"); // undefined
 * map.size(); // 1
 * map.isEmpty(); // false
 * map.clear();
 * map.size(); // 0
 * map.isEmpty(); // true
 */
function Map(items) {
    this.clear();
    if (items !== undefined) {
        for (var key in items) {
            this.put(key, items[key]);
        }
    }
}
Map.prototype.put = function(key, value) {
    this._size = undefined;
    this.values[key] = value;
};
Map.prototype.get = function(key) {
    return this.values[key];
};
Map.prototype.remove = function(key) {
    delete this.values[key];
};
Map.prototype.contains = function(key) {
    return this.values[key] !== undefined;
};
Map.prototype.size = function() {
    if (this._size === undefined) {
        this._size = 0;
        for (var key in this.values) {
            this._size++;
        }
    }
    return this._size;
};
Map.prototype.isEmpty = function() {
    // don't need to use size
    for (var key in this.values) {
        return false;
    }
    return true;
};
Map.prototype.clear = function() {
    this.values = {};
    this._size = 0;
};

