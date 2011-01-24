#ifndef GAMEWIDGET_H
#define GAMEWIDGET_H

#include "Chunk.h"

#include <QGLWidget>
#include <QHash>
#include <QSharedPointer>
#include <QLinkedList>
#include <QKeyEvent>

#include <OpenEXR/ImathVec.h>
using namespace Imath;

class Camera;

class GameWidget : public QGLWidget
{
    Q_OBJECT
public:
    enum Control {
        Forward,
        Back,
        Left,
        Right,
        Jump,
        Crouch,
        DiscardItem,
        Action1, // left click
        Action2, // right click
        Inventory,
        Chat,
    };

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
    void keyPressEvent(QKeyEvent *);
    void keyReleaseEvent(QKeyEvent *);

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

    // keeps track of the keyboard state
    QHash<int, bool> m_key_down;
    // maps Qt::Key to Control and vice versa
    QHash<int, Control> m_key_to_control;
    QHash<Control, int> m_control_to_key;

    static const int c_fps;
    static const double c_time_per_frame_msecs;
    double m_target_time_msecs;

private slots:
    void mainLoop();

private:
    void computeNextFrame();
    void loadControls();
};

#endif // GAMEWIDGET_H
