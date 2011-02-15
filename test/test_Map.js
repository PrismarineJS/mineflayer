
mf.include("assert.js");
mf.include("Map.js");

function test_basic() {
    var map = new Map({"a": 1, "b": 2});
    assert.isTrue(map.get("a") === 1);
    map.put("a", 3);
    assert.isTrue(map.get("a") === 3);
    map.remove("b");
    assert.isTrue(map.get("b") === undefined);
    assert.isTrue(map.size() === 1);
    assert.isTrue(map.isEmpty() === false);
    map.clear();
    assert.isTrue(map.size() === 0);
    assert.isTrue(map.isEmpty());
}
test_basic();

mf.exit();
