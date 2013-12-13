var quoteMeta = require('quotemeta')
  , LEGAL_CHARS = ' !"#$%&\'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_abcdefghijklmnopqrstuvwxyz{|}~⌂ÇüéâäàåçêëèïîìÄÅÉæÆôöòûùÿÖÜø£Ø×ƒáíóúñÑªº¿®¬½¼¡«»§'
  , CHAT_LENGTH_LIMIT = 100

var quotedLegalChars = quoteMeta(LEGAL_CHARS);
var incomingFilter = new RegExp("([^" + quotedLegalChars + "]|§.)", 'g');
var outgoingFilter = new RegExp("([^" + quotedLegalChars + "])", 'g');

module.exports = {
  incomingFilter: incomingFilter,
  outgoingFilter: outgoingFilter,
  lengthLimit: CHAT_LENGTH_LIMIT
}

