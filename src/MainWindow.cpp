#include "MainWindow.h"

#include <OGRE/OgreMaterialManager.h>
#include <OGRE/OgreManualObject.h>

#include <QtGlobal>
#include <QTimer>
#include <QCoreApplication>
#include <QDateTime>
#include <QSettings>
#include <QDir>
#include <QDebug>
#include <QCursor>

const Int3D MainWindow::c_side_offset[] = {
    Int3D(0, -1, 0),
    Int3D(0, 1, 0),
    Int3D(0, 0, -1),
    Int3D(0, 0, 1),
    Int3D(-1, 0, 0),
    Int3D(1, 0, 0),
};

const Ogre::Vector3 MainWindow::c_side_coord[6][2][3] = {
    {
        {Ogre::Vector3(0, 0, 1), Ogre::Vector3(0, 0, 0), Ogre::Vector3(1, 0, 1)},
        {Ogre::Vector3(1, 0, 1), Ogre::Vector3(0, 0, 0), Ogre::Vector3(1, 0, 0)},
    },
    {
        {Ogre::Vector3(1, 1, 1), Ogre::Vector3(1, 1, 0), Ogre::Vector3(0, 1, 1)},
        {Ogre::Vector3(0, 1, 1), Ogre::Vector3(1, 1, 0), Ogre::Vector3(0, 1, 0)},
    },
    {
        {Ogre::Vector3(0, 0, 0), Ogre::Vector3(0, 1, 0), Ogre::Vector3(1, 0, 0)},
        {Ogre::Vector3(1, 0, 0), Ogre::Vector3(0, 1, 0), Ogre::Vector3(1, 1, 0)},
    },
    {
        {Ogre::Vector3(0, 1, 1), Ogre::Vector3(0, 0, 1), Ogre::Vector3(1, 1, 1)},
        {Ogre::Vector3(1, 1, 1), Ogre::Vector3(0, 0, 1), Ogre::Vector3(1, 0, 1)},
    },
    {
        {Ogre::Vector3(0, 1, 1), Ogre::Vector3(0, 1, 0), Ogre::Vector3(0, 0, 1)},
        {Ogre::Vector3(0, 0, 1), Ogre::Vector3(0, 1, 0), Ogre::Vector3(0, 0, 0)},
    },
    {
        {Ogre::Vector3(1, 0, 1), Ogre::Vector3(1, 0, 0), Ogre::Vector3(1, 1, 1)},
        {Ogre::Vector3(1, 1, 1), Ogre::Vector3(1, 0, 0), Ogre::Vector3(1, 1, 0)},
    },

};
const Ogre::Vector2 MainWindow::c_tex_coord[2][3] = {
    {Ogre::Vector2(0, 0), Ogre::Vector2(0, 1), Ogre::Vector2(1, 0)},
    {Ogre::Vector2(1, 0), Ogre::Vector2(0, 1), Ogre::Vector2(1, 1)},
};
const Int3D MainWindow::c_sub_chunk_mesh_size(16, 16, 16);
const Int3D MainWindow::c_chunk_size(16, 16, 128);

const float MainWindow::c_terrain_png_height = 256.0f;
const float MainWindow::c_terrain_png_width = 256.0f;
const float MainWindow::c_terrain_block_size = 16.0f;

const float MainWindow::c_decay_rate = 0.80f;
const float MainWindow::c_light_brightness[] = {
    0.0351843720888,
    0.043980465111,
    0.0549755813888,
    0.068719476736,
    0.08589934592,
    0.1073741824,
    0.134217728,
    0.16777216,
    0.2097152,
    0.262144,
    0.32768,
    0.4096,
    0.512,
    0.64,
    0.8,
    1.0
};

const float MainWindow::c_brightness_bias[] = {
    0.8f,
    0.8f,
    0.8f * 0.8f,
    1.0f,
    1.0f,
    1.0f,
};
const char * MainWindow::c_wool_texture_names[] = {
    "Wool",
    "OrangeWool",
    "MagentaWool",
    "LightBlueWool",
    "YellowWool",
    "LightGreenWool",
    "PinkWool",
    "GrayWool",
    "LightGrayWool",
    "CyanWool",
    "PurpleWool",
    "BlueWool",
    "BrownWool",
    "DarkGreenWool",
    "RedWool",
    "BlackWool",
};

uint qHash(const MainWindow::PhysicalInput & value)
{
    return value.id;
}

MainWindow::MainWindow(QUrl url) :
    m_root(NULL),
    m_camera(NULL),
    m_scene_manager(NULL),
    m_window(NULL),
    m_resources_config(Ogre::StringUtil::BLANK),
    m_camera_velocity(0, 0, 0),
    m_shut_down(false),
    m_free_look_mode(false),
    m_input_manager(NULL),
    m_mouse(NULL),
    m_keyboard(NULL),
    m_grab_mouse(false),
    m_game(NULL),
    m_control_to_key(Game::ControlCount),
    m_sub_chunk_generator(NULL)
{
    Q_ASSERT(sizeof(MainWindow) != 216 && sizeof(MainWindow) != 336);

    loadControls();

    m_air.see_through = true;
    m_air.partial_alpha = false;
    m_air.name = "Air";

    m_game = new Game(url);
    bool success;
    success = connect(m_game, SIGNAL(playerPositionUpdated()), this, SLOT(movePlayerPosition()));
    Q_ASSERT(success);
    success = connect(m_game, SIGNAL(playerHealthUpdated()), this, SLOT(handlePlayerHealthUpdated()));
    Q_ASSERT(success);
    success = connect(m_game, SIGNAL(playerDied()), this, SLOT(handlePlayerDied()));
    Q_ASSERT(success);

    m_sub_chunk_generator = new SubChunkMeshGenerator(this);
}

MainWindow::~MainWindow()
{
    // Remove ourself as a Window listener
    Ogre::WindowEventUtilities::removeWindowEventListener(m_window, this);
    windowClosed(m_window);
    delete m_root;
}

void MainWindow::loadControls()
{
    QDir dir(QCoreApplication::applicationDirPath());
    QSettings settings(dir.absoluteFilePath("mineflayer.ini"), QSettings::IniFormat);

    m_control_to_key[Game::Forward] = configKeyToPhysInput(settings.value("controls/forward", QString("key_%1").arg(QString::number(OIS::KC_W))).toString());
    m_control_to_key[Game::Back] = configKeyToPhysInput(settings.value("controls/back", QString("key_%1").arg(QString::number(OIS::KC_S))).toString());
    m_control_to_key[Game::Left] = configKeyToPhysInput(settings.value("controls/left", QString("key_%1").arg(QString::number(OIS::KC_A))).toString());
    m_control_to_key[Game::Right] = configKeyToPhysInput(settings.value("controls/right", QString("key_%1").arg(QString::number(OIS::KC_D))).toString());
    m_control_to_key[Game::Jump] = configKeyToPhysInput(settings.value("controls/jump", QString("key_%1").arg(QString::number(OIS::KC_SPACE))).toString());
    m_control_to_key[Game::Crouch] = configKeyToPhysInput(settings.value("controls/crouch", QString("mod_%1").arg(QString::number(OIS::Keyboard::Shift))).toString());
    m_control_to_key[Game::DiscardItem] = configKeyToPhysInput(settings.value("controls/discard_item", QString("key_%1").arg(QString::number(OIS::KC_Q))).toString());
    m_control_to_key[Game::Action1] = configKeyToPhysInput(settings.value("controls/action_1", QString("mouse_%1").arg(QString::number(OIS::MB_Left))).toString());
    m_control_to_key[Game::Action2] = configKeyToPhysInput(settings.value("controls/action_2", QString("mouse_%1").arg(QString::number(OIS::MB_Right))).toString());
    m_control_to_key[Game::Inventory] = configKeyToPhysInput(settings.value("controls/inventory", QString("key_%1").arg(QString::number(OIS::KC_I))).toString());
    m_control_to_key[Game::Chat] = configKeyToPhysInput(settings.value("controls/chat", QString("key_%1").arg(QString::number(OIS::KC_T))).toString());

    for (int i = 0; i < m_control_to_key.size(); i++)
        m_key_to_control.insert(m_control_to_key[i], (Game::Control) i);
}

MainWindow::PhysicalInput MainWindow::configKeyToPhysInput(QString config_value)
{
    PhysicalInput value;
    config_value = config_value.toLower();
    QStringList parts = config_value.split("_");
    Q_ASSERT(parts.size() == 2);
    if (parts.at(0) == "key")
        value.location = KeyboardKey;
    else if (parts.at(0) == "mod")
        value.location = KeyboardModifier;
    else if (parts.at(0) == "mouse")
        value.location = Mouse;
    else
        Q_ASSERT(false);

    value.id = parts.at(1).toInt();
    return value;
}

bool MainWindow::configure()
{
    if (! m_root->restoreConfig()) {
        if (! m_root->showConfigDialog())
            return false;
    }
    m_window = m_root->initialise(true, "Mine Flayer");
    if (! m_window)
        return false;

    return true;
}

void MainWindow::createCamera()
{
    // Create the camera
    m_camera = m_scene_manager->createCamera("PlayerCam");

    // sit and look somewhere while we wait for our real orientation
    m_camera->setPosition(Ogre::Vector3(0,0,0));
    m_camera->lookAt(Ogre::Vector3(1,1,0));
    m_camera->roll(Ogre::Degree(-90));
    m_camera->setNearClipDistance(0.1);
}

void MainWindow::createFrameListener()
{
    Ogre::LogManager::getSingletonPtr()->logMessage("*** Initializing OIS ***");
    OIS::ParamList pl;
    size_t windowHnd = 0;
    std::ostringstream windowHndStr;

    m_window->getCustomAttribute("WINDOW", &windowHnd);
    windowHndStr << windowHnd;
    pl.insert(std::make_pair(std::string("WINDOW"), windowHndStr.str()));
#if defined(OIS_WIN32_PLATFORM)
    pl.insert(std::make_pair(std::string("w32_mouse"), std::string("DISCL_FOREGROUND" )));
    pl.insert(std::make_pair(std::string("w32_mouse"), std::string("DISCL_NONEXCLUSIVE")));
    pl.insert(std::make_pair(std::string("w32_keyboard"), std::string("DISCL_FOREGROUND")));
    pl.insert(std::make_pair(std::string("w32_keyboard"), std::string("DISCL_NONEXCLUSIVE")));
#elif defined(OIS_LINUX_PLATFORM)
    pl.insert(std::make_pair(std::string("x11_mouse_grab"), std::string("false")));
    pl.insert(std::make_pair(std::string("x11_keyboard_grab"), std::string("false")));
#endif

    m_input_manager = OIS::InputManager::createInputSystem( pl );

    m_keyboard = static_cast<OIS::Keyboard*>(m_input_manager->createInputObject( OIS::OISKeyboard, true ));
    m_mouse = static_cast<OIS::Mouse*>(m_input_manager->createInputObject( OIS::OISMouse, true ));

    m_mouse->setEventCallback(this);
    m_keyboard->setEventCallback(this);

    // Set initial mouse clipping size
    windowResized(m_window);

    // Register as a Window listener
    Ogre::WindowEventUtilities::addWindowEventListener(m_window, this);

    m_root->addFrameListener(this);


    grabMouse();
}

void MainWindow::createViewports()
{
    // Create one viewport, entire window
    Ogre::Viewport* vp = m_window->addViewport(m_camera);
    vp->setBackgroundColour(Ogre::ColourValue(0,0,0));

    // Alter the camera aspect ratio to match the viewport
    m_camera->setAspectRatio(
        Ogre::Real(vp->getActualWidth()) / Ogre::Real(vp->getActualHeight()));
}

void MainWindow::setupResources()
{
    Ogre::ResourceGroupManager * mgr = Ogre::ResourceGroupManager::getSingletonPtr();
    mgr->addResourceLocation("resources", "FileSystem", Ogre::ResourceGroupManager::DEFAULT_RESOURCE_GROUP_NAME, true);
}

void MainWindow::loadResources()
{
    Ogre::ResourceGroupManager::getSingleton().initialiseAllResourceGroups();

    // create the terrain material
    {
        Ogre::MaterialPtr material = Ogre::MaterialManager::getSingleton().create("TerrainOpaque", Ogre::ResourceGroupManager::DEFAULT_RESOURCE_GROUP_NAME);
        Ogre::Technique* first_technique = material->getTechnique(0);
        Ogre::Pass* first_pass = first_technique->getPass(0);
        first_pass->setAlphaRejectFunction(Ogre::CMPF_GREATER_EQUAL);
        first_pass->setAlphaRejectValue(128);
        first_pass->setDepthWriteEnabled(true);
        first_pass->setDepthCheckEnabled(true);
        first_pass->setColourWriteEnabled(true);
        first_pass->setVertexColourTracking(Ogre::TVC_AMBIENT);
        Ogre::TextureUnitState* texture_unit = first_pass->createTextureUnitState();
        texture_unit->setTextureName("terrain.png");
        texture_unit->setTextureCoordSet(0);
        texture_unit->setTextureFiltering(Ogre::TFO_NONE);
        texture_unit->setColourOperation(Ogre::LBO_MODULATE);
    }

    {
        Ogre::MaterialPtr material = Ogre::MaterialManager::getSingleton().create("TerrainTransparent", Ogre::ResourceGroupManager::DEFAULT_RESOURCE_GROUP_NAME);
        Ogre::Technique* first_technique = material->getTechnique(0);
        Ogre::Pass* first_pass = first_technique->getPass(0);
        first_pass->setDepthWriteEnabled(false);
        first_pass->setDepthCheckEnabled(true);
        first_pass->setColourWriteEnabled(true);
        first_pass->setVertexColourTracking(Ogre::TVC_AMBIENT);
        first_pass->setSceneBlending(Ogre::SBT_TRANSPARENT_ALPHA);
        Ogre::TextureUnitState* texture_unit = first_pass->createTextureUnitState();
        texture_unit->setTextureName("terrain.png");
        texture_unit->setTextureCoordSet(0);
        texture_unit->setTextureFiltering(Ogre::TFO_NONE);
        texture_unit->setColourOperation(Ogre::LBO_MODULATE);
    }

    {
        // grab all the textures from resources
        QFile texture_index_file(":/textures/textures.txt");
        texture_index_file.open(QFile::ReadOnly);
        QTextStream stream(&texture_index_file);
        while (! stream.atEnd()) {
            QString line = stream.readLine().trimmed();
            if (line.isEmpty() || line.startsWith("#"))
                continue;
            QStringList parts = line.split(QRegExp("\\s+"), QString::SkipEmptyParts);
            Q_ASSERT(parts.size() == 5);
            BlockTextureCoord texture_data;
            QString name = parts.at(0);
            texture_data.x = parts.at(1).toInt();
            texture_data.y = parts.at(2).toInt();
            texture_data.w = parts.at(3).toInt();
            texture_data.h = parts.at(4).toInt();
            m_terrain_tex_coords.insert(name, texture_data);
        }
        texture_index_file.close();
    }

    {
        // grab all the solid block data from resources
        QFile blocks_file(":/textures/blocks.txt");
        blocks_file.open(QFile::ReadOnly);
        QTextStream stream(&blocks_file);
        while(! stream.atEnd()) {
            QString line = stream.readLine().trimmed();
            if (line.isEmpty() || line.startsWith("#"))
                continue;
            QStringList parts = line.split(QRegExp("\\s+"), QString::SkipEmptyParts);
            Q_ASSERT(parts.size() == 17);
            BlockData block_data;
            block_data.side_textures.resize(6);
            block_data.squish_amount.resize(6);
            int index = 0;
            Block::ItemType id = (Block::ItemType) parts.at(index++).toInt();
            block_data.name = parts.at(index++);
            for (int i = 0; i < 6; i++) {
                QString texture = parts.at(index++);
                if (texture != "-")
                    block_data.side_textures.replace(i, texture);
            }
            block_data.see_through = (bool)parts.at(index++).toInt();
            block_data.partial_alpha = (bool)parts.at(index++).toInt();
            for (int i = 0; i < 6; i++) {
                Int3D squish = c_side_offset[i] * parts.at(index++).toInt();
                block_data.squish_amount.replace(i, Ogre::Vector3(squish.x, squish.y, squish.z)/c_terrain_block_size);
            }
            block_data.rotate = (bool)parts.at(index++).toInt();
            m_block_data.insert(id, block_data);
        }
        blocks_file.close();
    }
}

int MainWindow::exec()
{
    m_resources_config = "resources.cfg";

    if (!setup())
        return -1;

    m_root->startRendering();

    return 0;
}

bool MainWindow::setup()
{
    // suppress debug output on stdout
    Ogre::LogManager * logManager = new Ogre::LogManager();
    logManager->setLogDetail(Ogre::LL_LOW);
    logManager->createLog("ogre.log", true, false, false);

    m_root = new Ogre::Root("resources/plugins.cfg");

    setupResources();

    bool carryOn = configure();
    if (!carryOn) return false;

    // Get the SceneManager, in this case a generic one
    m_scene_manager = m_root->createSceneManager(Ogre::ST_EXTERIOR_FAR);

    createCamera();
    createViewports();

    // Set default mipmap level (NB some APIs ignore this)
    Ogre::TextureManager::getSingleton().setDefaultNumMipmaps(5);

    // Load resources
    loadResources();

    // create the scene
    m_scene_manager->setAmbientLight(Ogre::ColourValue(1.0f, 1.0f, 1.0f));
    Ogre::SceneNode * node = m_scene_manager->getRootSceneNode();
    m_pass[0] = node->createChildSceneNode();
    m_pass[1] = node->createChildSceneNode();

    createFrameListener();

    return true;
};

bool MainWindow::frameRenderingQueued(const Ogre::FrameEvent& evt)
{
    if (m_window->isClosed() || m_shut_down)
        return false;

    // add the newly generated chunks to the scene
    QCoreApplication::processEvents();
    while (m_sub_chunk_generator->availableNewSubChunk()) {
        SubChunkMeshGenerator::ReadySubChunk ready_chunk = m_sub_chunk_generator->nextNewSubChunk();
        m_ogre_mutex.lock();
        ready_chunk.obj->end();
        m_ogre_mutex.unlock();
        Ogre::SceneNode * chunk_node = ready_chunk.node->createChildSceneNode();
        chunk_node->attachObject(ready_chunk.obj);
        // save the scene node so we can delete it later
        SubChunkData chunk_data = m_sub_chunks.value(ready_chunk.sub_chunk_key);
        if (! chunk_data.is_null) {
            chunk_data.node[ready_chunk.pass] = chunk_node;
            m_sub_chunks.insert(ready_chunk.sub_chunk_key, chunk_data);
        }
    }
    while (m_sub_chunk_generator->availableDoneSubChunk()) {
        SubChunkMeshGenerator::ReadySubChunk done_chunk = m_sub_chunk_generator->nextDoneSubChunk();
        if (done_chunk.node != NULL) {
            done_chunk.node->removeAndDestroyAllChildren();
            m_scene_manager->destroySceneNode(done_chunk.node);
        }
    }

    // Need to capture/update each device
    m_keyboard->capture();
    m_mouse->capture();
    if (m_grab_mouse) {
        QPoint mouse_pos = QCursor::pos();
        int window_left, window_top;
        unsigned int window_width, window_height, trash;
        m_window->getMetrics(window_width, window_height, trash, window_left, window_top);
        QPoint center(window_left + window_width / 2, window_top + window_height / 2);
        QPoint delta = center - mouse_pos;
        if (delta.manhattanLength() != 0) {
            QCursor::setPos(center);

            // move camera
            Ogre::Degree delta_yaw = Ogre::Degree(delta.x() * 0.25f);
            Ogre::Degree delta_pitch = Ogre::Degree(delta.y() * 0.25f);
            if (m_free_look_mode) {
                // update camera directly
                m_camera->rotate(Ogre::Vector3::UNIT_Z, delta_yaw);
                m_camera->pitch(delta_pitch);
            } else {
                // update the camera indirectly by updating the player's look
                m_game->updatePlayerLook(delta_yaw.valueRadians(), delta_pitch.valueRadians());
            }
        }
    }
    // compute next frame
    m_game->doPhysics(evt.timeSinceLastFrame);

    // update the camera
    if (m_free_look_mode) {
        bool forward = controlPressed(Game::Forward);
        bool backward = controlPressed(Game::Back);
        bool left = controlPressed(Game::Left);
        bool right = controlPressed(Game::Right);

        // update the camera
        bool crouch = controlPressed(Game::Crouch);

        Ogre::Vector3 accel = Ogre::Vector3::ZERO;
        if (forward) accel += m_camera->getDirection();
        if (backward) accel -= m_camera->getDirection();
        if (left) accel -= m_camera->getRight();
        if (right) accel += m_camera->getRight();

        float top_speed = 20;
        if (crouch)
            top_speed *= 20;

        if (accel.squaredLength() != 0) {
            accel.normalise();
            m_camera_velocity += accel * top_speed * evt.timeSinceLastFrame * 10;
        } else {
            m_camera_velocity -= m_camera_velocity * evt.timeSinceLastFrame * 10;
        }

        float too_small = std::numeric_limits<float>::epsilon();

        if (m_camera_velocity.squaredLength() > top_speed * top_speed) {
            m_camera_velocity.normalise();
            m_camera_velocity *= top_speed;
        } else if (m_camera_velocity.squaredLength() < too_small * too_small) {
            m_camera_velocity = Ogre::Vector3::ZERO;
        }
        if (m_camera_velocity != Ogre::Vector3::ZERO)
            m_camera->move(m_camera_velocity * evt.timeSinceLastFrame);
    } else {
        bool crouch = controlPressed(Game::Crouch);
        m_game->setMaxGroundSpeed(Game::c_standard_max_ground_speed * (crouch ? 10 : 1));
    }
    return true;
}

bool MainWindow::keyPressed(const OIS::KeyEvent &arg )
{
    m_keyboard->capture();
    if (m_keyboard->isModifierDown(OIS::Keyboard::Alt))
        m_grab_mouse = false;
    if (arg.key == OIS::KC_ESCAPE || (m_keyboard->isModifierDown(OIS::Keyboard::Alt) && arg.key == OIS::KC_F4))
        m_sub_chunk_generator->shutDown();
    else if (arg.key == OIS::KC_F2)
        m_free_look_mode = !m_free_look_mode;

    activateInput(arg.key, true);
    return true;
}

bool MainWindow::keyReleased(const OIS::KeyEvent &arg )
{
    activateInput(arg.key, false);
    return true;
}

bool MainWindow::mousePressed(const OIS::MouseEvent &, OIS::MouseButtonID id )
{
    grabMouse();
    activateInput(id, true);
    return true;
}

bool MainWindow::mouseReleased(const OIS::MouseEvent &, OIS::MouseButtonID id )
{
    activateInput(id, false);
    return true;
}

bool MainWindow::mouseMoved(const OIS::MouseEvent &)
{
    return true;
}

void MainWindow::grabMouse()
{
    m_grab_mouse = true;
    // center mouse cursor

    int window_left, window_top;
    unsigned int window_width, window_height, trash;
    m_window->getMetrics(window_width, window_height, trash, window_left, window_top);
    QPoint center(window_left + window_width / 2, window_top + window_height / 2);
    QCursor::setPos(center);
}

bool MainWindow::controlPressed(Game::Control control)
{
    PhysicalInput input = m_control_to_key.value(control);
    switch (input.location) {
    case Mouse:
        return m_mouse->getMouseState().buttonDown((OIS::MouseButtonID)input.id);
    case KeyboardKey:
        return m_keyboard->isKeyDown((OIS::KeyCode)input.id);
    case KeyboardModifier:
        return m_keyboard->isModifierDown((OIS::Keyboard::Modifier)input.id);
    }
    Q_ASSERT(false);
    return false;
}

void MainWindow::activateInput(PhysicalInput input, bool activated)
{
    m_game->setControlActivated(m_key_to_control.value(input, Game::NoControl), activated);
}

void MainWindow::windowResized(Ogre::RenderWindow* rw)
{
    // Adjust mouse clipping area
    unsigned int width, height, depth;
    int left, top;
    rw->getMetrics(width, height, depth, left, top);

    const OIS::MouseState &ms = m_mouse->getMouseState();
    ms.width = width;
    ms.height = height;
}

void MainWindow::windowClosed(Ogre::RenderWindow* rw)
{
    // Unattach OIS before window shutdown (very important under Linux)
    // Only close for window that created OIS (the main window)
    if (rw == m_window && m_input_manager) {
        m_input_manager->destroyInputObject(m_mouse);
        m_input_manager->destroyInputObject(m_keyboard);

        OIS::InputManager::destroyInputSystem(m_input_manager);
        m_input_manager = NULL;
    }
}

SubChunkMeshGenerator::SubChunkMeshGenerator(MainWindow * owner) :
    QObject(NULL),
    m_owner(owner)
{
    // run in our own thread
    m_thread = new QThread(this);
    m_thread->start();
    this->moveToThread(m_thread);

    bool success;
    success = QMetaObject::invokeMethod(this, "initialize", Qt::QueuedConnection);
    Q_ASSERT(success);
}

void SubChunkMeshGenerator::initialize()
{
    bool success;
    success = connect(m_owner->m_game, SIGNAL(chunkUpdated(Int3D,Int3D)), this, SLOT(handleUpdatedChunk(Int3D,Int3D)));
    Q_ASSERT(success);
    success = connect(m_owner->m_game, SIGNAL(unloadChunk(Int3D)), this, SLOT(queueDeleteSubChunkMesh(Int3D)));
    Q_ASSERT(success);
    m_owner->m_game->start();
}

void SubChunkMeshGenerator::shutDown()
{
    m_thread->exit();
    m_thread->wait();
    m_owner->m_shut_down = true;
}

void SubChunkMeshGenerator::handleUpdatedChunk(const Int3D &start, const Int3D &size)
{
    Q_ASSERT(QThread::currentThread() == m_thread);

    // update every sub chunk that the updated region touches
    Int3D min = m_owner->subChunkKey(start);
    Int3D max = m_owner->subChunkKey(start+size);
    Int3D it;
    for (it.x = min.x; it.x < max.x; it.x+=MainWindow::c_sub_chunk_mesh_size.x) {
        for (it.y = min.y; it.y < max.y; it.y+=MainWindow::c_sub_chunk_mesh_size.y) {
            for (it.z = min.z; it.z < max.z; it.z+=MainWindow::c_sub_chunk_mesh_size.z) {
                generateSubChunkMesh(it);
            }
        }
    }
}

void SubChunkMeshGenerator::generateSubChunkMesh(const Int3D & sub_chunk_key)
{
    Q_ASSERT(QThread::currentThread() == m_thread);

    MainWindow::SubChunkData chunk_data = m_owner->m_sub_chunks.value(sub_chunk_key);
    bool replace_chunk = true;
    if (chunk_data.is_null) {
        // initialize chunk data
        replace_chunk = false;
        chunk_data.is_null = false;
        chunk_data.position = sub_chunk_key;
        for (int i = 0; i < 2; i++) {
            chunk_data.obj[i] = NULL;
            chunk_data.node[i] = NULL;
        }
        m_owner->m_sub_chunks.insert(sub_chunk_key, chunk_data);

    }

    ReadySubChunk done_chunks[2];

    Int3D offset;
    for (int pass = 0; pass < 2; pass++) {
        done_chunks[pass] = ReadySubChunk(pass, chunk_data.obj[pass], chunk_data.node[pass], sub_chunk_key);

        m_owner->m_ogre_mutex.lock();
        Ogre::ManualObject * obj = new Ogre::ManualObject(Ogre::String());
        obj->begin(pass == 0 ? "TerrainOpaque" : "TerrainTransparent", Ogre::RenderOperation::OT_TRIANGLE_LIST);
        m_owner->m_ogre_mutex.unlock();
        Int3D absolute_position;
        for (offset.x = 0, absolute_position.x = chunk_data.position.x; offset.x < MainWindow::c_sub_chunk_mesh_size.x; offset.x++, absolute_position.x++) {
            for (offset.y = 0, absolute_position.y = chunk_data.position.y; offset.y < MainWindow::c_sub_chunk_mesh_size.y; offset.y++, absolute_position.y++) {
                for (offset.z = 0, absolute_position.z = chunk_data.position.z; offset.z < MainWindow::c_sub_chunk_mesh_size.z; offset.z++, absolute_position.z++) {
                    Block block = m_owner->m_game->blockAt(absolute_position);

                    MainWindow::BlockData block_data = m_owner->m_block_data.value(block.type(), m_owner->m_air);

                    // skip air
                    if (block_data.side_textures.isEmpty())
                        continue;

                    // first pass, skip partially transparent stuff
                    if (pass == 0 && block_data.partial_alpha)
                        continue;

                    // second pass, only do partially transparent stuff
                    if (pass == 1 && !block_data.partial_alpha)
                        continue;

                    // for every side
                    for (int side_index = 0; side_index < 6; side_index++) {
                        if (block_data.side_textures.at(side_index).isEmpty())
                            continue;

                        // if the block on this side is opaque or the same block, skip
                        Block neighbor_block = m_owner->m_game->blockAt(absolute_position + MainWindow::c_side_offset[side_index]);
                        Block::ItemType side_type = neighbor_block.type();
                        if ((side_type == block.type() && (block_data.partial_alpha || side_type == Block::Glass)) ||
                            ! m_owner->m_block_data.value(side_type, m_owner->m_air).see_through)
                        {
                            continue;
                        }


                        // add this side to mesh
                        Ogre::Vector3 abs_block_loc(absolute_position.x, absolute_position.y, absolute_position.z);

                        // special cases for textures
                        QString texture_name = block_data.side_textures.at(side_index);
                        switch (block.type()) {
                            case Block::Wood:
                            if (side_index != MainWindow::NegativeZ && side_index != MainWindow::PositiveZ) {
                                switch (block.woodMetadata()) {
                                case Block::NormalTrunkTexture:
                                    texture_name = "WoodSide";
                                    break;
                                case Block::RedwoodTrunkTexture:
                                    texture_name = "RedwoodTrunkSide";
                                    break;
                                case Block::BirchTrunkTexture:
                                    texture_name = "BirchTrunkSide";
                                    break;
                                }
                            }
                            break;
                            case Block::Leaves:
                            {
                                switch (block.leavesMetadata()) {
                                case Block::NormalLeavesTexture:
                                    texture_name = "LeavesRegular";
                                    break;
                                case Block::RedwoodLeavesTexture:
                                    texture_name = "RedwoodLeaves";
                                    break;
                                case Block::BirchLeavesTexture:
                                    texture_name = "BirchLeaves";
                                    break;
                                }
                            }
                            break;
                            case Block::Farmland:
                            if (side_index == MainWindow::PositiveZ)
                                texture_name = block.farmlandMetadata() == 0 ? "FarmlandDry" : "FarmlandWet";
                            break;
                            case Block::Crops:
                            texture_name = QString("Crops") + QString::number(block.cropsMetadata());
                            break;
                            case Block::Wool:
                            texture_name = MainWindow::c_wool_texture_names[block.woolMetadata()];
                            break;
                            case Block::Furnace:
                            case Block::BurningFurnace:
                            case Block::Dispenser:
                            {
                                if (side_index != MainWindow::NegativeZ && side_index != MainWindow::PositiveZ) {
                                    if ((block.furnaceMetadata() == Block::EastFacingFurnace && side_index == MainWindow::PositiveX) ||
                                        (block.furnaceMetadata() == Block::WestFacingFurnace && side_index == MainWindow::NegativeX) ||
                                        (block.furnaceMetadata() == Block::NorthFacingFurnace && side_index == MainWindow::PositiveY) ||
                                        (block.furnaceMetadata() == Block::SouthFacingFurnace && side_index == MainWindow::NegativeY))
                                    {
                                        texture_name = block_data.side_textures.value(MainWindow::NegativeY);
                                    } else {
                                        texture_name = "FurnaceBack";
                                    }
                                }
                            }
                            break;
                            case Block::Pumpkin:
                            case Block::JackOLantern:
                            {
                                if (side_index != MainWindow::NegativeZ && side_index != MainWindow::PositiveZ) {
                                    if ((block.pumpkinMetadata() == Block::EastFacingPumpkin && side_index == MainWindow::PositiveX) ||
                                        (block.pumpkinMetadata() == Block::WestFacingPumpkin && side_index == MainWindow::NegativeX) ||
                                        (block.pumpkinMetadata() == Block::NorthFacingPumpkin && side_index == MainWindow::PositiveY) ||
                                        (block.pumpkinMetadata() == Block::SouthFacingPumpkin && side_index == MainWindow::NegativeY))
                                    {
                                        texture_name = block_data.side_textures.value(MainWindow::NegativeY);
                                    } else {
                                        texture_name = "PumpkinBack";
                                    }
                                }
                            }
                            break;
                            case Block::RedstoneWire_placed:
                            {
                                if (block.redstoneMetadata() == 0) {
                                    texture_name = "RedWire4wayOff";
                                } else {
                                    texture_name = "RedWire4wayOn";
                                }
                            }
                            break;
                            default:;
                        }
                        MainWindow::BlockTextureCoord btc = m_owner->m_terrain_tex_coords.value(texture_name);

                        Ogre::Vector3 squish = block_data.squish_amount.at(side_index);

                        float brightness;
                        int night_darkness = 0;
                        brightness = MainWindow::c_light_brightness[qMax(neighbor_block.skyLight() - night_darkness, neighbor_block.light())];

                        Ogre::ColourValue color = Ogre::ColourValue::White;
                        if (block.type() == Block::Grass && side_index == MainWindow::PositiveZ)
                            color.setAsRGBA(0x8DD55EFF);
                        else if (block.type() == Block::Leaves)
                            color.setAsRGBA(0x8DD55EFF);

                        color *= brightness;
                        color *= MainWindow::c_brightness_bias[side_index];

                        for (int triangle_index = 0; triangle_index < 2; triangle_index++) {
                            for (int point_index = 0; point_index < 3; point_index++) {
                                Ogre::Vector3 pos = MainWindow::c_side_coord[side_index][triangle_index][point_index] - squish;
                                if (block_data.rotate) {
                                    pos -= 0.5f;
                                    pos = Ogre::Quaternion(Ogre::Degree(45), Ogre::Vector3::UNIT_Z) * pos;
                                    pos += 0.5f;
                                }
                                obj->position(pos + abs_block_loc);

                                Ogre::Vector2 tex_coord = MainWindow::c_tex_coord[triangle_index][point_index];
                                obj->textureCoord((btc.x+tex_coord.x*btc.w) / MainWindow::c_terrain_png_width, (btc.y+tex_coord.y*btc.h) / MainWindow::c_terrain_png_height);

                                obj->colour(color);
                            }
                        }
                    }
                }
            }
        }
        m_queue_mutex.lock();
        m_new_sub_chunk_queue.enqueue(ReadySubChunk(pass, obj, m_owner->m_pass[pass], sub_chunk_key));


        chunk_data = m_owner->m_sub_chunks.value(sub_chunk_key);
        // chunk_data.node[pass] is set in frameRenderingQueued by the other thread after it creates it.
        chunk_data.node[pass] = NULL;
        chunk_data.obj[pass] = obj;
        m_owner->m_sub_chunks.insert(sub_chunk_key, chunk_data);
        m_queue_mutex.unlock();
    }

    for (int pass = 0; pass < 2; pass++) {
        // put delete old stuff on queue
        if (replace_chunk) {
            m_queue_mutex.lock();
            m_done_sub_chunk_queue.enqueue(done_chunks[pass]);
            m_queue_mutex.unlock();
        }
    }
}

void SubChunkMeshGenerator::queueDeleteSubChunkMesh(const Int3D &coord)
{
    Q_ASSERT(QThread::currentThread() == m_thread);

    // queue for deletion every sub chunk within the chunk.
    Int3D min = m_owner->subChunkKey(coord);
    Int3D max = m_owner->subChunkKey(coord+MainWindow::c_chunk_size);
    Int3D it;
    m_queue_mutex.lock();
    for (it.x = min.x; it.x < max.x; it.x+=MainWindow::c_sub_chunk_mesh_size.x) {
        for (it.y = min.y; it.y < max.y; it.y+=MainWindow::c_sub_chunk_mesh_size.y) {
            for (it.z = min.z; it.z < max.z; it.z+=MainWindow::c_sub_chunk_mesh_size.z) {
                MainWindow::SubChunkData chunk_data = m_owner->m_sub_chunks.value(it);
                if (chunk_data.is_null)
                    continue;
                for (int i = 0; i < 2; i++)
                    m_done_sub_chunk_queue.enqueue(ReadySubChunk(i, chunk_data.obj[i], chunk_data.node[i], it));
                m_owner->m_sub_chunks.remove(it);
            }
        }
    }
    m_queue_mutex.unlock();
}

Int3D MainWindow::subChunkKey(const Int3D & coord)
{
    return coord - (coord % c_sub_chunk_mesh_size);
}

void MainWindow::movePlayerPosition()
{
    if (m_free_look_mode)
        return;
    Server::EntityPosition position = m_game->playerPosition();

    Ogre::Vector3 cameraPosition(position.x, position.y, position.z + position.height);
    m_camera->setPosition(cameraPosition);

    // look due east
    m_camera->lookAt(cameraPosition + Ogre::Vector3::UNIT_X);
    m_camera->roll(Ogre::Degree(-90));
    // then rotate to where we're looking
    m_camera->rotate(Ogre::Vector3::UNIT_Z, Ogre::Radian(position.yaw));
    m_camera->rotate(m_camera->getRight(), Ogre::Radian(position.pitch));
}

void MainWindow::handlePlayerHealthUpdated()
{
    qDebug() << "health: " << m_game->playerHealth();
}
void MainWindow::handlePlayerDied()
{
    // TODO: ask the user first
    m_game->respawn();
}
