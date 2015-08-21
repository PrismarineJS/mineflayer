// provide access to a fixed minecraft data version

var mc = require("minecraft-protocol");
var mcData = require('minecraft-data')(mc.minecraftVersion);
module.exports = mcData;