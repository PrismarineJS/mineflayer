const mojangson = require('mojangson');

module.exports = ChatMessage;

/**
 * ChatMessage Constructor
 * @param {String|Object} message content of ChatMessage
 */
class ChatMessage {
  constructor(message) {
    if(typeof message === 'string') {
      this.json = {text: message};
    } else if(typeof message === 'object' && !Array.isArray(message)) {
      this.json = message;
    } else {
      throw new Error('Expected String or Object for Message argument');
    }
    this.parse();
  }

  /**
   * Parses the this.json property to decorate the properties of the ChatMessage.
   * Called by the Constructor
   * @return {void}
   */
  parse() {
    const json = this.json;
    // Message scope for callback functions
    const that = this;

    // There is EITHER, a text property or a translate property
    // If there is no translate property, there is no with property
    // HOWEVER! If there is a translate property, there may not be a with property
    if(typeof json.text === 'string') {
      this.text = json.text;
    } else if(typeof json.translate === 'string') {
      this.translate = json.translate;
      if(typeof json.with === 'object' || Array.isArray(json.with)) {
        this.with = [];
        json.with.forEach(entry => {
          if(typeof entry === 'string') {
            that.with.push(entry);
          } else if(typeof entry === 'object') {
            // Parse ChatMessage
            const subChatMessage = new ChatMessage(entry);
            that.with.push(subChatMessage);
          }
        });
      }
    }
    // Parse extra property
    // Extras are appended to the initial text
    if(typeof json.extra === 'object') {
      if(!Array.isArray(json.extra)) {
        throw new Error('Expected extra property to be an Array in ChatMessage');
      }
      this.extra = [];
      json.extra.forEach(entry => {
        if(typeof entry === 'string') {
          that.extra.push(entry);
        } else if(typeof entry === 'object') {
          const subChatMessage = new ChatMessage(entry);
          that.extra.push(subChatMessage);
        }
      });
    }
    // Text modifiers
    this.bold = json.bold;
    this.italic = json.italic;
    this.underlined = json.underlined;
    this.strikethrough = json.strikethrough;
    this.obfuscated = json.obfuscated;

    // Supported constants @ 2014-04-21
    const supportedColors = ['black', 'dark_blue', 'dark_green', 'dark_aqua', 'dark_red', 'dark_purple',
      'gold', 'gray', 'dark_gray', 'blue', 'green', 'aqua', 'red', 'light_purple',
      'yellow', 'white', 'obfuscated', 'bold', 'strikethrough', 'underlined', 'italic',
      'reset'];
    const supportedClick = ['open_url', 'open_file', 'run_command', 'suggest_command'];
    const supportedHover = ['show_text', 'show_achievement', 'show_item', 'show_entity'];

    // Parse color
    this.color = json.color;
    switch(this.color) {
      case 'obfuscated':
        this.obfuscated = true;
        this.color = null;
        break;
      case 'bold':
        this.bold = true;
        this.color = null;
        break;
      case 'strikethrough':
        this.strikethrough = true;
        this.color = null;
        break;
      case 'underlined':
        this.underlined = true;
        this.color = null;
        break;
      case 'italic':
        this.italic = true;
        this.color = null;
        break;
      case 'reset':
        this.reset = true;
        this.color = null;
        break;
    }
    if(Array.prototype.indexOf && this.color &&
      !supportedColors.includes(this.color)) {
      console.warn('ChatMessage parsed with unsupported color', this.color);
    }

    // Parse click event
    if(typeof json.clickEvent === 'object') {
      this.clickEvent = json.clickEvent;
      if(typeof this.clickEvent.action !== 'string') {
        throw new Error('ClickEvent action missing in ChatMessage');
      } else if(Array.prototype.indexOf && !supportedClick.includes(this.clickEvent.action)) {
        console.warn('ChatMessage parsed with unsupported clickEvent', this.clickEvent.action);
      }
    }

    // Parse hover event
    if(typeof json.hoverEvent === 'object') {
      this.hoverEvent = json.hoverEvent;
      if(typeof this.hoverEvent.action !== 'string') {
        throw new Error('HoverEvent action missing in ChatMessage');
      } else if(Array.prototype.indexOf && !supportedHover.includes(this.hoverEvent.action)) {
        console.warn('ChatMessage parsed with unsupported hoverEvent', this.hoverEvent.action);
      }
      // Special case
      if(this.hoverEvent.action === 'show_item') {
        let content;
        if(this.hoverEvent.value instanceof Array) {
          if(this.hoverEvent.value[0] instanceof Object)
            content=this.hoverEvent.value[0].text;
          else
            content=this.hoverEvent.value[0];
        }
        else {
          if(this.hoverEvent.value instanceof Object)
            content=this.hoverEvent.value.text;
          else
            content=this.hoverEvent.value;
        }
        this.hoverEvent.value = mojangson.parse(content);
      }
    }
  }

  /**
   * Returns the count of text extras and child ChatMessages
   * Does not count recursively in to the children
   * @return {Number}
   */
  length() {
    let count = 0;
    if(this.text) count++;
    else if(this.translate) count += this.with.length;

    if(this.extra) count += this.extra.length;
    return count;
  }

  /**
   * Returns a text part from the message
   * @param  {Number} idx Index of the part
   * @return {String}
   */
  getText(idx) {
    // If the index is not defined is is invalid, return toString
    if(typeof idx !== 'number') return this.toString();
    // If we are not a translating message, return the text
    if(this.text && idx === 0) return this.text;
    // Else return the with child if it's in range
    else if(this.with.length > idx) return this.with[idx].toString();
    // Else return the extra if it's in range
    if(this.extra && this.extra.length + (this.text ? 1 : this.with.length) > idx)
      return this.extra[idx - (this.text ? 1 : this.with.length)].toString();
    // Not sure how you want to default this
    // Undefined, an error ?
    return "";
  }

  /**
   * Flattens the message in to plain-text
   * @return {String}
   */
  toString() {
    let message = "";
    if(typeof this.text === 'string') message += `${this.text} `;
    else if(this.with) {
      this.with.forEach(entry => {
        message += `${entry.toString()} `;
      })
    }
    if(this.extra) {
      this.extra.forEach(entry => {
        message += `${entry.toString()} `;
      })
    }
    return message.trim();
  }
}

if(require.main === module) {
  testParseShowItemHoverEventValue();
}
