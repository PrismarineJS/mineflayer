var ScoreBoard=require("../scoreboard");

module.exports = inject;

function inject(bot) {
  bot.scoreboards = {};

  bot._client.on('scoreboard_objective', function(packet) {
    var name=packet.name;
    var displayText=packet.displayText;
    var scoreBoard=new ScoreBoard(name);
    scoreBoard.displayText=displayText;
    bot.scoreboards[name]=scoreBoard;

    bot.emit('scoreboardObjective', name, displayText);

  });

  bot._client.on('scoreboard_score', function(packet) {

    var scoreName=packet.scoreName;
    var itemName=packet.itemName;
    var value=packet.value;
    if(!bot.scoreboards[scoreName])
      bot.scoreboards[scoreName] = new ScoreBoard(scoreName);

    var scoreBoard=bot.scoreboards[packet.scoreName];

    if(!scoreBoard.items[itemName])
      scoreBoard.items[itemName]= {};
    scoreBoard.items[itemName]= value;
    
    bot.emit('scoreboardScore', scoreName,itemName, value);

  });

  bot._client.on('scoreboard_display_objective', function(packet) {
    var name=packet["name"];
    var position=packet["position"];

    if(!bot.scoreboards[name])
      bot.scoreboards[name] = new ScoreBoard(name);
    var scoreBoard=bot.scoreboards[name];
    scoreBoard.position= position;

    bot.emit('scoreboardDisplayObjective', name, position);
    
  });

}
