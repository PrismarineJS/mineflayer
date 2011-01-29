#ifndef MINEFLAYERAPPLICATION_H
#define MINEFLAYERAPPLICATION_H

#include <QObject>
#include <QHash>
#include <QSharedPointer>

#include "BaseApplication.h"
#include "Chunk.h"
#include "Server.h"

#include <OGRE/OgreVector3.h>

class MineflayerApplication : public BaseApplication
{
    Q_OBJECT
public:
    enum Control {
        Forward,
        Back,
        Left,
        Right,
        Jump,
        Crouch,
        DiscardItem,
        Action1, // left click
        Action2, // right click
        Inventory,
        Chat,
    };

public:
    MineflayerApplication();
    virtual ~MineflayerApplication();


protected:
    virtual void createScene();

private:

    struct Entity {
        Ogre::Vector3 pos;
        Ogre::Vector3 up;
        Ogre::Vector3 look;
        double stance;
        bool on_ground;
    };

    Server * m_server;

    QHash<Chunk::Coord, QSharedPointer<Chunk> > m_chunks;
    QHash<qint32, QSharedPointer<Entity> > m_entities;
    Entity * m_player;

    // maps Qt::Key to Control and vice versa
    QHash<int, Control> m_key_to_control;
    QHash<Control, int> m_control_to_key;

    static const int c_fps;
    static const double c_time_per_frame_msecs;
    double m_target_time_msecs;


private:
    void loadControls();
    void computeNextFrame();

};

#endif // MINEFLAYERAPPLICATION_H
