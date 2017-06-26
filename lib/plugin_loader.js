var assert = require('assert');

module.exports = inject;

function inject(bot, options){
  var loaded = false;
  var pluginsToBeAdded = [];
  bot.once('inject_allowed', onInjectAllowed);

  function onInjectAllowed() {
    loaded = true;
    injectPlugins(pluginsToBeAdded);
  }
  function loadPlugin(plugin) {
    assert.ok(typeof plugin === 'function', 'plugin needs to be a function');
    if (!loaded) pluginsToBeAdded.push(plugin);
    else plugin(bot, options);
  }
  function loadPlugins(plugins) {
    assert.ok(plugins.filter(function (plugin) {
      return typeof plugin === 'function';
    }).length === plugins.length, 'plugins need to be an array of functions');
    if(loaded) return injectPlugins(plugins);
    pluginsToBeAdded = pluginsToBeAdded.concat(plugins);
  }
  function injectPlugins(plugins) {
    plugins.forEach(function (plugin) {
      plugin(bot, options);
    });
  }

  bot.loadPlugin = loadPlugin;
  bot.loadPlugins = loadPlugins;
}

