module.exports = inject;

function inject(bot) {
  bot.scoreboard = {};

  bot._client.on('scoreboard_objective', function(packet) {
    
    if(!bot.scoreboard[
      packet["name"]
      ]){
      bot.scoreboard[packet["name"]]
                    = {};
      
    }
    
    bot.scoreboard[packet["name"]]={"name": packet["name"],
                                    "displayText": packet["displayText"]};
    bot.scoreboard[packet["name"]]["items"]= {};


    bot.emit('scoreboardObjective', packet["name"], packet["displayText"]);

  });

  bot._client.on('scoreboard_score', function(packet) {
    if(bot.scoreboard[packet["scoreName"]]){
        
        if(!bot.scoreboard[packet["scoreName"]]
                          ["items"]
                          ){
        
          bot.scoreboard[packet["scoreName"]]
                        ["items"]
                        = {};
        }
        
        if(!bot.scoreboard[packet["scoreName"]]
                         ["items"]
                         [packet["itemName"]]
                         ){
        
          bot.scoreboard[packet["scoreName"]]
                        ["items"]
                        [packet["itemName"]]
                        = {};
        }
        
        bot.scoreboard[packet["scoreName"]]
                      ["items"]
                      [packet["itemName"]]
                      = packet["value"];
    }
    
    bot.emit('scoreboardScore', packet["itemName"], packet["action"], packet["scoreName"], packet["value"]);

  });

  bot._client.on('scoreboard_display_objective', function(packet) {
    if(bot.scoreboard[packet["name"]]){

      bot.scoreboard[packet["name"]]
      if(!bot.scoreboard[packet["name"]]
                      ["position"]
                      ){
        
      bot.scoreboard[packet["name"]]
                    ["position"]
                    = {};
      }

      bot.scoreboard[packet["name"]]
                    ["position"]
                    = packet["position"];
    }

    bot.emit('scoreboardDisplayObjective', packet["name"], packet["position"]);
    
  });

}

