module.exports = inject
function inject (bot) {
  // Debug: log all incoming packets
  bot._client.on('packet', (data, meta) => {
    if (meta.name.includes('title')) {
      console.log('[DEBUG] Received packet:', meta.name, JSON.stringify(data))
    }
  })

  if (bot.supportFeature('titleUsesLegacyPackets')) {
    bot._client.on('title', (packet) => {
      console.log('[DEBUG] Received packet: title', packet);
      if (packet.action === 0) { // Title
        const text = packet.text.replace(/^"|"$/g, ''); // Remove surrounding quotes
        console.log('[DEBUG] Emitting title event:', text, 'title');
        console.log('[PLUGIN DEBUG] Emitting title event for bot:', bot.username, 'entityId:', bot.entityId, 'title:', text, 'type: title');
        bot.emit('title', text, 'title');
      } else if (packet.action === 1) { // Subtitle
        const text = packet.text.replace(/^"|"$/g, ''); // Remove surrounding quotes
        console.log('[DEBUG] Emitting title event:', text, 'subtitle');
        console.log('[PLUGIN DEBUG] Emitting title event for bot:', bot.username, 'entityId:', bot.entityId, 'title:', text, 'type: subtitle');
        bot.emit('title', text, 'subtitle');
      }
    });
  } else if (bot.supportFeature('titleUsesNewPackets')) {
    bot._client.on('set_title_text', (packet) => {
      const text = typeof packet.text === 'object' && packet.text.value !== undefined ? packet.text.value : packet.text;
      console.log('[DEBUG] Received set_title_text packet:', packet);
      console.log('[DEBUG] About to emit title event with text:', text, 'type: title');
      console.log('[PLUGIN DEBUG] Emitting title event for bot:', bot.username, 'entityId:', bot.entityId, 'title:', text, 'type: title');
      bot.emit('title', text, 'title');
      console.log('[DEBUG] Title event emitted');
    });
    bot._client.on('set_title_subtitle', (packet) => {
      const text = typeof packet.text === 'object' && packet.text.value !== undefined ? packet.text.value : packet.text;
      console.log('[DEBUG] Received set_title_subtitle packet:', packet);
      console.log('[DEBUG] About to emit title event with text:', text, 'type: subtitle');
      console.log('[PLUGIN DEBUG] Emitting title event for bot:', bot.username, 'entityId:', bot.entityId, 'title:', text, 'type: subtitle');
      bot.emit('title', text, 'subtitle');
      console.log('[DEBUG] Title event emitted');
    });
  }

  // Handle title times
  bot._client.on('packet_set_title_time', packet => {
    console.log('[DEBUG] Received set_title_time packet:', packet)
    // No need to emit an event for times, just log it
  })

  // Handle clear titles
  bot._client.on('packet_clear_titles', packet => {
    console.log('[DEBUG] Received clear_titles packet:', packet)
    // No need to emit an event for clear, just log it
  })
}
