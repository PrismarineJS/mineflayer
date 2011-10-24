
/**
 * this class was mostly copied from python's heapq.py module
 */
function Heap(key_func) {
    if (key_func === undefined) {
        key_func = function(x) { return x;};
    }
    this.key_func = key_func;
    this.clear();
}
Heap.prototype.clear = function() {
    this.entries = [];
};
Heap.prototype.size = function() {
    return this.entries.length;
}
Heap.prototype.isEmpty = function() {
    return this.entries.length === 0;
}
Heap.prototype.add = function(item) {
    var key = this.key_func(item);
    var entry = [key, item];
    this.entries.push(entry);
    this._siftDown(0, this.entries.length - 1);
};
Heap.prototype.take = function() {
    var last_entry = this.entries.pop();
    if (this.entries.length === 0) {
        // taking from empty returns undefined
        return last_entry !== undefined ? last_entry[1] : undefined;
    }
    var first_entry = this.entries[0];
    this.entries[0] = last_entry;
    this._siftUp(0);
    return first_entry[1];
};
Heap.prototype.reheapify = function() {
    for (var i = 0; i < this.entries.length; i++) {
        this.entries[i][0] = this.key_func(this.entries[i][1]);
    }
    for (var i = this.entries.length >> 1; i >= 0; i--) {
        this._siftUp(i);
    }
};

Heap.prototype._siftDown = function(start, index) {
    var new_entry = this.entries[index];
    while (index > start) {
        var parent_index = (index - 1) >> 1;
        var parent_entry = this.entries[parent_index];
        if (new_entry[0] < parent_entry[0]) {
            this.entries[index] = parent_entry;
            index = parent_index;
            continue;
        }
        break;
    }
    this.entries[index] = new_entry;
};

Heap.prototype._siftUp = function(index) {
    var end_index = this.entries.length;
    var start_index = index;
    var new_entry = this.entries[index];

    // start child index with the left child
    var child_index = 2 * index + 1;
    while (child_index < end_index) {
        var right_index = child_index + 1;
        if (right_index < end_index && !(this.entries[child_index][0] < this.entries[right_index][0])) {
            // right child is smaller
            child_index = right_index;
        }
        // child index is now the smaller child
        this.entries[index] = this.entries[child_index];
        index = child_index;
        child_index = 2 * index + 1;
    }
    this.entries[index] = new_entry;
    this._siftDown(start_index, index);
};

