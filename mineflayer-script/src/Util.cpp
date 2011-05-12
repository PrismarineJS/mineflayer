#include "Util.h"

QString Util::toQString(mineflayer_Utf8 utf8)
{
    return QString::fromUtf8(reinterpret_cast<const char *>(utf8.utf8_bytes), utf8.byte_count);
}

mineflayer_Utf8 Util::toNewMfUtf8(QString qstring)
{
    mineflayer_Utf8 data;
    QByteArray barray = qstring.toUtf8();
    data.byte_count = barray.size();
    data.utf8_bytes = new unsigned char[data.byte_count];
    memcpy(data.utf8_bytes, barray.data(), data.byte_count);
    return data;
}

void Util::deallocMfUtf8(mineflayer_Utf8 utf8)
{
    delete[] utf8.utf8_bytes;
    utf8.utf8_bytes = NULL;
}

mineflayer_Utf8 Util::copyMfUtf8(mineflayer_Utf8 utf8)
{
    mineflayer_Utf8 newUtf8;

    newUtf8.byte_count = utf8.byte_count;
    newUtf8.utf8_bytes = new unsigned char[newUtf8.byte_count];
    memcpy(newUtf8.utf8_bytes, utf8.utf8_bytes, utf8.byte_count);

    return newUtf8;
}

mineflayer_Entity * Util::cloneEntity(mineflayer_Entity * orig)
{
    mineflayer_Entity * newEntity = new mineflayer_Entity;

    *newEntity = *orig;

    if (newEntity->type == mineflayer_NamedPlayerEntity)
        newEntity->username = Util::copyMfUtf8(newEntity->username);

    return newEntity;
}

void Util::destroyEntity(mineflayer_Entity * entity) {
    if (entity == NULL)
        return;

    if (entity->type == mineflayer_NamedPlayerEntity)
        Util::deallocMfUtf8(entity->username);

    delete entity;
}
