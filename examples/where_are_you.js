mf.include("chat_commands.js");

(function() {
    function whereareyou(username, message, respond) {
        var position = mf.self().position;

        var eastWest = position.x < 0 ? "West" : "East";
        var northSouth = position.y < 0 ? "South" : "North";
        var upDown = position.z < 0 ? "Down" : "Up";

        respond("I am " + Math.abs(position.x) + " blocks " + eastWest + ", " + Math.abs(position.y) + " blocks " + northSouth + ", and " + " " + Math.abs(position.z) + " blocks " + upDown + "."); 
    }

    chat_commands.registerCommand("whereareyou", whereareyou, 0, 0);
})();
