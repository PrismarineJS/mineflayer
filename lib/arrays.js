/** removes value from array. returns success */
Array.prototype.remove = function(value) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] === value) {
            this.splice(i, 1);
            return true;
        }
    }
    return false;
};
/** removes item from array at index. returns old value. */
Array.prototype.removeAt = function(index) {
    return this.splice(index, 1)[0];
};
/** removes all items */
Array.prototype.clear = function() {
    this.splice(0, this.length);
};
/** shallow entry-wise comparison */
Array.prototype.equals = function(other) {
    if (this.length !== other.length) {
        // also checks for non-arrays
        return false;
    }
    for (var i = 0; i < this.length; i++) {
        if (this[i] !== other[i]) {
            return false;
        }
    }
    return true;
};
Array.prototype.extend = function(other) {
    for (var i = 0; i < other.length; i++) {
        this.push(other[i]);
    }
};
Array.prototype.clone = function() {
    return this.slice(0);
};
/**
 * returns a copy of this array but only including elements that make the
 * provided predicate function return true. Function is passed each item
 * and should return a boolean.
 */
Array.prototype.filtered = function(predicate_func) {
    var result = [];
    for (var i = 0; i < this.length; i++) {
        var item = this[i];
        if (predicate_func(item)) {
            result.push(item);
        }
    }
    return result;
};

Array.prototype.mapped = function(transformer_func) {
    var result = [];
    for (var i = 0; i < this.length; i++) {
        result.push(transformer_func(this[i]));
    }
    return result;
};

