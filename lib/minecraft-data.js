// provide access to a fixed minecraft data version

var version=require("./version");
var mcData = require('minecraft-data')(version);
module.exports = mcData;