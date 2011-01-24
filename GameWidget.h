#ifndef GAMEWIDGET_H
#define GAMEWIDGET_H

#include "Chunk.h"

#include <QGLWidget>
#include <QHash>
#include <QSharedPointer>
#include <QLinkedList>

#include <OpenEXR/ImathVec.h>
using namespace Imath;

class Camera;

class GameWidget : public QGLWidget
{
    Q_OBJECT

public:
    explicit GameWidget(QWidget *parent = 0);
    ~GameWidget();

    void start(QString user, QString password, QString server);

protected:
    void paintGL();
    void resizeGL(int w, int h);
    void initializeGL();
    void mouseMoveEvent(QMouseEvent *);
    void mousePressEvent(QMouseEvent *);
    void mouseReleaseEvent(QMouseEvent *);

private:

    struct Entity {
        Vec3<float> pos;
        Vec3<float> up;
        Vec3<float> look;
        double stance;
        bool on_ground;
    };

    QHash<Chunk::Coord, QSharedPointer<Chunk> > m_chunks;
    QLinkedList<QSharedPointer<Entity> > m_entities;
    Camera * m_camera;
    Entity * m_player;
};

#endif // GAMEWIDGET_H
