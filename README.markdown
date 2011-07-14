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

3. Optionally disable script debugging support (not recommended). This removes any dependency on an X server:

        echo "CONFIG += headless" > ../mineflayer-script/config.pro

4. Run qmake once:

        qmake ../mineflayer/mineflayer.pro

5. Build with `make`:

        make

6. Optionally install `libmineflayer-core.so` to `/usr/lib`:

        INSTALL_ROOT=/usr sudo make install

If you don't do this, you'll have to put the directory containing the .so in the `LD_LIBRARY_PATH` variable whenever you run mineflayer.

### Mac:

1. Download the Qt SDK for Mac from http://qt.nokia.com/downloads/
2. Create a build folder OUTSIDE the source code tree and cd to it.
3. Optionally enable headless mode:

        echo "CONFIG += headless" > ../mineflayer-script/config.pro

4. Run qmake:

        qmake -spec macx-g++ path/to/mineflayer.pro

5. Now whenever you want to build, use `make`.

### Windows:

1. Download and install the Qt SDK: http://qt.nokia.com/downloads/
2. Open `mineflayer.pro` with Qt Creator
3. Click `Projects`, and change the build configuration from `Debug` to `Release`.
4. `Build` -> `Build All`. This generates:
    * `mineflayer-core.dll` in your **library build directory** which is `mineflayer-build-desktop/mineflayer-core/relase` just outside the `mineflayer` directory.
    * `mineflayer.exe` in your **build directory** which is `mineflayer-build-desktop/mineflayer-script/relase` just outside the `mineflayer` directory.
5. Put the absolute path of your **library build directory** in your `PATH` variable.
6. Copy a bunch of DLLs from Qt into the **build directory** or put these locations in your `PATH` variable:
    * from `C:\Qt\[version]\mingw\bin`:
        * `libgcc_s_dw2-1.dll`
        * `mingwm10.dll`
    * from `C:\Qt\[version]\qt\bin`:
        * `QtCore4.dll`
        * `QtGui4.dll`
        * `QtNetwork4.dll`
        * `QtScript4.dll`
        * `QtScriptTools4.dll`

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
