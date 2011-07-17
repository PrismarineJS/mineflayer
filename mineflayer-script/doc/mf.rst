.. module:: mf

Vocabulary
==========

**meter** - a block is 1 meter cubed, or 1x1x1.

Enums
=====

.. class:: EntityType

   .. attribute:: Player
   .. attribute:: Mob
   .. attribute:: Pickup

.. class:: ItemType 
   
   The id of blocks and items. See the output of
   `examples/reflect.js` for a full listing of names.

.. class:: Face

   Which side of a block, if any.

   .. attribute:: NoDirection
   .. attribute:: NegativeX

      West

   .. attribute:: PositiveX

      East

   .. attribute:: NegativeY

      South

   .. attribute:: PositiveY

      North

   .. attribute:: NegativeZ

      Down

   .. attribute:: PositiveZ

      Up

.. class:: MobType

    .. attribute:: Creeper
    .. attribute:: Skeleton
    .. attribute:: Spider
    .. attribute:: GiantZombie
    .. attribute:: Zombie
    .. attribute:: Slime
    .. attribute:: Ghast
    .. attribute:: ZombiePigman
    .. attribute:: Pig
    .. attribute:: Sheep
    .. attribute:: Cow
    .. attribute:: Chicken

.. class:: StoppedDiggingReason

    .. attribute:: BlockBroken
    .. attribute:: Aborted

.. class:: Control

    Represents an input action as if you were pressing buttons on a keyboard.

    .. attribute:: Forward
    .. attribute:: Back
    .. attribute:: Left
    .. attribute:: Right
    .. attribute:: Jump
    .. attribute:: Crouch

       TODO (not hooked up)

    .. attribute:: DiscardItem 

       TODO (not hooked up)

.. class:: AnimationType

    .. attribute:: NoAnimation
    .. attribute:: SwingArm
    .. attribute:: Damage
    .. attribute:: Crouch
    .. attribute:: Uncrouch

.. class:: WindowType

    .. attribute:: None
    .. attribute:: Inventory
    .. attribute:: Chest
    .. attribute:: Workbench
    .. attribute:: Furnace
    .. attribute:: Dispenser

.. class:: MouseButton

    For sending window clicks.

    .. attribute:: Left
    .. attribute:: Right

.. class:: Dimension

   .. attribute:: Normal
   .. attribute:: Nether

Classes
=======

.. class:: Point(x, y, z)

    Represents a 3D coordinate/location in meters.

    Example::

        var point = new mf.Point(0, 0, 0);

    .. attribute:: Point.x

        `Number`, south

    .. attribute:: Point.y

        `Number`, up

    .. attribute:: Point.z

        `Number`, west

    .. function:: floored()

       :rtype: :class:`Point`
       :returns: A new point with each coordinate rounded down to the nearest integer.

    .. function:: offset(dx, dy, dz)

       :rtype: :class:`Point`
       :returns: A new :class:`Point` offset by the amount specified.
       :param Number dx: How much to offset x.
       :param Number dy: How much to offset y.
       :param Number dz: How much to offset z.

    .. function:: plus(other)

        :rtype: :class:`Point`
        :returns: A new point with each term offset by `other`.
        :param mf.Point other: The :class:`Point` to add.

    .. function:: minus(other)

        :rtype: :class:`Point`
        :returns: A new point with each term subtracted by `other`.
        :param mf.Point other: The :class:`Point` to subtract.

    .. function:: scaled(scalar)

        :rtype: :class:`Point`
        :returns: A new point with each term multiplied by `scalar`.
        :param Number other: The number to multiply by.

    .. function:: abs()

        :rtype: :class:`Point`
        :returns: A new point with each term the absolute value of its former value.

    .. function:: distanceTo(other)

        :rtype: Number
        :returns: The Euclidean distance from the point to `other`.
        :param mf.Point other: The :class:`Point` to compute the distance to.

    .. function:: equals(other)

        :rtype: Boolean
        :returns: Whether or not the points are equal.
        :param mf.Point other: The :class:`Point` to check.

    .. function:: toString()

       :rtype: String
       :returns: The point represented in text form.

    .. function:: clone()

       :rtype: :class:`Point`
       :returns: A new point which is a copy of the original.

.. class:: Entity

   Contains a snapshot of an entity's state.

   .. attribute:: entity_id

      `Number`, the id of this entity.

   .. attribute:: type

      :class:`mf.EntityType`

   .. attribute:: position

      :class:`mf.Point`, the center of the bottom of of the entity.

   .. attribute:: velocity

      :class:`mf.Point`, the entity's velocity in meters per second squared.

   .. attribute:: yaw

      `Number`, range [0, 2pi], rotation around vertical axis. 0 is -z (east). pi/2 is -x (north), etc.

   .. attribute:: pitch

      `Number`, range [-pi/2, pi/2], 0 is parallel to the ground. pi/2 is up. -pi/2 is down.

   .. attribute:: on_ground

      `Boolean`, `true` if you are not free-falling.

   .. attribute:: height

      `Number`, distance from ground to eyes. `0` for non-humanoid entities.

   Additional properties when :attr:`type` is :attr:`mf.EntityType.Player`:

       .. attribute:: username

          `String`

       .. attribute:: held_item

          :class:`mf.ItemType`, the item the player is holding in their hand

   Additional properties when :attr:`type` is :attr:`mf.EntityType.Mob`:

       .. attribute:: mob_type

          :class:`mf.MobType`

   Additional properties when :attr:`type` is :attr:`mf.EntityType.Pickup`:

       .. attribute:: item

          :class:`mf.Item`

.. class:: Item(type, [count, [metadata]])

    Represents an item or stack of items.
    
    .. attribute:: type

       :class:`mf.ItemType`

    .. attribute:: count

       `Number`, defaults to 1

    .. attribute:: metadata

       `Number`, defaults to 0

    Examples::

        var item1 = new mf.Item(mf.ItemType.Dirt, 64)
        var item2 = new mf.Item(mf.ItemType.StoneSword)

.. class:: Block(type, [metadata, [light, [sky_light]]])

    Represents a block placed in the world

    .. attribute:: type

       :class:`mf.ItemType` 

    .. attribute:: metadata

       `Number`, defaults to 0
    
    .. attribute:: light

       `Number`, defaults to 0, light from local sources (not the sky)

    .. attribute:: sky_light

       `Number`, defaults to 0, potential light from sky if it was daytime

Methods
=======

.. function:: include(path)

    :param String path: The filepath to the script including the extension.

    Runs a script with a path relative to the current script.
    Modularize your bot by using this function to import components.
    This method will not run a script twice.

.. function:: setTimeout(func, time)

    Call a function later.

    :param Function func: The function that you want to execute later.

    :param Number time: The amount of milliseconds you want to wait before executing func.

    :returns: an ID which you can use to cancel the timeout.
    :rtype: Number

.. function:: clearTimeout(id)

    Stop a timeout that is in progress

    :param Number id: The ID which you got from :func:`setTimeout`.

.. function:: setInterval(func, time)

    Execute a function on a set internal.

    :param Function func: The function that you want to execute every time milliseconds.
    :param Number time: The interval in milliseconds you want to wait between executing `func`.

.. function:: clearInterval(id)

    Stop an interval that is in progress

    :param Number id: The ID which you got from :func:`setInterval`.

.. function:: debug(line)

    Prints a line of text to stderr. Useful for debugging.

    :param String line:

.. function:: print(string)

    Prints a string to stdout. Does not put a newline character at the end.
    :param String string:

.. function:: readFile(path)

    Reads a text file and returns the contents as a string. Returns undefined if the file cannot be opened.

    :param String path: The path to the file.
    :rtype: String or undefined
    :returns: Contents of the file as a String.

.. function:: writeFile(path, contents)

    Writes a text file with the specified contents.

    :param String path: The path to the file
    :param String contents:

.. function:: args()

    :rtype: Array of Strings
    :returns: the script's arguments from the command line invocation.

.. function:: mf.chat(message)

    Sends a publicly broadcast chat message. Breaks up big messages into multiple chat messages as necessary.
    If message begins with "/tell <username> ", then all split messages will be whispered as well.

    :param String message:

.. function:: exit(return_code)

    Disconnects from server and exits the program.

    :param Number return_code: Optional. Defaults to 0.

.. function:: itemStackHeight(item)

    Gets the number of items you can stack together.

    :param mf.ItemType item: The ID of the item you want to check the stack height of.
    :returns: The number of items of type item you can stack together, or -1 if that item doesn't exist.
    :rtype: Number

.. function:: isPhysical(block_type)

    Returns whether the block type has any physical presence with respect to physics.
    This is false for air, flowers, torches, etc.

    Example::

        if (mf.isPhysical(mf.blockAt(some_point).type)) {
            // water physics
        }

    :param mf.ItemType block_type:
    :rtype: Boolean

.. function:: isSafe(block_type)

    Returns whether the block type is non-physical and safe to stand in.
    This returns `false` for lava, fire, and everything that :func:`isPhysical` returns `true` for.

    :param mf.ItemType block_type:
    :rtype: Boolean

.. function:: isDiggable(block_type)

    Returns whether the block type is diggable.
    This returns false for air, bedrock, water, lava, etc.

    :param mf.ItemType block_type:
    :rtype: Boolean

.. function:: health()

    :rtype: Number
    :returns: The number of half-hearts that you have, out of 20.

.. function:: blockAt(point)

    Returns the block at the absolute location in the world.
    If :func:`isBlockLoaded` returns `false` for the point, this function will
    return some kind of Air.

    :param mf.Point point: Coordinates do not need to be rounded.
    :rtype: :class:`Block`

.. function:: isBlockLoaded(point)

    :param Number point: Coordinates do not need to be rounded.
    :rtype: Boolean
    :returns: whether the map is loaded at the specified point.

.. function:: signTextAt(point)

    Returns the text of the sign at the specified location, or `undefined` if
    the block at the location is not a sign. Lines are separated by `'\n'`.

    :param mf.Point point: The location of the sign
    :rtype: String or undefined

.. function:: canPlaceBlock(point, face)

    Returns whether or not you're able to place your currently equipped item
    on the face of the block at point.
    Takes into account distance, whether something is in your way,
    whether the target block is activatable, and what you're equipped with.

    :param mf.Point point: The location of the block you want to check.
    :param mf.Face face: The face of the block you want to attach to.

.. function:: self()

    Returns a snapshot of your state in the world as an entity. Modifying the object does nothing.

    :rtype: :class:`Entity`

.. function:: setControlState(control, state)

    Sets the input state of a control. Use this to move around, jump, and
    place and activate blocks. It is as if you are virtually pressing keys on a
    keyboard. Your actions will be bound by the physics engine, (unless you
    use the mf.hax functions).

    :param mf.Control control:
    :param Boolean state: Whether or not you are activating this control. E.g. whether or not the virtual button is held down.

.. function:: clearControlStates()

    Sets all control states to false.

.. function:: lookAt(point, [force])

    Looks at the given point specified in absolute coordinates. See also :func:`mf.look`.

    :param mf.Point point:
    :param Boolean force: If present and true, skips the smooth server-side transition. Specify this to true if you need the server to know exactly where you are looking, such as for dropping items or shooting arrows. This is not needed for client-side calculation such as walking direction.

.. function:: respawn()

    Call this when you're dead to respawn.

.. function:: activateItem()

    Eat, shoot, throw, etc. your currently equipped item.
    Throws an exception if your currently equipped item can't be activated.

Cheating methods
----------------

.. function:: hax.placeBlock(block, face)

    Place the currently equipped block. If the block at point is a chest,
    furnace, workbench, etc, this will throw an exception.
    See :func:`activateBlock()`.
    If the equipped item is food, this will throw an exception.
    See :func:`setControlState()`.
    This method is considered cheating. See description of :func:`canPlaceBlock()` for
    an example of how to place blocks without cheating.

    :param mf.Point block: The coordinates of the block that you want to place the block on.
    :param mf.Face face: Which side of the block you want to place the block on.

.. function:: hax.activateBlock(block)

    Same as right-clicking. This is for chests, furnaces, note blocks, etc.
    Throws an exception if the block is not activatable.
    This method is considered cheating. See description of :func:`canPlaceBlock()` for
    an example of how to activate blocks without cheating.

    :param mf.Point block: The coordinates of the block that you want to activate

.. function:: hax.setPosition(point)

    Instantly moves you to the position specified.
    NOTE: Your movement may be rejected by the server. This can happen if you
    try to go through a wall.

    :param mf.Point point:

.. function:: hax.setGravityEnabled(value)

    Turns on/off gravity. When gravity is off, you will not take fall damage.

    :param Boolean value:

.. function:: hax.setJesusModeEnabled(value)

    Pretend that water is solid.

    :param Boolean value:

.. function:: attackEntity(entity_id)

    Sends a single attack message to the server.

    :param Number entity_id:

.. function:: entity(entity_id)

    :param Number entity_id:
    :rtype: :class:`mf.Entity` or `undefined`:
    :returns: a snapshot of the entity with the given entity id or undefined if the entity id cannot be found. Modifying the object does nothing.

.. function:: startDigging(point)

    Begin digging into a block with the currently equipped item. When you finally break through the block,
    or you are interrupted for any reason, you will get an :func:`onStoppedDigging()` event.

    :param mf.Point point: The location of the block to dig.


.. function:: stopDigging()

    Stops digging.

.. function:: look(yaw, pitch)

    Looks in a direction.

    :param Number yaw: The number of radians to rotate around the vertical axis, starting from due east. Counter clockwise.
    :param Number pitch: Number of radians to point up or down. 0 means straight forward. pi / 2 means straight up. -pi / 2 means straight down.

.. function:: selectedEquipSlot()

    :returns: The slot id [0-8] of the selected equipment.

    See the diagrams in :func:`clickUniqueSlot`.

.. function:: selectEquipSlot(slot)

    Selects an equipment slot.

    :param Number slot: The id of the slot [0-8] you wish to select.

    See the diagrams in :func:`clickUniqueSlot`.

.. function:: clickInventorySlot(slot, button)

    Simulates clicking the mouse button as with the real client.
    Make sure you use :func:`openInventoryWindow` and get the :func:`onWindowOpened` event before using this function.

    :param Number slot: The slot id you wish to click on.
    :param mf.MouseButton button: Which mouse button you wish to simulate clicking with.

    See the diagrams in :func:`clickUniqueSlot`.

.. function:: clickUniqueSlot(slot, button)

    Simulates clicking the mouse button as with the real client.
    Make sure you get the :func:`onWindowOpened` event with the correct
    window id before using this function.

    :param Number slot: The slot id you wish to click on.
    :param mf.MouseButton button: Which mouse button you wish to simulate clicking with.

    The slot ids are as follows:

    .. figure:: _static/container-slots.png

       Double chest slot ids. Single chest is the top half only.

    .. figure:: _static/furnace-slots.png

       Furnace slot ids.

    .. figure:: _static/trap-slots.png

       Dispenser slot ids.

    .. figure:: _static/crafting-slots.png

       Crafting Table slot ids.

    .. figure:: _static/inventory-slots.png

       Inventory slot ids.

.. function:: clickOutsideWindow(button)

   Simulates clicking outside of the open window.

   :param mf.MouseButton button: Which mouse button to simulate clicking with.

.. function:: openInventoryWindow()

   Opens the inventory window. Will cause an :func:`onWindowOpened` event.

.. function:: closeWindow()

   Closes the open window.

.. function:: inventoryItem(slot)

    :returns: The item in `slot`.
    :rtype: :class:`mf.Item`
    :param Number slot: The slot id to return the item for.

    See the diagrams in :func:`clickUniqueSlot`.

.. function:: uniqueWindowItem(slot)

    :returns: The item in `slot`.
    :rtype: :class:`Item`

    See the diagrams in :func:`clickUniqueSlot`.

.. function:: timeOfDay()

    Tells what time it is, also known as where the sun or moon is in the sky.

    :rtype: Number
    :returns: The number of real life seconds since dawn (6:00am). This ranges from 0 to 1200 since a day is 20 minutes.

Events
======

Fill in the ... part of the function. See examples for more information.

.. function:: onConnected(function() {...})

    Called when the bot successfully logs into a server.

.. function:: onChat(function(user, message) {...})

    Called when the bot hears a publicly broadcast chat message.

    :param String user: The username of the person sending the message.
    :param String message: The content of the message.

.. function:: onNonSpokenChat(function(message) {...})

    Called when a chat is received that was no spoken by a player.
    This includes player joined messages, teleporting notifications, etc.

    :param String message: All color codes will be removed

.. function:: onTimeUpdated(function(seconds) {...})

    Called every second. See :func:`timeOfDay()`.

    :param Number seconds: Number of seconds since dawn.

.. function:: onChunkUpdated(function(start, size) {...})

    Called when blocks are updated. Updated region is a rectangular solid even if not
    all of the blocks in the region have actually changed.

    :param mf.Point start: The absolute position of the min corner of the region.
    :param mf.Point size: The size of the region.

.. function:: onSignUpdated(function(location, text) {...})

    Called when a sign is discovered or destroyed or when a sign's text changes.

    :param mf.Point location: The location of the sign
    :param String text: The new text of the sign or undefined if the sign was destroyed

.. function:: onSpawn(function(dimension) {...})

    Called when you spawn. Happens after connecting and after respawning after death.

    :param mf.Dimension world: Either :attr:`mf.Dimension.Normal` or :attr:`mf.Dimension.Nether`.

.. function:: onSelfMoved(function() {...})

    Called when you move. See also :func:`self()`.

.. function:: onHealthChanged(function() {...})

    Called when you get hit, take fall damage, eat food, etc. See also :func:`health()`.

.. function:: onDeath(function() {...})

    Called when you die.

.. function:: onEntitySpawned(function(entity) {...})

    Called when an entity is discovered.
    This can happen when an entity is created or when it comes into view.

    :param mf.Entity entity:

.. function:: onEntityDespawned(function(entity) {...})

    Called when an entity vanishes from known existence.
    This can happen when an entity is destroyed or when it goes out of view.

    :param mf.Entity entity:

.. function:: onEntityMoved(function(entity) {...})

    Called when an entity moves or in some other way changes state.

    :param mf.Entity entity:

.. function:: onAnimation(function(entity, animation_type) {...})

    Called when an entity animates

    :param mf.Entity entity:
    :param mf.AnimationType animation_type: which animation was performed.

.. function:: onStoppedDigging(function(reason) {...})

    Called when you have stopped digging for some reason.

    :param mf.StoppedDiggingReason reason:

.. function:: onEquippedItemChanged(function() {...})

    Called when what you are currently equipped with changes.
    For example, if your pickaxe breaks or you eat food. See also :func:`equippedItem()`.
    TODO: equippedItem is not documented

.. function:: onInventoryUpdated(function() {...})

    Called when anything in your inventory changes. See also :func:`inventoryItem()`.

.. function:: onWindowOpened(function(window_type) {...})

    Called when you can begin messing with a chest or your inventory.

    :param mf.WindowType window_type:

.. function:: onStdinLine(function(line) {...})

    Called when a line of stardard input is typed in the console.

    :param String line:

.. function:: removeHandler(event_registrar, handler)

    Removes the handler from the event.

    Example::

        mf.onChat(function handleChat(username, message) {
            mf.debug("got first chat");
            mf.removeHandler(mf.onChat, handleChat);
        });

    :param Object event_registrar: One of mf.on*
    :param Function handler: function registered previously with the event

