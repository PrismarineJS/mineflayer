// reflect mineflayer program: reveals what properties the mf object has.
function MineflayerBot() {
    for (prop in mf) {
        mf.print("'" + prop + "'" + "["+ typeof mf[prop] + "] = " + mf[prop]);
    }
    mf.exit();
}
