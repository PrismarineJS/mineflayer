#include "MainWindow.h"

#include <OGRE/OgreMaterialManager.h>
#include <OGRE/OgreManualObject.h>

#include <QSettings>
#include <QDir>
#include <QApplication>
#include <QCursor>
#include <QDebug>
#include <QRectF>

const QSizeF MainWindow::c_gui_png_size(256.0f, 256.0f);
const QSizeF MainWindow::c_icons_png_size(256.0f, 256.0f);
const QSizeF MainWindow::c_items_png_size(256.0f, 256.0f);
const QSizeF MainWindow::c_inventory_png_size(256.0f, 256.0f);

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
    m_sub_chunk_generator(NULL),
    m_selected_slot(0),
    m_next_manual_object_string(0),
    m_inventory_open(false)
{
    loadControls();

    m_game = new Game(url);
    bool success;
    success = connect(m_game, SIGNAL(playerPositionUpdated()), this, SLOT(movePlayerPosition()));
    Q_ASSERT(success);
    success = connect(m_game, SIGNAL(playerHealthUpdated()), this, SLOT(handlePlayerHealthUpdated()));
    Q_ASSERT(success);
    success = connect(m_game, SIGNAL(playerDied()), this, SLOT(handlePlayerDied()));
    Q_ASSERT(success);

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
    QDir dir(QApplication::applicationDirPath());
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
    m_camera->setFOVy(Ogre::Degree(60));
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
    pl.insert(std::make_pair(std::string("x11_mouse_hide"), std::string("false")));
    pl.insert(std::make_pair(std::string("XAutoRepeatOn"), std::string("true")));
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

    {
        // grab all the textures from resources
        QFile texture_index_file(":/graphics/textures.txt");
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
        texture_unit->setTextureFiltering(Ogre::TFO_NONE);
        texture_unit->setColourOperation(Ogre::LBO_MODULATE);
    }

    // create the item material
    {
        Ogre::MaterialPtr material = Ogre::MaterialManager::getSingleton().create("Items", Ogre::ResourceGroupManager::DEFAULT_RESOURCE_GROUP_NAME);
        Ogre::Technique * first_technique = material->getTechnique(0);
        Ogre::Pass * first_pass = first_technique->getPass(0);
        first_pass->setDepthWriteEnabled(false);
        first_pass->setDepthCheckEnabled(false);
        first_pass->setLightingEnabled(false);
        first_pass->setSceneBlending(Ogre::SBT_TRANSPARENT_ALPHA);
        Ogre::TextureUnitState * texture_unit = first_pass->createTextureUnitState();
        texture_unit->setTextureName("gui/items.png");
        texture_unit->setTextureFiltering(Ogre::TFO_NONE);
    }

    // create the icons material
    {
        Ogre::MaterialPtr material = Ogre::MaterialManager::getSingleton().create("Icons", Ogre::ResourceGroupManager::DEFAULT_RESOURCE_GROUP_NAME);
        Ogre::Technique * first_technique = material->getTechnique(0);
        Ogre::Pass * first_pass = first_technique->getPass(0);
        first_pass->setDepthWriteEnabled(false);
        first_pass->setDepthCheckEnabled(false);
        first_pass->setLightingEnabled(false);
        first_pass->setSceneBlending(Ogre::SBT_TRANSPARENT_ALPHA);
        Ogre::TextureUnitState * texture_unit = first_pass->createTextureUnitState();
        texture_unit->setTextureName("gui/icons.png");
        texture_unit->setTextureFiltering(Ogre::TFO_NONE);
    }

    // create the gui material
    {
        Ogre::MaterialPtr material = Ogre::MaterialManager::getSingleton().create("Hud", Ogre::ResourceGroupManager::DEFAULT_RESOURCE_GROUP_NAME);
        Ogre::Technique * first_technique = material->getTechnique(0);
        Ogre::Pass * first_pass = first_technique->getPass(0);
        first_pass->setDepthWriteEnabled(false);
        first_pass->setDepthCheckEnabled(false);
        first_pass->setLightingEnabled(false);
        first_pass->setSceneBlending(Ogre::SBT_TRANSPARENT_ALPHA);
        Ogre::TextureUnitState * texture_unit = first_pass->createTextureUnitState();
        texture_unit->setTextureName("gui/gui.png");
        texture_unit->setTextureFiltering(Ogre::TFO_NONE);
    }

    // crosshair
    {
        Ogre::MaterialPtr material = Ogre::MaterialManager::getSingleton().create("IconsInverted", Ogre::ResourceGroupManager::DEFAULT_RESOURCE_GROUP_NAME);
        Ogre::Technique * first_technique = material->getTechnique(0);
        Ogre::Pass * first_pass = first_technique->getPass(0);
        first_pass->setAlphaRejectFunction(Ogre::CMPF_GREATER_EQUAL);
        first_pass->setAlphaRejectValue(128);
        first_pass->setDepthWriteEnabled(false);
        first_pass->setDepthCheckEnabled(false);
        first_pass->setLightingEnabled(false);
        first_pass->setSceneBlending(Ogre::SBF_ONE_MINUS_DEST_COLOUR, Ogre::SBF_ZERO);
        Ogre::TextureUnitState * texture_unit = first_pass->createTextureUnitState();
        texture_unit->setTextureName("gui/icons.png");
        texture_unit->setTextureFiltering(Ogre::TFO_NONE);
    }

    // inventory
    {
        Ogre::MaterialPtr material = Ogre::MaterialManager::getSingleton().create("Inventory", Ogre::ResourceGroupManager::DEFAULT_RESOURCE_GROUP_NAME);
        Ogre::Technique * first_technique = material->getTechnique(0);
        Ogre::Pass * first_pass = first_technique->getPass(0);
        first_pass->setAlphaRejectFunction(Ogre::CMPF_GREATER_EQUAL);
        first_pass->setAlphaRejectValue(128);
        first_pass->setDepthWriteEnabled(false);
        first_pass->setDepthCheckEnabled(false);
        first_pass->setLightingEnabled(false);
        Ogre::TextureUnitState * texture_unit = first_pass->createTextureUnitState();
        texture_unit->setTextureName("gui/inventory.png");
        texture_unit->setTextureFiltering(Ogre::TFO_NONE);
    }
}

int MainWindow::exec()
{
    m_resources_config = "resources.cfg";

    if (!setup())
        return -1;

    m_sub_chunk_generator = new SubChunkMeshGenerator(this);

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
    createScene();

    createFrameListener();

    return true;
};

void MainWindow::createScene()
{
    m_scene_manager->setAmbientLight(Ogre::ColourValue(1.0f, 1.0f, 1.0f));
    Ogre::SceneNode * node = m_scene_manager->getRootSceneNode();
    m_pass[0] = node->createChildSceneNode();
    m_pass[1] = node->createChildSceneNode();
    createHud();

    // create dialog windows
    QSizeF inv_size(0.41*2, 0.6875*2);
    QRectF inv_pos(QPointF(-inv_size.width()/2, -inv_size.height()/2), inv_size);
    Ogre::SceneNode * inventory = node->createChildSceneNode("Inventory");
    inventory->attachObject(create2DObject("Inventory", c_inventory_png_size, "Inventory", inv_size));
    inventory->setPosition(inv_pos.x(), inv_pos.y(), 0);
    setInventoryOpen(m_inventory_open);


}

void MainWindow::createHud()
{
    m_hud = m_scene_manager->getRootSceneNode()->createChildSceneNode();

    // inventory slots
    float width = 0.42225f * 2;
    float height = width / 8.27f * 2;
    m_slots_position = QRectF(-width / 2, -1.0f, width, height);
    Ogre::SceneNode * inv_slots = m_hud->createChildSceneNode("EquippableSlots");
    inv_slots->attachObject(create2DObject("Hud", c_gui_png_size, "EquippableSlots", m_slots_position.size()));
    inv_slots->setPosition(m_slots_position.left(), m_slots_position.top(), 0.0f);

    // selected inventory slot
    Ogre::SceneNode * selected_slot = inv_slots->createChildSceneNode("SelectedSlot");
    selected_slot->attachObject(create2DObject("Hud", c_gui_png_size, "SelectedSlot",
        QSizeF(m_slots_position.height()/2, m_slots_position.height())));
    selected_slot->setPosition(0, 0, 0);

    // health
    Ogre::SceneNode * health_node = m_hud->createChildSceneNode("Health");
    health_node->setPosition(m_slots_position.left(), m_slots_position.top() + m_slots_position.height(), 0);

    // black heart outline
    QSizeF heart_size(0.01873536299765808 * 2, 0.0375 * 2);
    Ogre::SceneNode * black_hearts_outline = health_node->createChildSceneNode("BlackHeartsOutline");
    for (int i = 0; i < 10; i++) {
        Ogre::ManualObject * black_heart_outline_obj = create2DObject("Icons", c_icons_png_size,
            "BlackHeartOutline", heart_size);
        Ogre::SceneNode * node = black_hearts_outline->createChildSceneNode();
        node->attachObject(black_heart_outline_obj);
        node->setPosition(i * heart_size.width(), 0, 0);
    }

    // red inner hearts
    Ogre::SceneNode * red_inner_hearts = health_node->createChildSceneNode("RedHeartsInner");
    for (int i = 0; i < 10; i++) {
        Ogre::ManualObject * red_half_heart_obj = create2DObject("Icons",
            c_icons_png_size, "RedHalfHeartInner", heart_size);
        Ogre::SceneNode * half_heart_node = red_inner_hearts->createChildSceneNode((QString("HalfHeart") + QString::number(i)).toStdString());
        half_heart_node->attachObject(red_half_heart_obj);
        half_heart_node->setPosition(i * heart_size.width(), 0, 0);

        Ogre::ManualObject * red_heart_obj = create2DObject("Icons",
            c_icons_png_size, "RedHeartInner", heart_size);
        Ogre::SceneNode * heart_node = red_inner_hearts->createChildSceneNode((QString("Heart") + QString::number(i)).toStdString());
        heart_node->attachObject(red_heart_obj);
        heart_node->setPosition(i * heart_size.width(), 0, 0);
    }

    // crosshair - size and position is recomputed on window resize.
    Ogre::SceneNode * crosshair_node = m_hud->createChildSceneNode("CrossHair");
    crosshair_node->attachObject(create2DObject("IconsInverted", c_icons_png_size, "CrossHair", QSizeF(1,1)));

}

Ogre::ManualObject * MainWindow::create2DObject(const Ogre::String & material_name,
    const QSizeF & material_size_pixels, const QString & texture_name, const QSizeF & size)
{
    Q_ASSERT(m_terrain_tex_coords.contains(texture_name));

    Ogre::ManualObject * obj = m_scene_manager->createManualObject(nextManualObjectString());
    obj->setUseIdentityProjection(true);
    obj->setUseIdentityView(true);

    obj->begin(material_name, Ogre::RenderOperation::OT_TRIANGLE_LIST);

    BlockTextureCoord btc = m_terrain_tex_coords.value(texture_name);
    for (int triangle_index = 0; triangle_index < 2; triangle_index++) {
        for (int point_index = 0; point_index < 3; point_index++) {
            Ogre::Vector3 pos = SubChunkMeshGenerator::c_side_coord[SubChunkMeshGenerator::PositiveZ][triangle_index][point_index];
            obj->position(pos.x * size.width(), pos.y * size.height(), 0);

            Ogre::Vector2 tex_coord = SubChunkMeshGenerator::c_tex_coord[triangle_index][point_index];
            obj->textureCoord((btc.x+tex_coord.x*btc.w) / material_size_pixels.width(),
                              (btc.y+tex_coord.y*btc.h) / material_size_pixels.height());
        }
    }
    obj->end();

    Ogre::AxisAlignedBox aab_inf;
    aab_inf.setInfinite();
    obj->setBoundingBox(aab_inf);

    // Render just before overlays
    obj->setRenderQueueGroup(Ogre::RENDER_QUEUE_OVERLAY - 1);

    return obj;

}

bool MainWindow::frameRenderingQueued(const Ogre::FrameEvent& evt)
{
    if (m_window->isClosed() || m_shut_down)
        return false;

    // add the newly generated chunks to the scene
    QApplication::processEvents();
    while (m_sub_chunk_generator->availableNewSubChunk()) {
        SubChunkMeshGenerator::ReadySubChunk ready_chunk = m_sub_chunk_generator->nextNewSubChunk();
        m_ogre_mutex.lock();
        ready_chunk.obj->end();
        m_ogre_mutex.unlock();
        Ogre::SceneNode * chunk_node = ready_chunk.node->createChildSceneNode();
        chunk_node->attachObject(ready_chunk.obj);
        // save the scene node so we can delete it later
        m_sub_chunk_generator->saveSubChunkNode(ready_chunk, chunk_node);
    }
    while (m_sub_chunk_generator->availableDoneSubChunk()) {
        SubChunkMeshGenerator::ReadySubChunk done_chunk = m_sub_chunk_generator->nextDoneSubChunk();
        if (done_chunk.obj != NULL) {
            m_scene_manager->destroyManualObject(done_chunk.obj);
        }
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

void MainWindow::mouseWheel(int direction)
{
    m_selected_slot = Util::euclideanMod(m_selected_slot-Util::sign(direction), 9);
    m_scene_manager->getSceneNode("SelectedSlot")->setPosition(m_selected_slot * (m_slots_position.height()/2-0.009), 0, 0);
}

bool MainWindow::keyPressed(const OIS::KeyEvent &arg )
{
    m_keyboard->capture();

    if (m_keyboard->isModifierDown(OIS::Keyboard::Alt))
        m_grab_mouse = false;

    if (arg.key == OIS::KC_ESCAPE || (m_keyboard->isModifierDown(OIS::Keyboard::Alt) && arg.key == OIS::KC_F4)) {
        QCoreApplication::quit();
        m_shut_down = true;
    } else if (arg.key == OIS::KC_F2) {
        m_free_look_mode = !m_free_look_mode;
    }

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
    if (! m_inventory_open)
        grabMouse();
    activateInput(id, true);
    return true;
}

bool MainWindow::mouseReleased(const OIS::MouseEvent &, OIS::MouseButtonID id )
{
    activateInput(id, false);
    return true;
}

bool MainWindow::mouseMoved(const OIS::MouseEvent & event)
{
    mouseWheel(event.state.Z.rel);
    return true;
}

void MainWindow::grabMouse(bool grab_mouse)
{
    if (m_grab_mouse == grab_mouse)
        return;

    if (! grab_mouse) {
        m_grab_mouse = false;
        return;
    }

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
    Game::Control activated_control = m_key_to_control.value(input, Game::NoControl);
    m_game->setControlActivated(activated_control, activated);

    if (activated && activated_control == Game::Inventory)
        setInventoryOpen(! m_inventory_open);
}

void MainWindow::setInventoryOpen(bool new_value)
{
    m_inventory_open = new_value;
    m_scene_manager->getSceneNode("Inventory")->setVisible(m_inventory_open);
    m_scene_manager->getSceneNode("CrossHair")->setVisible(! m_inventory_open);
    grabMouse(! m_inventory_open);
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

    Ogre::SceneNode * crosshair_node = m_scene_manager->getSceneNode("CrossHair");
    BlockTextureCoord tex_coord = m_terrain_tex_coords.value("CrossHair");
    crosshair_node->setScale(tex_coord.w*2 * 2 / (float)width, tex_coord.h*2 * 2 / (float)height, 1);
    crosshair_node->setPosition(-tex_coord.w*2 / (float)width, tex_coord.h*2 / (float)height, 0);
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

void MainWindow::movePlayerPosition()
{
    if (m_free_look_mode)
        return;
    Server::EntityPosition position = m_game->playerPosition();

    Ogre::Vector3 cameraPosition(position.pos.x, position.pos.y, position.pos.z + position.height);
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
    for (int i = 0; i < 10; i++) {
        m_scene_manager->getSceneNode((QString("Heart")+QString::number(i)).toStdString())->setVisible(m_game->playerHealth() - 1 > i * 2);
        m_scene_manager->getSceneNode((QString("HalfHeart")+QString::number(i)).toStdString())->setVisible(m_game->playerHealth() > i * 2);
    }
}
void MainWindow::handlePlayerDied()
{
    // TODO: ask the user first
    m_game->respawn();
}

