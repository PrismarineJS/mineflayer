var util = require('util');

// Message translate type, followed by string, array, or object
function ChatMessage(type, message) {
	if(typeof type !== 'string') {
		throw new Error('Expected message type. Invalid translate property');
	}else{
		this.translate = type;
	}
	if(typeof message === 'string') {
		this.with = [message];
	}else if(typeof message === 'object') {
		if(Array.isArray(message)) {
			this.with = message;
		}else{
			this.with = [message];
		}
	}
}

module.exports = ChatMessage;

// Append a part to the message, literal text and attributes.
ChatMessage.prototype.append = function(text, attributes) {
	if(typeof attributes === 'object') {
		var newPart = {
			text: text
		};
		for(var key in Object.keys(attributes)) {
			newPart[key] = attributes[key];
		}
		this.with.push(newPart);
	}else{
		this.with.push(text);
	}
}

// Returns the entire message flattened to plain text
ChatMessage.prototype.toString = function() {
	var stringMessage = "";
	this.with.forEach(function(element) {
		if(typeof element === 'string') {
			stringMessage += element;
		}else if(element && typeof element.text === 'string') {
			stringMessage += element.text;
		}
		stringMessage += ' ';
	});
	return stringMessage.trimRight();
}

// Returns the message as JSON
ChatMessage.prototype.toJSON = function() {
	return {
		translate: this.translate,
		with: this.with
	};
}

// Component getter
ChatMessage.prototype.get = function(idx) {
	return this.with[idx];
}

// Get's an individual component of the message as plain-text
ChatMessage.prototype.getText = function(idx) {
	if(this.with[idx]) {
		if(typeof this.with[idx] == 'string') {
			return this.with[idx];
		}else if(typeof this.with[idx].text == 'string') {
			return this.with[idx].text;
		}
	}
}