// reflect mineflayer program: reveals what properties the mf object has.
function reflect(prefix, obj) {
    for (name in obj) {
        child = obj[name];
        mf.debug(prefix + name + "<"+ typeof child + "> = " + child);
        if (typeof obj == 'object') {
            reflect(prefix + name + ".", child);
        }
    }
}
reflect("mf.", mf);
mf.exit();
