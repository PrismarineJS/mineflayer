#include "mineflayer-core.h"
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

mineflayer_GamePtr game;

mineflayer_Utf8 makeUtf8(char * str) {
    mineflayer_Utf8 utf8;
    utf8.byte_count = strlen(str);
    utf8.utf8_bytes = malloc(utf8.byte_count);
    strcpy(utf8.utf8_bytes, str);
    return utf8;
}

void chatReceived(void * context, mineflayer_Utf8 username,
    mineflayer_Utf8 message)
{
    mineflayer_sendChat(game, message);
}

int main() {
    mineflayer_Url url;
    memset(&url, 0, sizeof(mineflayer_Url));
    url.username = makeUtf8("mineflayer");

    game = mineflayer_createGame(url, 1);

    mineflayer_Callbacks callbacks;
    memset(&callbacks, 0, sizeof(mineflayer_Callbacks));
    callbacks.chatReceived = chatReceived;
    mineflayer_setCallbacks(game, callbacks, NULL);

    mineflayer_start(game);

    mineflayer_runEventLoop();
}
