#ifndef PHYSICSDOER_H
#define PHYSICSDOER_H

#include "mineflayer-core.h"

#include <QObject>
#include <QTimer>
#include <QTime>
#include <QThread>

class PhysicsDoer : public QObject {
    Q_OBJECT
public:
    PhysicsDoer(mineflayer_GamePtr game);
public slots:
    void start();
private:
    static const int c_physics_fps;

    mineflayer_GamePtr m_game;
    QTimer * m_physics_timer;
    QTime m_physics_time;
    QThread * m_thread;
private slots:
    void doPhysics();
};


#endif // PHYSICSDOER_H
