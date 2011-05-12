#ifndef UTIL_H
#define UTIL_H

#include <QString>

#include "mineflayer-core/src/mineflayer-core.h"

namespace Util
{
    QString toQString(mineflayer_Utf8 utf8);
    mineflayer_Utf8 toNewMfUtf8(QString qstring);
    void deallocMfUtf8(mineflayer_Utf8 utf8);
    mineflayer_Utf8 copyMfUtf8(mineflayer_Utf8 utf8);
}

#endif // UTIL_H
