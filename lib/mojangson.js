exports.parse=parse;


function parse(string) {
  // Mojang apparently invented a syntax for this.
  // it may look like JSON at first, but it isn't, so we write our own parser.

  // examples:
  //   "{id:35,Damage:5,Count:2,tag:{display:{Name:Testing}}}"
  //   '{id:"minecraft:dirt",Damage:0s,Count:1b}'

  var index = 0;
  var result = parseAnything();
  if (index !== string.length) syntaxError();
  return result;

  function parseDict() {
    if (string[index] !== "{") syntaxError();
    index++;

    var result = {};
    var needDelimiter = false;
    while (true) {
      if (string[index] === "}") {
        index++;
        break;
      }
      if (needDelimiter) {
        if (string[index] !== ",") syntaxError();
        index++;
      }
      needDelimiter = true;
      var key = parseString();
      if(key==="") {
        index++;
        break;
      } // trailing comma
      if (string[index] !== ":") syntaxError();
      index++;
      result[key] = parseAnything();
    }
    return result;
  }
  function parseArray() {
    if (string[index] !== "[") syntaxError();
    index++;

    var result = [];
    var needDelimiter = false;
    while (true) {
      if (string[index] === "]") {
        index++;
        break;
      }
      if (needDelimiter) {
        if (string[index] !== ",") syntaxError();
        index++;
      }
      needDelimiter = true;
      var key = parseString();
      if(key==="") {
        index++;
        break;
      } // trailing comma
      key=parseInt(key);
      if (string[index] !== ":") syntaxError();
      index++;
      result[key] = parseAnything();
    }
    return result;
  }
  function parseString() {
    var result = "";
    var quoted = false;
    if (string[index] === '"') {
      index++;
      quoted = true;
    }
    while (true) {
      if (quoted) {
        if (string[index] === '"') {
          index++;
          break;
        }
      } else {
        if (/\W/.test(string[index])) break;
      }
      result += string[index];
      index++;
    }
    //if (!quoted && result === "") syntaxError(); // trailing comma
    return result;
  }
  function parseNumber() {
    var match = /^([0-9]+)[a-z]?/.exec(string.substr(index));
    if (match === null) syntaxError();
    index += match[0].length;
    return parseInt(match[1]);
  }
  function parseAnything() {
    var c = string[index];
    if (c === '"') return parseString();
    if (c === '{') return parseDict();
    if (c === '[') return parseArray();
    if ("0123456789".indexOf(c) !== -1) return parseNumber();
    // must be an unquotted string
    return parseString();
  }
  function syntaxError() {
    throw new Error("hoverEvent 'show_item' value syntax error at index " + index + ": " + string);
  }
}

function testParse() {
  var assert = require("assert");
  assert.deepEqual(parse('{}'), {});
  assert.deepEqual(parse('{key:value}'), {key:"value"});
  assert.deepEqual(parse('{key:"value"}'), {key:"value"});
  assert.deepEqual(parse('{key:"va,lue"}'), {key:"va,lue"});
  assert.deepEqual(parse('{k1:v1,k2:v2}'), {k1:"v1", k2:"v2"});
  assert.deepEqual(parse('{number:0s}'), {number:0});
  assert.deepEqual(parse('{number:123b}'), {number:123});
  assert.deepEqual(parse('{nest:{}}'), {nest:{}});
  assert.deepEqual(parse('{nest:{nest:{}}}'), {nest:{nest:{}}});
  assert.deepEqual(parse("{id:35,Damage:5,Count:2,tag:{display:{Name:Testing}}}"),
    {id:35,Damage:5,Count:2,tag:{display:{Name:"Testing"}}});
  assert.deepEqual(parse('{id:"minecraft:dirt",Damage:0s,Count:1b}'),
    {id:"minecraft:dirt",Damage:0, Count:1});

  assert.deepEqual(parse('{key:value,}'), {key:"value"});
  assert.deepEqual(parse('[0:v1,1:v2]'), ["v1","v2"]);
  assert.deepEqual(parse('[0:"§6Last Killed: None",1:"§6Last Killer: None",2:"§6Rank: §aNovice-III",3:"§6§6Elo Rating: 1000",' +
    ']'),["§6Last Killed: None","§6Last Killer: None","§6Rank: §aNovice-III","§6§6Elo Rating: 1000"]);

  assert.deepEqual(parse('{id:1s,Damage:0s,Count:1b,tag:{display:{Name:"§r§6Class' +
      ': Civilian",Lore:[0:"§6Last Killed: None",1:"§6Last Killer: None",2:"§6Rank: §aNovice-III",3:"§6§6Elo Rating: 1000",' +
      '],},},}'),
    {id:1,Damage:0, Count:1,tag:{display:{Name:"§r§6Class: Civilian",Lore:["§6Last Killed: None","§6Last Killer: None","§6Rank: §aNovice-III","§6§6Elo Rating: 1000"]}}});
}
