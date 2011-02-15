
mf.include("assert.js");
mf.include("Heap.js");

function test_forwards() {
    var heap = new Heap();
    assert.isTrue(heap.isEmpty());
    for (var i = 0; i < 10; i++) {
        heap.add(i);
    }
    assert.isTrue(!heap.isEmpty());
    for (i = 0; i < 10; i++) {
        assert.isTrue(heap.take() === i);
    }
    assert.isTrue(heap.isEmpty());
}
test_forwards();

function test_backwards() {
    var heap = new Heap();
    assert.isTrue(heap.isEmpty());
    for (var i = 9; i >= 0; i--) {
        heap.add(i);
    }
    assert.isTrue(heap.size() === 10);
    for (i = 0; i < 10; i++) {
        assert.isTrue(heap.take() === i);
    }
    assert.isTrue(heap.isEmpty());
}
test_backwards();

function test_partial() {
    var heap = new Heap();
    for (var i = 0; i < 10; i++) {
        heap.add(i);
    }
    for (i = 0; i < 5; i++) {
        assert.isTrue(heap.take() === i);
    }
    for (i = 10; i < 20; i++) {
        heap.add(i);
    }
    for (i = 5; i < 20; i++) {
        assert.isTrue(heap.take() === i);
    }
}
test_partial();

function test_key_func() {
    var heap = new Heap(function(s) { return s.length; });
    heap.add("aaaa");
    heap.add("b");
    heap.add("ccc");
    heap.add("dd");
    assert.isTrue(heap.take() === "b");
    assert.isTrue(heap.take() === "dd");
    assert.isTrue(heap.take() === "ccc");
    assert.isTrue(heap.take() === "aaaa");
}
test_key_func();

mf.exit();

