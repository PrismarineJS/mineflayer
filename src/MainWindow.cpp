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

MainWindow::MainWindow() :
    m_root(NULL),
    m_camera(NULL),
    m_scene_manager(NULL),
    m_window(NULL),
    m_resources_config(Ogre::StringUtil::BLANK),
    m_shut_down(false),
    m_input_manager(NULL),
    m_mouse(NULL),
    m_keyboard(NULL),
    m_server(NULL)
{
    loadControls();

    Q_ASSERT(sizeof(MainWindow) != 216 && sizeof(MainWindow) != 336);
    qDebug() << sizeof(MainWindow);

    m_air.see_through = true;
    m_air.partial_alpha = false;
    m_air.name = "Air";

    QUrl connection_settings;
    connection_settings.setHost("localhost");
    connection_settings.setPort(25565);
    connection_settings.setUserName("superbot");
    m_server = new Server(connection_settings);
    bool success;
    success = connect(m_server, SIGNAL(mapChunkUpdated(QSharedPointer<Chunk>)), this, SLOT(updateChunk(QSharedPointer<Chunk>)));
    Q_ASSERT(success);
    success = connect(m_server, SIGNAL(playerPositionUpdated(Server::EntityPosition)), this, SLOT(movePlayerPosition(Server::EntityPosition)));
    Q_ASSERT(success);
    m_server->socketConnect();
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
    m_key_to_control.insert((OIS::KeyCode)settings.value("controls/forward", OIS::KC_W).toInt(), Forward);
    m_key_to_control.insert((OIS::KeyCode)settings.value("controls/back", OIS::KC_S).toInt(), Back);
    m_key_to_control.insert((OIS::KeyCode)settings.value("controls/left", OIS::KC_A).toInt(), Left);
    m_key_to_control.insert((OIS::KeyCode)settings.value("controls/right", OIS::KC_D).toInt(), Right);
    m_key_to_control.insert((OIS::KeyCode)settings.value("controls/jump", OIS::KC_SPACE).toInt(), Jump);
    m_key_to_control.insert((OIS::KeyCode)settings.value("controls/crouch", OIS::KC_Z).toInt(), Crouch);
    m_key_to_control.insert((OIS::KeyCode)settings.value("controls/discard_item", OIS::KC_Q).toInt(), DiscardItem);
    m_key_to_control.insert((OIS::KeyCode)settings.value("controls/action_1", OIS::KC_NUMPAD0).toInt(), Action1);
    m_key_to_control.insert((OIS::KeyCode)settings.value("controls/action_2", OIS::KC_NUMPAD1).toInt(), Action2);
    m_key_to_control.insert((OIS::KeyCode)settings.value("controls/inventory", OIS::KC_I).toInt(), Inventory);
    m_key_to_control.insert((OIS::KeyCode)settings.value("controls/chat", OIS::KC_T).toInt(), Chat);

    QHashIterator<OIS::KeyCode, Control> it(m_key_to_control);
    while (it.hasNext()) {
        it.next();
        m_control_to_key.insert(it.value(), it.key());
    }
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

    // Position it at 500 in Z direction
    m_camera->setPosition(Ogre::Vector3(0,0,0));
    // Look back along -Z
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
   // pl.insert(std::make_pair(std::string("x11_mouse_grab"), std::string("false")));
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
            Q_ASSERT(parts.size() == 10);
            BlockData block_data;
            block_data.side_textures.resize(6);
            int index = 0;
            Chunk::ItemType id = (Chunk::ItemType) parts.at(index++).toInt();
            block_data.name = parts.at(index++);
            for (int i = 0; i < 6; i++)
                block_data.side_textures.replace(i, parts.at(index++));
            block_data.see_through = (bool)parts.at(index++).toInt();
            block_data.partial_alpha = (bool)parts.at(index++).toInt();
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


    // update the camera
    bool forward = controlPressed(Forward);
    bool backward = controlPressed(Back);
    bool left = controlPressed(Left);
    bool right = controlPressed(Right);
    bool crouch = controlPressed(Crouch);

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

    return true;
}

bool MainWindow::keyPressed(const OIS::KeyEvent &arg )
{
    if (arg.key == OIS::KC_ESCAPE || (m_keyboard->isModifierDown(OIS::Keyboard::Alt) && arg.key == OIS::KC_F4))
        m_shut_down = true;

    return true;
}

bool MainWindow::keyReleased(const OIS::KeyEvent &arg )
{
    return true;
}

bool MainWindow::mouseMoved(const OIS::MouseEvent &arg )
{
    // move camera
    m_camera->rotate(Ogre::Vector3(0, 0, 1), Ogre::Degree(-arg.state.X.rel * 0.25f));
    m_camera->pitch(Ogre::Degree(-arg.state.Y.rel * 0.25f));
    return true;
}

bool MainWindow::mousePressed(const OIS::MouseEvent &arg, OIS::MouseButtonID id )
{
    return true;
}

bool MainWindow::mouseReleased(const OIS::MouseEvent &arg, OIS::MouseButtonID id )
{
    return true;
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

bool MainWindow::controlPressed(Control control)
{
    OIS::KeyCode key_code = m_control_to_key.value(control);
    return m_keyboard->isKeyDown(key_code) ||
            m_keyboard->isModifierDown((OIS::Keyboard::Modifier) key_code);
}

void MainWindow::updateChunk(QSharedPointer<Chunk> update)
{
    // build a mesh for the chunk
    // find the chunk coordinates for this updated stuff.
    Int3D chunk_key = chunkKey(update->position());

    // update our chunk with update
    bool chunk_is_new;
    ChunkData chunk_data = getChunk(chunk_key, &chunk_is_new);
    QSharedPointer<Chunk> chunk = chunk_data.chunk;
    Int3D offset;
    Int3D size = update.data()->size();
    for (offset.x = 0; offset.x < size.x; offset.x++) {
        for (offset.y = 0; offset.y < size.y; offset.y++) {
            for (offset.z = 0; offset.z < size.z; offset.z++) {
                chunk.data()->setBlock(update.data()->position() + offset - chunk.data()->position(), update.data()->getBlock(offset));
            }
        }
    }

    generateChunkMesh(chunk_data);
}

void MainWindow::generateChunkMesh(ChunkData & chunk_data)
{
    // delete old stuff
    if (chunk_data.manual_object)
        m_scene_manager->destroyManualObject(chunk_data.manual_object);
    if (chunk_data.node)
        m_scene_manager->destroySceneNode(chunk_data.node);

    QSharedPointer<Chunk> chunk = chunk_data.chunk;
    Int3D offset;
    Int3D size = chunk.data()->size();
    for (int pass = 0; pass < 2; pass++) {
        Ogre::ManualObject * obj = new Ogre::ManualObject(Ogre::String());
        obj->begin(pass == 0 ? "TerrainOpaque" : "TerrainTransparent", Ogre::RenderOperation::OT_TRIANGLE_LIST);
        for (offset.x = 0; offset.x < size.x; offset.x++) {
            for (offset.y = 0; offset.y < size.y; offset.y++) {
                for (offset.z = 0; offset.z < size.z; offset.z++) {
                    Chunk::Block block = chunk.data()->getBlock(offset);

                    BlockData block_data = m_block_data.value(block.type, m_air);

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
                    for (int i = 0; i < 6; i++) {
                        // if the block on this side is opaque or the same block, skip
                        Chunk::ItemType side_type = blockTypeAt(chunk.data()->position()+offset+c_side_offset[i]);
                        if (side_type == block.type || ! m_block_data.value(side_type, m_air).see_through)
                            continue;

                        // add this side to mesh
                        Int3D abs_block_loc = chunk.data()->position() + offset;
                        QString texture_name = block_data.side_textures.at(i);
                        BlockTextureCoord btc = m_terrain_tex_coords.value(texture_name);

                        for (int triangle_index = 0; triangle_index < 2; triangle_index++) {
                            for (int point_index = 0; point_index < 3; point_index++) {
                                Ogre::Vector3 side_coord = c_side_coord[i][triangle_index][point_index];
                                Ogre::Vector2 tex_coord = c_tex_coord[triangle_index][point_index];
                                obj->position(abs_block_loc.x+side_coord.x, abs_block_loc.y+side_coord.y, abs_block_loc.z+side_coord.z);
                                obj->textureCoord((btc.x+tex_coord.x*btc.w) / 256.f, (btc.y+tex_coord.y*btc.h) / 256.0f);
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

Chunk::ItemType MainWindow::blockTypeAt(const Int3D & coord)
{
    Int3D chunk_key = chunkKey(coord);
    ChunkData chunk_data = m_chunks.value(chunk_key, ChunkData());
    QSharedPointer<Chunk> chunk = chunk_data.chunk;
    if (chunk.isNull())
        return Chunk::Air;
    Int3D offset = coord - chunk_key;
    return chunk.data()->getBlock(offset).type;
}

Int3D MainWindow::chunkKey(const Int3D & coord)
{
    return coord - (coord % c_chunk_size);
}

MainWindow::ChunkData MainWindow::getChunk(const Int3D & key, bool * made_new_chunk)
{
    ChunkData chunk_data = m_chunks.value(key, ChunkData());
    QSharedPointer<Chunk> chunk = chunk_data.chunk;
    if (! chunk.isNull()) {
        if (made_new_chunk)
            *made_new_chunk = false;
        return chunk_data;
    }
    chunk_data.node = NULL;
    chunk_data.manual_object = NULL;
    chunk_data.chunk = QSharedPointer<Chunk>(new Chunk(key, c_chunk_size));
    m_chunks.insert(key, chunk_data);
    if (made_new_chunk)
        *made_new_chunk = true;
    return chunk_data;
}

void MainWindow::movePlayerPosition(Server::EntityPosition position)
{
    m_camera->setPosition(Ogre::Vector3(position.x, position.y, position.z + position.stance));
}
