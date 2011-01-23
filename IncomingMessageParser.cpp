#include "IncomingMessageParser.h"

const int IncomingMessageParser::c_read_timeout_ms = 2000;

IncomingMessageParser::IncomingMessageParser(QIODevice *device) :
    m_device(device),
    m_in_progress_msg(NULL)
{
    bool success;
    success = connect(m_device, SIGNAL(readyRead()), this, SLOT(readMessage()), Qt::QueuedConnection);
    Q_ASSERT(success);
}

void IncomingMessageParser::readMessage()
{
    // transfer socket data to our buffer
    m_buffer.append(m_device->readAll());
    // flush any messages we can from out buffer
    forever {
        if (m_in_progress_msg == NULL) {
            // we'll always have at least 1 byte here
            qint8 type = m_buffer.at(0);
            m_in_progress_msg = createMessageOfType((Message::MessageType)type);
        }
        int index = m_in_progress_msg->parse(m_buffer);
        if (index == -1)
            return; // not done yet
        // message is complete. remove it from the buffer
        m_buffer.remove(0, index);
        // emit and start over.
        emit messageReceived(QSharedPointer<IncomingMessage>(m_in_progress_msg));
        m_in_progress_msg = NULL;
        if (m_buffer.isEmpty())
            return;
    }
}

IncomingMessage * IncomingMessageParser::createMessageOfType(IncomingMessage::MessageType type)
{
    switch (type) {
    case Message::Handshake:
        return new HandshakeResponseMessage;
    default:
        Q_ASSERT(false);
        return NULL;
    }
}
