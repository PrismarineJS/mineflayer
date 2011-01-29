#include "GameWidget.h"

#include "Camera.h"

#include <QtGlobal>
#include <QTimer>
#include <QApplication>
#include <QDateTime>
#include <QSettings>
#include <QDir>
#include <QDebug>

const int GameWidget::c_fps = 60;
const double GameWidget::c_time_per_frame_msecs = 1.0 / (double)c_fps * 1000.0;

GameWidget::GameWidget(QWidget *parent) :
    QGLWidget(parent),
    m_server(NULL),
    m_camera(NULL),
    m_player(NULL)
{
    this->setMouseTracking(true);
    this->setFocusPolicy(Qt::StrongFocus);
    this->setCursor(Qt::BlankCursor);

    loadControls();
}

GameWidget::~GameWidget()
{
    delete m_server;
    delete m_camera;
    delete m_player;
}

void GameWidget::loadControls()
{
    QDir dir(QCoreApplication::applicationDirPath());
    QSettings settings(dir.absoluteFilePath("mineflayer.ini"), QSettings::IniFormat);
    m_key_to_control.insert(settings.value("controls/forward", Qt::Key_W).toInt(), Forward);
    m_key_to_control.insert(settings.value("controls/back", Qt::Key_S).toInt(), Back);
    m_key_to_control.insert(settings.value("controls/left", Qt::Key_A).toInt(), Left);
    m_key_to_control.insert(settings.value("controls/right", Qt::Key_D).toInt(), Right);
    m_key_to_control.insert(settings.value("controls/jump", Qt::Key_Space).toInt(), Jump);
    m_key_to_control.insert(settings.value("controls/crouch", Qt::Key_Shift).toInt(), Crouch);
    m_key_to_control.insert(settings.value("controls/discard_item", Qt::Key_Q).toInt(), DiscardItem);
    m_key_to_control.insert(settings.value("controls/action_1", Qt::LeftButton).toInt(), Action1);
    m_key_to_control.insert(settings.value("controls/action_2", Qt::RightButton).toInt(), Action2);
    m_key_to_control.insert(settings.value("controls/inventory", Qt::Key_I).toInt(), Inventory);
    m_key_to_control.insert(settings.value("controls/chat", Qt::Key_T).toInt(), Chat);

    QHashIterator<int, Control> it(m_key_to_control);
    while (it.hasNext()) {
        it.next();
        m_control_to_key.insert(it.value(), it.key());
    }
}

void GameWidget::start(QString username, QString password, QString hostname, int port)
{
    ConnectionSettings connection_info;
    connection_info.username = username;
    connection_info.password = password;
    connection_info.hostname = hostname;
    connection_info.port = port;
    m_server = new Server(connection_info);
    // TODO: connect server signals
    m_server->socketConnect();

    bool success;
    success = connect(m_server, SIGNAL(mapChunkUpdated(QSharedPointer<Chunk>)), this, SLOT(handleMapChunkUpdated(QSharedPointer<Chunk>)));
    Q_ASSERT(success);
    m_target_time_msecs = (double)QDateTime::currentMSecsSinceEpoch();
    QTimer::singleShot(1, this, SLOT(mainLoop()));
}

void GameWidget::mainLoop()
{
    // until we catch up to where we want to be
    double current_time_msecs = (double)QDateTime::currentMSecsSinceEpoch();
    while (m_target_time_msecs < current_time_msecs) {
        // process events
        QApplication::processEvents(QEventLoop::ExcludeSocketNotifiers);

        m_target_time_msecs += c_time_per_frame_msecs;
        computeNextFrame();
    }
    glDraw();
    // compute the time we need to wait until computing the next frame
    double wait_time_msecs = m_target_time_msecs + c_time_per_frame_msecs - current_time_msecs;

    QTimer::singleShot((int)wait_time_msecs, this, SLOT(mainLoop()));
}

void GameWidget::handleMapChunkUpdated(QSharedPointer<Chunk>chunk)
{
    Chunk::Coord chunk_key;
    chunk_key.x = chunk.data()->position().x & 0xf;
    chunk_key.y = chunk.data()->position().y & 0xf;
    chunk_key.z = chunk.data()->position().z & 0xff; // always 0
    QSharedPointer<Chunk> existing_chunk = m_chunks.value(chunk_key, QSharedPointer<Chunk>());
    if (existing_chunk.isNull()) {
        existing_chunk = QSharedPointer<Chunk>(new Chunk(chunk_key, Chunk::Coord(16, 16, 128)));
        m_chunks.insert(chunk_key, existing_chunk);
        qDebug() << "chunk count: " << m_chunks.size();
    }

    Chunk::Coord relative_position;
    for (relative_position.x = 0; relative_position.x < chunk.data()->size().x; relative_position.x++) {
        for (relative_position.y = 0; relative_position.y < chunk.data()->size().y; relative_position.y++) {
            for (relative_position.z = 0; relative_position.z < chunk.data()->size().z; relative_position.z++) {
                Chunk::Coord existing_position = chunk.data()->position() + relative_position;
                existing_chunk.data()->getBlock(existing_position).data()->type = chunk.data()->getBlock(relative_position).data()->type;
                existing_chunk.data()->updateBlock(existing_position);
            }
        }
    }
}

void GameWidget::computeNextFrame()
{

    //  move the player
    bool forward = m_key_down.value(m_control_to_key.value(Forward));
    bool backward = m_key_down.value(m_control_to_key.value(Back));
    bool left = m_key_down.value(m_control_to_key.value(Left));
    bool right = m_key_down.value(m_control_to_key.value(Right));

    if (forward && ! backward) {
        // move camera forward in direction it is facing
        m_camera->moveForward(2.0f);
    } else if (backward && ! forward) {
        // move camera backward in direction it is facing
        m_camera->moveBackward(2.0f);
    }

    if (left && ! right) {
        // strafe camera left
        m_camera->moveLeft(2.0f);
    } else if (right && ! left) {
        // strafe camera right
        m_camera->moveRight(2.0f);
    }
}

void GameWidget::paintGL()
{
    glClear(GL_COLOR_BUFFER_BIT | GL_DEPTH_BUFFER_BIT);

    // build projection
    glMatrixMode(GL_PROJECTION);
    glLoadIdentity();
    gluPerspective(60, (float)this->width() / (float)this->height(), 1, 1000);

    // build camera
    glMatrixMode(GL_MODELVIEW);
    glLoadIdentity();
    m_camera->applyTransformations();

    // draw chunks
    QHashIterator<Chunk::Coord, QSharedPointer<Chunk> > it(m_chunks);
    while (it.hasNext()) {
        it.next();
        it.value().data()->render();
    }
}

void GameWidget::resizeGL(int width, int height)
{
    glViewport(0, 0, width, height);
}

void GameWidget::initializeGL()
{
    qglClearColor(Qt::black);
    glShadeModel(GL_SMOOTH);
    glEnable(GL_DEPTH_TEST);
    glDepthFunc(GL_LESS);
    glEnable(GL_CULL_FACE);
    glFrontFace(GL_CCW);

    glEnable(GL_LIGHTING);
    glEnable(GL_LIGHT0);
    glEnable(GL_COLOR_MATERIAL);
    glEnable(GL_NORMALIZE);
    const GLfloat goodAmbientLight[]  = { 1.0f, 1.0f, 1.0f, 1.0f };
    glLightfv(GL_LIGHT0, GL_AMBIENT, goodAmbientLight);

    glColorMaterial(GL_FRONT, GL_AMBIENT);

    glEnable(GL_BLEND);
    glBlendFunc(GL_SRC_ALPHA, GL_ONE_MINUS_SRC_ALPHA);
    glEnable(GL_ALPHA_TEST);
    glAlphaFunc(GL_GREATER, 0.6f);

    m_player = new Entity;
    m_player->pos = Vec3<float>(0, 0, 69*16);
    m_player->up = Vec3<float>(0, 0, 1);
    m_player->look = Vec3<float>(1,1,0);
    m_camera = new Camera(m_player->pos, m_player->up, m_player->look);
}

void GameWidget::mousePressEvent(QMouseEvent *)
{

}

void GameWidget::mouseMoveEvent(QMouseEvent * e)
{
    QPoint center(this->width() / 2, this->height() / 2);
    QPoint delta = e->pos() - center;

    if (delta.manhattanLength() > 0) {
        QCursor::setPos(this->mapToGlobal(center));
        m_camera->pointRight(delta.x() / 500.0f);
        m_camera->pointDown(delta.y() / 500.0f);
    }
}

void GameWidget::mouseReleaseEvent(QMouseEvent *)
{

}

void GameWidget::keyPressEvent(QKeyEvent * e)
{
    m_key_down.insert(e->key(), true);
}

void GameWidget::keyReleaseEvent(QKeyEvent * e)
{
    m_key_down.insert(e->key(), false);
}
