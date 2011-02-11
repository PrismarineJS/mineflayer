#ifndef BLOCKINGPRIORITYQUEUE_H
#define BLOCKINGPRIORITYQUEUE_H

#include <QMutex>
#include <QWaitCondition>
#include <QMap>
#include <QSet>

template <class T>
class BlockingPriorityQueue
{
public:
    BlockingPriorityQueue();
    ~BlockingPriorityQueue();

    T dequeue();
    void enqueue(const T & t, int priority);
private:
    QMutex m_wait_mutex;
    QWaitCondition m_wait_condition;

    // priority queue for chunk updates. maps priority to set of sub chunk coords
    QMap<int, QSet<T> * > m_priority_map;
};

template <class T>
BlockingPriorityQueue::BlockingPriorityQueue()
{
}

template <class T>
BlockingPriorityQueue::~BlockingPriorityQueue()
{
    for (QMap<int, QSet<T> * >::iterator map_it = m_priority_map.begin();
        map_it != m_priority_map.end(); map_it++)
    {
        delete m_priority_map.value(map_it.key(), NULL);
    }
}

template <class T>
T BlockingPriorityQueue::dequeue()
{
    QMutexLocker locker(&m_wait_mutex);
    m_wait_condition.wait(&m_wait_mutex);

    QMap<int, QSet<T> * >::iterator map_it = m_priority_map.begin();
    QSet<T> * set = map_it.value();
    QSet<T>::iterator set_it = set->begin();
    T value = *set_it;
    set->remove(value);
    if (set->isEmpty()) {
        delete set;
        m_priority_map.remove(map_it.key());
    }
    return value;
}

template <class T>
void BlockingPriorityQueue::enqueue(const T &t, int priority)
{
    QSet<T> * set = m_priority_map.value(priority, NULL);
    if (set == NULL) {
        set = new QSet<T>();
        m_priority_map.insert(priority, set);
    }
    set->insert(t);

    m_wait_condition.wakeOne();
}

#endif // BLOCKINGPRIORITYQUEUE_H
