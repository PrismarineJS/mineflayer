mf.include("chat_commands.js");
mf.include("strings.js");

chat_commands.registerCommand("time", function(speaker, args, responder_func) {
    var real_seconds = mf.timeOfDay();
    var progress_since_dawn = real_seconds / 1200;
    var hours_since_dawn = progress_since_dawn * 24;
    var hours_since_midnight = (hours_since_dawn + 6) % 24;
    var fake_minutes = (hours_since_midnight % 1) * 60;
    var fake_seconds = (fake_minutes % 1) * 60;
    var time_string = [hours_since_midnight, fake_minutes, fake_seconds].mapped(function(n) { return Math.floor(n).zfill(2); }).join(":");
    responder_func("time is " + time_string);
});
