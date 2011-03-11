#include "Game.h"

#include <QCoreApplication>
#include <QHashIterator>
#include <QStringList>

#include <cmath>
#include <limits>

const float Game::c_standard_max_ground_speed = 4.27; // according to the internet
const float Game::c_standard_terminal_velocity = 20.0; // guess
const float Game::c_standard_walking_acceleration = 100.0; // seems good
const float Game::c_standard_gravity = 27.0; // seems good
const float Game::c_standard_ground_friction = Game::c_standard_walking_acceleration * 0.9; // seems good
const float Game::c_player_apothem = 0.32; // notch's client F3 says 0.30, but that caused spankings
const float Game::c_player_height = 1.74; // tested with a binary search
const float Game::c_player_half_height = Game::c_player_height / 2;
const float Game::c_jump_speed = 8.2f; // seems good

const int Game::c_position_update_interval_ms = 50;
const int Game::c_chat_length_limit = 100;
const Int3D Game::c_chunk_size(16, 16, 128);
const Block Game::c_air(Item::Air, 0, 0, 0);

const int Game::c_inventory_count = 36;
const int Game::c_inventory_window_unique_count = 9;
const int Game::c_outside_window_slot = -999;


const Int3D Game::c_side_offset[] = {
    Int3D(0, -1, 0),
    Int3D(0, 1, 0),
    Int3D(0, 0, -1),
    Int3D(0, 0, 1),
    Int3D(-1, 0, 0),
    Int3D(1, 0, 0),
};

Game::Game(QUrl connection_info) :
    m_mutex(QMutex::Recursive),
    m_server(connection_info),
    m_position_update_timer(NULL),
    m_waiting_for_dig_confirmation(false),
    m_digging_animation_timer(NULL),
    m_player(-1, Server::EntityPosition(), connection_info.userName(), Item::NoItem),
    m_player_health(20),
    m_current_time_seconds(0),
    m_current_time_recorded_time(QTime::currentTime()),
    m_max_ground_speed(c_standard_max_ground_speed),
    m_terminal_velocity(c_standard_terminal_velocity),
    m_input_acceleration(c_standard_walking_acceleration),
    m_gravity(c_standard_gravity),
    m_ground_friction(c_standard_ground_friction),
    m_jump_was_pressed(false),
    m_return_code(0),
    m_inventory(c_inventory_count),
    m_next_action_id(0),
    m_equipped_slot_id(0),
    m_open_window_id(-1),
    m_need_to_emit_window_opened(false)
{
    Item::initializeStaticData();

    foreach (QChar c, QString(" !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_abcdefghijklmnopqrstuvwxyz{|}~⌂ÇüéâäàåçêëèïîìÄÅÉæÆôöòûùÿÖÜø£Ø×ƒáíóúñÑªº¿®¬½¼¡«»" ))
        m_legal_chat_chars.insert(c);

    bool success;
    success = connect(&m_server, SIGNAL(loginStatusUpdated(Server::LoginStatus)), this, SLOT(handleLoginStatusChanged(Server::LoginStatus)));
    Q_ASSERT(success);
    success = connect(&m_server, SIGNAL(loginCompleted(int)), this, SLOT(handleLoginCompleted(int)));
    Q_ASSERT(success);
    success = connect(&m_server, SIGNAL(playerPositionAndLookUpdated(Server::EntityPosition)), this, SLOT(handlePlayerPositionAndLookUpdated(Server::EntityPosition)));
    Q_ASSERT(success);
    success = connect(&m_server, SIGNAL(playerHealthUpdated(int)), this, SLOT(handlePlayerHealthUpdated(int)));
    Q_ASSERT(success);

    success = connect(&m_server, SIGNAL(namedPlayerSpawned(int,QString,Server::EntityPosition,Item::ItemType)), this, SLOT(handleNamedPlayerSpawned(int,QString,Server::EntityPosition,Item::ItemType)));
    Q_ASSERT(success);
    success = connect(&m_server, SIGNAL(pickupSpawned(int,Item,Server::EntityPosition)), this, SLOT(handlePickupSpawned(int,Item,Server::EntityPosition)));
    Q_ASSERT(success);
    success = connect(&m_server, SIGNAL(mobSpawned(int,MobSpawnResponse::MobType,Server::EntityPosition)), this, SLOT(handleMobSpawned(int,MobSpawnResponse::MobType,Server::EntityPosition)));
    Q_ASSERT(success);
    success = connect(&m_server, SIGNAL(entityDestroyed(int)), this, SLOT(handleEntityDestroyed(int)));
    Q_ASSERT(success);
    success = connect(&m_server, SIGNAL(entityMovedRelatively(int,Server::EntityPosition)), this, SLOT(handleEntityMovedRelatively(int,Server::EntityPosition)));
    Q_ASSERT(success);
    success = connect(&m_server, SIGNAL(entityLooked(int,Server::EntityPosition)), this, SLOT(handleEntityLooked(int,Server::EntityPosition)));
    Q_ASSERT(success);
    success = connect(&m_server, SIGNAL(entityLookedAndMovedRelatively(int,Server::EntityPosition)), this, SLOT(handleEntityLookedAndMovedRelatively(int,Server::EntityPosition)));
    Q_ASSERT(success);
    success = connect(&m_server, SIGNAL(entityMoved(int,Server::EntityPosition)), this, SLOT(handleEntityMoved(int,Server::EntityPosition)));
    Q_ASSERT(success);
    success = connect(&m_server, SIGNAL(animation(int,AnimationResponse::AnimationType)), this, SLOT(handleAnimation(int,AnimationResponse::AnimationType)));
    Q_ASSERT(success);

    success = connect(&m_server, SIGNAL(mapChunkUpdated(QSharedPointer<Chunk>)), this, SLOT(handleMapChunkUpdated(QSharedPointer<Chunk>)));
    Q_ASSERT(success);
    success = connect(&m_server, SIGNAL(multiBlockUpdate(Int3D,QHash<Int3D,Block>)), this, SLOT(handleMultiBlockUpdate(Int3D,QHash<Int3D,Block>)));
    Q_ASSERT(success);
    success = connect(&m_server, SIGNAL(blockUpdate(Int3D,Block)), this, SLOT(handleBlockUpdate(Int3D,Block)));
    Q_ASSERT(success);
    success = connect(&m_server, SIGNAL(signUpdated(Int3D,QString)), this, SLOT(handleSignUpdate(Int3D,QString)));
    Q_ASSERT(success);
    success = connect(&m_server, SIGNAL(chatReceived(QString)), this, SLOT(handleChatReceived(QString)));
    Q_ASSERT(success);
    success = connect(&m_server, SIGNAL(timeUpdated(double)), this, SLOT(handleTimeUpdated(double)));
    Q_ASSERT(success);

    success = connect(&m_server, SIGNAL(windowItemsUpdated(int,QVector<Item>)), this, SLOT(handleWindowItemsUpdated(int,QVector<Item>)));
    Q_ASSERT(success);
    success = connect(&m_server, SIGNAL(windowSlotUpdated(int,int,Item)), this, SLOT(handleWindowSlotUpdated(int,int,Item)));
    Q_ASSERT(success);
    success = connect(&m_server, SIGNAL(holdingChange(int)), this, SLOT(handleHoldingChange(int)));
    Q_ASSERT(success);
    success = connect(&m_server, SIGNAL(transaction(int,int,bool)), this, SLOT(handleTransaction(int,int,bool)));
    Q_ASSERT(success);
    success = connect(&m_server, SIGNAL(openWindow(int,Message::WindowType,int)), this, SLOT(handleOpenWindow(int,Message::WindowType,int)));
    Q_ASSERT(success);


    // pass directly through
    success = connect(&m_server, SIGNAL(unloadChunk(Int3D)), this, SLOT(handleUnloadChunk(Int3D)));
    Q_ASSERT(success);

    success = connect(this, SIGNAL(chunkUpdated(Int3D,Int3D)), this, SLOT(checkForDiggingStopped(Int3D,Int3D)));
    Q_ASSERT(success);
    success = connect(this, SIGNAL(chunkUpdated(Int3D,Int3D)), this, SLOT(checkForDestroyedSigns(Int3D,Int3D)));
    Q_ASSERT(success);

    m_control_state.fill(false, (int)ControlCount);
}

void Game::setControlActivated(Control control, bool activated)
{
    QMutexLocker locker(&m_mutex);
    m_control_state[control] = activated;
    if (activated && control == Jump)
        m_jump_was_pressed = true;

    if (activated && (control == Action1 || control == Action2)) {
        // TODO: raycast to figure out what block and face we are clicking on.

    }
}

void Game::updatePlayerLook(float delta_yaw, float delta_pitch)
{
    QMutexLocker locker(&m_mutex);
    m_player.position.yaw += delta_yaw;
    m_player.position.pitch += delta_pitch;
    emit playerPositionUpdated();
}
void Game::setPlayerLook(float yaw, float pitch)
{
    QMutexLocker locker(&m_mutex);
    m_player.position.yaw = yaw;
    m_player.position.pitch = pitch;
    emit playerPositionUpdated();
}
void Game::setPlayerPosition(const Double3D & pt)
{
    QMutexLocker locker(&m_mutex);
    m_player.position.pos = pt;
    emit playerPositionUpdated();
}

void Game::attackEntity(int entity_id)
{
    QMutexLocker locker(&m_mutex);
    m_server.sendClickEntity(m_player.entity_id, entity_id, false);
    m_server.sendAnimation(m_player.entity_id, Message::SwingArmAnimation);
}

void Game::respawn()
{
    QMutexLocker locker(&m_mutex);
    Q_ASSERT(m_player_health == 0);
    m_server.sendRespawnRequest();

    // assume this always works for now
    emit playerSpawned();
}

void Game::start()
{
    QMutexLocker locker(&m_mutex);
    m_server.socketConnect();
}

void Game::shutdown(int return_code)
{
    QMutexLocker locker(&m_mutex);

    m_return_code = return_code;
    m_server.finishWritingAndDisconnect();
}
QSharedPointer<Game::Entity> Game::entity(int entity_id)
{
    QMutexLocker locker(&m_mutex);
    if (entity_id == m_player.entity_id)
        return QSharedPointer<Entity>(m_player.clone());

    QSharedPointer<Entity> entity = m_entities.value(entity_id, QSharedPointer<Entity>());
    if (entity.isNull())
        return entity;
    return QSharedPointer<Entity>(entity.data()->clone());
}

Server::EntityPosition Game::playerPosition()
{
    QMutexLocker locker(&m_mutex);
    return m_player.position;
}

Block Game::blockAt(const Int3D & absolute_location)
{
    QMutexLocker locker(&m_mutex);
    Int3D chunk_key = chunkKey(absolute_location);
    QSharedPointer<Chunk> chunk = m_chunks.value(chunk_key, QSharedPointer<Chunk>());
    if (chunk.isNull())
        return c_air;
    Int3D relative_location = absolute_location - chunk_key;
    Block probable_value = chunk.data()->getBlock(relative_location);
    if (probable_value.type() == Item::Air && relative_location.z != 0) {
        Block maybe_a_fence = chunk.data()->getBlock(relative_location + Int3D(0, 0, -1));
        if (maybe_a_fence.type() == Item::Fence) {
            // say that the air immediately above a fence is also a fence.
            return maybe_a_fence;
        }
    }
    return probable_value;
}
QString Game::signTextAt(const Int3D &absolute_location)
{
    QMutexLocker locker(&m_mutex);
    return m_signs.value(absolute_location);
}

void Game::updateBlock(const Int3D & absolute_location, Block new_block)
{
    // no mutex locker; private function
    Q_ASSERT(isBlockLoaded(absolute_location));
    Int3D chunk_key = chunkKey(absolute_location);
    QSharedPointer<Chunk> chunk = m_chunks.value(chunk_key, QSharedPointer<Chunk>());
    if (chunk.isNull())
        return;
    chunk.data()->setBlock(absolute_location - chunk_key, new_block);
}

bool Game::isBlockLoaded(const Int3D &absolute_location)
{
    QMutexLocker locker(&m_mutex);
    Int3D chunk_key = chunkKey(absolute_location);
    return m_chunks.contains(chunk_key);
}

void Game::startDigging(const Int3D &block)
{
    QMutexLocker locker(&m_mutex);
    stopDigging();
    m_digging_location = block;
    m_server.sendDiggingStatus(Message::StartDigging, m_digging_location);
    m_server.sendDiggingStatus(Message::AbortDigging, m_digging_location);
    m_waiting_for_dig_confirmation = true;
    m_digging_animation_timer = new QTimer(this);
    m_digging_animation_timer->setInterval(1000 / 4); // guess
    bool success;
    success = connect(m_digging_animation_timer, SIGNAL(timeout()), this, SLOT(animateDigging()));
    Q_ASSERT(success);
    m_digging_animation_timer->start();
}

void Game::stopDigging()
{
    QMutexLocker locker(&m_mutex);
    delete m_digging_animation_timer;
    m_digging_animation_timer = NULL;
}

void Game::handleLoginStatusChanged(Server::LoginStatus status)
{
    QMutexLocker locker(&m_mutex);
    switch (status) {
        case Server::SocketError:
            qWarning() << "Game: Unable to connect to server";
            QCoreApplication::instance()->exit(1);
            break;
        case Server::Disconnected:
            qWarning() << "Game: Disconnected from server";
            QCoreApplication::instance()->exit(m_return_code);
            break;
        default:;
    }

    emit loginStatusUpdated(status);
}
void Game::handleLoginCompleted(int entity_id)
{
    QMutexLocker locker(&m_mutex);
    m_player.entity_id = entity_id;
}

void Game::handleChatReceived(QString message)
{
    QMutexLocker locker(&m_mutex);
    if (message.startsWith("<")) {
        // spoken chat
        int pos = message.indexOf(">");
        Q_ASSERT(pos != -1);
        QString username = message.mid(1, pos-1);
        QString content = message.mid(pos+2);
        // suppress talking to yourself
        if (username == m_player.username)
            return;
        emit chatReceived(username, content);
    } else {
        // non-spoken chat
        while (true) {
            // remove any color codes
            int index = message.indexOf(QChar(0xa7));
            if (index == -1)
                break;
            message = message.mid(0, index) + message.mid(index + 2);
        }
        emit nonSpokenChatReceived(message);
    }
}
void Game::handleTimeUpdated(double seconds)
{
    QMutexLocker locker(&m_mutex);
    m_current_time_seconds = seconds;
    m_current_time_recorded_time = QTime::currentTime();
    emit timeUpdated(seconds);
}

void Game::handlePlayerPositionAndLookUpdated(Server::EntityPosition position)
{
    QMutexLocker locker(&m_mutex);
    m_player.position.pos = position.pos;
    m_player.position.height = position.height;
    m_player.position.on_ground = position.on_ground;

    // apologize to the notchian server by echoing an identical position back

    m_server.sendPositionAndLook(m_player.position);

    if (m_position_update_timer == NULL) {
        // got first 0x0D. start the clocks
        m_player.position.yaw = position.yaw;
        m_player.position.pitch = position.pitch;

        m_position_update_timer = new QTimer(this);
        m_position_update_timer->setInterval(c_position_update_interval_ms);
        bool success;
        success = connect(m_position_update_timer, SIGNAL(timeout()), this, SLOT(sendPosition()));
        Q_ASSERT(success);
        m_position_update_timer->start();
        emit playerSpawned();
    }
    emit playerPositionUpdated();
}

void Game::handlePlayerHealthUpdated(int new_health)
{
    QMutexLocker locker(&m_mutex);
    m_player_health = new_health;
    if (m_player_health <= 0) {
        m_player_health = 0;
    }
    emit playerHealthUpdated();
    if (m_player_health == 0)
        emit playerDied();
}

void Game::handleNamedPlayerSpawned(int entity_id, QString player_name, Server::EntityPosition position, Item::ItemType held_item)
{
    QMutexLocker locker(&m_mutex);
    Entity * entity = new NamedPlayerEntity(entity_id, position, player_name, held_item);
    m_entities.insert(entity_id, QSharedPointer<Entity>(entity));
    emit entitySpawned(QSharedPointer<Entity>(entity->clone()));
}
void Game::handlePickupSpawned(int entity_id, Item item, Server::EntityPosition position)
{
    QMutexLocker locker(&m_mutex);
    Entity * entity = new PickupEntity(entity_id, position, item);
    m_entities.insert(entity_id, QSharedPointer<Entity>(entity));
    emit entitySpawned(QSharedPointer<Entity>(entity->clone()));
}
void Game::handleMobSpawned(int entity_id, MobSpawnResponse::MobType mob_type, Server::EntityPosition position)
{
    QMutexLocker locker(&m_mutex);
    switch (mob_type) {
        case MobSpawnResponse::Creeper:
        case MobSpawnResponse::Skeleton:
        case MobSpawnResponse::Zombie:
        case MobSpawnResponse::ZombiePigman:
            // humanoids get a human-ish height
            position.height = 1.62;
            break;
        default:
            break;
    }

    Entity * entity = new MobEntity(entity_id, position, mob_type);
    m_entities.insert(entity_id, QSharedPointer<Entity>(entity));
    emit entitySpawned(QSharedPointer<Entity>(entity->clone()));
}
void Game::handleEntityDestroyed(int entity_id)
{
    QMutexLocker locker(&m_mutex);
    QSharedPointer<Entity> entity = m_entities.take(entity_id);
    if (entity.isNull())
        return;
    emit entityDespawned(entity);
}
void Game::handleEntityMovedRelatively(int entity_id, Server::EntityPosition movement)
{
    QMutexLocker locker(&m_mutex);
    QSharedPointer<Entity> entity = m_entities.value(entity_id, QSharedPointer<Entity>());
    if (entity.isNull())
        return;
    entity.data()->position.pos += movement.pos;
    emit entityMoved(QSharedPointer<Entity>(entity.data()->clone()));
}
void Game::handleEntityLooked(int entity_id, Server::EntityPosition look)
{
    QMutexLocker locker(&m_mutex);
    QSharedPointer<Entity> entity = m_entities.value(entity_id, QSharedPointer<Entity>());
    if (entity.isNull())
        return;
    entity.data()->position.yaw = look.yaw;
    entity.data()->position.pitch = look.pitch;
    emit entityMoved(QSharedPointer<Entity>(entity.data()->clone()));
}
void Game::handleEntityLookedAndMovedRelatively(int entity_id, Server::EntityPosition position)
{
    QMutexLocker locker(&m_mutex);
    QSharedPointer<Entity> entity = m_entities.value(entity_id, QSharedPointer<Entity>());
    if (entity.isNull())
        return;
    entity.data()->position.pos += position.pos;
    entity.data()->position.yaw = position.yaw;
    entity.data()->position.pitch = position.pitch;
    emit entityMoved(QSharedPointer<Entity>(entity.data()->clone()));
}
void Game::handleEntityMoved(int entity_id, Server::EntityPosition position)
{
    QMutexLocker locker(&m_mutex);
    QSharedPointer<Entity> entity = m_entities.value(entity_id, QSharedPointer<Entity>());
    if (entity.isNull())
        return;
    entity.data()->position.pos = position.pos;
    emit entityMoved(QSharedPointer<Entity>(entity.data()->clone()));
}
void Game::handleAnimation(int entity_id, AnimationResponse::AnimationType animation_type)
{
    QMutexLocker locker(&m_mutex);
    QSharedPointer<Entity> entity = m_entities.value(entity_id, QSharedPointer<Entity>());
    if (entity.isNull())
        return;
    emit animation(QSharedPointer<Entity>(entity.data()->clone()), animation_type);
}

void Game::handleUnloadChunk(const Int3D &coord)
{
    QMutexLocker locker(&m_mutex);
    m_chunks.remove(chunkKey(coord));
    emit unloadChunk(coord);
}

void Game::handleMapChunkUpdated(QSharedPointer<Chunk>update)
{
    QMutexLocker locker(&m_mutex);
    // update can be smaller than a full size chunk, and can exceed the bounds of a chunk.
    Int3D update_position = update.data()->position();
    Int3D chunk_position = chunkKey(update_position);
    Int3D update_size = update.data()->size();
    if (chunkKey(update_position + update_size - Int3D(1,1,1)) != chunk_position) {
        qWarning() << "Ignoring cross-chunk map chunk update with start" <<
                update_position.x <<update_position.y <<update_position.z << "and size" <<
                update_size.x <<update_size.y <<update_size.z;
        return;
    }
    QSharedPointer<Chunk> chunk = m_chunks.value(chunk_position, QSharedPointer<Chunk>());
    if (chunk.isNull()) {
        // this better be a full chunk
        if (update_size != c_chunk_size) {
            // ignore initialization garbage fragments
            return;
        }
        chunk = QSharedPointer<Chunk>(new Chunk(chunk_position, c_chunk_size));
        m_chunks.insert(chunk_position, chunk);
    }
    Int3D chunk_to_update = update_position - chunk_position;
    Int3D update_offset, chunk_offset;
    for (update_offset.x = 0, chunk_offset.x = chunk_to_update.x; update_offset.x < update_size.x; update_offset.x++, chunk_offset.x++)
        for (update_offset.y = 0, chunk_offset.y = chunk_to_update.y; update_offset.y < update_size.y; update_offset.y++, chunk_offset.y++)
            for (update_offset.z = 0, chunk_offset.z = chunk_to_update.z; update_offset.z < update_size.z; update_offset.z++, chunk_offset.z++)
                chunk.data()->setBlock(chunk_offset, update.data()->getBlock(update_offset));

    emit chunkUpdated(update_position, update_size);
}
void Game::handleMultiBlockUpdate(Int3D chunk_key, QHash<Int3D, Block> new_blocks)
{
    QMutexLocker locker(&m_mutex);
    if (new_blocks.isEmpty())
        return;
    QSharedPointer<Chunk> chunk = m_chunks.value(chunk_key, QSharedPointer<Chunk>());
    if (chunk.isNull())
        return;
    Int3D min_corner = chunk_key + c_chunk_size;
    Int3D max_corner = chunk_key;
    QHashIterator<Int3D, Block> iterator(new_blocks);
    while (iterator.hasNext()) {
        Int3D absolute_location = iterator.key();
        Block new_block = iterator.value();
        // TODO: recalculate lighting :(
        new_block.setLight(7);
        new_block.setSkyLight(0);
        chunk.data()->setBlock(absolute_location - chunk_key, new_block);

        min_corner.x = std::min(min_corner.x, absolute_location.x);
        min_corner.y = std::min(min_corner.y, absolute_location.y);
        min_corner.z = std::min(min_corner.z, absolute_location.z);
        max_corner.x = std::max(max_corner.x, absolute_location.x);
        max_corner.y = std::max(max_corner.y, absolute_location.y);
        max_corner.z = std::max(max_corner.z, absolute_location.z);
    }
    emit chunkUpdated(min_corner, max_corner - min_corner + Int3D(1, 1, 1));
}
void Game::handleBlockUpdate(Int3D absolute_location, Block new_block)
{
    QMutexLocker locker(&m_mutex);

    Int3D chunk_key =  chunkKey(absolute_location);
    QSharedPointer<Chunk> chunk = m_chunks.value(chunk_key, QSharedPointer<Chunk>());
    if (chunk.isNull())
        return;
    // TODO: recalculate lighting :(
    new_block.setLight(7);
    new_block.setSkyLight(0);
    chunk.data()->setBlock(absolute_location - chunk_key, new_block);

    emit chunkUpdated(absolute_location, Int3D(1, 1, 1));
}
void Game::handleSignUpdate(Int3D absolute_location, QString text)
{
    QMutexLocker locker(&m_mutex);
    if (text == m_signs.value(absolute_location))
        return; // suppress no change
    m_signs.insert(absolute_location, text);
    emit signUpdated(absolute_location, text);
}

void Game::checkForDiggingStopped(const Int3D &start, const Int3D &size)
{
    QMutexLocker locker(&m_mutex);
    if (! m_waiting_for_dig_confirmation)
        return;
    Int3D end = start + size;
    if (start.x <= m_digging_location.x && start.y <= m_digging_location.y && start.z <= m_digging_location.z &&
        m_digging_location.x < end.x && m_digging_location.y < end.y && m_digging_location.z < end.z)
    {
        m_waiting_for_dig_confirmation = false;
        // if the new block is not diggable (air, water, etc.) then it worked.
        bool success = !Item::itemData(blockAt(m_digging_location).type())->diggable;
        m_server.sendDiggingStatus(Message::BlockBroken, m_digging_location);
        stopDigging();
        emit stoppedDigging(success ? BlockBroken : Aborted);

        qDebug() << "got confirmation from server" << success;
    }
}

void Game::checkForDestroyedSigns(const Int3D &start, const Int3D &size)
{
    QMutexLocker locker(&m_mutex);
    QList<Int3D> removed_signs;
    if (size == Int3D(1, 1, 1)) {
        // single block update
        if (!m_signs.contains(start))
            return; // wasn't a sign
        Block supposed_sign = blockAt(start);
        if (supposed_sign.type() == Item::SignPost_placed || supposed_sign.type() == Item::WallSign_placed)
            return; // still a sign
        removed_signs.append(start);
    } else {
        // multi block update
        foreach (Int3D location, m_signs.keys()) {
            if (!(start.x <= location.x && start.y <= location.y && start.z <= location.z &&
                  location.x < start.x + size.x && location.y < start.y + size.y && location.z < start.z + size.z))
                continue; // out of bounds
            Block supposed_sign = blockAt(location);
            if (supposed_sign.type() == Item::SignPost_placed || supposed_sign.type() == Item::WallSign_placed)
                continue; // still a sign
            removed_signs.append(location);
        }
    }
    foreach (Int3D location, removed_signs) {
        m_signs.remove(location);
        emit signUpdated(location, QString());
    }
}

Int3D Game::chunkKey(const Int3D &coord)
{
    return coord - (coord % c_chunk_size);
}

void Game::sendPosition()
{
    QMutexLocker locker(&m_mutex);
    m_server.sendPositionAndLook(m_player.position);
}
void Game::animateDigging()
{
    QMutexLocker locker(&m_mutex);
    m_server.sendAnimation(m_player.entity_id, Message::SwingArmAnimation);
}

void Game::doPhysics(float delta_seconds)
{
    if (delta_seconds < std::numeric_limits<float>::epsilon())
        return; // too fast!!

    QMutexLocker locker(&m_mutex);

    // derive xy movement vector from controls
    int movement_right = 0;
    if (m_control_state.at(Right))
        movement_right += 1;
    if (m_control_state.at(Left))
        movement_right -= 1;
    int movement_forward = 0;
    if (m_control_state.at(Forward))
        movement_forward += 1;
    if (m_control_state.at(Back))
        movement_forward -= 1;

    // acceleration is m/s/s
    Double3D acceleration;
    if (movement_forward || movement_right) {
        // input acceleration
        float rotation_from_input = std::atan2(movement_forward, movement_right) - Util::half_pi;
        float input_yaw = m_player.position.yaw + rotation_from_input;
        acceleration.x += std::cos(input_yaw) * m_input_acceleration;
        acceleration.y += std::sin(input_yaw) * m_input_acceleration;
    }

    // jumping
    if ((m_control_state.at(Jump) || m_jump_was_pressed) && m_player.position.on_ground)
        m_player.position.vel.z = c_jump_speed;
    m_jump_was_pressed = false;

    // gravity
    acceleration.z -= m_gravity;

    float old_ground_speed_squared = groundSpeedSquared();
    if (old_ground_speed_squared < std::numeric_limits<float>::epsilon()) {
        // stopped
        m_player.position.vel.x = 0;
        m_player.position.vel.y = 0;
    } else {
        // non-zero ground speed
        float old_ground_speed = std::sqrt(old_ground_speed_squared);
        float ground_friction = m_ground_friction;
        if (!m_player.position.on_ground)
            ground_friction *= 0.05; // half friction for the air
        if (ground_friction > old_ground_speed / delta_seconds) {
            // friction will stop the motion
            ground_friction = old_ground_speed / delta_seconds;
        }
        acceleration.x -= m_player.position.vel.x / old_ground_speed * ground_friction;
        acceleration.y -= m_player.position.vel.y / old_ground_speed * ground_friction;
    }

    // calculate new speed
    m_player.position.vel += acceleration * delta_seconds;

    // limit speed
    double ground_speed_squared = groundSpeedSquared();
    if (ground_speed_squared > m_max_ground_speed * m_max_ground_speed) {
        float ground_speed = std::sqrt(ground_speed_squared);
        float correction_scale = m_max_ground_speed / ground_speed;
        m_player.position.vel.x *= correction_scale;
        m_player.position.vel.y *= correction_scale;
    }
    if (m_player.position.vel.z < -m_terminal_velocity)
        m_player.position.vel.z = -m_terminal_velocity;
    else if (m_player.position.vel.z > m_terminal_velocity)
        m_player.position.vel.z = m_terminal_velocity;


    // calculate new positions and resolve collisions
    Int3D boundingBoxMin, boundingBoxMax;
    m_player.getBoundingBox(boundingBoxMin, boundingBoxMax);

    if (m_player.position.vel.x != 0) {
        m_player.position.pos.x += m_player.position.vel.x * delta_seconds;
        double forward_x_edge = m_player.position.pos.x + Util::sign(m_player.position.vel.x) * c_player_apothem;
        int block_x = (int)std::floor(forward_x_edge);
        if (collisionInRange(Int3D(block_x, boundingBoxMin.y, boundingBoxMin.z), Int3D(block_x, boundingBoxMax.y, boundingBoxMax.z))) {
            m_player.position.pos.x = block_x + (m_player.position.vel.x < 0 ? 1 + c_player_apothem : -c_player_apothem) * 1.001;
            m_player.position.vel.x = 0;
            m_player.getBoundingBox(boundingBoxMin, boundingBoxMax);
        }
    }

    if (m_player.position.vel.y != 0) {
        m_player.position.pos.y += m_player.position.vel.y * delta_seconds;
        int block_y = (int)std::floor(m_player.position.pos.y + Util::sign(m_player.position.vel.y) * c_player_apothem);
        if (collisionInRange(Int3D(boundingBoxMin.x, block_y, boundingBoxMin.z), Int3D(boundingBoxMax.x, block_y, boundingBoxMax.z))) {
            m_player.position.pos.y = block_y + (m_player.position.vel.y < 0 ? 1 + c_player_apothem : -c_player_apothem) * 1.001;
            m_player.position.vel.y = 0;
            m_player.getBoundingBox(boundingBoxMin, boundingBoxMax);
        }
    }

    m_player.position.on_ground = false;
    if (m_player.position.vel.z != 0) {
        m_player.position.pos.z += m_player.position.vel.z * delta_seconds;
        int block_z = (int)std::floor(m_player.position.pos.z + c_player_half_height + Util::sign(m_player.position.vel.z) * c_player_half_height);
        if (collisionInRange(Int3D(boundingBoxMin.x, boundingBoxMin.y, block_z), Int3D(boundingBoxMax.x, boundingBoxMax.y, block_z))) {
            m_player.position.pos.z = block_z + (m_player.position.vel.z < 0 ? 1 : -c_player_height) * 1.001;
            if (m_player.position.vel.z < 0)
                m_player.position.on_ground = true;
            m_player.position.vel.z = 0;
        }
    }

    // always emit update
    emit playerPositionUpdated();
}

void Game::NamedPlayerEntity::getBoundingBox(Int3D &boundingBoxMin, Int3D &boundingBoxMax) const
{
    boundingBoxMin.x = (int)std::floor(position.pos.x - Game::c_player_apothem);
    boundingBoxMin.y = (int)std::floor(position.pos.y - Game::c_player_apothem);
    boundingBoxMin.z = (int)std::floor(position.pos.z - 0);
    boundingBoxMax.x = (int)std::floor(position.pos.x + Game::c_player_apothem);
    boundingBoxMax.y = (int)std::floor(position.pos.y + Game::c_player_apothem);
    boundingBoxMax.z = (int)std::floor(position.pos.z + Game::c_player_height);
}

void Game::MobEntity::getBoundingBox(Int3D &boundingBoxMin, Int3D &boundingBoxMax) const
{
    // TODO: use the real bounding box instead of a human shape for all of them
    boundingBoxMin.x = (int)std::floor(position.pos.x - Game::c_player_apothem);
    boundingBoxMin.y = (int)std::floor(position.pos.y - Game::c_player_apothem);
    boundingBoxMin.z = (int)std::floor(position.pos.z - 0);
    boundingBoxMax.x = (int)std::floor(position.pos.x + Game::c_player_apothem);
    boundingBoxMax.y = (int)std::floor(position.pos.y + Game::c_player_apothem);
    boundingBoxMax.z = (int)std::floor(position.pos.z + Game::c_player_height);
}

void Game::PickupEntity::getBoundingBox(Int3D &boundingBoxMin, Int3D &boundingBoxMax) const
{
    boundingBoxMin.x = (int)std::floor(position.pos.x - 1);
    boundingBoxMin.y = (int)std::floor(position.pos.y - 1);
    boundingBoxMin.z = (int)std::floor(position.pos.z - 0);
    boundingBoxMax.x = (int)std::floor(position.pos.x + 1);
    boundingBoxMax.y = (int)std::floor(position.pos.y + 1);
    boundingBoxMax.z = (int)std::floor(position.pos.z + 1);
}

// TODO: check partial blocks
bool Game::collisionInRange(const Int3D & boundingBoxMin, const Int3D & boundingBoxMax)
{
    // no mutex locker; private function
    Int3D cursor;
    for (cursor.x = boundingBoxMin.x; cursor.x <= boundingBoxMax.x; cursor.x++)
        for (cursor.y = boundingBoxMin.y; cursor.y <= boundingBoxMax.y; cursor.y++)
            for (cursor.z = boundingBoxMin.z; cursor.z <= boundingBoxMax.z; cursor.z++)
                if (Item::itemData(blockAt(cursor).type())->physical)
                    return true;
    return false;
}

void Game::sendChat(QString message)
{
    QMutexLocker locker(&m_mutex);

    // remove illegal characters
    QString new_message = "";
    foreach (QChar c, message)
        if (m_legal_chat_chars.contains(c))
            new_message.append(c);
    message = new_message;
    QString header = "";
    if (message.startsWith("/tell ")) {
        // repeate any "/tell <username> " header on all the chat messages.
        int username_end = message.indexOf(" ", QString("/tell ").length());
        if (username_end != -1) {
            header = message.mid(0, username_end + 1);
            message = message.mid(username_end + 1);
        }
    }
    int lenght_limit = c_chat_length_limit - header.length();
    // split on newlines
    foreach (QString sub_message, message.split('\n')) {
        if (sub_message.isEmpty())
            continue;
        for (int i = 0; i < sub_message.length(); i += lenght_limit) {
            m_server.sendChat(header + sub_message.mid(i, lenght_limit));
        }
    }
}

double Game::timeOfDay()
{
    QMutexLocker locker(&m_mutex);
    return Util::euclideanMod(m_current_time_seconds + m_current_time_recorded_time.msecsTo(QTime::currentTime()) / 1000.0, 1200.0);
}

bool Game::placeBlock(const Int3D &block, Message::BlockFaceDirection face)
{
    QMutexLocker locker(&m_mutex);

    Item equipped_item = m_inventory.at(m_equipped_slot_id);
    if (!Item::itemData(equipped_item.type)->placeable) {
        qWarning() << "trying to place: " << equipped_item.type;
        return false;
    }
    if (canPlaceBlock(block, face))
        return true;
    Int3D new_block_pos = block + c_side_offset[face];
    updateBlock(new_block_pos, Block(equipped_item.type, equipped_item.metadata, 0, 0));
    m_server.sendPositionAndLook(m_player.position);
    m_server.sendBlockPlacement(block, face, equipped_item);
    return true;
}
bool Game::activateItem()
{
    QMutexLocker locker(&m_mutex);

    Item item = m_inventory.at(m_equipped_slot_id);
    if (!Item::itemData(item.type)->item_activatable) {
        qWarning() << "trying to activate: " << item.type;
        return false;
    }
    m_server.sendBlockPlacement(Int3D(-1, -1, -1), Message::NoDirection, item);
    return true;
}

void Game::activateBlock(const Int3D &block)
{
    QMutexLocker locker(&m_mutex);

    Item equipped_item = m_inventory.at(m_equipped_slot_id);

    m_server.sendPositionAndLook(m_player.position);
    m_server.sendBlockPlacement(block, Message::PositiveZ, equipped_item);
}

bool Game::canPlaceBlock(const Int3D &block_pos, Message::BlockFaceDirection face)
{
    QMutexLocker locker(&m_mutex);

    Int3D new_block_pos = block_pos + c_side_offset[face];

    // not if it's outside z boundaries
    if (new_block_pos.z < 0 || new_block_pos.z >= 128)
        return false;

    // not if we're too far away
    if (new_block_pos.distanceTo(m_player.position.pos) > 6.0)
        return false;

    // not if there's an entity in the way
    // myself
    if (entityCollidesWithPoint(&m_player, new_block_pos))
        return false;
    // anyone else
    foreach (QSharedPointer<Entity> entity, m_entities) {
        if (entity.data()->type != Entity::Pickup) {
            if (entityCollidesWithPoint(entity.data(), new_block_pos))
                return false;
        }
    }

    Block target_block = blockAt(block_pos);

    const Item::ItemData * item_data = Item::itemData(target_block.type());

    // not against water, lava, air, etc
    if (! item_data->diggable)
        return false;

    // not against chest, dispenser, furnace, door, etc
    if (item_data->block_activatable)
        return false;

    // not if our equipment isn't placeable
    Item equipped_item = m_inventory.at(m_equipped_slot_id);
    if (! Item::itemData(equipped_item.type)->placeable)
        return false;

    return true;
}

bool Game::entityCollidesWithPoint(const Entity * entity, const Int3D & point)
{
    // no mutex locker; private method
    Int3D min, max, it;
    entity->getBoundingBox(min, max);
    for (it.x = min.x; it.x <= max.x; it.x++) {
        for (it.y = min.y; it.y <= max.y; it.y++) {
            for (it.z = min.z; it.z <= max.z; it.z++) {
                if (it == point)
                    return true;
            }
        }
    }
    return false;
}

void Game::handleWindowItemsUpdated(int window_id, QVector<Item> items)
{
    QMutexLocker locker(&m_mutex);

    m_unique_slots.resize(items.size() - c_inventory_count);
    for (int i = 0; i < items.size(); i++)
        updateWindowSlot(i, items.at(i));

    if (window_id == 0) {
        emit inventoryUpdated();
    } else if (m_need_to_emit_window_opened) {
        emit windowOpened(m_open_window_type);
        m_need_to_emit_window_opened = false;
    }
}

void Game::handleWindowSlotUpdated(int window_id, int slot, Item item)
{
    QMutexLocker locker(&m_mutex);

    if (window_id == -1 && slot == -1) {
        m_held_item = item;
        return;
    }

    updateWindowSlot(slot, item);

    if (window_id == 0) {
        emit inventoryUpdated();
    }
}

void Game::updateWindowSlot(int slot, Item item)
{
    // no mutex locker; private function
    if (slot == Game::c_outside_window_slot)
        return;
    if (slot < m_unique_slots.size())
        m_unique_slots.replace(slot, item);
    else
        m_inventory.replace((slot-m_unique_slots.size()+9) % c_inventory_count, item);
}

Item Game::getWindowSlot(int slot)
{
    // no mutex locker; private function
    if (slot == Game::c_outside_window_slot)
        return Item();
    if (slot < m_unique_slots.size())
        return m_unique_slots.at(slot);
    else
        return m_inventory.at((slot-m_unique_slots.size()+9) % c_inventory_count);
}

bool Game::clickInventorySlot(int slot_id, bool right_click)
{
    WindowClick window_click;
    {

        QMutexLocker locker(&m_mutex);

        Q_ASSERT(slot_id >= 0 && slot_id < c_inventory_count);

        int notch_slot = m_unique_slots.size() + Util::euclideanMod(slot_id - 9, c_inventory_count);

        window_click.id = nextActionId();
        window_click.slot = notch_slot;
        window_click.right_click = right_click;
        window_click.item = m_inventory.at(slot_id);

    }

    return doWindowClick(window_click);
}

bool Game::clickUniqueSlot(int slot_id, bool right_click)
{
    WindowClick window_click;
    {
        QMutexLocker locker(&m_mutex);

        Q_ASSERT(slot_id >= 0 && slot_id < m_unique_slots.size());

        window_click.id = nextActionId();
        window_click.slot = slot_id;
        window_click.right_click = right_click;
        window_click.item = m_unique_slots.at(slot_id);
    }

    return doWindowClick(window_click);
}

_Item::Recipe Game::buildRecipeForItems(QVector<Item> items, QSize size)
{
    // determine bounds and build palette
    int min_x = -1, min_y = -1, max_x = -1, max_y = -1;
    QHash<Item, int> palette;
    int next_palette_index = 0;
    _Item::Recipe recipe;
    for (int x = 0; x < size.width(); x++) {
        for (int y = 0; y < size.height(); y++) {
            int index = y * size.width() + x;
            if (items.at(index).type != Item::NoItem) {
                if (min_x == -1) min_x = x;
                if (min_y == -1) min_y = y;
                if (x > max_x) max_x = x;
                if (y > max_y) max_y = y;

                if (! palette.contains(items.at(index))) {
                    _Item::Ingredient ingredient;
                    ingredient.item = items.at(index);
                    ingredient.metadata_matters = false;
                    ingredient.result = Item();
                    recipe.ingredients.append(ingredient);
                    palette.insert(items.at(index), next_palette_index++);
                }
            }
        }
    }

    if (palette.size() == 0)
        return recipe;

    recipe.size = QSize(max_x-min_x+1, max_y-min_y+1);
    recipe.design.resize(recipe.size.width() * recipe.size.height());

    for (int x = 0; x < recipe.size.width(); x++) {
        for (int y = 0; y < recipe.size.height(); y++) {
            int old_index = (y+min_y) * size.width() + (x+min_x);
            int index = y * recipe.size.width() + x;
            recipe.design.replace(index, palette.value(items.at(old_index), -1));
        }
    }

    return recipe;
}

int Game::nextActionId()
{
    // no mutex locker; private function
    return m_next_action_id++;
}

void Game::selectEquipSlot(int slot_id)
{
    QMutexLocker locker(&m_mutex);

    Q_ASSERT(slot_id >= 0 && slot_id < 9);
    m_server.sendHoldingChange(slot_id);
    m_equipped_slot_id = slot_id;

    emit equippedItemChanged();
}

void Game::handleHoldingChange(int slot_id)
{
    QMutexLocker locker(&m_mutex);

    m_equipped_slot_id = slot_id;

    emit equippedItemChanged();
}

bool Game::doWindowClick(const WindowClick &window_click)
{
    {
        QMutexLocker locker(&m_mutex);

        Q_ASSERT(m_open_window_id != -1);

        m_window_click_queue.enqueue(window_click);
        m_server.sendWindowClick(m_open_window_id, window_click.slot, window_click.right_click, window_click.id, window_click.item);
    }

    m_click_mutex.lock();
    bool success = m_click_wait_condition.wait(&m_click_mutex, 1000) && m_click_success;
    m_click_mutex.unlock();

    {
        QMutexLocker locker(&m_mutex);

        // if they click in the crafting area, we need to set the value of unique_slots[0]
        if (m_open_window_type == Message::Inventory && window_click.slot >= 1 && window_click.slot <= 4) {
            // make a recipe out of the crafting area and see what we need to set the result
            const _Item::Recipe * recipe = Item::recipeFor(buildRecipeForItems(m_unique_slots.mid(1, 4), QSize(2,2)));
            m_unique_slots.replace(0, (recipe == NULL) ? Item() : recipe->result);
        } else if (m_open_window_type == Message::CraftingTable && window_click.slot >= 1 && window_click.slot <= 9) {
            const _Item::Recipe * recipe = Item::recipeFor(buildRecipeForItems(m_unique_slots.mid(1, 9), QSize(3,3)));
            m_unique_slots.replace(0, (recipe == NULL) ? Item() : recipe->result);
        }
    }

    return success;
}

void Game::handleTransaction(int window_id, int action_id, bool accepted)
{
    Q_UNUSED(window_id);

    {
        QMutexLocker locker(&m_mutex);

        WindowClick window_click = m_window_click_queue.dequeue();

        Q_ASSERT(window_click.id <= action_id);
        while (action_id > window_click.id)
            window_click = m_window_click_queue.dequeue();

        if (accepted) {
            if ((m_open_window_type == Message::Inventory || m_open_window_type == Message::CraftingTable) &&
                window_click.slot == 0)
            {
                // take the crafting output and add it to your hand.
                // if you're holding something else, clicking does nothing.
                Item slot_item = getWindowSlot(window_click.slot);
                if (m_held_item.type == Item::NoItem ||
                    (slot_item.type == m_held_item.type && slot_item.metadata == m_held_item.metadata))
                {
                    if (m_held_item.type == Item::NoItem)
                        m_held_item = slot_item;
                    else if (slot_item.type == m_held_item.type && slot_item.metadata == m_held_item.metadata)
                        m_held_item.count += slot_item.count;
                    slot_item = Item();
                    updateWindowSlot(window_click.slot, slot_item);

                    // decrement the count of every slot in the crafting area
                    int decrement_start, decrement_end;
                    if (m_open_window_type == Message::Inventory) {
                        decrement_start = 1;
                        decrement_end = 4;
                    } else if (m_open_window_type == Message::CraftingTable) {
                        decrement_start = 1;
                        decrement_end = 9;
                    } else {
                        decrement_start = 0;
                        decrement_end = 0;
                        Q_ASSERT(false);
                    }

                    for (int i = decrement_start; i <= decrement_end; i++) {
                        Item slot_item = getWindowSlot(i);
                        if (slot_item.type != Item::NoItem) {
                            slot_item.count--;
                            if (slot_item.count == 0)
                                slot_item = Item();
                            updateWindowSlot(i, slot_item);
                        }
                    }
                }
            } else if (window_click.right_click) {
                if (m_held_item.type == Item::NoItem) {
                    // take half. if uneven, take the extra as well.
                    Item slot_item = getWindowSlot(window_click.slot);
                    int amt_to_take = std::floor((slot_item.count + 1) / 2);
                    int amt_to_leave = slot_item.count - amt_to_take;
                    m_held_item.count = amt_to_take;
                    m_held_item.type = slot_item.type;
                    m_held_item.metadata = slot_item.metadata;
                    if (m_held_item.count == 0)
                        m_held_item = Item();
                    slot_item.count = amt_to_leave;
                    if (slot_item.count == 0)
                        slot_item = Item();
                    updateWindowSlot(window_click.slot, slot_item);
                } else {
                    Item slot_item = getWindowSlot(window_click.slot);
                    if (slot_item.type == Item::NoItem ||
                        (slot_item.type == m_held_item.type && slot_item.metadata == m_held_item.metadata))
                    {
                        // drop 1 if the stack height allows it
                        slot_item.type = m_held_item.type;
                        slot_item.metadata = m_held_item.metadata;

                        if (slot_item.count < Item::itemData(slot_item.type)->stack_height) {
                            slot_item.count++;

                            updateWindowSlot(window_click.slot, slot_item);
                            m_held_item.count--;
                            if (m_held_item.count == 0)
                                m_held_item = Item();
                        }
                    } else {
                        // swap held item and window item
                        Item tmp = m_held_item;
                        m_held_item = slot_item;
                        updateWindowSlot(window_click.slot, tmp);
                    }
                }
            } else {
                if (window_click.slot == c_outside_window_slot) {
                    m_held_item = Item();
                } else {
                    Item slot_item = getWindowSlot(window_click.slot);
                    if (slot_item.type == m_held_item.type && slot_item.metadata == m_held_item.metadata) {
                        // drop as many held item counts into the slot as we can.
                        int new_count = slot_item.count + m_held_item.count;
                        int max = Item::itemData(slot_item.type)->stack_height;
                        int leftover = new_count - max;
                        if (leftover <= 0) {
                            slot_item.count = new_count;
                            m_held_item = Item();
                        } else {
                            slot_item.count = max;
                            m_held_item.count = leftover;
                        }
                        updateWindowSlot(window_click.slot, slot_item);
                    } else {
                        // swap held item and window item
                        Item tmp = m_held_item;
                        m_held_item = slot_item;
                        updateWindowSlot(window_click.slot, tmp);
                    }
                }
            }
        } else {
            qDebug() << "rejected transaction: " << action_id;
        }
    }

    m_click_mutex.lock();
    m_click_success = accepted;
    m_click_wait_condition.wakeAll();
    m_click_mutex.unlock();
}

void Game::closeWindow()
{
    QMutexLocker locker(&m_mutex);

    Q_ASSERT(m_open_window_id >= 0 && m_open_window_id < 256);
    m_server.sendCloseWindow(m_open_window_id);

    m_open_window_id = -1;
    m_unique_slots.resize(c_inventory_window_unique_count);
    m_held_item = Item();
}

void Game::openInventoryWindow()
{
    QMutexLocker locker(&m_mutex);

    Q_ASSERT(m_open_window_id == -1);

    m_open_window_id = 0;
    m_open_window_type = Message::Inventory;
    m_unique_slots.resize(c_inventory_window_unique_count);

    emit windowOpened(Message::Inventory);
}

bool Game::clickOutsideWindow(bool right_click)
{
    WindowClick window_click;
    {
        QMutexLocker locker(&m_mutex);

        window_click.id = nextActionId();
        window_click.slot = c_outside_window_slot;
        window_click.right_click = right_click;
        window_click.item = Item();
    }
    return doWindowClick(window_click);
}

void Game::handleOpenWindow(int window_id, Message::WindowType window_type, int number_of_slots)
{
    QMutexLocker locker(&m_mutex);

    Q_ASSERT(m_open_window_id == -1);

    m_open_window_id = window_id;
    m_unique_slots.resize(number_of_slots);

    m_open_window_type = window_type;
    m_need_to_emit_window_opened = true;
}

Item Game::inventoryItem(int slot_id) const
{
    QMutexLocker locker(&m_mutex);

    return m_inventory.at(slot_id);
}

Item Game::uniqueWindowItem(int slot_id) const
{
    QMutexLocker locker(&m_mutex);

    Q_ASSERT(m_open_window_id != -1);

    return m_unique_slots.at(slot_id);
}

