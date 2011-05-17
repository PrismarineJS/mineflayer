#include "PhysicsDoer.h"

#include <QDebug>

const int PhysicsDoer::c_physics_fps = 20;


PhysicsDoer::PhysicsDoer(mineflayer_GamePtr game) :
    m_game(game),
    m_physics_timer(NULL)
{
    // run in our own thread
    m_thread = new QThread();
    m_thread->start();
    this->moveToThread(m_thread);
}

void PhysicsDoer::doPhysics()
{
    float elapsed_time = m_physics_time.restart() / 1000.0f;
    mineflayer_doPhysics(m_game, elapsed_time);
}

void PhysicsDoer::start()
{
    if (QThread::currentThread() != m_thread) {
        bool success;
        success = QMetaObject::invokeMethod(this, "start", Qt::QueuedConnection);
        Q_ASSERT(success);
        return;
    }
    m_physics_timer = new QTimer(this);

    bool success;
    success = connect(m_physics_timer, SIGNAL(timeout()), this, SLOT(doPhysics()));
    Q_ASSERT(success);

    m_physics_time.start();
    m_physics_timer->start(1000 / c_physics_fps);
}

