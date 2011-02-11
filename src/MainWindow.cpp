#include "MainWindow.h"

#include <OGRE/OgreMaterialManager.h>
#include <OGRE/OgreManualObject.h>

#include <QSettings>
#include <QDir>
#include <QCoreApplication>
#include <QCursor>
#include <QDebug>


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
    // TODO: figure out wtf is going on and delete this assertion.
    Q_ASSERT(sizeof(MainWindow) != 216);

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
        m_sub_chunk_generator->saveSubChunkNode(ready_chunk, chunk_node);
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

