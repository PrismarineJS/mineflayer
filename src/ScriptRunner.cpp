#include "ScriptRunner.h"
#include <QFile>
#include <QTimer>
#include <QMainWindow>
#include <QDebug>
#include <QCoreApplication>

const int c_item_stack_height[] = {

};

ScriptRunner::ScriptRunner(QUrl url, QString script_file, bool debug, bool headless, QObject *parent) :
    QObject(parent),
    m_url(url),
    m_script_filename(script_file),
    m_debug(debug),
    m_headless(headless),
    m_engine(NULL),
    m_server(NULL),
    m_exiting(false),
    m_stderr(stderr),
    m_stdout(stdout)
{
    m_item_stack_height.insert(Block::NoItem, 0);
    m_item_stack_height.insert(Block::Air, 0);
    m_item_stack_height.insert(Block::Stone, 64);
    m_item_stack_height.insert(Block::Grass, 64);
    m_item_stack_height.insert(Block::Dirt, 64);
    m_item_stack_height.insert(Block::Cobblestone, 64);
    m_item_stack_height.insert(Block::WoodenPlank, 64);
    m_item_stack_height.insert(Block::Sapling, 64);
    m_item_stack_height.insert(Block::Bedrock, 64);
    m_item_stack_height.insert(Block::Water, 64);
    m_item_stack_height.insert(Block::StationaryWater, 64);
    m_item_stack_height.insert(Block::Lava, 64);
    m_item_stack_height.insert(Block::StationaryLava, 64);
    m_item_stack_height.insert(Block::Sand, 64);
    m_item_stack_height.insert(Block::Gravel, 64);
    m_item_stack_height.insert(Block::GoldOre, 64);
    m_item_stack_height.insert(Block::IronOre, 64);
    m_item_stack_height.insert(Block::CoalOre, 64);
    m_item_stack_height.insert(Block::Wood, 64);
    m_item_stack_height.insert(Block::Leaves, 64);
    m_item_stack_height.insert(Block::Sponge, 64);
    m_item_stack_height.insert(Block::Glass, 64);
    m_item_stack_height.insert(Block::LapisLazuliOre, 64);
    m_item_stack_height.insert(Block::LapisLazuliBlock, 64);
    m_item_stack_height.insert(Block::Dispenser, 64);
    m_item_stack_height.insert(Block::Sandstone, 64);
    m_item_stack_height.insert(Block::NoteBlock, 64);
    m_item_stack_height.insert(Block::Wool, 64);
    m_item_stack_height.insert(Block::YellowFlower, 64);
    m_item_stack_height.insert(Block::RedRose, 64);
    m_item_stack_height.insert(Block::BrownMushroom, 64);
    m_item_stack_height.insert(Block::RedMushroom, 64);
    m_item_stack_height.insert(Block::GoldBlock, 64);
    m_item_stack_height.insert(Block::IronBlock, 64);
    m_item_stack_height.insert(Block::DoubleStoneSlab, 64);
    m_item_stack_height.insert(Block::StoneSlab, 64);
    m_item_stack_height.insert(Block::Brick, 64);
    m_item_stack_height.insert(Block::TNT, 64);
    m_item_stack_height.insert(Block::Bookshelf, 64);
    m_item_stack_height.insert(Block::MossStone, 64);
    m_item_stack_height.insert(Block::Obsidian, 64);
    m_item_stack_height.insert(Block::Torch, 64);
    m_item_stack_height.insert(Block::Fire, 64);
    m_item_stack_height.insert(Block::MonsterSpawner, 64);
    m_item_stack_height.insert(Block::WoodenStairs, 64);
    m_item_stack_height.insert(Block::Chest, 64);
    m_item_stack_height.insert(Block::RedstoneWire_placed, 64);
    m_item_stack_height.insert(Block::DiamondOre, 64);
    m_item_stack_height.insert(Block::DiamondBlock, 64);
    m_item_stack_height.insert(Block::Workbench, 64);
    m_item_stack_height.insert(Block::Crops, 64);
    m_item_stack_height.insert(Block::Farmland, 64);
    m_item_stack_height.insert(Block::Furnace, 64);
    m_item_stack_height.insert(Block::BurningFurnace, 64);
    m_item_stack_height.insert(Block::SignPost_placed, 1);
    m_item_stack_height.insert(Block::WoodenDoor_placed, 1);
    m_item_stack_height.insert(Block::Ladder, 64);
    m_item_stack_height.insert(Block::MinecartTracks, 64);
    m_item_stack_height.insert(Block::CobblestoneStairs, 64);
    m_item_stack_height.insert(Block::WallSign_placed, 1);
    m_item_stack_height.insert(Block::Lever, 64);
    m_item_stack_height.insert(Block::StonePressurePlate, 64);
    m_item_stack_height.insert(Block::IronDoor_placed, 1);
    m_item_stack_height.insert(Block::WoodenPressurePlate, 64);
    m_item_stack_height.insert(Block::RedstoneOre, 64);
    m_item_stack_height.insert(Block::GlowingRedstoneOre, 64);
    m_item_stack_height.insert(Block::RedstoneTorchOff_placed, 64);
    m_item_stack_height.insert(Block::RedstoneTorchOn, 64);
    m_item_stack_height.insert(Block::StoneButton, 64);
    m_item_stack_height.insert(Block::Snow, 64);
    m_item_stack_height.insert(Block::Ice, 64);
    m_item_stack_height.insert(Block::SnowBlock, 64);
    m_item_stack_height.insert(Block::Cactus, 64);
    m_item_stack_height.insert(Block::Clay, 64);
    m_item_stack_height.insert(Block::SugarCane_place, 64);
    m_item_stack_height.insert(Block::Jukebox, 64);
    m_item_stack_height.insert(Block::Fence, 64);
    m_item_stack_height.insert(Block::Pumpkin, 64);
    m_item_stack_height.insert(Block::Netherrack, 64);
    m_item_stack_height.insert(Block::SoulSand, 64);
    m_item_stack_height.insert(Block::Glowstone, 64);
    m_item_stack_height.insert(Block::Portal, 0);
    m_item_stack_height.insert(Block::JackOLantern, 64);
    m_item_stack_height.insert(Block::CakeBlock, 1);

    m_item_stack_height.insert(Block::IronShovel, 1);
    m_item_stack_height.insert(Block::IronPickaxe, 1);
    m_item_stack_height.insert(Block::IronAxe, 1);
    m_item_stack_height.insert(Block::FlintAndSteel, 1);
    m_item_stack_height.insert(Block::Apple, 1);
    m_item_stack_height.insert(Block::Bow, 1);
    m_item_stack_height.insert(Block::Arrow, 64);
    m_item_stack_height.insert(Block::Coal, 64);
    m_item_stack_height.insert(Block::Diamond, 64);
    m_item_stack_height.insert(Block::IronIngot, 64);
    m_item_stack_height.insert(Block::GoldIngot, 64);
    m_item_stack_height.insert(Block::IronSword, 1);
    m_item_stack_height.insert(Block::WoodenSword, 1);
    m_item_stack_height.insert(Block::WoodenShovel, 1);
    m_item_stack_height.insert(Block::WoodenPickaxe, 1);
    m_item_stack_height.insert(Block::WoodenAxe, 1);
    m_item_stack_height.insert(Block::StoneSword, 1);
    m_item_stack_height.insert(Block::StoneShovel, 1);
    m_item_stack_height.insert(Block::StonePickaxe, 1);
    m_item_stack_height.insert(Block::StoneAxe, 1);
    m_item_stack_height.insert(Block::DiamondSword, 1);
    m_item_stack_height.insert(Block::DiamondShovel, 1);
    m_item_stack_height.insert(Block::DiamondPickaxe, 1);
    m_item_stack_height.insert(Block::DiamondAxe, 1);
    m_item_stack_height.insert(Block::Stick, 64);
    m_item_stack_height.insert(Block::Bowl, 64);
    m_item_stack_height.insert(Block::MushroomSoup, 1);
    m_item_stack_height.insert(Block::GoldSword, 1);
    m_item_stack_height.insert(Block::GoldShovel, 1);
    m_item_stack_height.insert(Block::GoldPickaxe, 1);
    m_item_stack_height.insert(Block::GoldAxe, 1);
    m_item_stack_height.insert(Block::String, 64);
    m_item_stack_height.insert(Block::Feather, 64);
    m_item_stack_height.insert(Block::Sulphur, 64);
    m_item_stack_height.insert(Block::WoodenHoe, 1);
    m_item_stack_height.insert(Block::StoneHoe, 1);
    m_item_stack_height.insert(Block::IronHoe, 1);
    m_item_stack_height.insert(Block::DiamondHoe, 1);
    m_item_stack_height.insert(Block::GoldHoe, 1);
    m_item_stack_height.insert(Block::Seeds, 64);
    m_item_stack_height.insert(Block::Wheat, 64);
    m_item_stack_height.insert(Block::Bread, 1);
    m_item_stack_height.insert(Block::LeatherHelmet, 1);
    m_item_stack_height.insert(Block::LeatherChestplate, 1);
    m_item_stack_height.insert(Block::LeatherLeggings, 1);
    m_item_stack_height.insert(Block::LeatherBoots, 1);
    m_item_stack_height.insert(Block::ChainmailHelmet, 1);
    m_item_stack_height.insert(Block::ChainmailChestplate, 1);
    m_item_stack_height.insert(Block::ChainmailLeggings, 1);
    m_item_stack_height.insert(Block::ChainmailBoots, 1);
    m_item_stack_height.insert(Block::IronHelmet, 1);
    m_item_stack_height.insert(Block::IronChestplate, 1);
    m_item_stack_height.insert(Block::IronLeggings, 1);
    m_item_stack_height.insert(Block::IronBoots, 1);
    m_item_stack_height.insert(Block::DiamondHelmet, 1);
    m_item_stack_height.insert(Block::DiamondChestplate, 1);
    m_item_stack_height.insert(Block::DiamondLeggings, 1);
    m_item_stack_height.insert(Block::DiamondBoots, 1);
    m_item_stack_height.insert(Block::GoldHelmet, 1);
    m_item_stack_height.insert(Block::GoldChestplate, 1);
    m_item_stack_height.insert(Block::GoldLeggings, 1);
    m_item_stack_height.insert(Block::GoldBoots, 1);
    m_item_stack_height.insert(Block::Flint, 1);
    m_item_stack_height.insert(Block::RawPorkchop, 1);
    m_item_stack_height.insert(Block::CookedPorkchop, 1);
    m_item_stack_height.insert(Block::Paintings, 64);
    m_item_stack_height.insert(Block::GoldenApple, 1);
    m_item_stack_height.insert(Block::Sign, 1);
    m_item_stack_height.insert(Block::WoodenDoor, 1);
    m_item_stack_height.insert(Block::Bucket, 1);
    m_item_stack_height.insert(Block::WaterBucket, 1);
    m_item_stack_height.insert(Block::LavaBucket, 1);
    m_item_stack_height.insert(Block::Minecart, 1);
    m_item_stack_height.insert(Block::Saddle, 1);
    m_item_stack_height.insert(Block::IronDoor, 1);
    m_item_stack_height.insert(Block::Redstone, 64);
    m_item_stack_height.insert(Block::Snowball, 16);
    m_item_stack_height.insert(Block::Boat, 1);
    m_item_stack_height.insert(Block::Leather, 1);
    m_item_stack_height.insert(Block::Milk, 1);
    m_item_stack_height.insert(Block::ClayBrick, 64);
    m_item_stack_height.insert(Block::ClayBalls, 64);
    m_item_stack_height.insert(Block::SugarCane, 64);
    m_item_stack_height.insert(Block::Paper, 64);
    m_item_stack_height.insert(Block::Book, 64);
    m_item_stack_height.insert(Block::Slimeball, 64);
    m_item_stack_height.insert(Block::StorageMinecart, 1);
    m_item_stack_height.insert(Block::PoweredMinecart, 1);
    m_item_stack_height.insert(Block::Egg, 16);
    m_item_stack_height.insert(Block::Compass, 64);
    m_item_stack_height.insert(Block::FishingRod, 64);
    m_item_stack_height.insert(Block::Clock, 64);
    m_item_stack_height.insert(Block::GlowstoneDust, 64);
    m_item_stack_height.insert(Block::RawFish, 1);
    m_item_stack_height.insert(Block::CookedFish, 1);
    m_item_stack_height.insert(Block::InkSac, 64);
    m_item_stack_height.insert(Block::Bone, 64);
    m_item_stack_height.insert(Block::Sugar, 64);
    m_item_stack_height.insert(Block::Cake, 1);
    m_item_stack_height.insert(Block::GoldMusicDisc, 1);
    m_item_stack_height.insert(Block::GreenMusicDisc, 1);


}

bool ScriptRunner::go()
{
    m_engine = new QScriptEngine(this);
    if (m_debug) {
        QScriptEngineDebugger debugger;
        debugger.attachTo(m_engine);
        QMainWindow * debug_window = debugger.standardWindow();
        debug_window->resize(1024, 640);
        debug_window->show();
    }

    QFile script_file(m_script_filename);
    script_file.open(QIODevice::ReadOnly);
    m_engine->evaluate(script_file.readAll(), m_script_filename);
    script_file.close();
    if (m_engine->hasUncaughtException()) {
        qWarning() << "Error while evaluating script file:" << m_engine->uncaughtException().toString();
        qWarning() << m_engine->uncaughtExceptionBacktrace().join("\n");
        return false;
    }

    // initialize the MF object before we run any user code
    m_engine->globalObject().setProperty("mf", m_engine->newQObject(this));
    QScriptValue mf_obj = m_engine->globalObject().property("mf");

    // create JavaScript enums from C++ enums
    QFile enum_file(":/enums/ItemTypeEnum.h");
    enum_file.open(QIODevice::ReadOnly);
    QString enum_contents = QString::fromUtf8(enum_file.readAll()).trimmed();
    enum_file.close();
    QStringList lines = enum_contents.split("\n");
    QStringList values = lines.takeFirst().split(" ");
    Q_ASSERT(values.size() == 2);
    QString prop_name = values.at(1);
    Q_ASSERT(values.at(0) == "enum");
    enum_contents = lines.join("\n");
    Q_ASSERT(enum_contents.endsWith(";"));
    enum_contents.chop(1);
    QString json = QString("(") + enum_contents.replace("=", ":") + QString(")");
    mf_obj.setProperty(prop_name, m_engine->evaluate(json));

    // create functions
    mf_obj.setProperty("username", m_engine->newFunction(username));
    mf_obj.setProperty("itemStackHeight", m_engine->newFunction(itemStackHeight, 1));

    QScriptValue ctor = m_engine->evaluate("MineflayerBot");
    if (m_engine->hasUncaughtException()) {
        qWarning() << "Error while evaluating MineflayerBot constructor:" << m_engine->uncaughtException().toString();
        qWarning() << m_engine->uncaughtExceptionBacktrace().join("\n");
        return false;
    }
    if (m_exiting)
        return false;
    m_bot = ctor.construct();
    if (m_engine->hasUncaughtException()) {
        qWarning() << "Error while calling MineflayerBot constructor:" << m_engine->uncaughtException().toString();
        qWarning() << m_engine->uncaughtExceptionBacktrace().join("\n");
        return false;
    }
    if (m_exiting)
        return false;

    // connect to server
    m_server = new Server(m_url);
    bool success;
    success = connect(m_server, SIGNAL(mapChunkUpdated(QSharedPointer<Chunk>)), this, SLOT(updateChunk(QSharedPointer<Chunk>)));
    Q_ASSERT(success);
    success = connect(m_server, SIGNAL(playerPositionAndLookUpdated(Server::EntityPosition)), this, SLOT(movePlayerPosition(Server::EntityPosition)));
    Q_ASSERT(success);
    success = connect(m_server, SIGNAL(loginStatusUpdated(Server::LoginStatus)), this, SLOT(handleLoginStatusUpdated(Server::LoginStatus)));
    Q_ASSERT(success);
    success = connect(m_server, SIGNAL(chatReceived(QString,QString)), this, SLOT(handleChatReceived(QString,QString)));
    Q_ASSERT(success);
    m_server->socketConnect();

    return true;
}

void ScriptRunner::process()
{
    callBotMethod("onNextFrame");
    QTimer::singleShot(1, this, SLOT(process()));
}

void ScriptRunner::callBotMethod(QString method_name, const QScriptValueList &args)
{
    QScriptValue method = m_bot.property(method_name);
    if (method.isValid()) {
        method.call(m_bot, args);
        if (m_engine->hasUncaughtException()) {
            qWarning() << "Error while calling method" << method_name;
            qWarning() << m_engine->uncaughtException().toString();
            qWarning() << m_engine->uncaughtExceptionBacktrace().join("\n");
            m_engine->clearExceptions();
        }
    }
}

void ScriptRunner::print(QString text)
{
    m_stdout << text;
}

void ScriptRunner::debug(QString line)
{
    m_stderr << line << "\n";
    m_stderr.flush();
}

void ScriptRunner::chat(QString message)
{
    m_server->sendChat(message);
}

void ScriptRunner::exit()
{
    m_exiting = true;
    QCoreApplication::instance()->quit();
}

QScriptValue ScriptRunner::username(QScriptContext *context, QScriptEngine *engine)
{
    ScriptRunner * me = (ScriptRunner *) engine->parent();
    if (! me->argCount(context, 0))
        return QScriptValue();
    return me->m_url.userName();
}

QScriptValue ScriptRunner::itemStackHeight(QScriptContext *context, QScriptEngine *engine)
{
    ScriptRunner * me = (ScriptRunner *) engine->parent();
    if (! me->argCount(context, 1))
        return QScriptValue();
    QScriptValue val = context->argument(0);
    if (! val.isNumber()) {
        qWarning() << "itemStackHeight: invalid argument at" << context->backtrace().join("\n");
        return -1;
    }
    return me->m_item_stack_height.value((Block::ItemType)val.toInteger(), -1);
}

bool ScriptRunner::argCount(QScriptContext *context, int arg_count)
{
    if (context->argumentCount() == arg_count)
        return true;

    qWarning() << "Expected" << arg_count << "arguments. Received" << context->argumentCount();
    qWarning() << m_engine->currentContext()->backtrace().join("\n");
    m_engine->abortEvaluation();
    exit();
    return false;
}

void ScriptRunner::updateChunk(QSharedPointer<Chunk> chunk)
{
    // TODO
}

void ScriptRunner::movePlayerPosition(Server::EntityPosition position)
{
    // TODO
}

void ScriptRunner::handleChatReceived(QString username, QString message)
{
    callBotMethod("onChat", QScriptValueList() << username << message);
}

void ScriptRunner::handleLoginStatusUpdated(Server::LoginStatus status)
{
    switch (status) {
        case Server::Disconnected:
            qWarning() << "Got disconnected from server";
            exit();
            break;
        case Server::Success:
            callBotMethod("onConnected");
            QTimer::singleShot(1, this, SLOT(process()));
            break;
        case Server::SocketError:
            qWarning() << "Unable to connect to server";
            exit();
            break;
        default:;
    }
}
