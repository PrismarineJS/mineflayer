#ifndef RINGBUFFER_H
#define RINGBUFFER_H

#include <QtCore/QIODevice>
#include <QtCore/QByteArray>

class RingBuffer : public QIODevice
{
    Q_OBJECT
public:
    explicit RingBuffer(qint64 size = 1024 * 1024, QObject *parent = 0);
    ~RingBuffer();

    // sets the amount of memory to use. destroys the buffer and rebuilds it,
    // so don't do this while using it.
    void setBufferSize(qint64 size);
    qint64 bufferSize() const {return m_size; }

    // no seeking allowed
    bool isSequential() const {return true;}

    bool reset();

private:
    // buffer size
    qint64 m_size;

    // actual buffer
    char * m_buffer;

    // the next location we will read or write from
    qint64 m_readHead;
    qint64 m_writeHead;

    qint64 readData(char *data, qint64 maxlen);
    qint64 writeData(const char *data, qint64 len);
};

#endif // RINGBUFFER_H
