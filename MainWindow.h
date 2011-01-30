#ifndef MAINWINDOW_H
#define MAINWINDOW_H

#include <OGRE/OgreCamera.h>
#include <OGRE/OgreEntity.h>
#include <OGRE/OgreLogManager.h>
#include <OGRE/OgreRoot.h>
#include <OGRE/OgreViewport.h>
#include <OGRE/OgreSceneManager.h>
#include <OGRE/OgreRenderWindow.h>
#include <OGRE/OgreConfigFile.h>
#include <OGRE/OgreVector3.h>

#include <OIS/OISEvents.h>
#include <OIS/OISInputManager.h>
#include <OIS/OISKeyboard.h>
#include <OIS/OISMouse.h>

#include <OGRE/SdkCameraMan.h>

#include <QObject>
#include <QHash>
#include <QSharedPointer>

#include "Chunk.h"
#include "Server.h"

class MainWindow :
    public QObject,
    public Ogre::FrameListener,
    public Ogre::WindowEventListener,
    public OIS::KeyListener,
    public OIS::MouseListener
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
    MainWindow();
    ~MainWindow();

    void go();

protected:
    // Ogre::FrameListener
    bool frameRenderingQueued(const Ogre::FrameEvent& evt);

    // OIS::KeyListener
    bool keyPressed( const OIS::KeyEvent &arg );
    bool keyReleased( const OIS::KeyEvent &arg );
    // OIS::MouseListener
    bool mouseMoved( const OIS::MouseEvent &arg );
    bool mousePressed( const OIS::MouseEvent &arg, OIS::MouseButtonID id );
    bool mouseReleased( const OIS::MouseEvent &arg, OIS::MouseButtonID id );

    // Ogre::WindowEventListener
    //Adjust mouse clipping area
    void windowResized(Ogre::RenderWindow* rw);
    //Unattach OIS before window shutdown (very important under Linux)
    void windowClosed(Ogre::RenderWindow* rw);

private:
    Ogre::Root *m_root;
    Ogre::Camera* m_camera;
    Ogre::SceneManager* m_scene_manager;
    Ogre::RenderWindow* m_window;
    Ogre::String m_resources_config;
    Ogre::String m_plugins_config;

    // OgreBites
    OgreBites::SdkCameraMan* m_camera_man;       // basic camera controller
    bool m_shut_down;

    //OIS Input devices
    OIS::InputManager* m_input_manager;
    OIS::Mouse* m_mouse;
    OIS::Keyboard* m_keyboard;

    struct Entity {
        Ogre::Vector3 pos;
        Ogre::Vector3 up;
        Ogre::Vector3 look;
        double stance;
        bool on_ground;
    };

    Server * m_server;

    QHash<Chunk::Int3D, QSharedPointer<Chunk> > m_chunks;
    QHash<qint32, QSharedPointer<Entity> > m_entities;
    Entity * m_player;

    // maps OIS::KeyCode to Control and vice versa
    QHash<OIS::KeyCode, Control> m_key_to_control;
    QHash<Control, OIS::KeyCode> m_control_to_key;

private:
    void loadControls();

    bool setup();
    bool configure();
    void createCamera();
    void createFrameListener();
    void createScene();
    void destroyScene();
    void createViewports();
    void setupResources();
    void loadResources();

private slots:
    void updateChunk(QSharedPointer<Chunk> chunk);

};

#endif // MAINWINDOW_H
