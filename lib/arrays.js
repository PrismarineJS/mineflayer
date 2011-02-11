/** removes value from array. returns success*/
Array.prototype.remove = function(value) {
    for (var i = 0; i < this.length; i++) {
        if (this[i] === value) {
            this.splice(i, 1);
            return true;
        }
    }
    return false;
};
/** removes item from array at index. returns old value.*/
Array.prototype.removeAt = function(index) {
    return this.splice(index, 1)[0];
};


