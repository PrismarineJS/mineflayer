#include "MainWindow.h"

#include <QtGlobal>
#include <QTimer>
#include <QCoreApplication>
#include <QDateTime>
#include <QSettings>
#include <QDir>
#include <QDebug>

MainWindow::MainWindow() :
    m_root(NULL),
    m_camera(NULL),
    m_scene_manager(NULL),
    m_window(NULL),
    m_resources_config(Ogre::StringUtil::BLANK),
    m_camera_man(NULL),
    m_shut_down(false),
    m_input_manager(NULL),
    m_mouse(NULL),
    m_keyboard(NULL),
    m_server(NULL)
{
    loadControls();

    QUrl connection_settings;
    connection_settings.setHost("localhost");
    connection_settings.setPort(25565);
    connection_settings.setUserName("superbot");
    m_server = new Server(connection_settings);
    m_server->socketConnect();
}

MainWindow::~MainWindow()
{
    delete m_camera_man;

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
    m_camera->setPosition(Ogre::Vector3(0,0,80));
    // Look back along -Z
    m_camera->lookAt(Ogre::Vector3(0,0,-300));
    m_camera->setNearClipDistance(5);

    m_camera_man = new OgreBites::SdkCameraMan(m_camera);   // create a default camera controller
}

void MainWindow::createFrameListener()
{
    return; // TODO: stop borking my keyboard!
    Ogre::LogManager::getSingletonPtr()->logMessage("*** Initializing OIS ***");
    OIS::ParamList pl;
    size_t windowHnd = 0;
    std::ostringstream windowHndStr;

    m_window->getCustomAttribute("WINDOW", &windowHnd);
    windowHndStr << windowHnd;
    pl.insert(std::make_pair(std::string("WINDOW"), windowHndStr.str()));

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
    mgr->addResourceLocation("media", "FileSystem", Ogre::ResourceGroupManager::DEFAULT_RESOURCE_GROUP_NAME, true);
}

void MainWindow::loadResources()
{
    Ogre::ResourceGroupManager::getSingleton().initialiseAllResourceGroups();

    createUnitCubeMesh();


    {
        // grab all the textures from resources
        //QImage terrain(":/textures/terrain.png");
        //terrain.convertToFormat(QImage::Format_ARGB32_Premultiplied);

        QFile texture_index_file(":/textures/textures.txt");
        texture_index_file.open(QFile::ReadOnly);
        QTextStream stream(&texture_index_file);
        while (! stream.atEnd()) {
            QString line = stream.readLine().trimmed();
            if (line.isEmpty() || line.startsWith("#"))
                continue;
            QStringList parts = line.split(QRegExp("\\s+"), QString::SkipEmptyParts);
            Q_ASSERT(parts.size() == 5);
            QString name = parts.at(0);
            int x = parts.at(1).toInt();
            int y = parts.at(2).toInt();
            int w = parts.at(3).toInt();
            int h = parts.at(4).toInt();
            //QImage image = terrain.copy(x, y, w, h).rgbSwapped();
            //Texture * texture = new Texture(image);
            //s_textures.insert(name, texture);
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
            Q_ASSERT(parts.size() == 8);
            int id = parts.at(0).toInt();
            QString name = parts.at(1);
            QString top = parts.at(2);
            QString bottom = parts.at(3);
            QString front = parts.at(4);
            QString back = parts.at(5);
            QString left = parts.at(6);
            QString right = parts.at(7);

//            Mesh * textured_cube = Mesh::createUnitCube(Constants::white,
//                s_textures.value(top),
//                s_textures.value(bottom),
//                s_textures.value(front),
//                s_textures.value(back),
//                s_textures.value(left),
//                s_textures.value(right));
//            s_meshes.replace(id, textured_cube);
        }
        blocks_file.close();
    }
}

void MainWindow::createUnitCubeMesh()
{

    Ogre::ManualObject * obj = new Ogre::ManualObject("Cube");

    // front face
    obj->begin("", Ogre::RenderOperation::OT_TRIANGLE_STRIP);
    obj->position(0.5f, 0, 0);      obj->textureCoord(0, 0);
    obj->position(0.5f, 0.5f, 0);   obj->textureCoord(1, 0);
    obj->position(0, 0, 0);         obj->textureCoord(1, 1);
    obj->position(0, 0.5f, 0);      obj->textureCoord(0, 1);
    // left face
    obj->position(0, 0, -0.5f);     obj->textureCoord(1, 0);
    obj->position(0, 0.5f, -0.5f);  obj->textureCoord(1, 1);
    // back face
    obj->position(0.5f, 0, -0.5f);  obj->textureCoord(0, 0);
    obj->position(0.5f, 0.5f,-0.5f);obj->textureCoord(0, 1);
    // right face
    obj->position(0.5f, 0, 0);      obj->textureCoord(1, 0);
    obj->position(0.5f, 0.5f, 0);   obj->textureCoord(1, 1);
    obj->end();
    // top face
    obj->begin("", Ogre::RenderOperation::OT_TRIANGLE_STRIP);
    obj->position(0.5f, 0.5f, 0);   obj->textureCoord(0, 0);
    obj->position(0.5f, 0.5f,-0.5f);obj->textureCoord(1, 0);
    obj->position(0, 0.5f, 0);      obj->textureCoord(1, 1);
    obj->position(0, 0.5f, -0.5f);  obj->textureCoord(0, 1);
    obj->end();
    // bottom face
    obj->begin("", Ogre::RenderOperation::OT_TRIANGLE_STRIP);
    obj->position(0, 0, 0);         obj->textureCoord(0, 0);
    obj->position(0, 0, -0.5f);     obj->textureCoord(1, 0);
    obj->position(0.5f, 0, 0);      obj->textureCoord(1, 1);
    obj->position(0.5f, 0, -0.5f);  obj->textureCoord(0, 1);
    obj->end();

    obj->convertToMesh("Cube");
}

void MainWindow::go()
{
    m_resources_config = "resources.cfg";

    if (!setup())
        return;

    m_root->startRendering();
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
    m_scene_manager = m_root->createSceneManager(Ogre::ST_GENERIC);

    createCamera();
    createViewports();

    // Set default mipmap level (NB some APIs ignore this)
    Ogre::TextureManager::getSingleton().setDefaultNumMipmaps(5);

    // Load resources
    loadResources();

    // create the scene
    m_scene_manager->setAmbientLight(Ogre::ColourValue(0.5, 0.5, 0.5));

    createFrameListener();

    return true;
};

bool MainWindow::frameRenderingQueued(const Ogre::FrameEvent& evt)
{
    if(m_window->isClosed())
        return false;

    if(m_shut_down)
        return false;

    //Need to capture/update each device
    m_keyboard->capture();
    m_mouse->capture();
    QCoreApplication::processEvents();

    // compute next frame


    m_camera_man->frameRenderingQueued(evt);   // if dialog isn't up, then update the camera


    return true;
}

bool MainWindow::keyPressed( const OIS::KeyEvent &arg )
{
    if (arg.key == OIS::KC_ESCAPE || (m_keyboard->isModifierDown(OIS::Keyboard::Alt) && arg.key == OIS::KC_F4))
        m_shut_down = true;

    m_camera_man->injectKeyDown(arg);
    return true;
}

bool MainWindow::keyReleased( const OIS::KeyEvent &arg )
{
    m_camera_man->injectKeyUp(arg);
    return true;
}

bool MainWindow::mouseMoved( const OIS::MouseEvent &arg )
{
    m_camera_man->injectMouseMove(arg);
    return true;
}

bool MainWindow::mousePressed( const OIS::MouseEvent &arg, OIS::MouseButtonID id )
{
    m_camera_man->injectMouseDown(arg, id);
    return true;
}

bool MainWindow::mouseReleased( const OIS::MouseEvent &arg, OIS::MouseButtonID id )
{
    m_camera_man->injectMouseUp(arg, id);
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

void MainWindow::updateChunk(QSharedPointer<Chunk> chunk)
{

}
