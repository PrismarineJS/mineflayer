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
    m_plugins_config(Ogre::StringUtil::BLANK),
    m_camera_man(NULL),
    m_shut_down(false),
    m_input_manager(NULL),
    m_mouse(NULL),
    m_keyboard(NULL),
    m_server(NULL)
{
    loadControls();
}

MainWindow::~MainWindow()
{
    delete m_camera_man;

    // Remove ourself as a Window listener
    Ogre::WindowEventUtilities::removeWindowEventListener(m_window, this);
    windowClosed(m_window);
    delete m_root;
}

void MainWindow::createScene()
{
    Ogre::Entity* ogreHead = m_scene_manager->createEntity("Head", "ogrehead.mesh");

    Ogre::SceneNode* headNode = m_scene_manager->getRootSceneNode()->createChildSceneNode();
    headNode->attachObject(ogreHead);

    // Set ambient light
    m_scene_manager->setAmbientLight(Ogre::ColourValue(0.5, 0.5, 0.5));

    // Create a light
    Ogre::Light* l = m_scene_manager->createLight("MainLight");
    l->setPosition(20,80,50);
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

void MainWindow::destroyScene()
{
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
    // Load resource paths from config file
    Ogre::ConfigFile cf;
    cf.load(m_resources_config);

    // Go through all sections & settings in the file
    Ogre::ConfigFile::SectionIterator seci = cf.getSectionIterator();

    Ogre::String secName, typeName, archName;
    while (seci.hasMoreElements())
    {
        secName = seci.peekNextKey();
        Ogre::ConfigFile::SettingsMultiMap *settings = seci.getNext();
        Ogre::ConfigFile::SettingsMultiMap::iterator i;
        for (i = settings->begin(); i != settings->end(); ++i)
        {
            typeName = i->first;
            archName = i->second;
            Ogre::ResourceGroupManager::getSingleton().addResourceLocation(
                archName, typeName, secName);
        }
    }
}

void MainWindow::loadResources()
{
    Ogre::ResourceGroupManager::getSingleton().initialiseAllResourceGroups();
}

void MainWindow::go()
{
    m_resources_config = "resources.cfg";
    m_plugins_config = "plugins.cfg";

    if (!setup())
        return;

    m_root->startRendering();

    destroyScene();
}

bool MainWindow::setup()
{
    m_root = new Ogre::Root(m_plugins_config);

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

    // Create the scene
    createScene();

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
