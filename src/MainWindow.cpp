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
const Int3D MainWindow::c_chunk_size(16, 16, 128);

const float MainWindow::c_terrain_png_height = 256.0f;
const float MainWindow::c_terrain_png_width = 256.0f;
const float MainWindow::c_terrain_block_size = 16.0f;

uint qHash(const MainWindow::PhysicalInput & value)
{
    return value.id;
}

MainWindow::MainWindow() :
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
    m_game(NULL),
    m_control_to_key(Game::ControlCount)
{
    loadControls();

    Q_ASSERT(sizeof(MainWindow) != 216 && sizeof(MainWindow) != 336);

    m_air.see_through = true;
    m_air.partial_alpha = false;
    m_air.name = "Air";

    QUrl connection_settings;
    connection_settings.setHost("localhost");
    connection_settings.setPort(25565);
    connection_settings.setUserName("superbot");
    m_game = new Game(connection_settings);
    bool success;
    success = connect(m_game, SIGNAL(chunkUpdated(Int3D,Int3D)), this, SLOT(handleChunkUpdated(Int3D,Int3D)));
    Q_ASSERT(success);
    success = connect(m_game, SIGNAL(playerPositionUpdated(Server::EntityPosition)), this, SLOT(movePlayerPosition(Server::EntityPosition)));
    Q_ASSERT(success);
    m_game->start();
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
#ifdef OIS_LINUX_PLATFORM
    //pl.insert(std::make_pair(std::string("x11_mouse_grab"), std::string("false")));
    //pl.insert(std::make_pair(std::string("x11_keyboard_grab"), std::string("false")));
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
        Ogre::TextureUnitState* texture_unit = first_pass->createTextureUnitState();
        texture_unit->setTextureName("terrain.png");
        texture_unit->setTextureCoordSet(0);
        texture_unit->setTextureFiltering(Ogre::TFO_NONE);
    }

    {
        Ogre::MaterialPtr material = Ogre::MaterialManager::getSingleton().create("TerrainTransparent", Ogre::ResourceGroupManager::DEFAULT_RESOURCE_GROUP_NAME);
        Ogre::Technique* first_technique = material->getTechnique(0);
        Ogre::Pass* first_pass = first_technique->getPass(0);
        first_pass->setDepthWriteEnabled(false);
        first_pass->setDepthCheckEnabled(true);
        first_pass->setSceneBlending(Ogre::SBT_TRANSPARENT_ALPHA);
        Ogre::TextureUnitState* texture_unit = first_pass->createTextureUnitState();
        texture_unit->setTextureName("terrain.png");
        texture_unit->setTextureCoordSet(0);
        texture_unit->setTextureFiltering(Ogre::TFO_NONE);
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
    Ogre::LogManager * logManager = new Ogre::LogManager;
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
    if (m_window->isClosed())
        return false;

    if (m_shut_down)
        return false;

    // Need to capture/update each device
    m_keyboard->capture();
    m_mouse->capture();
    QCoreApplication::processEvents();

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
    }
    return true;
}

bool MainWindow::keyPressed(const OIS::KeyEvent &arg )
{
    if (arg.key == OIS::KC_ESCAPE || (m_keyboard->isModifierDown(OIS::Keyboard::Alt) && arg.key == OIS::KC_F4))
        m_shut_down = true;
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

bool MainWindow::mouseMoved(const OIS::MouseEvent &arg )
{
    // move camera
    Ogre::Degree delta_yaw = Ogre::Degree(-arg.state.X.rel * 0.25f);
    Ogre::Degree delta_pitch = Ogre::Degree(-arg.state.Y.rel * 0.25f);
    if (m_free_look_mode) {
        // update camera directly
        m_camera->rotate(Ogre::Vector3::UNIT_Z, delta_yaw);
        m_camera->pitch(delta_pitch);
    } else {
        // update the camera indirectly by updating the player's look
        m_game->updatePlayerLook(delta_yaw.valueRadians(), delta_pitch.valueRadians());
    }
    return true;
}

bool MainWindow::mousePressed(const OIS::MouseEvent &, OIS::MouseButtonID id )
{
    activateInput(id, true);
    return true;
}

bool MainWindow::mouseReleased(const OIS::MouseEvent &, OIS::MouseButtonID id )
{
    activateInput(id, false);
    return true;
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

void MainWindow::handleChunkUpdated(Int3D start, Int3D size)
{
    // build a mesh for the chunk
    // find the chunk coordinates for this updated stuff.
    Int3D chunk_key = chunkKey(start);
    // make sure it fits in one chunk
    Q_ASSERT(chunkKey(start + size - Int3D(1,1,1)) == chunk_key);
    ChunkData chunk_data = getChunk(chunk_key);
    generateChunkMesh(chunk_data);
}

void MainWindow::generateChunkMesh(ChunkData & chunk_data)
{
    // delete old stuff
    if (chunk_data.manual_object)
        m_scene_manager->destroyManualObject(chunk_data.manual_object);
    if (chunk_data.node)
        m_scene_manager->destroySceneNode(chunk_data.node);

    Int3D offset;
    Int3D size = c_chunk_size;
    for (int pass = 0; pass < 2; pass++) {
        Ogre::ManualObject * obj = new Ogre::ManualObject(Ogre::String());
        obj->begin(pass == 0 ? "TerrainOpaque" : "TerrainTransparent", Ogre::RenderOperation::OT_TRIANGLE_LIST);
        Int3D absolute_position;
        for (offset.x = 0, absolute_position.x = chunk_data.position.x; offset.x < size.x; offset.x++, absolute_position.x++) {
            for (offset.y = 0, absolute_position.y = chunk_data.position.y; offset.y < size.y; offset.y++, absolute_position.y++) {
                for (offset.z = 0, absolute_position.z = chunk_data.position.z; offset.z < size.z; offset.z++, absolute_position.z++) {
                    Block block = m_game->blockAt(absolute_position);

                    BlockData block_data = m_block_data.value(block.type(), m_air);

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
                        Block::ItemType side_type = m_game->blockAt(absolute_position + c_side_offset[side_index]).type();
                        if (side_type == block.type() || ! m_block_data.value(side_type, m_air).see_through)
                            continue;

                        // add this side to mesh
                        Ogre::Vector3 abs_block_loc(absolute_position.x, absolute_position.y, absolute_position.z);
                        QString texture_name = block_data.side_textures.at(side_index);
                        BlockTextureCoord btc = m_terrain_tex_coords.value(texture_name);
                        Ogre::Vector3 squish = block_data.squish_amount.at(side_index);

                        for (int triangle_index = 0; triangle_index < 2; triangle_index++) {
                            for (int point_index = 0; point_index < 3; point_index++) {
                                Ogre::Vector3 pos = c_side_coord[side_index][triangle_index][point_index] - squish;
                                if (block_data.rotate) {
                                    pos -= 0.5f;
                                    pos = Ogre::Quaternion(Ogre::Degree(45), Ogre::Vector3::UNIT_Z) * pos;
                                    pos += 0.5f;
                                }
                                obj->position(pos + abs_block_loc);

                                Ogre::Vector2 tex_coord = c_tex_coord[triangle_index][point_index];
                                obj->textureCoord((btc.x+tex_coord.x*btc.w) / c_terrain_png_width, (btc.y+tex_coord.y*btc.h) / c_terrain_png_height);
                            }
                        }
                    }
                }
            }
        }
        obj->end();
        Ogre::SceneNode * chunk_node = m_pass[pass]->createChildSceneNode();
        chunk_node->attachObject(obj);

        chunk_data.node = chunk_node;
        chunk_data.manual_object = obj;
    }
}

Int3D MainWindow::chunkKey(const Int3D & coord)
{
    return coord - (coord % c_chunk_size);
}

MainWindow::ChunkData MainWindow::getChunk(const Int3D & key)
{
    ChunkData default_chunk_data;
    default_chunk_data.node = NULL;
    ChunkData chunk_data = m_chunks.value(key, default_chunk_data);
    if (chunk_data.node != NULL)
        return chunk_data;
    chunk_data.position = key;
    chunk_data.manual_object = NULL;
    m_chunks.insert(key, chunk_data);
    return chunk_data;
}

void MainWindow::movePlayerPosition(Server::EntityPosition position)
{
    if (m_free_look_mode)
        return;
    Ogre::Vector3 cameraPosition(position.x, position.y, position.z + position.stance);
    m_camera->setPosition(cameraPosition);

    // look due east
    m_camera->lookAt(cameraPosition + Ogre::Vector3::UNIT_X);
    m_camera->roll(Ogre::Degree(-90));
    // then rotate to where we're looking
    qDebug() << position.pitch;
    m_camera->rotate(Ogre::Vector3::UNIT_Z, Ogre::Radian(position.yaw));
    m_camera->rotate(m_camera->getRight(), Ogre::Radian(position.pitch));
}
