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

    mineflayer_Entity * cloneEntity(mineflayer_Entity * orig);
    void destroyEntity(mineflayer_Entity * entity);
}

#endif // UTIL_H
