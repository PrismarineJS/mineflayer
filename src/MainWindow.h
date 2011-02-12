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
#include <OGRE/OgreWindowEventUtilities.h>
#include <OGRE/OgreFrameListener.h>

#include <OIS/OISEvents.h>
#include <OIS/OISInputManager.h>
#include <OIS/OISKeyboard.h>
#include <OIS/OISMouse.h>

#include <QObject>
#include <QUrl>

#include "Chunk.h"
#include "Game.h"
#include "SubChunkMeshGenerator.h"

class MainWindow :
    public QObject,
    public Ogre::FrameListener,
    public Ogre::WindowEventListener,
    public OIS::KeyListener,
    public OIS::MouseListener
{
    Q_OBJECT
public:
    enum InputLocation {
        KeyboardKey,
        KeyboardModifier,
        Mouse,
    };

    struct PhysicalInput {
        InputLocation location;
        int id;
        PhysicalInput() {}
        PhysicalInput(OIS::MouseButtonID mouse_button) : location(Mouse), id(mouse_button) {}
        PhysicalInput(OIS::Keyboard::Modifier modifier_button) : location(KeyboardModifier), id(modifier_button) {}
        PhysicalInput(OIS::KeyCode key_code) : location(KeyboardKey), id(key_code) {}

        bool operator ==(const PhysicalInput & other) const {
            return other.id == id;
        }
    };

    struct BlockTextureCoord {
        int x;
        int y;
        int w;
        int h;
    };

public:
    MainWindow(QUrl url);
    ~MainWindow();

    int exec();

    Game * game() const { return m_game; }
    QMutex * ogreMutex() { return &m_ogre_mutex; }
    Ogre::SceneNode * sceneNodeForPass(int pass_index) const { return m_pass[pass_index]; }
    BlockTextureCoord texCoords(QString name) const { return m_terrain_tex_coords.value(name); }

protected:
    // Ogre::FrameListener
    bool frameRenderingQueued(const Ogre::FrameEvent& evt);

    // OIS::KeyListener
    bool keyPressed(const OIS::KeyEvent &arg);
    bool keyReleased(const OIS::KeyEvent &arg);
    // OIS::MouseListener
    bool mouseMoved(const OIS::MouseEvent &arg);
    bool mousePressed(const OIS::MouseEvent &arg, OIS::MouseButtonID id);
    bool mouseReleased(const OIS::MouseEvent &arg, OIS::MouseButtonID id);

    // Ogre::WindowEventListener
    // Adjust mouse clipping area
    void windowResized(Ogre::RenderWindow* rw);
    // unattach OIS before window shutdown
    void windowClosed(Ogre::RenderWindow* rw);

private:
    static const float c_gui_png_width;
    static const float c_gui_png_height;


    Ogre::Root *m_root;
    Ogre::Camera* m_camera;
    Ogre::SceneManager* m_scene_manager;
    Ogre::RenderWindow* m_window;
    Ogre::String m_resources_config;

    Ogre::Vector3 m_camera_velocity;
    bool m_shut_down;
    bool m_free_look_mode;

    //OIS Input devices
    OIS::InputManager* m_input_manager;
    OIS::Mouse* m_mouse;
    OIS::Keyboard* m_keyboard;

    bool m_grab_mouse;

    Game * m_game;

    // maps input to Control and vice versa
    QHash<PhysicalInput, Game::Control> m_key_to_control;
    QVector<PhysicalInput> m_control_to_key;

    Ogre::SceneNode * m_pass[2];
    Ogre::SceneNode * m_hud;

    SubChunkMeshGenerator * m_sub_chunk_generator;

    QMutex m_ogre_mutex;


    // maps texture name to coordinates in terrain.png
    QHash<QString, BlockTextureCoord> m_terrain_tex_coords;

private:
    void loadControls();

    bool setup();
    bool configure();
    void createCamera();
    void createFrameListener();
    void createViewports();
    void setupResources();
    void loadResources();

    PhysicalInput configKeyToPhysInput(QString config_value);
    bool controlPressed(Game::Control control);
    void activateInput(PhysicalInput input, bool activated = true);

    void grabMouse();

    Ogre::ManualObject * create2DObject(const Ogre::String & material_name,
        const QSizeF & material_size_pixels, const QString & texture_name, const QSizeF & size);
    void createHud();

private slots:
    void movePlayerPosition();
    void handlePlayerHealthUpdated();
    void handlePlayerDied();

};

uint qHash(const MainWindow::PhysicalInput & value);

#endif // MAINWINDOW_H
