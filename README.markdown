Mineflayer
==========
Minecraft multiplayer client game logic library and bot scripting interface.

**Homepage:** http://mineflayer.com

Setting up build:
-----------------

### Linux:

1. Install prerequisites:

		sudo apt-get install qt4-dev-tools

2. Create a build folder OUTSIDE the source code tree:

		mkdir ../mineflayer-build
		cd ../mineflayer-build/

3. Configure with script debugging support (recommended):

		qmake ../mineflayer/mineflayer.pro

	OR configure headless which removes any dependency on an X server:

		EXTRA_CONFIG=headless qmake ../mineflayer/mineflayer.pro

4. Build everything:

		make

5. Optionally install `libmineflayer-core.so` to `/usr/lib`:

		INSTALL_ROOT=/usr sudo make install

If you don't do this, you'll have to put the directory containing the .so in the `LD_LIBRARY_PATH` variable whenever you run mineflayer.

### Mac:

1. Download the Qt SDK for Mac from http://qt.nokia.com/downloads/
2. Create a build folder OUTSIDE the source code tree and cd to it.
3. Configure:

		qmake -spec macx-g++ path/to/mineflayer.pro

	OR:

		EXTRA_CONFIG=headless qmake -spec macx-g++ path/to/mineflayer.pro

4. Now whenever you want to build, use `make`.

### Windows:

NOTE: these instructions are out of date. You don't need to do step 5 or probably steps 2 - 6 at all.

1. Download and install the Qt SDK: http://qt.nokia.com/downloads/
2. Open mineflayer.pro with Qt Creator
3. On the left click Projects.
4. Edit build configuration: Release
5. Build Steps -> qmake -> Details -> additional arguments: CONFIG+=no_3d
6. On the left above the run button, change the active build to Release
7. Build -> Build All
8. This generates mineflayer.exe in your build directory. Typically you run bots from the command line. To do this you'll need to copy a bunch of DLLs from Qt. These DLLs are:

	* libgcc_s_dw2-1.dll
	* mingwm10.dll
	* QtCore4.dll
	* QtGui4.dll
	* QtNetwork4.dll
	* QtScript4.dll
	* QtScriptTools4.dll

Running bots:
-------------

    mineflayer bot.js

If the bot depends on any of the lib files you'll need to pass the lib folder like this:

    mineflayer -I<path_to_lib> bot.js

Alternately, you can put the lib folder in an environment variable called `MINEFLAYER_LIB`.

To connect to a server that requires authentication:

    mineflayer --url username@server --password 12345 bot.js

NOTE: all parameters passed after the bot `.js` file are parameters passed to the bot script itself rather than mineflayer.


Running the useful examples (multi.js):
---------------------------------------

The script `examples/multi.js` is a meta-script that includes most all of the useful bot scripts found in the `examples/` directory. Here's an example invocation command from the build directory (this assumes you don't have a `MINEFLAYER_LIB` variable defined):

    ./mineflayer-script/mineflayer -I../mineflayer/mineflayer-script/lib/ --url BOT_USER_NAME@SERVER_HOSTNAME ../mineflayer/mineflayer-script/examples/multi.js --master=YOUR_USER_NAME --setup="jesusmode on" --setup="healthreport on"

Explanations of the `--master` and `--setup` commands can be found in `lib/chat_commands.js`. If you and your bot are logged in, say "help" via chat for a list of known chat commands (such as "jesusmode" and "healthreport").

Documentation:
--------------
 * See `doc/bot-api` for comprehensive API documentation.
 * See `libs/` for more utility functions.
 * See `examples/` for examples of bot code.

ECMAScript reference: http://doc.qt.nokia.com/latest/ecmascript.html

Running the test suite:
-----------------------
Command will look something like:

	cd mineflayer-script
	LD_LIBRARY_PATH=../../mineflayer-build-desktop/mineflayer-core bin/run_tests ~/apps/minecraft-server-1.5/minecraft_server.jar ../../mineflayer-build-desktop/mineflayer-script/mineflayer
