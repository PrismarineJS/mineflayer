// reflect mineflayer program: reveals what nameerties the mf object has.
function MineflayerBot() {
    function reflect(obj) {
        for (name in obj) {
            child = obj[name];
            mf.print("'" + name + "'" + "["+ typeof child + "] = " + child);
            if (typeof obj == 'object') {
                reflect(child);
            }
        }
    }
    reflect(mf);
    mf.exit();
}
