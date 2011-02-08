
String.prototype.contains = function(s) {
    return this.indexOf(s) !== -1;
};

String.prototype.startsWith = function(s) {
    return this.lastIndexOf(s, 0) === 0;
};
String.prototype.endsWith = function(s) {
    var index = this.length - s.length;
    if (index < 0) {
        return false;
    }
    return this.indexOf(s, index) === index;
};

/**
 * only trims spaces, not tabs or newlines or anything else.
 */
String.prototype.trim = function() {
    var start = 0, end = this.length;
    while (start < end && this.charAt(start) === " ") {
        start++;
    }
    while (start < end && this.charAt(end - 1) === " ") {
        end--;
    }
    return this.substr(start, end);
};
