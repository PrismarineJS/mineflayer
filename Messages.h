#ifndef MESSAGES_H
#define MESSAGES_H

#include <QString>
#include <QDataStream>


class Message {
public:
    enum MessageType {
        KeepAlive=0x00,
        LoginRequest=0x01,
        Handshake=0x02,
        Chat=0x03,
        TimeUpdate=0x04,
        EntityEquipment=0x05,
        SpawnPosition=0x06,
        UseEntity=0x07,
        UpdateHealth=0x08,
        Respawn=0x09,
        Player=0x0A,
        PlayerPosition=0x0B,
        PlayerLook=0x0C,
        PlayerPositionAndLook=0x0D,
        PlayerDigging=0x0E,
        PlayerBlockPlacement=0x0F,
        HoldingChange=0x10,
        Animation=0x12,
        EntityAction=0x13,
        NamedEntitySpawn=0x14,
        PickupSpawn=0x15,
        CollectItem=0x16,
        AddObjectOrVehicle=0x17,
        MobSpawn=0x18,
        EntityPainting=0x19,
        EntityVelocity=0x1C,
        DestroyEntity=0x1D,
        Entity=0x1E,
        EntityRelativeMove=0x1F,
        EntityLook=0x20,
        EntityLookAndRelativeMove=0x21,
        EntityTeleport=0x22,
        EntityStatus=0x26,
        AttachEntity=0x27,
        EntityMetadata=0x28,
        PreChunk=0x32,
        MapChunk=0x33,
        MultiBlockChange=0x34,
        BlockChange=0x35,
        PlayNoteBlock=0x36,
        Explosion=0x3C,
        OpenWindow=0x64,
        CloseWindow=0x65,
        WindowClick=0x66,
        SetSlot=0x67,
        WindowItems=0x68,
        UpdateProgressBar=0x69,
        Transaction=0x6A,
        UpdateSign=0x82,
        DisconnectOrKick=0xFF,

        DummyDisconnect=-1,
    };

    MessageType messageType;

protected:
    Message(MessageType messageType) : messageType(messageType) {}
};

class OutgoingMessage : public Message {
public:
    virtual ~OutgoingMessage() {}
    void writeToStream(QDataStream & stream);
protected:
    OutgoingMessage(MessageType messageType) : Message(messageType) {}
    virtual void writeMessageBody(QDataStream & stream) = 0;
    static void writeString(QDataStream & stream, QString string);
};

class KeepAliveMessage : public OutgoingMessage {
public:
    KeepAliveMessage() : OutgoingMessage(KeepAlive) {}
};

class LoginRequestMessage : public OutgoingMessage {
public:
    QString username;
    QString password;
    LoginRequestMessage(QString username, QString password) : OutgoingMessage(LoginRequest),
        username(username), password(password) {}
};

class HandshakeRequestMessage : public OutgoingMessage {
public:
    QString username;
    HandshakeRequestMessage(QString username) : OutgoingMessage(Handshake),
        username(username) {}
    virtual void writeMessageBody(QDataStream & stream);
};


class DummyDisconnectMessage : public OutgoingMessage {
public:
    DummyDisconnectMessage() : OutgoingMessage(DummyDisconnect) {}
    virtual void writeMessageBody(QDataStream &) {};
};

class IncomingMessage : public Message {
public:
    virtual ~IncomingMessage() {}
    // attempts to parse entire message from the beginning of the buffer.
    // returns length of message parsed, or -1 if message is not compelte.
    virtual int parse(QByteArray buffer) = 0;
protected:
    IncomingMessage(MessageType messageType) : Message(messageType) {}

    int parseInt16(QByteArray buffer, int index, qint16 & string);
    // parses a string from buffer at index into the string parameter.
    // returns the next index after the string or -1.
    int parseString(QByteArray buffer, int index, QString & string);
};

class HandshakeResponseMessage : public IncomingMessage {
public:
    QString connectionHash;
    HandshakeResponseMessage() : IncomingMessage(Handshake) {}
    virtual int parse(QByteArray buffer);
};

#endif // MESSAGES_H
