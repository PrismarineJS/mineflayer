#include "Game.h"

#include <QCoreApplication>
#include <QHashIterator>

#include <cmath>
#include <limits>

const float Game::c_standard_max_ground_speed = 4.27; // according to the internet
const float Game::c_standard_terminal_velocity = 20.0; // guess
const float Game::c_standard_walking_acceleration = 100.0; // seems good
const float Game::c_standard_gravity = 27.0; // seems good
const float Game::c_standard_ground_friction = Game::c_standard_walking_acceleration * 0.9; // seems good
const float Game::c_player_apothem = 0.30; // measured with notche's client F3
const float Game::c_player_height = 1.74; // tested with a binary search
const float Game::c_player_half_height = Game::c_player_height / 2;
const float Game::c_jump_speed = 8.2f; // seems good

const int Game::c_position_update_interval_ms = 50;
const int Game::c_chat_length_limit = 100;
const Int3D Game::c_chunk_size(16, 16, 128);
const Block Game::c_air(Block::Air, 0, 0, 0);

bool Game::s_initialized = false;
QHash<Block::ItemType, int> Game::s_item_stack_height;

Game::Game(QUrl connection_info) :
    m_mutex(QMutex::Recursive),
    m_server(connection_info),
    m_userName(connection_info.userName()),
    m_position_update_timer(NULL),
    m_digging_timer(NULL),
    m_player_held_item(Block::NoItem),
    m_max_ground_speed(c_standard_max_ground_speed),
    m_terminal_velocity(c_standard_terminal_velocity),
    m_input_acceleration(c_standard_walking_acceleration),
    m_gravity(c_standard_gravity),
    m_ground_friction(c_standard_ground_friction),
    m_jump_was_pressed(false),
    m_return_code(0)
{
    initializeStaticData();

    bool success;
    success = connect(&m_server, SIGNAL(loginStatusUpdated(Server::LoginStatus)), this, SLOT(handleLoginStatusChanged(Server::LoginStatus)));
    Q_ASSERT(success);
    success = connect(&m_server, SIGNAL(loginCompleted(int)), this, SLOT(handleLoginCompleted(int)));
    Q_ASSERT(success);
    success = connect(&m_server, SIGNAL(playerPositionAndLookUpdated(Server::EntityPosition)), this, SLOT(handlePlayerPositionAndLookUpdated(Server::EntityPosition)));
    Q_ASSERT(success);
    success = connect(&m_server, SIGNAL(playerHealthUpdated(int)), this, SLOT(handlePlayerHealthUpdated(int)));
    Q_ASSERT(success);

    success = connect(&m_server, SIGNAL(namedPlayerSpawned(int,QString,Server::EntityPosition,Block::ItemType)), this, SLOT(handleNamedPlayerSpawned(int,QString,Server::EntityPosition,Block::ItemType)));
    Q_ASSERT(success);
    success = connect(&m_server, SIGNAL(pickupSpawned(int,Message::Item,Server::EntityPosition)), this, SLOT(handlePickupSpawned(int,Message::Item,Server::EntityPosition)));
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

    success = connect(&m_server, SIGNAL(mapChunkUpdated(QSharedPointer<Chunk>)), this, SLOT(handleMapChunkUpdated(QSharedPointer<Chunk>)));
    Q_ASSERT(success);
    success = connect(&m_server, SIGNAL(multiBlockUpdate(Int3D,QHash<Int3D,Block>)), this, SLOT(handleMultiBlockUpdate(Int3D,QHash<Int3D,Block>)));
    Q_ASSERT(success);
    success = connect(&m_server, SIGNAL(blockUpdate(Int3D,Block)), this, SLOT(handleBlockUpdate(Int3D,Block)));
    Q_ASSERT(success);
    success = connect(&m_server, SIGNAL(chatReceived(QString)), this, SLOT(handleChatReceived(QString)));
    Q_ASSERT(success);
    // pass some signals directly through
    success = connect(&m_server, SIGNAL(unloadChunk(Int3D)), this, SLOT(handleUnloadChunk(Int3D)));
    Q_ASSERT(success);

    m_control_state.fill(false, (int)ControlCount);
}

Game::~Game()
{
    delete m_position_update_timer;
    delete m_digging_timer;
}

void Game::initializeStaticData()
{
    if (s_initialized)
        return;
    s_initialized = true;

    s_item_stack_height.insert(Block::NoItem, 0);
    s_item_stack_height.insert(Block::Air, 0);
    s_item_stack_height.insert(Block::Stone, 64);
    s_item_stack_height.insert(Block::Grass, 64);
    s_item_stack_height.insert(Block::Dirt, 64);
    s_item_stack_height.insert(Block::Cobblestone, 64);
    s_item_stack_height.insert(Block::WoodenPlank, 64);
    s_item_stack_height.insert(Block::Sapling, 64);
    s_item_stack_height.insert(Block::Bedrock, 64);
    s_item_stack_height.insert(Block::Water, 64);
    s_item_stack_height.insert(Block::StationaryWater, 64);
    s_item_stack_height.insert(Block::Lava, 64);
    s_item_stack_height.insert(Block::StationaryLava, 64);
    s_item_stack_height.insert(Block::Sand, 64);
    s_item_stack_height.insert(Block::Gravel, 64);
    s_item_stack_height.insert(Block::GoldOre, 64);
    s_item_stack_height.insert(Block::IronOre, 64);
    s_item_stack_height.insert(Block::CoalOre, 64);
    s_item_stack_height.insert(Block::Wood, 64);
    s_item_stack_height.insert(Block::Leaves, 64);
    s_item_stack_height.insert(Block::Sponge, 64);
    s_item_stack_height.insert(Block::Glass, 64);
    s_item_stack_height.insert(Block::LapisLazuliOre, 64);
    s_item_stack_height.insert(Block::LapisLazuliBlock, 64);
    s_item_stack_height.insert(Block::Dispenser, 64);
    s_item_stack_height.insert(Block::Sandstone, 64);
    s_item_stack_height.insert(Block::NoteBlock, 64);
    s_item_stack_height.insert(Block::Wool, 64);
    s_item_stack_height.insert(Block::YellowFlower, 64);
    s_item_stack_height.insert(Block::RedRose, 64);
    s_item_stack_height.insert(Block::BrownMushroom, 64);
    s_item_stack_height.insert(Block::RedMushroom, 64);
    s_item_stack_height.insert(Block::GoldBlock, 64);
    s_item_stack_height.insert(Block::IronBlock, 64);
    s_item_stack_height.insert(Block::DoubleStoneSlab, 64);
    s_item_stack_height.insert(Block::StoneSlab, 64);
    s_item_stack_height.insert(Block::Brick, 64);
    s_item_stack_height.insert(Block::Tnt, 64);
    s_item_stack_height.insert(Block::Bookshelf, 64);
    s_item_stack_height.insert(Block::MossStone, 64);
    s_item_stack_height.insert(Block::Obsidian, 64);
    s_item_stack_height.insert(Block::Torch, 64);
    s_item_stack_height.insert(Block::Fire, 64);
    s_item_stack_height.insert(Block::MonsterSpawner, 64);
    s_item_stack_height.insert(Block::WoodenStairs, 64);
    s_item_stack_height.insert(Block::Chest, 64);
    s_item_stack_height.insert(Block::RedstoneWire_placed, 64);
    s_item_stack_height.insert(Block::DiamondOre, 64);
    s_item_stack_height.insert(Block::DiamondBlock, 64);
    s_item_stack_height.insert(Block::Workbench, 64);
    s_item_stack_height.insert(Block::Crops, 64);
    s_item_stack_height.insert(Block::Farmland, 64);
    s_item_stack_height.insert(Block::Furnace, 64);
    s_item_stack_height.insert(Block::BurningFurnace, 64);
    s_item_stack_height.insert(Block::SignPost_placed, 1);
    s_item_stack_height.insert(Block::WoodenDoor_placed, 1);
    s_item_stack_height.insert(Block::Ladder, 64);
    s_item_stack_height.insert(Block::MinecartTracks, 64);
    s_item_stack_height.insert(Block::CobblestoneStairs, 64);
    s_item_stack_height.insert(Block::WallSign_placed, 1);
    s_item_stack_height.insert(Block::Lever, 64);
    s_item_stack_height.insert(Block::StonePressurePlate, 64);
    s_item_stack_height.insert(Block::IronDoor_placed, 1);
    s_item_stack_height.insert(Block::WoodenPressurePlate, 64);
    s_item_stack_height.insert(Block::RedstoneOre, 64);
    s_item_stack_height.insert(Block::GlowingRedstoneOre, 64);
    s_item_stack_height.insert(Block::RedstoneTorchOff_placed, 64);
    s_item_stack_height.insert(Block::RedstoneTorchOn, 64);
    s_item_stack_height.insert(Block::StoneButton, 64);
    s_item_stack_height.insert(Block::Snow, 64);
    s_item_stack_height.insert(Block::Ice, 64);
    s_item_stack_height.insert(Block::SnowBlock, 64);
    s_item_stack_height.insert(Block::Cactus, 64);
    s_item_stack_height.insert(Block::Clay, 64);
    s_item_stack_height.insert(Block::SugarCane_placed, 64);
    s_item_stack_height.insert(Block::Jukebox, 64);
    s_item_stack_height.insert(Block::Fence, 64);
    s_item_stack_height.insert(Block::Pumpkin, 64);
    s_item_stack_height.insert(Block::Netherrack, 64);
    s_item_stack_height.insert(Block::SoulSand, 64);
    s_item_stack_height.insert(Block::Glowstone, 64);
    s_item_stack_height.insert(Block::Portal, 0);
    s_item_stack_height.insert(Block::JackOLantern, 64);
    s_item_stack_height.insert(Block::CakeBlock, 1);

    s_item_stack_height.insert(Block::IronShovel, 1);
    s_item_stack_height.insert(Block::IronPickaxe, 1);
    s_item_stack_height.insert(Block::IronAxe, 1);
    s_item_stack_height.insert(Block::FlintAndSteel, 1);
    s_item_stack_height.insert(Block::Apple, 1);
    s_item_stack_height.insert(Block::Bow, 1);
    s_item_stack_height.insert(Block::Arrow, 64);
    s_item_stack_height.insert(Block::Coal, 64);
    s_item_stack_height.insert(Block::Diamond, 64);
    s_item_stack_height.insert(Block::IronIngot, 64);
    s_item_stack_height.insert(Block::GoldIngot, 64);
    s_item_stack_height.insert(Block::IronSword, 1);
    s_item_stack_height.insert(Block::WoodenSword, 1);
    s_item_stack_height.insert(Block::WoodenShovel, 1);
    s_item_stack_height.insert(Block::WoodenPickaxe, 1);
    s_item_stack_height.insert(Block::WoodenAxe, 1);
    s_item_stack_height.insert(Block::StoneSword, 1);
    s_item_stack_height.insert(Block::StoneShovel, 1);
    s_item_stack_height.insert(Block::StonePickaxe, 1);
    s_item_stack_height.insert(Block::StoneAxe, 1);
    s_item_stack_height.insert(Block::DiamondSword, 1);
    s_item_stack_height.insert(Block::DiamondShovel, 1);
    s_item_stack_height.insert(Block::DiamondPickaxe, 1);
    s_item_stack_height.insert(Block::DiamondAxe, 1);
    s_item_stack_height.insert(Block::Stick, 64);
    s_item_stack_height.insert(Block::Bowl, 64);
    s_item_stack_height.insert(Block::MushroomSoup, 1);
    s_item_stack_height.insert(Block::GoldSword, 1);
    s_item_stack_height.insert(Block::GoldShovel, 1);
    s_item_stack_height.insert(Block::GoldPickaxe, 1);
    s_item_stack_height.insert(Block::GoldAxe, 1);
    s_item_stack_height.insert(Block::String, 64);
    s_item_stack_height.insert(Block::Feather, 64);
    s_item_stack_height.insert(Block::Sulphur, 64);
    s_item_stack_height.insert(Block::WoodenHoe, 1);
    s_item_stack_height.insert(Block::StoneHoe, 1);
    s_item_stack_height.insert(Block::IronHoe, 1);
    s_item_stack_height.insert(Block::DiamondHoe, 1);
    s_item_stack_height.insert(Block::GoldHoe, 1);
    s_item_stack_height.insert(Block::Seeds, 64);
    s_item_stack_height.insert(Block::Wheat, 64);
    s_item_stack_height.insert(Block::Bread, 1);
    s_item_stack_height.insert(Block::LeatherHelmet, 1);
    s_item_stack_height.insert(Block::LeatherChestplate, 1);
    s_item_stack_height.insert(Block::LeatherLeggings, 1);
    s_item_stack_height.insert(Block::LeatherBoots, 1);
    s_item_stack_height.insert(Block::ChainmailHelmet, 1);
    s_item_stack_height.insert(Block::ChainmailChestplate, 1);
    s_item_stack_height.insert(Block::ChainmailLeggings, 1);
    s_item_stack_height.insert(Block::ChainmailBoots, 1);
    s_item_stack_height.insert(Block::IronHelmet, 1);
    s_item_stack_height.insert(Block::IronChestplate, 1);
    s_item_stack_height.insert(Block::IronLeggings, 1);
    s_item_stack_height.insert(Block::IronBoots, 1);
    s_item_stack_height.insert(Block::DiamondHelmet, 1);
    s_item_stack_height.insert(Block::DiamondChestplate, 1);
    s_item_stack_height.insert(Block::DiamondLeggings, 1);
    s_item_stack_height.insert(Block::DiamondBoots, 1);
    s_item_stack_height.insert(Block::GoldHelmet, 1);
    s_item_stack_height.insert(Block::GoldChestplate, 1);
    s_item_stack_height.insert(Block::GoldLeggings, 1);
    s_item_stack_height.insert(Block::GoldBoots, 1);
    s_item_stack_height.insert(Block::Flint, 1);
    s_item_stack_height.insert(Block::RawPorkchop, 1);
    s_item_stack_height.insert(Block::CookedPorkchop, 1);
    s_item_stack_height.insert(Block::Paintings, 64);
    s_item_stack_height.insert(Block::GoldenApple, 1);
    s_item_stack_height.insert(Block::Sign, 1);
    s_item_stack_height.insert(Block::WoodenDoor, 1);
    s_item_stack_height.insert(Block::Bucket, 1);
    s_item_stack_height.insert(Block::WaterBucket, 1);
    s_item_stack_height.insert(Block::LavaBucket, 1);
    s_item_stack_height.insert(Block::Minecart, 1);
    s_item_stack_height.insert(Block::Saddle, 1);
    s_item_stack_height.insert(Block::IronDoor, 1);
    s_item_stack_height.insert(Block::Redstone, 64);
    s_item_stack_height.insert(Block::Snowball, 16);
    s_item_stack_height.insert(Block::Boat, 1);
    s_item_stack_height.insert(Block::Leather, 64);
    s_item_stack_height.insert(Block::Milk, 1);
    s_item_stack_height.insert(Block::ClayBrick, 64);
    s_item_stack_height.insert(Block::ClayBalls, 64);
    s_item_stack_height.insert(Block::SugarCane, 64);
    s_item_stack_height.insert(Block::Paper, 64);
    s_item_stack_height.insert(Block::Book, 64);
    s_item_stack_height.insert(Block::Slimeball, 64);
    s_item_stack_height.insert(Block::StorageMinecart, 1);
    s_item_stack_height.insert(Block::PoweredMinecart, 1);
    s_item_stack_height.insert(Block::Egg, 16);
    s_item_stack_height.insert(Block::Compass, 64);
    s_item_stack_height.insert(Block::FishingRod, 64);
    s_item_stack_height.insert(Block::Clock, 64);
    s_item_stack_height.insert(Block::GlowstoneDust, 64);
    s_item_stack_height.insert(Block::RawFish, 1);
    s_item_stack_height.insert(Block::CookedFish, 1);
    s_item_stack_height.insert(Block::InkSac, 64);
    s_item_stack_height.insert(Block::Bone, 64);
    s_item_stack_height.insert(Block::Sugar, 64);
    s_item_stack_height.insert(Block::Cake, 1);
    s_item_stack_height.insert(Block::GoldMusicDisc, 1);
    s_item_stack_height.insert(Block::GreenMusicDisc, 1);
}

void Game::setControlActivated(Control control, bool activated)
{
    QMutexLocker locker(&m_mutex);
    m_control_state[control] = activated;
    if (control == Jump)
        m_jump_was_pressed = true;
}

void Game::updatePlayerLook(float delta_yaw, float delta_pitch)
{
    QMutexLocker locker(&m_mutex);
    m_player_position.yaw += delta_yaw;
    m_player_position.pitch += delta_pitch;
    emit playerPositionUpdated();
}
void Game::setPlayerLook(float yaw, float pitch)
{
    QMutexLocker locker(&m_mutex);
    m_player_position.yaw = yaw;
    m_player_position.pitch = pitch;
    emit playerPositionUpdated();
}
void Game::setPlayerPosition(const Double3D & pt)
{
    QMutexLocker locker(&m_mutex);
    m_player_position.pos = pt;
    emit playerPositionUpdated();
}

void Game::respawn()
{
    QMutexLocker locker(&m_mutex);
    Q_ASSERT(m_player_health == 0);
    m_server.sendRespawnRequest();
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
    if (entity_id == m_player_entity_id) {
        // construct a named player entity for the player
        return QSharedPointer<Entity>(new NamedPlayerEntity(entity_id, m_player_position, m_userName, m_player_held_item));
    }
    QSharedPointer<Entity> entity = m_entities.value(entity_id, QSharedPointer<Entity>());
    if (entity.isNull())
        return entity;
    return QSharedPointer<Entity>(entity.data()->clone());
}

Server::EntityPosition Game::playerPosition()
{
    QMutexLocker locker(&m_mutex);
    return m_player_position;
}

Block Game::blockAt(const Int3D & absolute_location)
{
    QMutexLocker locker(&m_mutex);
    Int3D chunk_key = chunkKey(absolute_location);
    QSharedPointer<Chunk> chunk = m_chunks.value(chunk_key, QSharedPointer<Chunk>());
    if (chunk.isNull())
        return c_air;
    return chunk.data()->getBlock(absolute_location - chunk_key);
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
    if (m_digging_timer != NULL)
        stopDigging();
    m_digging_location = block;
    m_digging_counter = 0;
    m_server.sendDiggingStatus(Message::StartDigging, m_digging_location);
    m_digging_timer = new QTimer;
    m_digging_timer->setInterval(10);
    bool success;
    success = connect(m_digging_timer, SIGNAL(timeout()), this, SLOT(timeToContinueDigging()));
    Q_ASSERT(success);
}
void Game::stopDigging()
{
    QMutexLocker locker(&m_mutex);
    if (m_digging_timer == NULL)
        return;
    m_digging_timer->stop();
    m_server.sendDiggingStatus(Message::AbortDigging, m_digging_location);
    delete m_digging_timer;
    m_digging_timer = NULL;
    emit stoppedDigging(DiggingAborted);
}
void Game::timeToContinueDigging()
{
    QMutexLocker locker(&m_mutex);
    if (m_digging_timer == NULL)
        return; // race conditions
    m_server.sendDiggingStatus(Message::ContinueDigging, m_digging_location);
    m_digging_counter++;
    if (m_digging_counter >= 76) { // TODO: test this number and make it variable
        // complete
        m_server.sendDiggingStatus(Message::BlockBroken, m_digging_location);
        delete m_digging_timer;
        m_digging_timer = NULL;
        emit stoppedDigging(DiggingCompleted);
    }
}

void Game::handleLoginStatusChanged(Server::LoginStatus status)
{
    QMutexLocker locker(&m_mutex);
    switch (status) {
        case Server::SocketError:
            qWarning() << "Game: Unable to connect to server";
            QCoreApplication::instance()->exit(-1);
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
    m_player_entity_id = entity_id;
}

void Game::handleChatReceived(QString message)
{
    QMutexLocker locker(&m_mutex);
    if (message.startsWith("<")) {
        int pos = message.indexOf(">");
        Q_ASSERT(pos != -1);
        QString username = message.mid(1, pos-1);
        QString content = message.mid(pos+2);
        // suppress talking to yourself
        if (username != m_userName)
            emit chatReceived(username, content);
    } else {
        // TODO
    }
}

void Game::handlePlayerPositionAndLookUpdated(Server::EntityPosition position)
{
    QMutexLocker locker(&m_mutex);
    m_player_position.pos = position.pos;
    m_player_position.height = position.height;
    m_player_position.on_ground = position.on_ground;

    // apologize to the notchian server by echoing an identical position back

    m_server.sendPositionAndLook(m_player_position);

    if (m_position_update_timer == NULL) {
        // got first 0x0D. start the clocks
        m_player_position.yaw = position.yaw;
        m_player_position.pitch = position.pitch;

        m_position_update_timer = new QTimer;
        m_position_update_timer->setInterval(c_position_update_interval_ms);
        bool success;
        success = connect(m_position_update_timer, SIGNAL(timeout()), this, SLOT(sendPosition()));
        Q_ASSERT(success);
        m_position_update_timer->start();
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

void Game::handleNamedPlayerSpawned(int entity_id, QString player_name, Server::EntityPosition position, Block::ItemType held_item)
{
    QMutexLocker locker(&m_mutex);
    Entity * entity = new NamedPlayerEntity(entity_id, position, player_name, held_item);
    m_entities.insert(entity_id, QSharedPointer<Entity>(entity));
    emit entitySpawned(QSharedPointer<Entity>(entity->clone()));
}
void Game::handlePickupSpawned(int entity_id, Message::Item item, Server::EntityPosition position)
{
    QMutexLocker locker(&m_mutex);
    Entity * entity = new PickupEntity(entity_id, position, item);
    m_entities.insert(entity_id, QSharedPointer<Entity>(entity));
    emit entitySpawned(QSharedPointer<Entity>(entity->clone()));
}
void Game::handleMobSpawned(int entity_id, MobSpawnResponse::MobType mob_type, Server::EntityPosition position)
{
    QMutexLocker locker(&m_mutex);
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

Int3D Game::chunkKey(const Int3D &coord)
{
    return coord - (coord % c_chunk_size);
}

void Game::sendPosition()
{
    QMutexLocker locker(&m_mutex);
    m_server.sendPositionAndLook(m_player_position);
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
        float input_yaw = m_player_position.yaw + rotation_from_input;
        acceleration.x += std::cos(input_yaw) * m_input_acceleration;
        acceleration.y += std::sin(input_yaw) * m_input_acceleration;
    }

    // jumping
    if ((m_control_state.at(Jump) || m_jump_was_pressed) && m_player_position.on_ground)
        m_player_position.vel.z = c_jump_speed;
    m_jump_was_pressed = false;

    // gravity
    acceleration.z -= m_gravity;

    float old_ground_speed_squared = groundSpeedSquared();
    if (old_ground_speed_squared < std::numeric_limits<float>::epsilon()) {
        // stopped
        m_player_position.vel.x = 0;
        m_player_position.vel.y = 0;
    } else {
        // non-zero ground speed
        float old_ground_speed = std::sqrt(old_ground_speed_squared);
        float ground_friction = m_ground_friction;
        if (!m_player_position.on_ground)
            ground_friction *= 0.05; // half friction for the air
        if (ground_friction > old_ground_speed / delta_seconds) {
            // friction will stop the motion
            ground_friction = old_ground_speed / delta_seconds;
        }
        acceleration.x -= m_player_position.vel.x / old_ground_speed * ground_friction;
        acceleration.y -= m_player_position.vel.y / old_ground_speed * ground_friction;
    }

    // calculate new speed
    m_player_position.vel += acceleration * delta_seconds;

    // limit speed
    double ground_speed_squared = groundSpeedSquared();
    if (ground_speed_squared > m_max_ground_speed * m_max_ground_speed) {
        float ground_speed = std::sqrt(ground_speed_squared);
        float correction_scale = m_max_ground_speed / ground_speed;
        m_player_position.vel.x *= correction_scale;
        m_player_position.vel.y *= correction_scale;
    }
    if (m_player_position.vel.z < -m_terminal_velocity)
        m_player_position.vel.z = -m_terminal_velocity;
    else if (m_player_position.vel.z > m_terminal_velocity)
        m_player_position.vel.z = m_terminal_velocity;


    // calculate new positions and resolve collisions
    Int3D boundingBoxMin, boundingBoxMax;
    getPlayerBoundingBox(boundingBoxMin, boundingBoxMax);

    if (m_player_position.vel.x != 0) {
        m_player_position.pos.x += m_player_position.vel.x * delta_seconds;
        double forward_x_edge = m_player_position.pos.x + Util::sign(m_player_position.vel.x) * c_player_apothem;
        int block_x = (int)std::floor(forward_x_edge);
        if (collisionInRange(Int3D(block_x, boundingBoxMin.y, boundingBoxMin.z), Int3D(block_x, boundingBoxMax.y, boundingBoxMax.z))) {
            m_player_position.pos.x = block_x + (m_player_position.vel.x < 0 ? 1 + c_player_apothem : -c_player_apothem) * 1.001;
            m_player_position.vel.x = 0;
            getPlayerBoundingBox(boundingBoxMin, boundingBoxMax);
        }
    }

    if (m_player_position.vel.y != 0) {
        m_player_position.pos.y += m_player_position.vel.y * delta_seconds;
        int block_y = (int)std::floor(m_player_position.pos.y + Util::sign(m_player_position.vel.y) * c_player_apothem);
        if (collisionInRange(Int3D(boundingBoxMin.x, block_y, boundingBoxMin.z), Int3D(boundingBoxMax.x, block_y, boundingBoxMax.z))) {
            m_player_position.pos.y = block_y + (m_player_position.vel.y < 0 ? 1 + c_player_apothem : -c_player_apothem) * 1.001;
            m_player_position.vel.y = 0;
            getPlayerBoundingBox(boundingBoxMin, boundingBoxMax);
        }
    }

    m_player_position.on_ground = false;
    if (m_player_position.vel.z != 0) {
        m_player_position.pos.z += m_player_position.vel.z * delta_seconds;
        int block_z = (int)std::floor(m_player_position.pos.z + c_player_half_height + Util::sign(m_player_position.vel.z) * c_player_half_height);
        if (collisionInRange(Int3D(boundingBoxMin.x, boundingBoxMin.y, block_z), Int3D(boundingBoxMax.x, boundingBoxMax.y, block_z))) {
            m_player_position.pos.z = block_z + (m_player_position.vel.z < 0 ? 1 : -c_player_height) * 1.001;
            if (m_player_position.vel.z < 0)
                m_player_position.on_ground = true;
            m_player_position.vel.z = 0;
        }
    }

    // always emit update
    emit playerPositionUpdated();
}

void Game::getPlayerBoundingBox(Int3D & boundingBoxMin, Int3D & boundingBoxMax)
{
    QMutexLocker locker(&m_mutex);
    boundingBoxMin.x = (int)std::floor(m_player_position.pos.x - c_player_apothem);
    boundingBoxMin.y = (int)std::floor(m_player_position.pos.y - c_player_apothem);
    boundingBoxMin.z = (int)std::floor(m_player_position.pos.z - 0);
    boundingBoxMax.x = (int)std::floor(m_player_position.pos.x + c_player_apothem);
    boundingBoxMax.y = (int)std::floor(m_player_position.pos.y + c_player_apothem);
    boundingBoxMax.z = (int)std::floor(m_player_position.pos.z + c_player_height);
}

// TODO: check partial blocks
bool Game::collisionInRange(const Int3D & boundingBoxMin, const Int3D & boundingBoxMax)
{
    QMutexLocker locker(&m_mutex);
    Int3D cursor;
    for (cursor.x = boundingBoxMin.x; cursor.x <= boundingBoxMax.x; cursor.x++)
        for (cursor.y = boundingBoxMin.y; cursor.y <= boundingBoxMax.y; cursor.y++)
            for (cursor.z = boundingBoxMin.z; cursor.z <= boundingBoxMax.z; cursor.z++)
                if (blockAt(cursor).type() != Block::Air)
                    return true;
    return false;
}

void Game::sendChat(QString message)
{
    QMutexLocker locker(&m_mutex);
    // limit chat length. split it up if necessary.
    for (int i = 0; i < message.length(); i += c_chat_length_limit)
        m_server.sendChat(message.mid(i, c_chat_length_limit));
}

int Game::itemStackHeight(Block::ItemType item)
{
    initializeStaticData();
    return s_item_stack_height.value(item, -1);
}
