#include "ScriptRunner.h"
#include "PhysicsDoer.h"

#ifdef MINEFLAYER_GUI_ON
#include <QMainWindow>
#endif

#include <QFile>
#include <QDebug>
#include <QCoreApplication>
#include <QDir>

#include <cmath>


ScriptRunner::ScriptRunner(QUrl url, QString script_file, QStringList args, bool debug, QStringList lib_path) :
    QObject(NULL),
    m_url(url),
    m_main_script_filename(script_file),
    m_args(args),
    m_debug(debug),
    m_engine(NULL),
    m_game(new Game(url)),
    m_started_game(false),
    m_exiting(false),
    m_stderr(stderr),
    m_stdout(stdout),
    m_timer_count(0),
#ifdef MINEFLAYER_GUI_ON
    m_debugger(NULL),
#endif
    m_lib_path(lib_path),
    m_physics_doer(NULL)
{
    m_engine = new QScriptEngine(this);

#ifdef MINEFLAYER_GUI_ON
    if (debug) {
        m_debugger = new QScriptEngineDebugger();
        m_debugger->attachTo(m_engine);
    }
#endif

    bool success;
    success = connect(QCoreApplication::instance(), SIGNAL(aboutToQuit()), this, SLOT(cleanup()));
    Q_ASSERT(success);

    // run in our own thread
    m_thread = new QThread();
    m_thread->start();
    this->moveToThread(m_thread);

}

void ScriptRunner::bootstrap()
{
    if (QThread::currentThread() != m_thread) {
        bool success;
        success = QMetaObject::invokeMethod(this, "bootstrap", Qt::QueuedConnection);
        Q_ASSERT(success);
        return;
    }

    // initialize the MF object before we run any user code
    QScriptValue mf_obj = m_engine->newObject();
    m_engine->globalObject().setProperty("mf", mf_obj);

    // add utility functions
    mf_obj.setProperty("include", m_engine->newFunction(include));
    mf_obj.setProperty("exit", m_engine->newFunction(exit));
    mf_obj.setProperty("print", m_engine->newFunction(print));
    mf_obj.setProperty("debug", m_engine->newFunction(debug));
    mf_obj.setProperty("setTimeout", m_engine->newFunction(setTimeout));
    mf_obj.setProperty("clearTimeout", m_engine->newFunction(clearTimeout));
    mf_obj.setProperty("setInterval", m_engine->newFunction(setInterval));
    mf_obj.setProperty("clearInterval", m_engine->newFunction(clearTimeout));
    mf_obj.setProperty("currentTimestamp", m_engine->newFunction(currentTimestamp));
    mf_obj.setProperty("readFile", m_engine->newFunction(readFile));
    mf_obj.setProperty("writeFile", m_engine->newFunction(writeFile));
    mf_obj.setProperty("args", m_engine->newFunction(args));

    // init event handler framework
    {
        QString file_name = ":/js/create_handlers.js";
        m_handler_map = evalJsonContents(internalReadFile(file_name), file_name);
        checkEngine("creating event handlers");
    }
    // init builtin types
    {
        QString file_name = ":/js/builtin_types.js";
        m_engine->evaluate(internalReadFile(file_name), file_name);
        checkEngine("evaluating builtin type");
        m_point_class = mf_obj.property("Point");
        m_entity_class = mf_obj.property("Entity");
        m_item_class = mf_obj.property("Item");
        m_block_class = mf_obj.property("Block");
        m_health_status_class = mf_obj.property("HealthStatus");
        m_status_effect_class = mf_obj.property("StatusEffect");
    }
    // create the mf.ItemType enum
    {
        QScriptValue item_type_obj = m_engine->newObject();
        mf_obj.setProperty("ItemType", item_type_obj);

        const QHash<Item::ItemType, Item::ItemData*> * item_data_hash = Item::itemDataHash();
        for (QHash<Item::ItemType, Item::ItemData*>::const_iterator it = item_data_hash->constBegin();
             it != item_data_hash->constEnd(); ++it)
        {
            const Item::ItemData * item_data = it.value();
            item_type_obj.setProperty(item_data->name, item_data->id);
        }
    }

    // hook up mf functions
    mf_obj.setProperty("chat", m_engine->newFunction(chat));
    mf_obj.setProperty("timeOfDay", m_engine->newFunction(timeOfDay));
    mf_obj.setProperty("itemStackHeight", m_engine->newFunction(itemStackHeight));
    mf_obj.setProperty("isPhysical", m_engine->newFunction(isPhysical));
    mf_obj.setProperty("isSafe", m_engine->newFunction(isSafe));
    mf_obj.setProperty("isDiggable", m_engine->newFunction(isDiggable));
    mf_obj.setProperty("healthStatus", m_engine->newFunction(healthStatus));
    mf_obj.setProperty("blockAt", m_engine->newFunction(blockAt));
    mf_obj.setProperty("isBlockLoaded", m_engine->newFunction(isBlockLoaded));
    mf_obj.setProperty("signTextAt", m_engine->newFunction(signTextAt));
    mf_obj.setProperty("self", m_engine->newFunction(self));
    mf_obj.setProperty("setControlState", m_engine->newFunction(setControlState));
    mf_obj.setProperty("clearControlStates", m_engine->newFunction(clearControlStates));
    mf_obj.setProperty("lookAt", m_engine->newFunction(lookAt));
    mf_obj.setProperty("respawn", m_engine->newFunction(respawn));
    mf_obj.setProperty("entity", m_engine->newFunction(entity));
    mf_obj.setProperty("startDigging", m_engine->newFunction(startDigging));
    mf_obj.setProperty("stopDigging", m_engine->newFunction(stopDigging));
    mf_obj.setProperty("attackEntity", m_engine->newFunction(attackEntity));

    mf_obj.setProperty("selectEquipSlot", m_engine->newFunction(selectEquipSlot));
    mf_obj.setProperty("selectedEquipSlot", m_engine->newFunction(selectedEquipSlot));
    mf_obj.setProperty("openInventoryWindow", m_engine->newFunction(openInventoryWindow));
    mf_obj.setProperty("clickInventorySlot", m_engine->newFunction(clickInventorySlot));
    mf_obj.setProperty("clickUniqueSlot", m_engine->newFunction(clickUniqueSlot));
    mf_obj.setProperty("clickOutsideWindow", m_engine->newFunction(clickOutsideWindow));
    mf_obj.setProperty("closeWindow", m_engine->newFunction(closeWindow));
    mf_obj.setProperty("inventoryItem", m_engine->newFunction(inventoryItem));
    mf_obj.setProperty("uniqueWindowItem", m_engine->newFunction(uniqueWindowItem));
    mf_obj.setProperty("canPlaceBlock", m_engine->newFunction(canPlaceBlock));
    mf_obj.setProperty("activateItem", m_engine->newFunction(activateItem));
    mf_obj.setProperty("dimension", m_engine->newFunction(dimension));
    mf_obj.setProperty("onlinePlayers", m_engine->newFunction(onlinePlayers));


    // hook up hax functions
    QScriptValue hax_obj = m_engine->newObject();
    mf_obj.setProperty("hax", hax_obj);
    hax_obj.setProperty("setPosition", m_engine->newFunction(setPosition));
    hax_obj.setProperty("positionUpdateInterval", m_engine->newFunction(positionUpdateInterval));
    hax_obj.setProperty("setGravityEnabled", m_engine->newFunction(setGravityEnabled));
    hax_obj.setProperty("setJesusModeEnabled", m_engine->newFunction(setJesusModeEnabled));

    hax_obj.setProperty("placeBlock", m_engine->newFunction(placeBlock));
    hax_obj.setProperty("activateBlock", m_engine->newFunction(activateBlock));

    // run main script
    QString main_script_contents = internalReadFile(m_main_script_filename);
    if (main_script_contents.isNull()) {
        m_stderr << "file not found: " << m_main_script_filename << "\n";
        m_stderr.flush();
        QCoreApplication::instance()->exit(1);
        return;
    }
    m_engine->evaluate(main_script_contents, m_main_script_filename);
    checkEngine("evaluating main script");

    if (m_exiting)
        return;

    // connect to server
    bool success;

    success = connect(m_game, SIGNAL(entitySpawned(QSharedPointer<Game::Entity>)), this, SLOT(handleEntitySpawned(QSharedPointer<Game::Entity>)));
    Q_ASSERT(success);
    success = connect(m_game, SIGNAL(entityMoved(QSharedPointer<Game::Entity>)), this, SLOT(handleEntityMoved(QSharedPointer<Game::Entity>)));
    Q_ASSERT(success);
    success = connect(m_game, SIGNAL(entityDespawned(QSharedPointer<Game::Entity>)), this, SLOT(handleEntityDespawned(QSharedPointer<Game::Entity>)));
    Q_ASSERT(success);
    success = connect(m_game, SIGNAL(animation(QSharedPointer<Game::Entity>,Message::AnimationType)), this, SLOT(handleAnimation(QSharedPointer<Game::Entity>,Message::AnimationType)));
    Q_ASSERT(success);
    success = connect(m_game, SIGNAL(entityEffect(QSharedPointer<Game::Entity>,QSharedPointer<Game::StatusEffect>)), this, SLOT(handleEntityEffect(QSharedPointer<Game::Entity>,QSharedPointer<Game::StatusEffect>)));
    Q_ASSERT(success);
    success = connect(m_game, SIGNAL(removeEntityEffect(QSharedPointer<Game::Entity>,QSharedPointer<Game::StatusEffect>)), this, SLOT(handleRemoveEntityEffect(QSharedPointer<Game::Entity>,QSharedPointer<Game::StatusEffect>)));
    Q_ASSERT(success);
    success = connect(m_game, SIGNAL(chunkUpdated(Int3D,Int3D)), this, SLOT(handleChunkUpdated(Int3D,Int3D)));
    Q_ASSERT(success);
    success = connect(m_game, SIGNAL(signUpdated(Int3D,QString)), this, SLOT(handleSignUpdated(Int3D,QString)));
    Q_ASSERT(success);
    success = connect(m_game, SIGNAL(playerPositionUpdated()), this, SLOT(movePlayerPosition()));
    Q_ASSERT(success);
    success = connect(m_game, SIGNAL(loginStatusUpdated(Server::LoginStatus)), this, SLOT(handleLoginStatusUpdated(Server::LoginStatus)));
    Q_ASSERT(success);
    success = connect(m_game, SIGNAL(chatReceived(QString,QString)), this, SLOT(handleChatReceived(QString,QString)));
    Q_ASSERT(success);
    success = connect(m_game, SIGNAL(nonSpokenChatReceived(QString)), this, SLOT(handleNonSpokenChatReceived(QString)));
    Q_ASSERT(success);
    success = connect(m_game, SIGNAL(timeUpdated(double)), this, SLOT(handleTimeUpdated(double)));
    Q_ASSERT(success);
    success = connect(m_game, SIGNAL(playerDied()), this, SLOT(handlePlayerDied()));
    Q_ASSERT(success);
    success = connect(m_game, SIGNAL(playerSpawned(int)), this, SLOT(handlePlayerSpawned(int)));
    Q_ASSERT(success);
    success = connect(m_game, SIGNAL(playerHealthStatusUpdated()), this, SLOT(handlePlayerHealthStatusUpdated()));
    Q_ASSERT(success);
    success = connect(m_game, SIGNAL(inventoryUpdated()), this, SLOT(handleInventoryUpdated()));
    Q_ASSERT(success);
    success = connect(m_game, SIGNAL(stoppedDigging(Game::StoppedDiggingReason)), this, SLOT(handleStoppedDigging(Game::StoppedDiggingReason)));
    Q_ASSERT(success);
    success = connect(m_game, SIGNAL(windowOpened(Message::WindowType)), this, SLOT(handleWindowOpened(Message::WindowType)));
    Q_ASSERT(success);
    success = connect(m_game, SIGNAL(equippedItemChanged()), this, SLOT(handleEquippedItemChanged()));
    Q_ASSERT(success);


    success = connect(&m_stdin_reader, SIGNAL(readLine(QString)), this, SLOT(handleReadLine(QString)));
    Q_ASSERT(success);
    success = connect(&m_stdin_reader, SIGNAL(eof()), QCoreApplication::instance(), SLOT(quit()));
    Q_ASSERT(success);

    m_physics_doer = new PhysicsDoer(m_game);

    m_started_game = true;
    m_game->start();
    m_stdin_reader.start();
}

QString ScriptRunner::internalReadFile(const QString &path)
{
    QFile file(path);
    if (!file.open(QIODevice::ReadOnly))
        return QString();
    QString contents = QString::fromUtf8(file.readAll());
    file.close();
    return contents;
}

QScriptValue ScriptRunner::evalJsonContents(const QString & file_contents, const QString & file_name)
{
    QScriptValue value = m_engine->evaluate(QString("(") + file_contents + QString(")"), file_name);
    checkEngine("evaluating json");
    return value;
}

void ScriptRunner::checkEngine(const QString & while_doing_what)
{
    if (m_exiting)
        return;
    if (!m_engine->hasUncaughtException())
        return;
    if (m_engine->uncaughtException().toString() != "Error: SystemExit") {
        if (!while_doing_what.isEmpty())
            m_stderr << "Error while " << while_doing_what << "\n";
        m_stderr << m_engine->uncaughtException().toString() << "\n";
        m_stderr << m_engine->uncaughtExceptionBacktrace().join("\n") << "\n";
        m_stderr.flush();
        QCoreApplication::instance()->exit(1);
    } else {
        QCoreApplication::instance()->exit(0);
    }
    m_exiting = true;
}

void ScriptRunner::dispatchTimeout()
{
    QTimer * timer = (QTimer *) sender();
    TimedFunction tf = m_script_timers.value(timer);
    if (! tf.repeat) {
        m_timer_ptrs.remove(tf.id);
        m_script_timers.remove(timer);
        delete timer;
    }
    tf.function.call(tf.this_ref);
    checkEngine("dispatching timeout");
}

QScriptValue ScriptRunner::setTimeout(QScriptContext *context, QScriptEngine *engine)
{
    ScriptRunner * me = (ScriptRunner *) engine->parent();
    QScriptValue error;
    if (!me->argCount(context, error, 2))
        return error;
    QScriptValue func = context->argument(0);
    if (!me->maybeThrowArgumentError(context, error, func.isFunction()))
        return error;
    QScriptValue ms = context->argument(1);
    if (!me->maybeThrowArgumentError(context, error, ms.isNumber()))
        return error;

    return me->setTimeout(func, ms.toInt32(), context->parentContext()->thisObject(), false);
}

QScriptValue ScriptRunner::setInterval(QScriptContext *context, QScriptEngine *engine)
{
    ScriptRunner * me = (ScriptRunner *) engine->parent();
    QScriptValue error;
    if (!me->argCount(context, error, 2))
        return error;
    QScriptValue func = context->argument(0);
    if (!me->maybeThrowArgumentError(context, error, func.isFunction()))
        return error;
    QScriptValue ms = context->argument(1);
    if (!me->maybeThrowArgumentError(context, error, ms.isNumber()))
        return error;

    return me->setTimeout(func, ms.toInt32(), context->parentContext()->thisObject(), true);
}

int ScriptRunner::setTimeout(QScriptValue func, int ms, QScriptValue this_obj, bool repeat)
{
    QTimer * new_timer = new QTimer(this);
    new_timer->setInterval(ms);
    bool success;
    success = connect(new_timer, SIGNAL(timeout()), this, SLOT(dispatchTimeout()));
    Q_ASSERT(success);
    int timer_id = nextTimerId();
    m_timer_ptrs.insert(timer_id, new_timer);
    m_script_timers.insert(new_timer, TimedFunction(timer_id, repeat, this_obj, func));
    new_timer->start();
    return timer_id;
}

QScriptValue ScriptRunner::clearTimeout(QScriptContext *context, QScriptEngine *engine)
{
    ScriptRunner * me = (ScriptRunner *) engine->parent();
    QScriptValue error;
    if (!me->argCount(context, error, 1))
        return error;
    QScriptValue id = context->argument(0);
    if (!me->maybeThrowArgumentError(context, error, id.isNumber()))
        return error;

    int int_id = id.toInt32();
    QTimer * ptr = me->m_timer_ptrs.value(int_id, NULL);
    me->m_timer_ptrs.remove(int_id);
    me->m_script_timers.remove(ptr);
    delete ptr;
    return QScriptValue();
}

QScriptValue ScriptRunner::currentTimestamp(QScriptContext *context, QScriptEngine *engine)
{
    ScriptRunner * me = (ScriptRunner *) engine->parent();
    QScriptValue error;
    if (!me->argCount(context, error, 0))
        return error;
    return QScriptValue((double)QDateTime::currentMSecsSinceEpoch());
}

QScriptValue ScriptRunner::readFile(QScriptContext *context, QScriptEngine *engine)
{
    ScriptRunner * me = (ScriptRunner *) engine->parent();
    QScriptValue error;
    if (!me->argCount(context, error, 1))
        return error;
    QScriptValue path_value = context->argument(0);
    if (!me->maybeThrowArgumentError(context, error, path_value.isString()))
        return error;

    QString path = path_value.toString();
    QString contents = me->internalReadFile(path);
    if (contents.isNull())
        return QScriptValue();
    return contents;
}
QScriptValue ScriptRunner::writeFile(QScriptContext *context, QScriptEngine *engine)
{
    ScriptRunner * me = (ScriptRunner *) engine->parent();
    QScriptValue error;
    if (!me->argCount(context, error, 2))
        return error;
    QScriptValue path_value = context->argument(0);
    if (!me->maybeThrowArgumentError(context, error, path_value.isString()))
        return error;
    QScriptValue contents_value = context->argument(1);
    if (!me->maybeThrowArgumentError(context, error, contents_value.isString()))
        return error;

    QString path = path_value.toString();
    QFile file(path);
    if (!file.open(QIODevice::WriteOnly))
        return context->throwError(tr("Unable to write file: %1").arg(path));
    QByteArray contents = contents_value.toString().toUtf8();
    int index = 0;
    while (index < contents.size()) {
        int written_size = file.write(contents.mid(index));
        if (written_size == -1) {
            file.close();
            return context->throwError(tr("Unable to write file: %1").arg(path));
        }
        index += written_size;
    }
    file.close();
    return QScriptValue();
}
QScriptValue ScriptRunner::args(QScriptContext *context, QScriptEngine *engine)
{
    ScriptRunner * me = (ScriptRunner *) engine->parent();
    QScriptValue error;
    if (!me->argCount(context, error, 0))
        return error;

    QScriptValue array = engine->newArray();
    foreach (QString arg, me->m_args)
        array.property("push").call(array, QScriptValueList() << arg);
    return array;
}

int ScriptRunner::nextTimerId()
{
    return m_timer_count++;
}

void ScriptRunner::raiseEvent(QString event_name, const QScriptValueList &args)
{
    QScriptValue handlers_value = m_handler_map.property(event_name);
    Q_ASSERT(handlers_value.isArray());
    int length = handlers_value.property("length").toInt32();
    if (length == 0)
        return;
    // create copy so handlers can remove themselves
    QList<QScriptValue> handlers_list;
    for (int i = 0; i < length; i++)
        handlers_list.append(handlers_value.property(i));
    foreach (QScriptValue handler, handlers_list) {
        Q_ASSERT(handler.isFunction());
        handler.call(QScriptValue(), args);
        checkEngine(QString("calling event handler ") + event_name);
    }
}

QScriptValue ScriptRunner::include(QScriptContext *context, QScriptEngine *engine)
{
    ScriptRunner * me = (ScriptRunner *) engine->parent();
    QScriptValue error;
    if (! me->argCount(context, error, 1))
        return error;

    QScriptValue file_name_value = context->argument(0);
    if (!me->maybeThrowArgumentError(context, error, file_name_value.isString()))
        return error;
    QString file_name = file_name_value.toString();

    if (me->m_included_filenames.contains(file_name)) {
        // already included this script, skip!
        return QScriptValue();
    }
    me->m_included_filenames.insert(file_name);

    // look in all lib paths for the file
    QString contents;
    foreach (QString lib_path, me->m_lib_path) {
        QString absolute_file_path = QDir(lib_path).absoluteFilePath(file_name);
        contents = me->internalReadFile(absolute_file_path);
        if (! contents.isNull())
            break;
    }

    if (contents.isNull())
        return context->throwError(tr("Connot open included file: %1\nLooked in %2\n").arg(file_name, me->m_lib_path.join(":")));

    context->setActivationObject(engine->globalObject());
    context->setThisObject(engine->globalObject());
    engine->evaluate(contents, file_name);
    me->checkEngine("evaluating included file");
    return QScriptValue();
}

QScriptValue ScriptRunner::exit(QScriptContext *context, QScriptEngine *engine)
{
    ScriptRunner * me = (ScriptRunner *) engine->parent();
    QScriptValue error;
    if (! me->argCount(context, error, 0, 1))
        return error;
    int return_code = 0;
    if (context->argumentCount() == 1) {
        QScriptValue return_code_value = context->argument(0);
        if (!me->maybeThrowArgumentError(context, error, return_code_value.isNumber()))
            return error;
        return_code = return_code_value.toInt32();
    }
    // TODO: care about the return code
    return context->throwError("SystemExit");
}

QScriptValue ScriptRunner::print(QScriptContext *context, QScriptEngine *engine)
{
    ScriptRunner * me = (ScriptRunner *) engine->parent();
    QScriptValue error;
    if (!me->argCount(context, error, 1))
        return error;
    QScriptValue arg_value = context->argument(0);
    if (!me->maybeThrowArgumentError(context, error, arg_value.isString()))
        return error;
    QString text = arg_value.toString();
    me->m_stdout << text;
    me->m_stdout.flush();
    return QScriptValue();
}

QScriptValue ScriptRunner::debug(QScriptContext *context, QScriptEngine *engine)
{
    ScriptRunner * me = (ScriptRunner *) engine->parent();
    QScriptValue error;
    if (! me->argCount(context, error, 1))
        return error;
    // argument can be anything
    QString line = context->argument(0).toString();
    me->m_stderr << line << "\n";
    me->m_stderr.flush();
    return QScriptValue();
}

void ScriptRunner::cleanup()
{
    m_exiting = true;
    m_thread->exit();
}

QScriptValue ScriptRunner::chat(QScriptContext *context, QScriptEngine *engine)
{
    ScriptRunner * me = (ScriptRunner *) engine->parent();
    QScriptValue error;
    if (!me->argCount(context, error, 1))
        return error;
    QScriptValue message_value = context->argument(0);
    if (!me->maybeThrowArgumentError(context, error, message_value.isString()))
        return error;
    QString message = message_value.toString();

    me->m_game->sendChat(message);

    return QScriptValue();
}
QScriptValue ScriptRunner::timeOfDay(QScriptContext *context, QScriptEngine *engine)
{
    ScriptRunner * me = (ScriptRunner *) engine->parent();
    QScriptValue error;
    if (!me->argCount(context, error, 0))
        return error;
    return me->m_game->timeOfDay();
}

QScriptValue ScriptRunner::itemStackHeight(QScriptContext *context, QScriptEngine *engine)
{
    ScriptRunner * me = (ScriptRunner *) engine->parent();
    QScriptValue error;
    if (!me->argCount(context, error, 1))
        return error;
    QScriptValue value = context->argument(0);
    if (!me->maybeThrowArgumentError(context, error, value.isNumber()))
        return error;

    return Item::itemData((Item::ItemType)value.toInt32())->stack_height;
}
QScriptValue ScriptRunner::isPhysical(QScriptContext *context, QScriptEngine *engine)
{
    ScriptRunner * me = (ScriptRunner *) engine->parent();
    QScriptValue error;
    if (!me->argCount(context, error, 1))
        return error;
    QScriptValue value = context->argument(0);
    if (!me->maybeThrowArgumentError(context, error, value.isNumber()))
        return error;
    return Item::itemData((Item::ItemType)value.toInt32())->physical;
}
QScriptValue ScriptRunner::isSafe(QScriptContext *context, QScriptEngine *engine)
{
    ScriptRunner * me = (ScriptRunner *) engine->parent();
    QScriptValue error;
    if (!me->argCount(context, error, 1))
        return error;
    QScriptValue value = context->argument(0);
    if (!me->maybeThrowArgumentError(context, error, value.isNumber()))
        return error;
    return Item::itemData((Item::ItemType)value.toInt32())->safe;
}
QScriptValue ScriptRunner::isDiggable(QScriptContext *context, QScriptEngine *engine)
{
    ScriptRunner * me = (ScriptRunner *) engine->parent();
    QScriptValue error;
    if (!me->argCount(context, error, 1))
        return error;
    QScriptValue value = context->argument(0);
    if (!me->maybeThrowArgumentError(context, error, value.isNumber()))
        return error;
    return Item::itemData((Item::ItemType)value.toInt32())->diggable;
}

QScriptValue ScriptRunner::healthStatus(QScriptContext *context, QScriptEngine *engine)
{
    ScriptRunner * me = (ScriptRunner *) engine->parent();
    QScriptValue error;
    if (!me->argCount(context, error, 0))
        return error;
    return me->m_health_status_class.construct(QScriptValueList()
                                               << me->m_game->playerHealthStatus().health
                                               << me->m_game->playerHealthStatus().food
                                               << me->m_game->playerHealthStatus().food_saturation);
}

QScriptValue ScriptRunner::blockAt(QScriptContext *context, QScriptEngine *engine)
{
    ScriptRunner * me = (ScriptRunner *) engine->parent();
    QScriptValue error;
    if (!me->argCount(context, error, 1))
        return error;
    QScriptValue js_pt = context->argument(0);
    if (!me->maybeThrowArgumentError(context, error, js_pt.isObject()))
        return error;
    Int3D pt;
    if (!fromJsPoint(context, error, js_pt, pt))
        return error;
    return me->jsBlock(me->m_game->blockAt(pt));
}

QScriptValue ScriptRunner::isBlockLoaded(QScriptContext *context, QScriptEngine *engine)
{
    ScriptRunner * me = (ScriptRunner *) engine->parent();
    QScriptValue error;
    if (!me->argCount(context, error, 1))
        return error;
    QScriptValue js_pt = context->argument(0);
    if (!me->maybeThrowArgumentError(context, error, js_pt.isObject()))
        return error;
    Int3D pt;
    if (!fromJsPoint(context, error, js_pt, pt))
        return error;
    return me->m_game->isBlockLoaded(pt);
}

QScriptValue ScriptRunner::signTextAt(QScriptContext *context, QScriptEngine *engine)
{
    ScriptRunner * me = (ScriptRunner *) engine->parent();
    QScriptValue error;
    if (!me->argCount(context, error, 1))
        return error;
    QScriptValue js_pt = context->argument(0);
    if (!me->maybeThrowArgumentError(context, error, js_pt.isObject()))
        return error;
    Int3D pt;
    if (!fromJsPoint(context, error, js_pt, pt))
        return error;
    QString text = me->m_game->signTextAt(pt);
    if (text.isNull())
        return QScriptValue();
    return text;
}

QScriptValue ScriptRunner::self(QScriptContext *context, QScriptEngine *engine)
{
    ScriptRunner * me = (ScriptRunner *) engine->parent();
    QScriptValue error;
    if (!me->argCount(context, error, 0))
        return error;
    int entity_id = me->m_game->playerEntityId();
    return me->jsEntity(me->m_game->entity(entity_id));
}
QScriptValue ScriptRunner::jsEntity(QSharedPointer<Game::Entity> entity)
{
    QScriptValue result = m_entity_class.construct();
    result.setProperty("entity_id", entity->entity_id);
    Server::EntityPosition position = entity->position;
    result.setProperty("position", jsPoint(position.pos));
    result.setProperty("velocity", jsPoint(position.vel));
    result.setProperty("yaw", position.yaw);
    result.setProperty("pitch", position.pitch);
    result.setProperty("on_ground", position.on_ground);
    result.setProperty("height", position.height);

    Game::Entity::EntityType type = entity->type;
    result.setProperty("type", (int)type);
    switch (type) {
        case Game::Entity::NamedPlayerEntity: {
            result.setProperty("username", ((Game::NamedPlayerEntity*)entity.data())->username);
            result.setProperty("held_item", (int)((Game::NamedPlayerEntity*)entity.data())->held_item);
            QScriptValue effects_obj = m_engine->newObject();
            QMap<int, QSharedPointer<Game::StatusEffect> >* effects = &((Game::NamedPlayerEntity*)entity.data())->effects;
            foreach (QSharedPointer<Game::StatusEffect> effect, effects->values())
                effects_obj.setProperty(effect.data()->effect_id, jsStatusEffect(effect));
            result.setProperty("effects", effects_obj);
            break;
        }
        case Game::Entity::MobEntity:
            result.setProperty("mob_type", (int)((Game::MobEntity*)entity.data())->mob_type);
            break;
        case Game::Entity::PickupEntity:
            result.setProperty("item", jsItem(((Game::PickupEntity*)entity.data())->item));
            break;
        default:
            Q_ASSERT(false);
    }
    return result;
}

QScriptValue ScriptRunner::jsStatusEffect(QSharedPointer<Game::StatusEffect> effect_pointer)
{
    Game::StatusEffect * effect = effect_pointer.data();
    return m_status_effect_class.construct(QScriptValueList() << effect->effect_id << effect->amplifier << (double)effect->start_timestamp << effect->duration_milliseconds);
}

QScriptValue ScriptRunner::setControlState(QScriptContext *context, QScriptEngine *engine)
{
    ScriptRunner * me = (ScriptRunner *) engine->parent();
    QScriptValue error;
    if (!me->argCount(context, error, 2))
        return error;
    QScriptValue control = context->argument(0);
    if (!me->maybeThrowArgumentError(context, error, control.isNumber()))
        return error;
    QScriptValue state = context->argument(1);
    if (!me->maybeThrowArgumentError(context, error, state.isBool()))
        return error;

    me->m_game->setControlActivated((Game::Control) control.toInt32(), state.toBool());
    return QScriptValue();
}
QScriptValue ScriptRunner::clearControlStates(QScriptContext *context, QScriptEngine *engine)
{
    ScriptRunner * me = (ScriptRunner *) engine->parent();
    QScriptValue error;
    if (!me->argCount(context, error, 0))
        return error;

    for (int control = 0; control < Game::ControlCount; control++)
        me->m_game->setControlActivated((Game::Control)control, false);
    return QScriptValue();
}

QScriptValue ScriptRunner::lookAt(QScriptContext *context, QScriptEngine *engine)
{
    ScriptRunner * me = (ScriptRunner *) engine->parent();
    QScriptValue error;
    if (!me->argCount(context, error, 1, 2))
        return error;
    QScriptValue point_value = context->argument(0);
    Double3D point;
    if (!me->fromJsPoint(context, error, point_value, point))
        return error;
    QScriptValue force_value = context->argument(1);
    bool force = false;
    if (force_value.isBool())
        force = force_value.toBool();

    Server::EntityPosition my_position = me->m_game->playerPosition();
    Double3D delta = point - my_position.pos;

    if (delta.x * delta.x + delta.y * delta.y + delta.z * delta.z >= 0.1) {
        // only go through with this if we're not trying to look too close (like at ourselves)
        double yaw = std::atan2(-delta.x, -delta.z);
        double ground_distance = std::sqrt(delta.x * delta.x + delta.z * delta.z);
        double pitch = std::atan2(delta.y, ground_distance);
        me->m_game->setPlayerLook(yaw, pitch, force);
    }
    return QScriptValue();
}

QScriptValue ScriptRunner::respawn(QScriptContext *context, QScriptEngine *engine)
{
    ScriptRunner * me = (ScriptRunner *) engine->parent();
    QScriptValue error;
    if (!me->argCount(context, error, 0))
        return error;
    me->m_game->respawn();
    return QScriptValue();
}

QScriptValue ScriptRunner::entity(QScriptContext *context, QScriptEngine *engine)
{
    ScriptRunner * me = (ScriptRunner *) engine->parent();
    QScriptValue error;
    if (!me->argCount(context, error, 1))
        return error;

    QScriptValue entity_id_value = context->argument(0);
    if (!me->maybeThrowArgumentError(context, error, entity_id_value.isNumber()))
        return error;
    int entity_id = entity_id_value.toInt32();

    QSharedPointer<Game::Entity> entity = me->m_game->entity(entity_id);
    if (entity.isNull())
        return QScriptValue();
    return me->jsEntity(entity);
}

QScriptValue ScriptRunner::startDigging(QScriptContext *context, QScriptEngine *engine)
{
    ScriptRunner * me = (ScriptRunner *) engine->parent();
    QScriptValue error;
    if (!me->argCount(context, error, 1))
        return error;

    QScriptValue point_value = context->argument(0);
    Int3D point;
    if (!me->fromJsPoint(context, error, point_value, point))
        return error;

    me->m_game->startDigging(point);
    return QScriptValue();
}
QScriptValue ScriptRunner::stopDigging(QScriptContext *context, QScriptEngine *engine)
{
    ScriptRunner * me = (ScriptRunner *) engine->parent();
    QScriptValue error;
    if (!me->argCount(context, error, 0))
        return error;

    me->m_game->stopDigging();
    return QScriptValue();
}

QScriptValue ScriptRunner::placeBlock(QScriptContext *context, QScriptEngine *engine)
{
    ScriptRunner * me = (ScriptRunner *) engine->parent();
    QScriptValue error;
    if (!me->argCount(context, error, 2))
        return error;

    QScriptValue point_value = context->argument(0);
    Int3D point;
    if (!me->fromJsPoint(context, error, point_value, point))
        return error;

    QScriptValue face_value = context->argument(1);
    if (!me->maybeThrowArgumentError(context, error, face_value.isNumber()))
        return error;
    Message::BlockFaceDirection face = (Message::BlockFaceDirection) face_value.toInt32();

    if (!me->m_game->placeBlock(point, face))
        return context->throwError("Invalid Argument");
    return QScriptValue();
}

QScriptValue ScriptRunner::activateItem(QScriptContext *context, QScriptEngine *engine)
{
    ScriptRunner * me = (ScriptRunner *) engine->parent();
    QScriptValue error;
    if (!me->argCount(context, error, 0))
        return error;

    if (! me->m_game->activateItem())
        return context->throwError("That item is not activatable.");

    return QScriptValue();
}

QScriptValue ScriptRunner::canPlaceBlock(QScriptContext *context, QScriptEngine *engine)
{
    ScriptRunner * me = (ScriptRunner *) engine->parent();
    QScriptValue error;
    if (!me->argCount(context, error, 2))
        return error;

    QScriptValue point_value = context->argument(0);
    Int3D point;
    if (!me->fromJsPoint(context, error, point_value, point))
        return error;

    QScriptValue face_value = context->argument(1);
    if (!me->maybeThrowArgumentError(context, error, face_value.isNumber()))
        return error;
    Message::BlockFaceDirection face = (Message::BlockFaceDirection) face_value.toInt32();

    return me->m_game->canPlaceBlock(point, face);
}

QScriptValue ScriptRunner::activateBlock(QScriptContext *context, QScriptEngine *engine)
{
    ScriptRunner * me = (ScriptRunner *) engine->parent();
    QScriptValue error;
    if (!me->argCount(context, error, 1))
        return error;

    QScriptValue point_value = context->argument(0);
    Int3D point;
    if (!me->fromJsPoint(context, error, point_value, point))
        return error;

    me->m_game->activateBlock(point);
    return QScriptValue();
}

QScriptValue ScriptRunner::selectEquipSlot(QScriptContext *context, QScriptEngine *engine)
{
    ScriptRunner * me = (ScriptRunner *) engine->parent();
    QScriptValue error;
    if (!me->argCount(context, error, 1))
        return error;

    QScriptValue slot_id_value = context->argument(0);
    if (!me->maybeThrowArgumentError(context, error, slot_id_value.isNumber()))
        return error;
    int slot_id = slot_id_value.toInt32();

    me->m_game->selectEquipSlot(slot_id);
    return QScriptValue();
}

QScriptValue ScriptRunner::selectedEquipSlot(QScriptContext *context, QScriptEngine *engine)
{
    ScriptRunner * me = (ScriptRunner *) engine->parent();
    QScriptValue error;
    if (!me->argCount(context, error, 0))
        return error;

    return me->m_game->selectedEquipSlot();
}

QScriptValue ScriptRunner::openInventoryWindow(QScriptContext *context, QScriptEngine *engine)
{
    ScriptRunner * me = (ScriptRunner *) engine->parent();
    QScriptValue error;
    if (!me->argCount(context, error, 0))
        return error;

    me->m_game->openInventoryWindow();
    return QScriptValue();
}

QScriptValue ScriptRunner::clickInventorySlot(QScriptContext *context, QScriptEngine *engine)
{
    ScriptRunner * me = (ScriptRunner *) engine->parent();
    QScriptValue error;
    if (!me->argCount(context, error, 2))
        return error;

    QScriptValue slot_id_value = context->argument(0);
    if (!me->maybeThrowArgumentError(context, error, slot_id_value.isNumber()))
        return error;
    int slot_id = slot_id_value.toInt32();

    QScriptValue right_click_value = context->argument(1);
    if (!me->maybeThrowArgumentError(context, error, right_click_value.isBool()))
        return error;
    bool right_click = right_click_value.toBool();

    return me->m_game->clickInventorySlot(slot_id, right_click);
}

QScriptValue ScriptRunner::clickUniqueSlot(QScriptContext *context, QScriptEngine *engine)
{
    ScriptRunner * me = (ScriptRunner *) engine->parent();
    QScriptValue error;
    if (!me->argCount(context, error, 2))
        return error;

    QScriptValue slot_id_value = context->argument(0);
    if (!me->maybeThrowArgumentError(context, error, slot_id_value.isNumber()))
        return error;
    int slot_id = slot_id_value.toInt32();

    QScriptValue right_click_value = context->argument(1);
    if (!me->maybeThrowArgumentError(context, error, right_click_value.isBool()))
        return error;
    bool right_click = right_click_value.toBool();

    return me->m_game->clickUniqueSlot(slot_id, right_click);
}

QScriptValue ScriptRunner::clickOutsideWindow(QScriptContext *context, QScriptEngine *engine)
{
    ScriptRunner * me = (ScriptRunner *) engine->parent();
    QScriptValue error;
    if (!me->argCount(context, error, 1))
        return error;

    QScriptValue right_click_value = context->argument(0);
    if (!me->maybeThrowArgumentError(context, error, right_click_value.isBool()))
        return error;
    bool right_click = right_click_value.toBool();

    return me->m_game->clickOutsideWindow(right_click);
}

QScriptValue ScriptRunner::closeWindow(QScriptContext *context, QScriptEngine *engine)
{
    ScriptRunner * me = (ScriptRunner *) engine->parent();
    QScriptValue error;
    if (!me->argCount(context, error, 0))
        return error;

    me->m_game->closeWindow();
    return QScriptValue();
}

QScriptValue ScriptRunner::inventoryItem(QScriptContext *context, QScriptEngine *engine)
{
    ScriptRunner * me = (ScriptRunner *) engine->parent();
    QScriptValue error;
    if (!me->argCount(context, error, 1))
        return error;

    QScriptValue slot_id_value = context->argument(0);
    if (!me->maybeThrowArgumentError(context, error, slot_id_value.isNumber()))
        return error;
    int slot_id = slot_id_value.toInt32();

    return me->jsItem(me->m_game->inventoryItem(slot_id));
}

QScriptValue ScriptRunner::uniqueWindowItem(QScriptContext *context, QScriptEngine *engine)
{
    ScriptRunner * me = (ScriptRunner *) engine->parent();
    QScriptValue error;
    if (!me->argCount(context, error, 1))
        return error;

    QScriptValue slot_id_value = context->argument(0);
    if (!me->maybeThrowArgumentError(context, error, slot_id_value.isNumber()))
        return error;
    int slot_id = slot_id_value.toInt32();

    return me->jsItem(me->m_game->uniqueWindowItem(slot_id));
}

QScriptValue ScriptRunner::dimension(QScriptContext *context, QScriptEngine *engine)
{
    ScriptRunner * me = (ScriptRunner *) engine->parent();

    QScriptValue error;
    if (!me->argCount(context, error, 0))
        return error;

    return me->m_game->dimension();
}

QScriptValue ScriptRunner::onlinePlayers(QScriptContext *context, QScriptEngine *engine)
{
    ScriptRunner * me = (ScriptRunner *) engine->parent();

    QScriptValue error;
    if (!me->argCount(context, error, 0))
        return error;

    QScriptValue result = me->m_engine->newObject();
    QMapIterator<QString, int> iterator(me->m_game->onlinePlayers());
    while (iterator.hasNext()) {
        iterator.next();
        result.setProperty(iterator.key(), iterator.value());
    }
    return result;
}

QScriptValue ScriptRunner::setPosition(QScriptContext *context, QScriptEngine *engine)
{
    ScriptRunner * me = (ScriptRunner *) engine->parent();
    QScriptValue error;
    if (!me->argCount(context, error, 1))
        return error;
    QScriptValue point_value = context->argument(0);
    Double3D point;
    if (!me->fromJsPoint(context, error, point_value, point))
        return error;

    me->m_game->setPlayerPosition(point);
    return QScriptValue();
}

QScriptValue ScriptRunner::positionUpdateInterval(QScriptContext *context, QScriptEngine *engine)
{
    ScriptRunner * me = (ScriptRunner *) engine->parent();
    QScriptValue error;
    if (!me->argCount(context, error, 0))
        return error;

    return Game::c_position_update_interval_ms;
}

QScriptValue ScriptRunner::setGravityEnabled(QScriptContext *context, QScriptEngine *engine)
{
    ScriptRunner * me = (ScriptRunner *) engine->parent();
    QScriptValue error;
    if (!me->argCount(context, error, 1))
        return error;
    QScriptValue value_value = context->argument(0);
    if (!me->maybeThrowArgumentError(context, error, value_value.isBool()))
        return error;

    me->m_game->setGravity(value_value.toBool() ? Game::c_standard_gravity : 0);
    return QScriptValue();
}
QScriptValue ScriptRunner::attackEntity(QScriptContext *context, QScriptEngine *engine)
{
    ScriptRunner * me = (ScriptRunner *) engine->parent();
    QScriptValue error;
    if (!me->argCount(context, error, 1))
        return error;
    QScriptValue entity_id_value = context->argument(0);
    if (!me->maybeThrowArgumentError(context, error, entity_id_value.isNumber()))
        return error;
    int entity_id = entity_id_value.toInt32();

    me->m_game->attackEntity(entity_id);
    return QScriptValue();
}

QScriptValue ScriptRunner::setJesusModeEnabled(QScriptContext *context, QScriptEngine *engine)
{
    ScriptRunner * me = (ScriptRunner *) engine->parent();
    QScriptValue error;
    if (!me->argCount(context, error, 1))
        return error;
    QScriptValue value_value = context->argument(0);
    if (!me->maybeThrowArgumentError(context, error, value_value.isBool()))
        return error;
    bool value = value_value.toBool();

    Item::setJesusModeEnabled(value);
    return QScriptValue();
}


bool ScriptRunner::argCount(QScriptContext *context, QScriptValue &error, int arg_count_min, int arg_count_max)
{
    if (arg_count_max == -1)
        arg_count_max = arg_count_min;
    if (arg_count_min <= context->argumentCount() && context->argumentCount() <= arg_count_max)
        return true;

    QString message;
    if (arg_count_min == arg_count_max)
        message = tr("Expected %1 arguments. Received %2").arg(arg_count_min).arg(context->argumentCount());
    else
        message = tr("Expected between %1 and %2 arguments. Received %3").arg(arg_count_min).arg(arg_count_max).arg(context->argumentCount());
    error = context->throwError(message);
    return false;
}

bool ScriptRunner::maybeThrowArgumentError(QScriptContext *context, QScriptValue &error, bool arg_is_valid)
{
    if (arg_is_valid)
        return true;
    error = context->throwError("Invalid Argument");
    return false;
}

QScriptValue ScriptRunner::jsPoint(const Int3D &pt)
{
    return m_point_class.construct(QScriptValueList() << pt.x << pt.y << pt.z);
}
QScriptValue ScriptRunner::jsPoint(const Double3D &pt)
{
    return m_point_class.construct(QScriptValueList() << pt.x << pt.y << pt.z);
}
bool ScriptRunner::fromJsPoint(QScriptContext *context, QScriptValue &error, QScriptValue point_value, Double3D &point)
{
    QScriptValue property;
    property = point_value.property("x");
    if (!maybeThrowArgumentError(context, error, property.isNumber()))
        return false;
    point.x = property.toNumber();
    property = point_value.property("y");
    if (!maybeThrowArgumentError(context, error, property.isNumber()))
        return false;
    point.y = property.toNumber();
    property = point_value.property("z");
    if (!maybeThrowArgumentError(context, error, property.isNumber()))
        return false;
    point.z = property.toNumber();
    return true;
}
bool ScriptRunner::fromJsPoint(QScriptContext *context, QScriptValue &error, QScriptValue point_value, Int3D &floored_point)
{
    Double3D double_point;
    if (!fromJsPoint(context, error, point_value, double_point))
        return false;
    floored_point.x = std::floor(double_point.x);
    floored_point.y = std::floor(double_point.y);
    floored_point.z = std::floor(double_point.z);
    return true;
}

QScriptValue ScriptRunner::jsItem(Item item)
{
    return m_item_class.construct(QScriptValueList() << item.type << item.count << item.metadata);
}
QScriptValue ScriptRunner::jsBlock(Block block)
{
    return m_block_class.construct(QScriptValueList() << block.type() << block.m_metadata << block.light() << block.m_sky_light);
}

void ScriptRunner::handleEntitySpawned(QSharedPointer<Game::Entity> entity)
{
    raiseEvent("onEntitySpawned", QScriptValueList() << jsEntity(entity));
}
void ScriptRunner::handleEntityMoved(QSharedPointer<Game::Entity> entity)
{
    raiseEvent("onEntityMoved", QScriptValueList() << jsEntity(entity));
}
void ScriptRunner::handleEntityDespawned(QSharedPointer<Game::Entity> entity)
{
    raiseEvent("onEntityDespawned", QScriptValueList() << jsEntity(entity));
}
void ScriptRunner::handleAnimation(QSharedPointer<Game::Entity> entity, Message::AnimationType animation_type)
{
    raiseEvent("onAnimation", QScriptValueList() << jsEntity(entity) << animation_type);
}
void ScriptRunner::handleEntityEffect(QSharedPointer<Game::Entity> player_entity, QSharedPointer<Game::StatusEffect> effect)
{
    raiseEvent("onEntityEffect", QScriptValueList() << jsEntity(player_entity) << jsStatusEffect(effect));
}
void ScriptRunner::handleRemoveEntityEffect(QSharedPointer<Game::Entity> player_entity, QSharedPointer<Game::StatusEffect> effect)
{
    raiseEvent("onRemoveEntityEffect", QScriptValueList() << jsEntity(player_entity) << jsStatusEffect(effect));
}

void ScriptRunner::handleChunkUpdated(const Int3D &start, const Int3D &size)
{
    raiseEvent("onChunkUpdated", QScriptValueList() << jsPoint(start) << jsPoint(size));
}
void ScriptRunner::handleSignUpdated(const Int3D &location, QString text)
{
    QScriptValue text_value;
    if (!text.isNull())
        text_value = text;
    raiseEvent("onSignUpdated", QScriptValueList() << jsPoint(location) << text_value);
}

void ScriptRunner::movePlayerPosition()
{
    raiseEvent("onSelfMoved");
}

void ScriptRunner::handlePlayerHealthStatusUpdated()
{
    raiseEvent("onHealthStatusChanged");
}

void ScriptRunner::handleInventoryUpdated()
{
    raiseEvent("onInventoryUpdated");
}

void ScriptRunner::handlePlayerDied()
{
    raiseEvent("onDeath");
}
void ScriptRunner::handlePlayerSpawned(int world)
{
    raiseEvent("onSpawn", QScriptValueList() << world);
}

void ScriptRunner::handleChatReceived(QString username, QString message)
{
    raiseEvent("onChat", QScriptValueList() << username << message);
}
void ScriptRunner::handleNonSpokenChatReceived(QString message)
{
    raiseEvent("onNonSpokenChat", QScriptValueList() << message);
}
void ScriptRunner::handleTimeUpdated(double seconds)
{
    raiseEvent("onTimeUpdated", QScriptValueList() << seconds);
}

void ScriptRunner::handleLoginStatusUpdated(Server::LoginStatus status)
{
    // note that game class already handles shutting down for Disconnected and SocketError.
    switch (status) {
        case Server::SuccessStatus:
            m_physics_doer->start();
            raiseEvent("onConnected");
            break;
        default:;
    }
}

void ScriptRunner::handleStoppedDigging(Game::StoppedDiggingReason reason)
{
    raiseEvent("onStoppedDigging", QScriptValueList() << reason);
}

void ScriptRunner::handleWindowOpened(Message::WindowType window_type)
{
    raiseEvent("onWindowOpened", QScriptValueList() << window_type);
}

void ScriptRunner::handleEquippedItemChanged()
{
    raiseEvent("onEquippedItemChanged", QScriptValueList());
}

void ScriptRunner::handleReadLine(QString line)
{
    raiseEvent("onStdinLine", QScriptValueList() << line);
}

