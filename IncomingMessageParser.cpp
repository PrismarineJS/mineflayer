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
        emit messageReceived(QSharedPointer<IncomingResponse>(m_in_progress_msg));
        m_in_progress_msg = NULL;
        if (m_buffer.isEmpty())
            return;
    }
}

IncomingResponse * IncomingMessageParser::createMessageOfType(IncomingResponse::MessageType type)
{
    switch (type) {
    case Message::KeepAlive:
        return new KeepAliveResponse;
    case Message::Login:
        return new LoginRespsonse;
    case Message::Handshake:
        return new HandshakeResponse;
    case Message::Chat:
        return new ChatResponse;
    case Message::TimeUpdate:
        return new TimeUpdateResponse;
    case Message::EntityEquipment:
        return new EntityEquipmentResponse;
    case Message::SpawnPosition:
        return new SpawnPositionResponse;
    case Message::UpdateHealth:
        return new UpdateHealthResponse;
    case Message::PlayerPositionAndLook:
        return new PlayerPositionAndLookResponse;
    case Message::Animation:
        return new AnimationResponse;
    case Message::NamedEntitySpawn:
        return new NamedEntitySpawnResponse;
    case Message::PickupSpawn:
        return new PickupSpawnResponse;
    case Message::CollectItem:
        return new CollectItemResponse;
    case Message::AddObjectOrVehicle:
        return new AddObjectOrVehicleResponse;
    case Message::MobSpawn:
        return new MobSpawnResponse;
    case Message::EntityVelocity:
        return new EntityVelocityResponse;
    case Message::DestroyEntity:
        return new DestroyEntityResponse;
    case Message::Entity:
        return new EntityResponse;
    case Message::EntityRelativeMove:
        return new EntityRelativeMoveResponse;
    case Message::EntityLook:
        return new EntityLookResponse;
    case Message::EntityLookAndRelativeMove:
        return new EntityLookAndRelativeMoveResponse;
    case Message::EntityTeleport:
        return new EntityTeleportResponse;
    case Message::EntityStatus:
        return new EntityStatusResponse;
    case Message::EntityMetadata:
        return new EntityMetadataResponse;
    case Message::PreChunk:
        return new PreChunkResponse;
    case Message::MapChunk:
        return new MapChunkResponse;
    case Message::MultiBlockChange:
        return new MultiBlockChangeResponse;
    case Message::BlockChange:
        return new BlockChangeResposne;
    case Message::Explosion:
        return new ExplosionResponse;
    case Message::SetSlot:
        return new SetSlotResponse;
    case Message::WindowItems:
        return new WindowItemsResponse;
    case Message::DisconnectOrKick:
        return new DisconnectOrKickResponse;
    default:
        Q_ASSERT_X(false, "", (QString("parse message: 0x") + QString::number(type, 16)).toStdString().c_str());
        return NULL;
    }
}
