#include "MineflayerApplication.h"

#include <QtGlobal>
#include <QTimer>
#include <QCoreApplication>
#include <QDateTime>
#include <QSettings>
#include <QDir>
#include <QDebug>


const int MineflayerApplication::c_fps = 60;
const double MineflayerApplication::c_time_per_frame_msecs = 1.0 / (double)c_fps * 1000.0;


MineflayerApplication::MineflayerApplication()
{
    loadControls();
}

MineflayerApplication::~MineflayerApplication()
{
}

void MineflayerApplication::createScene()
{
    Ogre::Entity* ogreHead = mSceneMgr->createEntity("Head", "ogrehead.mesh");

    Ogre::SceneNode* headNode = mSceneMgr->getRootSceneNode()->createChildSceneNode();
    headNode->attachObject(ogreHead);

    // Set ambient light
    mSceneMgr->setAmbientLight(Ogre::ColourValue(0.5, 0.5, 0.5));

    // Create a light
    Ogre::Light* l = mSceneMgr->createLight("MainLight");
    l->setPosition(20,80,50);
}


void MineflayerApplication::loadControls()
{
    QDir dir(QCoreApplication::applicationDirPath());
    QSettings settings(dir.absoluteFilePath("mineflayer.ini"), QSettings::IniFormat);
    m_key_to_control.insert(settings.value("controls/forward", Qt::Key_W).toInt(), Forward);
    m_key_to_control.insert(settings.value("controls/back", Qt::Key_S).toInt(), Back);
    m_key_to_control.insert(settings.value("controls/left", Qt::Key_A).toInt(), Left);
    m_key_to_control.insert(settings.value("controls/right", Qt::Key_D).toInt(), Right);
    m_key_to_control.insert(settings.value("controls/jump", Qt::Key_Space).toInt(), Jump);
    m_key_to_control.insert(settings.value("controls/crouch", Qt::Key_Shift).toInt(), Crouch);
    m_key_to_control.insert(settings.value("controls/discard_item", Qt::Key_Q).toInt(), DiscardItem);
    m_key_to_control.insert(settings.value("controls/action_1", Qt::LeftButton).toInt(), Action1);
    m_key_to_control.insert(settings.value("controls/action_2", Qt::RightButton).toInt(), Action2);
    m_key_to_control.insert(settings.value("controls/inventory", Qt::Key_I).toInt(), Inventory);
    m_key_to_control.insert(settings.value("controls/chat", Qt::Key_T).toInt(), Chat);

    QHashIterator<int, Control> it(m_key_to_control);
    while (it.hasNext()) {
        it.next();
        m_control_to_key.insert(it.value(), it.key());
    }
}


void MineflayerApplication::computeNextFrame()
{

//    //  move the player
//    bool forward = m_key_down.value(m_control_to_key.value(Forward));
//    bool backward = m_key_down.value(m_control_to_key.value(Back));
//    bool left = m_key_down.value(m_control_to_key.value(Left));
//    bool right = m_key_down.value(m_control_to_key.value(Right));

//    if (forward && ! backward) {
//        // move camera forward in direction it is facing
//        m_camera->moveForward(5.0f);
//    } else if (backward && ! forward) {
//        // move camera backward in direction it is facing
//        m_camera->moveBackward(5.0f);
//    }

//    if (left && ! right) {
//        // strafe camera left
//        m_camera->moveLeft(2.0f);
//    } else if (right && ! left) {
//        // strafe camera right
//        m_camera->moveRight(2.0f);
//    }
}
