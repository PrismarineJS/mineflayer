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
        if (m_buffer.isEmpty())
            return;
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
        if (false) {
            qDebug() << "incoming:" << m_in_progress_msg->messageType << "length:" << index;
        }
        // emit and start over.
        emit messageReceived(QSharedPointer<IncomingResponse>(m_in_progress_msg));
        m_in_progress_msg = NULL;
    }
}

IncomingResponse * IncomingMessageParser::createMessageOfType(IncomingResponse::MessageType type)
{
    switch (type) {
    case Message::KeepAlive: return new KeepAliveResponse;
    case Message::Login: return new LoginResponse;
    case Message::Handshake: return new HandshakeResponse;
    case Message::Chat: return new ChatResponse;
    case Message::TimeUpdate: return new TimeUpdateResponse;
    case Message::EntityEquipment: return new EntityEquipmentResponse;
    case Message::SpawnPosition: return new SpawnPositionResponse;
    case Message::BedAnimation: return new BedAnimationResponse;
    case Message::UseEntity: return new UseEntityResponse;
    case Message::UpdateHealth: return new UpdateHealthResponse;
    case Message::Respawn: return new RespawnResponse;
    case Message::PlayerPositionAndLook: return new PlayerPositionAndLookResponse;
    case Message::PlayerDigging: return new PlayerDiggingResponse;
    case Message::PlayerBlockPlacement: return new PlayerBlockPlacementResponse;
    case Message::HoldingChange: return new HoldingChangeResponse;
    case Message::Animation: return new AnimationResponse;
    case Message::EntityAction: return new EntityActionResponse;
    case Message::NamedEntitySpawn: return new NamedEntitySpawnResponse;
    case Message::PickupSpawn: return new PickupSpawnResponse;
    case Message::CollectItem: return new CollectItemResponse;
    case Message::AddObjectOrVehicle: return new AddObjectOrVehicleResponse;
    case Message::MobSpawn: return new MobSpawnResponse;
    case Message::EntityPainting: return new EntityPaintingResponse;
    case Message::ExperienceOrb: return new ExperienceOrbResponse;
    case Message::EntityVelocity: return new EntityVelocityResponse;
    case Message::DestroyEntity: return new DestroyEntityResponse;
    case Message::Entity: return new EntityResponse;
    case Message::EntityRelativeMove: return new EntityRelativeMoveResponse;
    case Message::EntityLook: return new EntityLookResponse;
    case Message::EntityLookAndRelativeMove: return new EntityLookAndRelativeMoveResponse;
    case Message::EntityTeleport: return new EntityTeleportResponse;
    case Message::EntityHeadLook: return new EntityHeadLookResponse;
    case Message::EntityStatus: return new EntityStatusResponse;
    case Message::AttachEntity: return new AttachEntityResponse;
    case Message::EntityMetadata: return new EntityMetadataResponse;
    case Message::EntityEffect: return new EntityEffectResponse;
    case Message::Experience: return new ExperienceResponse;
    case Message::RemoveEntityEffect: return new RemoveEntityEffectResponse;
    case Message::PreChunk: return new PreChunkResponse;
    case Message::MapChunk: return new MapChunkResponse;
    case Message::MultiBlockChange: return new MultiBlockChangeResponse;
    case Message::BlockChange: return new BlockChangeResponse;
    case Message::PlayNoteBlock: return new PlayNoteBlockResponse;
    case Message::InvalidBedOrStateChange: return new InvalidBedOrStateChangeResponse;
    case Message::LightningBolt: return new LightningBoltResponse;
    case Message::Explosion: return new ExplosionResponse;
    case Message::OpenWindow: return new OpenWindowResponse;
    case Message::CloseWindow: return new CloseWindowResponse;
    case Message::SetSlot: return new SetSlotResponse;
    case Message::WindowItems: return new WindowItemsResponse;
    case Message::UpdateProgressBar: return new UpdateProgressBarResponse;
    case Message::Transaction: return new TransactionResponse;
    case Message::CreativeInventoryAction: return new CreativeInventoryActionResponse;
    case Message::UpdateSign: return new UpdateSignResponse;
    case Message::IncrementStatistic: return new IncrementStatisticResponse;
    case Message::PlayerOnlineStatus: return new PlayerOnlineStatusResponse;
    case Message::DisconnectOrKick: return new DisconnectOrKickResponse;
    case Message::DoorChange: return new DoorChangeResponse;
    case Message::MapData: return new MapDataResponse;
    case Message::UpdateTileEntity: return new UpdateTileEntityResponse;
    case Message::PlayerAbilities: return new PlayerAbilitiesResponse;
    case Message::PluginMessage: return new PluginMessageResponse;

    case Message::Player:
    case Message::PlayerPosition:
    case Message::PlayerLook:
    case Message::WindowClick:
    case Message::EnchantItem:
        Q_ASSERT_X(false, "", (QString("client only message from server: 0x") + QString::number(type, 16)).toStdString().c_str());
        return NULL;
    }
    Q_ASSERT_X(false, "", (QString("parse message: 0x") + QString::number(type, 16)).toStdString().c_str());
    return NULL;
}
