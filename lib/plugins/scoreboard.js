const ScoreBoard=require("../scoreboard");

module.exports = inject;

function inject(bot) {
  bot.scoreboards = {};

  bot._client.on('scoreboard_objective', function(packet) {
    const name=packet.name;
    const displayText=packet.displayText;
    const scoreBoard=new ScoreBoard(name);
    scoreBoard.displayText=displayText;
    bot.scoreboards[name]=scoreBoard;

    bot.emit('scoreboardObjective', name, displayText);

  });

  bot._client.on('scoreboard_score', function(packet) {

    const scoreName=packet.scoreName;
    const itemName=packet.itemName;
    const value=packet.value;
    if(!bot.scoreboards[scoreName])
      bot.scoreboards[scoreName] = new ScoreBoard(scoreName);

    const scoreBoard=bot.scoreboards[packet.scoreName];

    if(!scoreBoard.items[itemName])
      scoreBoard.items[itemName]= {};
    scoreBoard.items[itemName]= value;
    
    bot.emit('scoreboardScore', scoreName,itemName, value);

  });

  bot._client.on('scoreboard_display_objective', function(packet) {
    const name=packet["name"];
    const position=packet["position"];

    if(!bot.scoreboards[name])
      bot.scoreboards[name] = new ScoreBoard(name);
    const scoreBoard=bot.scoreboards[name];
    scoreBoard.position= position;

    bot.emit('scoreboardDisplayObjective', name, position);
    
  });

}
