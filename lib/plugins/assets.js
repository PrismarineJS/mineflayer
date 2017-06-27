var path = require('path');

module.exports = inject;

function inject(bot, options) {
  function loadIndex(version) {
    var mcPath = require('minecraft-folder-path');
    var indexPath = path.join(mcPath, 'assets/indexes', version || bot.majorVersion);
    var assetIndex = require(indexPath);
    Object.keys(assetIndex.objects).forEach(function (file) {
      var hash = assetIndex.objects[file].hash;
      assetIndex.objects[file].location = path.join(mcPath, 'assets/objects', hash.substring(0,2), hash);
    });
    return assetIndex;
  }

  bot.loadIndex = loadIndex;
}
