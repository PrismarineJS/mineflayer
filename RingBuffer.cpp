#include "RingBuffer.h"

RingBuffer::RingBuffer(qint64 size, QObject *parent) :
    QIODevice(parent),
    m_buffer(NULL),
    m_readHead(0),
    m_writeHead(0)
{
    setBufferSize(size);
}

RingBuffer::~RingBuffer()
{
    delete m_buffer;
}

bool RingBuffer::reset()
{
    m_readHead = 0;
    m_writeHead = 0;
    return true;
}

void RingBuffer::setBufferSize(qint64 size)
{
    m_size = size;

    delete[] m_buffer;
    m_buffer = new char[size];
}

qint64 RingBuffer::readData(char *data, qint64 maxlen)
{
    if (m_readHead == m_writeHead)
        return 0;

    // don't read past write head
    qint64 readable_dist = (m_writeHead > m_readHead) ?
                           (m_writeHead - m_readHead) :
                           (m_size - m_readHead + m_writeHead);
    qint64 amt_to_read = qMin(maxlen, readable_dist);

    // don't read past end of buffer
    qint64 end_dist = m_size - m_readHead;
    qint64 first_chunk_len = qMin(amt_to_read, end_dist);
    qint64 second_chunk_len = amt_to_read - end_dist;

    if (first_chunk_len >= 1)
        memcpy(data, &m_buffer[m_readHead], first_chunk_len);
    if (second_chunk_len >= 1)
        memcpy(&data[first_chunk_len], m_buffer, second_chunk_len);

    m_readHead = (m_readHead + amt_to_read) % m_size;

    return amt_to_read;
}

qint64 RingBuffer::writeData(const char *data, qint64 len)
{
    // don't write past read head
    qint64 writable_dist = (m_readHead > m_writeHead) ?
                           (m_readHead - m_writeHead) :
                           (m_size - m_writeHead + m_readHead);
    qint64 amt_to_write = qMin(len, writable_dist);

    // don't write past end of buffer
    qint64 end_dist = m_size - m_writeHead;
    qint64 first_chunk_len = qMin(amt_to_write, end_dist);
    qint64 second_chunk_len = amt_to_write - end_dist;

    if (first_chunk_len >= 1)
        memcpy(&m_buffer[m_writeHead], data, first_chunk_len);
    if (second_chunk_len >= 1)
        memcpy(m_buffer, &data[first_chunk_len], second_chunk_len);

    m_writeHead = (m_writeHead + amt_to_write) % m_size;

    emit bytesWritten(amt_to_write);
    emit readyRead();
    return amt_to_write;
}
