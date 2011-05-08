/**
 * A Set datastructure. Note: only stores strings.
 *
 * NOTE: this class is broken if anyone adds methods to Object.prototype
 *
 * Examples:
 * var set = new Set(["a", "b"]);
 * set.contains("b"); // true
 * set.add("b"); // does nothing
 * set.remove("b");
 * set.contains("b"); // false
 * set.clear();
 * set.add("c");
 * set.size(); // 1
 * for (var value in set.values) {
 *     set.contains(value); // true
 * }
 */
function Set(items) {
    this.clear();
    if (items !== undefined) {
        for (var i = 0; i < items.length; i++) {
            this.add(items[i]);
        }
    }
}
/**
 * returns if the item wasn't already in the set.
 */

Set.prototype.list = function() {
    var all = [];
    for (val in this.values) {
        all.push(val);
    }
    return all;
}

Set.prototype.add = function(item) {
    this._size = undefined;
    var old_value = this.values[item];
    this.values[item] = item;
    return old_value === undefined;
}
Set.prototype.remove = function(item) {
    this._size = undefined;
    delete this.values[item];
}
Set.prototype.contains = function(item) {
    return this.values[item] !== undefined;
}
Set.prototype.size = function() {
    if (this._size === undefined) {
        this._size = 0;
        for (var item in this.values) {
            this._size++;
        }
    }
    return this._size;
}
Set.prototype.isEmpty = function() {
    // don't need to use size
    for (var item in this.values) {
        return false;
    }
    return true;
}
Set.prototype.clear = function() {
    this.values = {};
    this._size = 0;
}

