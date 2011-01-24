#include "GameWidget.h"

#include "Camera.h"

#include <QtGlobal>
#include <QTimer>
#include <QApplication>
#include <QDateTime>

const int GameWidget::c_fps = 60;
const double GameWidget::c_time_per_frame_msecs = 1.0 / (double)c_fps * 1000.0;

GameWidget::GameWidget(QWidget *parent) :
    QGLWidget(parent),
    m_camera(NULL),
    m_player(NULL)
{
    this->setMouseTracking(true);
}

GameWidget::~GameWidget()
{
    delete m_camera;
    delete m_player;
}

void GameWidget::start(QString user, QString password, QString server)
{
    // TODO: connect to the server

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

void GameWidget::computeNextFrame()
{
    // TODO
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
        it.value().data()->draw();
    }
}

void GameWidget::resizeGL(int width, int height)
{
    int side = qMin(width, height);
    glViewport((width - side) / 2, (height - side) / 2, side, side);
}

void GameWidget::initializeGL()
{
    qglClearColor(Qt::black);
    glShadeModel(GL_SMOOTH);
    glEnable(GL_DEPTH_TEST);
    glDepthFunc(GL_LESS);
    glEnable(GL_CULL_FACE);
    glFrontFace(GL_CCW);
    glEnable(GL_TEXTURE_2D);
    glPixelStorei(GL_UNPACK_ALIGNMENT, 1);

    glEnable(GL_LIGHTING);
    glEnable(GL_LIGHT0);
    glEnable(GL_COLOR_MATERIAL);
    glEnable(GL_NORMALIZE);
    const GLfloat goodAmbientLight[]  = { 0.3f, 0.3f, 0.3f, 1.0f };
    glLightfv(GL_LIGHT0, GL_AMBIENT, goodAmbientLight);

    // Texture::setFilterMode(Texture::FilterModeSimple);
    glColorMaterial(GL_FRONT, GL_AMBIENT);

    m_player = new Entity;
    m_player->pos = Vec3<float>(10, 10, 2);
    m_player->up = Vec3<float>(0, 0, 1);
    m_player->look = Vec3<float>(1,1,0);
    m_camera = new Camera(m_player->pos, m_player->up, m_player->look);
}

void GameWidget::mousePressEvent(QMouseEvent *)
{

}

void GameWidget::mouseMoveEvent(QMouseEvent *)
{

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
