// reflect mineflayer program: reveals what properties the global object has.
var global = this;
function reflect(prefix, obj) {
    for (name in obj) {
        child = obj[name];
        mf.print(prefix + name + "<"+ typeof child + "> = " + child + "\n");
        if (typeof obj == 'object' && child !== global) {
            reflect(prefix + name + ".", child);
        }
    }
}
reflect("", global);
mf.exit();
