module.exports = inject;

function inject(bot) {
  bot.scoreboard = new Object();

  bot._client.on('scoreboard_objective', function(packet) {
    
    if(!bot.scoreboard[
      packet["name"]
      ]){
      bot.scoreboard[packet["name"]]
                    = new Object();
      
    }
    
    bot.scoreboard[packet["name"]]=packet;
    bot.scoreboard[packet["name"]]["items"]= new Object();
    
  });

  bot._client.on('scoreboard_score', function(packet) {
    //console.log(packet)
    if(bot.scoreboard[packet["scoreName"]]){
        
        if(!bot.scoreboard[packet["scoreName"]]
                        ["items"]
                        ){
        
        bot.scoreboard[packet["scoreName"]]
                        ["items"]
                        = new Object();
        }
        
        if(!bot.scoreboard[packet["scoreName"]]
                        ["items"]
                        [packet["itemName"]]
                        ){
        
        bot.scoreboard[packet["scoreName"]]
                        ["items"]
                        [packet["itemName"]]
                        = new Object();
        }
        
        bot.scoreboard[packet["scoreName"]]
                    ["items"]
                    [packet["itemName"]]
                    = packet["value"];
    }
    
    

  });

  bot._client.on('scoreboard_display_objective', function(packet) {
      if(bot.scoreboard[packet["name"]]){

        bot.scoreboard[packet["name"]]
        if(!bot.scoreboard[packet["name"]]
                        ["position"]
                        ){
        
        bot.scoreboard[packet["name"]]
                      ["position"]
                      = new Object();
        }

        bot.scoreboard[packet["name"]]
                      ["position"]
                      = packet["position"];
      }


  });

}
