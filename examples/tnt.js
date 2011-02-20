mf.include("giver.js");
mf.include("auto_respawn.js");
mf.include("inventory.js");
mf.include("block_finder.js");
mf.include("navigator.js");

var next_interval;

var min_corner;
var max_corner;
var current_pt;

function min(arr) {
    var low = arr[0];
    for (var i = 1; i < arr.length; i++) {
        if (arr[i] < low) {
            low = arr[i];
        }
    }
    return low;
}

function max(arr) {
    var high = arr[0];
    for (var i = 1; i < arr.length; i++) {
        if (arr[i] > high) {
            high = arr[i];
        }
    }
    return high;
}

function next() {
    // do we have enough tnt?
    if (inventory.itemCount(mf.ItemType.Tnt) < 1828) {
        mf.lookAt(mf.self().position.offset(0, 0, -1));
        for (var i = 0; i < 10; i++) {
            mf.chat("/give " + mf.self().username + " 46 64");
        }
        mf.chat("got TNT");
        mf.debug("got TNT");
        return;
    }
    // are we selecting TNT?
    if (inventory.equippedItem().type != mf.ItemType.Tnt) {
        for (var i = 0; i < 9; i++) {
            if (mf.inventoryItem(i).type == mf.ItemType.Tnt) {
                mf.selectEquipSlot(i);
                mf.debug("selecting TNT");
                return;
            }
        }
        mf.debug("unable to select TNT");
        stop();
        return;
    }
    // corners in memory?
    if (min_corner == undefined || max_corner == undefined) {
        var corners = block_finder.findNearest(mf.self().position, mf.ItemType.Brick, 64, 2);
        if (corners.length != 2) {
            mf.chat("can't find brick corner markers.");
            mf.debug("can't find brick corner markers.");
            stop();
            return;
        }
        min_corner = new mf.Point(
            min([corners[0].x, corners[1].x]),
            min([corners[0].y, corners[1].y]),
            min([corners[0].z, corners[1].z]));
        max_corner = new mf.Point(
            max([corners[0].x, corners[1].x]),
            max([corners[0].y, corners[1].y]),
            max([corners[0].z, corners[1].z]));
        mf.debug("found corners: " + min_corner + " " + max_corner);
        return;
    }
    // find point where we left off
    if (current_pt === undefined) {
        current_pt = new mf.Point();
        for (current_pt.z = min_corner.z; current_pt.z < 127; current_pt.z++) {
            for (current_pt.x = min_corner.x+1; current_pt.x < max_corner.x; current_pt.x++) {
                for (current_pt.y = min_corner.y+1; current_pt.y < max_corner.y; current_pt.y++) {
                    if (mf.blockAt(current_pt).type != mf.ItemType.Tnt) {
                        mf.debug("picking up at " + current_pt);
                        return;
                    }
                }
            }
        }
        mf.chat("tower is done being built");
        mf.debug("tower is done being built");
        stop();
        return;
    }

    // place next TNT
    if (mf.blockAt(current_pt.offset(0, 0, -1)).type == mf.ItemType.Air) {
        mf.hax.placeBlock(current_pt.offset(0, 0, -2), mf.Face.PositiveZ);
    }
    while (mf.canPlaceBlock(current_pt.offset(0, 0, -1), mf.Face.PositiveZ)) {
        if (current_pt.distanceTo(mf.self().position) > 2) {
            break;
        }
        mf.hax.placeBlock(current_pt.offset(0, 0, -1), mf.Face.PositiveZ);

        current_pt.y++;
        if (current_pt.y >= max_corner.y) {
            current_pt.y = min_corner.y + 1;
            current_pt.x++;
            if (current_pt.x >= max_corner.x) {
                current_pt.x = min_corner.x + 1;
                current_pt.z++;
                if (current_pt.z >= 126) {
                    mf.chat("done building tower");
                    mf.debug("done building tower");
                    stop();
                    return;
                }
            }
        }
    }
    // walk to next point
    stop();
    var nav_point;
    if (current_pt.x > min_corner.x + (max_corner.x - min_corner.x) / 2) {
        nav_point = current_pt.offset(-1, 0, 0);
    } else {
        nav_point = current_pt.offset(1, 0, 0);
    }
    if (mf.isPhysical(mf.blockAt(nav_point).type)) {
        nav_point.z++;
    }
    if (! mf.isPhysical(mf.blockAt(nav_point.offset(0, 0, -1)).type)) {
        if (current_pt.y > min_corner.y + (max_corner.y - min_corner.y) / 2) {
            nav_point.y--;
        } else {
            nav_point.y++;
        }
    }
    navigator.navigateTo(nav_point, function() {
        next();
        next_interval = mf.setInterval(next, 1000);
    });
}

function stop() {
    if (next_interval != undefined) {
        mf.clearInterval(next_interval);
    }
}

mf.onChat(function(user, msg) {
    if (msg == "build") {
        stop();
        next_interval = mf.setInterval(next, 1000);
    } else if (msg == "stop") {
        stop();
    } else if (msg == "detonate") {
        
    }
});
