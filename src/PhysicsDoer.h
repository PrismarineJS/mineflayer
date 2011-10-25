#ifndef PHYSICSDOER_H
#define PHYSICSDOER_H

#include "Game.h"

#include <QObject>
#include <QTimer>
#include <QTime>
#include <QThread>

class PhysicsDoer : public QObject {
    Q_OBJECT
public:
    PhysicsDoer(Game * game);
public slots:
    void start();
private:
    static const int c_physics_fps;

    Game * m_game;
    QTimer * m_physics_timer;
    QTime m_physics_time;
    QThread * m_thread;
private slots:
    void doPhysics();
};


#endif // PHYSICSDOER_H
