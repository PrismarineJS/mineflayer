#include "MainWindow.h"

#include <QtGlobal>
#include <QTimer>
#include <QCoreApplication>
#include <QDateTime>
#include <QSettings>
#include <QDir>
#include <QDebug>


const int MainWindow::c_fps = 60;
const double MainWindow::c_time_per_frame_msecs = 1.0 / (double)c_fps * 1000.0;


MainWindow::MainWindow() :
    m_root(0),
    m_camera(0),
    m_scene_manager(0),
    m_window(0),
    m_resources_config(Ogre::StringUtil::BLANK),
    m_plugins_config(Ogre::StringUtil::BLANK),
    m_tray_manager(0),
    m_camera_man(0),
    m_details_panel(0),
    m_cursor_was_visible(false),
    m_shut_down(false),
    m_input_manager(0),
    m_mouse(0),
    m_keyboard(0)
{
    loadControls();
}

MainWindow::~MainWindow()
{
    if (m_tray_manager) delete m_tray_manager;
    if (m_camera_man) delete m_camera_man;

    //Remove ourself as a Window listener
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
    // Show the configuration dialog and initialise the system
    // You can skip this and use root.restoreConfig() to load configuration
    // settings if you were sure there are valid ones saved in ogre.cfg
    if(m_root->showConfigDialog())
    {
        // If returned true, user clicked OK so initialise
        // Here we choose to let the system create a default rendering window by passing 'true'
        m_window = m_root->initialise(true, "TutorialApplication Render Window");

        return true;
    }
    else
    {
        return false;
    }
}

void MainWindow::chooseSceneManager()
{
    // Get the SceneManager, in this case a generic one
    m_scene_manager = m_root->createSceneManager(Ogre::ST_GENERIC);
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

    //Set initial mouse clipping size
    windowResized(m_window);

    //Register as a Window listener
    Ogre::WindowEventUtilities::addWindowEventListener(m_window, this);

    m_tray_manager = new OgreBites::SdkTrayManager("InterfaceName", m_window, m_mouse, this);
    m_tray_manager->showFrameStats(OgreBites::TL_BOTTOMLEFT);
    m_tray_manager->showLogo(OgreBites::TL_BOTTOMRIGHT);
    m_tray_manager->hideCursor();

    // create a params panel for displaying sample details
    Ogre::StringVector items;
    items.push_back("cam.pX");
    items.push_back("cam.pY");
    items.push_back("cam.pZ");
    items.push_back("");
    items.push_back("cam.oW");
    items.push_back("cam.oX");
    items.push_back("cam.oY");
    items.push_back("cam.oZ");
    items.push_back("");
    items.push_back("Filtering");
    items.push_back("Poly Mode");

    m_details_panel = m_tray_manager->createParamsPanel(OgreBites::TL_NONE, "DetailsPanel", 200, items);
    m_details_panel->setParamValue(9, "Bilinear");
    m_details_panel->setParamValue(10, "Solid");
    m_details_panel->hide();

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

void MainWindow::createResourceListener()
{

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

    chooseSceneManager();
    createCamera();
    createViewports();

    // Set default mipmap level (NB some APIs ignore this)
    Ogre::TextureManager::getSingleton().setDefaultNumMipmaps(5);

    // Create any resource listeners (for loading screens)
    createResourceListener();
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

    m_tray_manager->frameRenderingQueued(evt);

    if (!m_tray_manager->isDialogVisible())
    {
        m_camera_man->frameRenderingQueued(evt);   // if dialog isn't up, then update the camera
        if (m_details_panel->isVisible())   // if details panel is visible, then update its contents
        {
            m_details_panel->setParamValue(0, Ogre::StringConverter::toString(m_camera->getDerivedPosition().x));
            m_details_panel->setParamValue(1, Ogre::StringConverter::toString(m_camera->getDerivedPosition().y));
            m_details_panel->setParamValue(2, Ogre::StringConverter::toString(m_camera->getDerivedPosition().z));
            m_details_panel->setParamValue(4, Ogre::StringConverter::toString(m_camera->getDerivedOrientation().w));
            m_details_panel->setParamValue(5, Ogre::StringConverter::toString(m_camera->getDerivedOrientation().x));
            m_details_panel->setParamValue(6, Ogre::StringConverter::toString(m_camera->getDerivedOrientation().y));
            m_details_panel->setParamValue(7, Ogre::StringConverter::toString(m_camera->getDerivedOrientation().z));
        }
    }

    //    //  move the player
    //    bool forward = m_key_down.value(m_control_to_key.value(Forward));
    //    bool backward = m_key_down.value(m_control_to_key.value(Back));
    //    bool left = m_key_down.value(m_control_to_key.value(Left));
    //    bool right = m_key_down.value(m_control_to_key.value(Right));

    //    if (forward && ! backward) {
    //        // move camera forward in direction it is facing
    //        m_camera->moveForward(5.0f);
    //    } else if (backward && ! forward) {
    //        // move camera backward in direction it is facing
    //        m_camera->moveBackward(5.0f);
    //    }

    //    if (left && ! right) {
    //        // strafe camera left
    //        m_camera->moveLeft(2.0f);
    //    } else if (right && ! left) {
    //        // strafe camera right
    //        m_camera->moveRight(2.0f);
    //    }

    return true;
}

bool MainWindow::keyPressed( const OIS::KeyEvent &arg )
{
    if (m_tray_manager->isDialogVisible()) return true;   // don't process any more keys if dialog is up

    if (arg.key == OIS::KC_F)   // toggle visibility of advanced frame stats
    {
        m_tray_manager->toggleAdvancedFrameStats();
    }
    else if (arg.key == OIS::KC_G)   // toggle visibility of even rarer debugging details
    {
        if (m_details_panel->getTrayLocation() == OgreBites::TL_NONE)
        {
            m_tray_manager->moveWidgetToTray(m_details_panel, OgreBites::TL_TOPRIGHT, 0);
            m_details_panel->show();
        }
        else
        {
            m_tray_manager->removeWidgetFromTray(m_details_panel);
            m_details_panel->hide();
        }
    }
    else if (arg.key == OIS::KC_T)   // cycle polygon rendering mode
    {
        Ogre::String newVal;
        Ogre::TextureFilterOptions tfo;
        unsigned int aniso;

        switch (m_details_panel->getParamValue(9).asUTF8()[0])
        {
        case 'B':
            newVal = "Trilinear";
            tfo = Ogre::TFO_TRILINEAR;
            aniso = 1;
            break;
        case 'T':
            newVal = "Anisotropic";
            tfo = Ogre::TFO_ANISOTROPIC;
            aniso = 8;
            break;
        case 'A':
            newVal = "None";
            tfo = Ogre::TFO_NONE;
            aniso = 1;
            break;
        default:
            newVal = "Bilinear";
            tfo = Ogre::TFO_BILINEAR;
            aniso = 1;
        }

        Ogre::MaterialManager::getSingleton().setDefaultTextureFiltering(tfo);
        Ogre::MaterialManager::getSingleton().setDefaultAnisotropy(aniso);
        m_details_panel->setParamValue(9, newVal);
    }
    else if (arg.key == OIS::KC_R)   // cycle polygon rendering mode
    {
        Ogre::String newVal;
        Ogre::PolygonMode pm;

        switch (m_camera->getPolygonMode())
        {
        case Ogre::PM_SOLID:
            newVal = "Wireframe";
            pm = Ogre::PM_WIREFRAME;
            break;
        case Ogre::PM_WIREFRAME:
            newVal = "Points";
            pm = Ogre::PM_POINTS;
            break;
        default:
            newVal = "Solid";
            pm = Ogre::PM_SOLID;
        }

        m_camera->setPolygonMode(pm);
        m_details_panel->setParamValue(10, newVal);
    }
    else if(arg.key == OIS::KC_F5)   // refresh all textures
    {
        Ogre::TextureManager::getSingleton().reloadAll();
    }
    else if (arg.key == OIS::KC_SYSRQ)   // take a screenshot
    {
        m_window->writeContentsToTimestampedFile("screenshot", ".jpg");
    }
    else if (arg.key == OIS::KC_ESCAPE)
    {
        m_shut_down = true;
    }

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
    if (m_tray_manager->injectMouseMove(arg)) return true;
    m_camera_man->injectMouseMove(arg);
    return true;
}

bool MainWindow::mousePressed( const OIS::MouseEvent &arg, OIS::MouseButtonID id )
{
    if (m_tray_manager->injectMouseDown(arg, id)) return true;
    m_camera_man->injectMouseDown(arg, id);
    return true;
}

bool MainWindow::mouseReleased( const OIS::MouseEvent &arg, OIS::MouseButtonID id )
{
    if (m_tray_manager->injectMouseUp(arg, id)) return true;
    m_camera_man->injectMouseUp(arg, id);
    return true;
}

//Adjust mouse clipping area
void MainWindow::windowResized(Ogre::RenderWindow* rw)
{
    unsigned int width, height, depth;
    int left, top;
    rw->getMetrics(width, height, depth, left, top);

    const OIS::MouseState &ms = m_mouse->getMouseState();
    ms.width = width;
    ms.height = height;
}

//Unattach OIS before window shutdown (very important under Linux)
void MainWindow::windowClosed(Ogre::RenderWindow* rw)
{
    //Only close for window that created OIS (the main window in these demos)
    if( rw == m_window )
    {
        if( m_input_manager )
        {
            m_input_manager->destroyInputObject( m_mouse );
            m_input_manager->destroyInputObject( m_keyboard );

            OIS::InputManager::destroyInputSystem(m_input_manager);
            m_input_manager = 0;
        }
    }
}
