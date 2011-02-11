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
#include <QHash>
#include <QSharedPointer>
#include <QUrl>
#include <QQueue>
#include <QMutex>

#include "Chunk.h"
#include "Game.h"

class SubChunkMeshGenerator;

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

public:
    MainWindow(QUrl url);
    ~MainWindow();

    int exec();

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
    //Adjust mouse clipping area
    void windowResized(Ogre::RenderWindow* rw);
    //Unattach OIS before window shutdown (very important under Linux)
    void windowClosed(Ogre::RenderWindow* rw);

private:
    static const Int3D c_side_offset[];
    static const Int3D c_side_offset_zero[];
    static const Int3D c_zero_face[];
    static const Int3D c_sub_chunk_mesh_size;
    static const Int3D c_chunk_size;
    static const Ogre::Vector3 c_side_coord[6][2][3];
    static const Ogre::Vector2 c_tex_coord[2][3];
    static const float c_terrain_png_width;
    static const float c_terrain_png_height;
    static const float c_terrain_block_size;
    static const float c_decay_rate;
    static const float c_light_brightness[];
    static const char * c_wool_texture_names[];
    static const float c_brightness_bias[];

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

    struct BlockTextureCoord {
        int x;
        int y;
        int w;
        int h;
    };

    struct BlockData {
        QString name;
        QVector<QString> side_textures;
        bool see_through;
        bool partial_alpha;
        QVector<Ogre::Vector3> squish_amount;
        bool rotate;
    };

    struct SubChunkData {
        bool is_null;
        Int3D position;

        // 2 passes for each seam, and a big one for the middle. index is face + 1 so you can do NoDirection as 0.
        Ogre::SceneNode * node[6+1][2];
        Ogre::ManualObject * obj[6+1][2];

        SubChunkData() : is_null(true) {}
    };

    enum BlockFaceDirection {
        NoDirection=-1,
        NegativeY=0, // south
        PositiveY=1, // north
        NegativeZ=2, // down
        PositiveZ=3, // up
        NegativeX=4, // west
        PositiveX=5, // east
    };

    Game * m_game;

    // key is the meter coordinates of the min corner
    QHash<Int3D, SubChunkData> m_sub_chunks;

    // maps input to Control and vice versa
    QHash<PhysicalInput, Game::Control> m_key_to_control;
    QVector<PhysicalInput> m_control_to_key;

    // maps texture name to coordinates in terrain.png
    QHash<QString, BlockTextureCoord> m_terrain_tex_coords;
    // maps item type to texture name for each side
    QHash<Block::ItemType, BlockData> m_block_data;
    BlockData m_air;

    Ogre::SceneNode * m_pass[2];

    SubChunkMeshGenerator * m_sub_chunk_generator;

    QMutex m_ogre_mutex;

    char wtf[50]; // can't let our object be certain sizes or unknown, undocumented, terrible things happen

private:
    void loadControls();

    bool setup();
    bool configure();
    void createCamera();
    void createFrameListener();
    void createViewports();
    void setupResources();
    void loadResources();

    Int3D subChunkKey(const Int3D & coord);
    PhysicalInput configKeyToPhysInput(QString config_value);
    bool controlPressed(Game::Control control);
    void activateInput(PhysicalInput input, bool activated = true);

    void grabMouse();

private slots:
    void movePlayerPosition();
    void handlePlayerHealthUpdated();
    void handlePlayerDied();

    friend class SubChunkMeshGenerator;
};


class SubChunkMeshGenerator : public QObject {
    Q_OBJECT
public:
    struct ReadySubChunk {
        int pass;
        MainWindow::BlockFaceDirection face;
        Ogre::ManualObject * obj;
        Ogre::SceneNode * node;

        Int3D sub_chunk_key;
        ReadySubChunk() {}
        ReadySubChunk(int pass, MainWindow::BlockFaceDirection face, Ogre::ManualObject * obj,
                      Ogre::SceneNode * node, Int3D sub_chunk_key) :
            pass(pass), face(face), obj(obj), node(node), sub_chunk_key(sub_chunk_key) {}
    };

public:
    SubChunkMeshGenerator(MainWindow * owner);
    bool availableNewSubChunk() const {
        QMutexLocker locker(&m_queue_mutex);
        return !m_new_sub_chunk_queue.isEmpty();
    }
    ReadySubChunk nextNewSubChunk() {
        QMutexLocker locker(&m_queue_mutex);
        return m_new_sub_chunk_queue.dequeue();
    }
    bool availableDoneSubChunk() const {
        QMutexLocker locker(&m_queue_mutex);
        return !m_done_sub_chunk_queue.isEmpty();
    }
    ReadySubChunk nextDoneSubChunk() {
        QMutexLocker locker(&m_queue_mutex);
        return m_done_sub_chunk_queue.dequeue();
    }
    void shutDown();
private:

    MainWindow * m_owner;
    QQueue<ReadySubChunk> m_new_sub_chunk_queue;
    QQueue<ReadySubChunk> m_done_sub_chunk_queue;
    QThread * m_thread;
    mutable QMutex m_queue_mutex;

private slots:
    void handleUpdatedChunk(const Int3D &start, const Int3D &size);
    void queueDeleteSubChunkMesh(const Int3D & coord);

    void initialize();
private:
    void generateSubChunkMesh(const Int3D & sub_chunk_key, MainWindow::BlockFaceDirection seam = MainWindow::NoDirection);
    void generateBlockMesh(Ogre::ManualObject * obj, const MainWindow::SubChunkData & chunk_data,
        const Int3D & offset, MainWindow::BlockFaceDirection face, int pass);
    void generateSideMesh(Ogre::ManualObject * obj, const Int3D & absolute_position,
        const Block & block, const MainWindow::BlockData & block_data, MainWindow::BlockFaceDirection face);
};

uint qHash(const MainWindow::PhysicalInput & value);

#endif // MAINWINDOW_H
