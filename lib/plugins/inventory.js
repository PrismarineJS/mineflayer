module.exports = inject;

function inject(bot) {
  var addItem = function(item, slot) {
    if (item.id === -1) {
      bot.entity.inventory[slot] = null;
    } else {
      bot.entity.inventory[slot] = item;
    }
    bot.emit('inventoryUpdate');
    if (slot === bot.entity.heldSlot) {
      bot.entity.setEquipment(0, bot.entity.inventory[slot]);
      bot.emit('equipmentUpdate');
    } else if (slot >= 5 && slot <= 8) {
      bot.entity.setEquipment(slot - 4, bot.entity.inventory[slot]);
      bot.emit('equipmentUpdate');
    } else if (slot >= 36 && slot <= 44) {
      bot.entity.quickBar[slot-36] = bot.entity.inventory[slot];
      bot.emit('quickbarUpdate');
    }
  };

  // held items
  // slot must be 0-8
  bot.hold = function(slot) {
    bot.client.write(0x10, {slotId: slot});
  };
  bot.client.on(0x10, function(packet) {
    bot.entity.heldSlot = packet.slotId;
    bot.emit('equipmentUpdate');
  });

  // item changes
  bot.client.on(0x67, function(packet) {
    if (packet.windowId !== 0) {
      return;
    }
    addItem(packet.item, packet.slot);
  });
  bot.client.on(0x68, function(packet) {
    if (packet.windowId !== 0) {
      return;
    }
    packet.items.forEach(addItem);
  });
}
