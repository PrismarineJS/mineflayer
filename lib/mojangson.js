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
    var match = /^([0-9]+)[bsLfd]?/.exec(string.substr(index));
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
