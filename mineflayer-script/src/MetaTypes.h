#ifndef METATYPES_H
#define METATYPES_H

#include <QMetaType>

namespace MetaTypes {
    void registerMetaTypes() {
        qRegisterMetaType<mineflayer_LoginStatus>("mineflayer_LoginStatus");
        qRegisterMetaType<mineflayer_EntityPosition>("mineflayer_EntityPosition");
        qRegisterMetaType<mineflayer_MobType>("mineflayer_MobType");
        qRegisterMetaType<mineflayer_ItemType>("mineflayer_ItemType");
        qRegisterMetaType<mineflayer_Entity*>("mineflayer_Entity*");
        qRegisterMetaType<mineflayer_StoppedDiggingReason>("mineflayer_StoppedDiggingReason");
        qRegisterMetaType<mineflayer_AnimationType>("mineflayer_AnimationType");
        qRegisterMetaType<mineflayer_WindowType>("mineflayer_WindowType");
        qRegisterMetaType<mineflayer_Int3D>("mineflayer_Int3D");
    }
}


#endif // METATYPES_H
