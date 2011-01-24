#ifndef INCOMINGMESSAGEPARSER_H
#define INCOMINGMESSAGEPARSER_H

#include "Messages.h"

#include <QObject>
#include <QIODevice>
#include <QSharedPointer>

class IncomingMessageParser : public QObject
{
    Q_OBJECT
public:
    IncomingMessageParser(QIODevice * device);

signals:
    // emitted when we gather enough data to put together a message
    void messageReceived(QSharedPointer<IncomingMessage> msg);

private:
    static const int c_read_timeout_ms;
    static IncomingMessage * createMessageOfType(Message::MessageType type);

    QIODevice * m_device;
    QByteArray m_buffer;
    IncomingMessage * m_in_progress_msg;

private slots:
    void readMessage();
};

#endif // INCOMINGMESSAGEPARSER_H
