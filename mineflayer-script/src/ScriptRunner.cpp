#include "ScriptRunner.h"

#include "Util.h"

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
    m_started_game(false),
    m_exiting(false),
    m_stderr(stderr),
    m_stdout(stdout),
    m_timer_count(0),
    m_lib_path(lib_path)
{
    mineflayer_Url mf_url;
    memset(&mf_url, 0, sizeof(mineflayer_Url));
    mf_url.hostname = Util::toNewMfUtf8(url.host());
    mf_url.username = Util::toNewMfUtf8(url.userName());
    mf_url.password = Util::toNewMfUtf8(url.password());
    mf_url.port = url.port(0);
    m_game = mineflayer_createGame(mf_url, true);
    Util::deallocMfUtf8(mf_url.hostname);
    Util::deallocMfUtf8(mf_url.username);
    Util::deallocMfUtf8(mf_url.password);

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
    }
    // create the mf.ItemType enum
    {
        QScriptValue item_type_obj = m_engine->newObject();
        mf_obj.setProperty("ItemType", item_type_obj);

        int * item_id_list = mineflayer_itemIdList();

        for (int i = 0; i < item_id_list[0]; i++) {
            mineflayer_ItemData * item_data = mineflayer_itemData((mineflayer_ItemType)item_id_list[1+i]);
            item_type_obj.setProperty(Util::toQString(item_data->name), item_data->id);
        }

        mineflayer_destroyItemIdList(item_id_list);
    }

    // hook up mf functions
    mf_obj.setProperty("chat", m_engine->newFunction(chat));
    mf_obj.setProperty("timeOfDay", m_engine->newFunction(timeOfDay));
    mf_obj.setProperty("itemStackHeight", m_engine->newFunction(itemStackHeight));
    mf_obj.setProperty("isPhysical", m_engine->newFunction(isPhysical));
    mf_obj.setProperty("isSafe", m_engine->newFunction(isSafe));
    mf_obj.setProperty("isDiggable", m_engine->newFunction(isDiggable));
    mf_obj.setProperty("health", m_engine->newFunction(health));
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


    // hook up hax functions
    QScriptValue hax_obj = m_engine->newObject();
    mf_obj.setProperty("hax", hax_obj);
    hax_obj.setProperty("setPosition", m_engine->newFunction(setPosition));
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

    mineflayer_Callbacks cbs;
    memset(&cbs, 0, sizeof(mineflayer_Callbacks));
    cbs.chatReceived = chatReceived;
    cbs.timeUpdated = timeUpdated;
    cbs.nonSpokenChatReceived = nonSpokenChatReceived;
    cbs.entitySpawned = entitySpawned;
    cbs.entityDespawned = entityDespawned;
    cbs.entityMoved = entityMoved;
    cbs.animation = animation;
    cbs.chunkUpdated = chunkUpdated;
    cbs.signUpdated = signUpdated;
    cbs.playerPositionUpdated = playerPositionUpdated;
    cbs.playerHealthUpdated = playerHealthUpdated;
    cbs.playerDied = playerDied;
    cbs.playerSpawned = playerSpawned;
    cbs.stoppedDigging = stoppedDigging;
    cbs.loginStatusUpdated = loginStatusUpdated;
    cbs.windowOpened = windowOpened;
    cbs.inventoryUpdated = inventoryUpdated;
    cbs.equippedItemChanged = equippedItemChanged;
    mineflayer_setCallbacks(m_game, cbs, this);

    bool success;

    success = connect(&m_stdin_reader, SIGNAL(readLine(QString)), this, SLOT(handleReadLine(QString)));
    Q_ASSERT(success);
    success = connect(&m_stdin_reader, SIGNAL(eof()), QCoreApplication::instance(), SLOT(quit()));
    Q_ASSERT(success);

    m_started_game = true;
    mineflayer_start(m_game);
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

    mineflayer_Utf8 utf8message = Util::toNewMfUtf8(message);
    mineflayer_sendChat(me->m_game, utf8message);
    Util::deallocMfUtf8(utf8message);

    return QScriptValue();
}
QScriptValue ScriptRunner::timeOfDay(QScriptContext *context, QScriptEngine *engine)
{
    ScriptRunner * me = (ScriptRunner *) engine->parent();
    QScriptValue error;
    if (!me->argCount(context, error, 0))
        return error;
    return mineflayer_timeOfDay(me->m_game);
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

    return mineflayer_itemData((mineflayer_ItemType)value.toInt32())->stack_height;
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
    return mineflayer_itemData((mineflayer_ItemType)value.toInt32())->physical;
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
    return mineflayer_itemData((mineflayer_ItemType)value.toInt32())->safe;
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
    return mineflayer_itemData((mineflayer_ItemType)value.toInt32())->diggable;
}

QScriptValue ScriptRunner::health(QScriptContext *context, QScriptEngine *engine)
{
    ScriptRunner * me = (ScriptRunner *) engine->parent();
    QScriptValue error;
    if (!me->argCount(context, error, 0))
        return error;
    return mineflayer_playerHealth(me->m_game);
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
    mineflayer_Int3D pt;
    if (!fromJsPoint(context, error, js_pt, pt))
        return error;
    mineflayer_Block block = mineflayer_blockAt(me->m_game, pt);
    QScriptValue result = engine->newObject();
    result.setProperty("type", block.type);
    return result;
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
    mineflayer_Int3D pt;
    if (!fromJsPoint(context, error, js_pt, pt))
        return error;
    return mineflayer_isBlockLoaded(me->m_game, pt);
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
    mineflayer_Int3D pt;
    if (!fromJsPoint(context, error, js_pt, pt))
        return error;
    QString text = Util::toQString(mineflayer_signTextAt(me->m_game, pt));
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
    int entity_id = mineflayer_playerEntityId(me->m_game);
    mineflayer_Entity * entity = mineflayer_entity(me->m_game, entity_id);
    QScriptValue return_value = me->jsEntity(entity);
    mineflayer_destroyEntity(entity);
    return return_value;
}
QScriptValue ScriptRunner::jsEntity(mineflayer_Entity * entity)
{
    QScriptValue result = m_entity_class.construct();
    result.setProperty("entity_id", entity->entity_id);
    mineflayer_EntityPosition position = entity->position;
    result.setProperty("position", jsPoint(position.pos));
    result.setProperty("velocity", jsPoint(position.vel));
    result.setProperty("yaw", position.yaw);
    result.setProperty("pitch", position.pitch);
    result.setProperty("on_ground", position.on_ground);
    result.setProperty("height", position.height);

    mineflayer_EntityType type = entity->type;
    result.setProperty("type", (int)type);
    switch (type) {
        case mineflayer_NamedPlayerEntity:
            result.setProperty("username", Util::toQString(entity->username));
            result.setProperty("held_item", (int)entity->held_item);
            break;
        case mineflayer_MobEntity:
            result.setProperty("mob_type", (int)entity->mob_type);
            break;
        case mineflayer_PickupEntity:
            result.setProperty("item", jsItem(entity->item));
            break;
        default:
            Q_ASSERT(false);
    }
    return result;
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

    mineflayer_setControlActivated(me->m_game, (mineflayer_Control) control.toInt32(), state.toBool());
    return QScriptValue();
}
QScriptValue ScriptRunner::clearControlStates(QScriptContext *context, QScriptEngine *engine)
{
    ScriptRunner * me = (ScriptRunner *) engine->parent();
    QScriptValue error;
    if (!me->argCount(context, error, 0))
        return error;

    for (int control = 0; control < mineflayer_ControlCount; control++)
        mineflayer_setControlActivated(me->m_game, (mineflayer_Control)control, false);
    return QScriptValue();
}

QScriptValue ScriptRunner::lookAt(QScriptContext *context, QScriptEngine *engine)
{
    ScriptRunner * me = (ScriptRunner *) engine->parent();
    QScriptValue error;
    if (!me->argCount(context, error, 1, 2))
        return error;
    QScriptValue point_value = context->argument(0);
    mineflayer_Double3D point;
    if (!me->fromJsPoint(context, error, point_value, point))
        return error;
    QScriptValue force_value = context->argument(1);
    bool force = false;
    if (force_value.isBool())
        force = force_value.toBool();

    mineflayer_EntityPosition my_position = mineflayer_playerPosition(me->m_game);
    mineflayer_Double3D delta;
    delta.x = point.x - my_position.pos.x;
    delta.y = point.y - my_position.pos.y;
    delta.z = point.z - my_position.pos.z;

    double yaw = std::atan2(delta.y, delta.x);
    double ground_distance = std::sqrt(delta.x * delta.x + delta.y * delta.y);
    double pitch = std::atan2(delta.z, ground_distance);
    mineflayer_setPlayerLook(me->m_game, yaw, pitch, force);
    return QScriptValue();
}

QScriptValue ScriptRunner::respawn(QScriptContext *context, QScriptEngine *engine)
{
    ScriptRunner * me = (ScriptRunner *) engine->parent();
    QScriptValue error;
    if (!me->argCount(context, error, 0))
        return error;
    mineflayer_respawn(me->m_game);
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

    mineflayer_Entity * entity = mineflayer_entity(me->m_game, entity_id);
    QScriptValue return_value;
    if (entity != NULL)
        return_value = me->jsEntity(entity);
    mineflayer_destroyEntity(entity);
    return return_value;
}

QScriptValue ScriptRunner::startDigging(QScriptContext *context, QScriptEngine *engine)
{
    ScriptRunner * me = (ScriptRunner *) engine->parent();
    QScriptValue error;
    if (!me->argCount(context, error, 1))
        return error;

    QScriptValue point_value = context->argument(0);
    mineflayer_Int3D point;
    if (!me->fromJsPoint(context, error, point_value, point))
        return error;

    mineflayer_startDigging(me->m_game, point);
    return QScriptValue();
}
QScriptValue ScriptRunner::stopDigging(QScriptContext *context, QScriptEngine *engine)
{
    ScriptRunner * me = (ScriptRunner *) engine->parent();
    QScriptValue error;
    if (!me->argCount(context, error, 0))
        return error;

    mineflayer_stopDigging(me->m_game);
    return QScriptValue();
}

QScriptValue ScriptRunner::placeBlock(QScriptContext *context, QScriptEngine *engine)
{
    ScriptRunner * me = (ScriptRunner *) engine->parent();
    QScriptValue error;
    if (!me->argCount(context, error, 2))
        return error;

    QScriptValue point_value = context->argument(0);
    mineflayer_Int3D point;
    if (!me->fromJsPoint(context, error, point_value, point))
        return error;

    QScriptValue face_value = context->argument(1);
    if (!me->maybeThrowArgumentError(context, error, face_value.isNumber()))
        return error;
    mineflayer_BlockFaceDirection face = (mineflayer_BlockFaceDirection) face_value.toInt32();

    if (! mineflayer_placeBlock(me->m_game, point, face))
        return context->throwError("Unable to place block there.");

    return QScriptValue();
}

QScriptValue ScriptRunner::activateItem(QScriptContext *context, QScriptEngine *engine)
{
    ScriptRunner * me = (ScriptRunner *) engine->parent();
    QScriptValue error;
    if (!me->argCount(context, error, 0))
        return error;

    if (! mineflayer_activateItem(me->m_game))
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
    mineflayer_Int3D point;
    if (!me->fromJsPoint(context, error, point_value, point))
        return error;

    QScriptValue face_value = context->argument(1);
    if (!me->maybeThrowArgumentError(context, error, face_value.isNumber()))
        return error;
    mineflayer_BlockFaceDirection face = (mineflayer_BlockFaceDirection) face_value.toInt32();

    return mineflayer_canPlaceBlock(me->m_game, point, face);
}

QScriptValue ScriptRunner::activateBlock(QScriptContext *context, QScriptEngine *engine)
{
    ScriptRunner * me = (ScriptRunner *) engine->parent();
    QScriptValue error;
    if (!me->argCount(context, error, 1))
        return error;

    QScriptValue point_value = context->argument(0);
    mineflayer_Int3D point;
    if (!me->fromJsPoint(context, error, point_value, point))
        return error;

    mineflayer_activateBlock(me->m_game, point);
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

    mineflayer_selectEquipSlot(me->m_game, slot_id);
    return QScriptValue();
}

QScriptValue ScriptRunner::selectedEquipSlot(QScriptContext *context, QScriptEngine *engine)
{
    ScriptRunner * me = (ScriptRunner *) engine->parent();
    QScriptValue error;
    if (!me->argCount(context, error, 0))
        return error;

    return mineflayer_selectedEquipSlot(me->m_game);
}

QScriptValue ScriptRunner::openInventoryWindow(QScriptContext *context, QScriptEngine *engine)
{
    ScriptRunner * me = (ScriptRunner *) engine->parent();
    QScriptValue error;
    if (!me->argCount(context, error, 0))
        return error;

    mineflayer_openInventoryWindow(me->m_game);
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

    return mineflayer_clickInventorySlot(me->m_game, slot_id, right_click);
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

    return mineflayer_clickUniqueSlot(me->m_game, slot_id, right_click);
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

    return mineflayer_clickOutsideWindow(me->m_game, right_click);
}

QScriptValue ScriptRunner::closeWindow(QScriptContext *context, QScriptEngine *engine)
{
    ScriptRunner * me = (ScriptRunner *) engine->parent();
    QScriptValue error;
    if (!me->argCount(context, error, 0))
        return error;

    mineflayer_closeWindow(me->m_game);
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

    return me->jsItem(mineflayer_inventoryItem(me->m_game, slot_id));
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

    return me->jsItem(mineflayer_uniqueWindowItem(me->m_game, slot_id));
}

QScriptValue ScriptRunner::setPosition(QScriptContext *context, QScriptEngine *engine)
{
    ScriptRunner * me = (ScriptRunner *) engine->parent();
    QScriptValue error;
    if (!me->argCount(context, error, 1))
        return error;
    QScriptValue point_value = context->argument(0);
    mineflayer_Double3D point;
    if (!me->fromJsPoint(context, error, point_value, point))
        return error;

    mineflayer_setPlayerPosition(me->m_game, point);
    return QScriptValue();
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

    mineflayer_setGravity(me->m_game, value_value.toBool() ? mineflayer_getStandardGravity() : 0);
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

    mineflayer_attackEntity(me->m_game, entity_id);
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

    mineflayer_setJesusModeEnabled(value);
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

QScriptValue ScriptRunner::jsPoint(const mineflayer_Int3D &pt)
{
    return m_point_class.construct(QScriptValueList() << pt.x << pt.y << pt.z);
}
QScriptValue ScriptRunner::jsPoint(const mineflayer_Double3D &pt)
{
    return m_point_class.construct(QScriptValueList() << pt.x << pt.y << pt.z);
}
bool ScriptRunner::fromJsPoint(QScriptContext *context, QScriptValue &error, QScriptValue point_value, mineflayer_Double3D &point)
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
bool ScriptRunner::fromJsPoint(QScriptContext *context, QScriptValue &error, QScriptValue point_value, mineflayer_Int3D &floored_point)
{
    mineflayer_Double3D double_point;
    if (!fromJsPoint(context, error, point_value, double_point))
        return false;
    floored_point.x = std::floor(double_point.x);
    floored_point.y = std::floor(double_point.y);
    floored_point.z = std::floor(double_point.z);
    return true;
}

QScriptValue ScriptRunner::jsItem(mineflayer_Item item)
{
    return m_item_class.construct(QScriptValueList() << item.type << item.count);
}

void ScriptRunner::handleEntitySpawned(mineflayer_Entity * entity)
{
    raiseEvent("onEntitySpawned", QScriptValueList() << jsEntity(entity));
    Util::destroyEntity(entity);
}
void ScriptRunner::handleEntityMoved(mineflayer_Entity * entity)
{
    raiseEvent("onEntityMoved", QScriptValueList() << jsEntity(entity));
    Util::destroyEntity(entity);
}
void ScriptRunner::handleEntityDespawned(mineflayer_Entity * entity)
{
    raiseEvent("onEntityDespawned", QScriptValueList() << jsEntity(entity));
    Util::destroyEntity(entity);
}
void ScriptRunner::handleAnimation(mineflayer_Entity * entity, mineflayer_AnimationType animation_type)
{
    raiseEvent("onAnimation", QScriptValueList() << jsEntity(entity) << animation_type);
    Util::destroyEntity(entity);
}

void ScriptRunner::handleChunkUpdated(const mineflayer_Int3D &start, const mineflayer_Int3D &size)
{
    raiseEvent("onChunkUpdated", QScriptValueList() << jsPoint(start) << jsPoint(size));
}
void ScriptRunner::handleSignUpdated(const mineflayer_Int3D &location, QString text)
{
    QScriptValue text_value;
    if (!text.isNull())
        text_value = text;
    raiseEvent("onSignUpdated", QScriptValueList() << jsPoint(location) << text_value);
}

void ScriptRunner::handlePlayerPositionUpdated()
{
    raiseEvent("onSelfMoved");
}

void ScriptRunner::handlePlayerHealthUpdated()
{
    raiseEvent("onHealthChanged");
}

void ScriptRunner::handleInventoryUpdated()
{
    raiseEvent("onInventoryUpdated");
}

void ScriptRunner::handlePlayerDied()
{
    raiseEvent("onDeath");
}
void ScriptRunner::handlePlayerSpawned()
{
    raiseEvent("onSpawn");
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

void ScriptRunner::handleLoginStatusUpdated(mineflayer_LoginStatus status)
{
    // TODO: handle shutting down for Disconnected and SocketError.
    switch (status) {
        case mineflayer_SuccessStatus:
            raiseEvent("onConnected");
            break;
        default:;
    }
}

void ScriptRunner::handleStoppedDigging(mineflayer_StoppedDiggingReason reason)
{
    raiseEvent("onStoppedDigging", QScriptValueList() << reason);
}

void ScriptRunner::handleWindowOpened(mineflayer_WindowType window_type)
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

void ScriptRunner::chatReceived(void * context, mineflayer_Utf8 username, mineflayer_Utf8 message)
{
    ScriptRunner * runner = reinterpret_cast<ScriptRunner *>(context);
    bool success = QMetaObject::invokeMethod(runner, "handleChatReceived",
        Q_ARG(QString, Util::toQString(username)), Q_ARG(QString, Util::toQString(message)));
    Q_ASSERT(success);
}

void ScriptRunner::timeUpdated(void * context, double seconds)
{
    ScriptRunner * runner = reinterpret_cast<ScriptRunner *>(context);
    bool success = QMetaObject::invokeMethod(runner, "handleTimeUpdated", Q_ARG(double, seconds));
    Q_ASSERT(success);
}

void ScriptRunner::nonSpokenChatReceived(void * context, mineflayer_Utf8 message)
{
    ScriptRunner * runner = reinterpret_cast<ScriptRunner *>(context);
    bool success = QMetaObject::invokeMethod(runner, "handleNonSpokenChatReceived", Q_ARG(QString, Util::toQString(message)));
    Q_ASSERT(success);
}

void ScriptRunner::entitySpawned(void * context, mineflayer_Entity *entity)
{
    ScriptRunner * runner = reinterpret_cast<ScriptRunner *>(context);
    bool success = QMetaObject::invokeMethod(runner, "handleEntitySpawned", Q_ARG(mineflayer_Entity *, Util::cloneEntity(entity)));
    Q_ASSERT(success);
}

void ScriptRunner::entityDespawned(void * context, mineflayer_Entity *entity)
{
    ScriptRunner * runner = reinterpret_cast<ScriptRunner *>(context);
    bool success = QMetaObject::invokeMethod(runner, "handleEntityDespawned", Q_ARG(mineflayer_Entity *, Util::cloneEntity(entity)));
    Q_ASSERT(success);
}

void ScriptRunner::entityMoved(void * context, mineflayer_Entity *entity)
{
    ScriptRunner * runner = reinterpret_cast<ScriptRunner *>(context);
    bool success = QMetaObject::invokeMethod(runner, "handleEntityMoved", Q_ARG(mineflayer_Entity *, Util::cloneEntity(entity)));
    Q_ASSERT(success);
}

void ScriptRunner::animation(void * context, mineflayer_Entity *entity, mineflayer_AnimationType animation_type)
{
    ScriptRunner * runner = reinterpret_cast<ScriptRunner *>(context);
    bool success = QMetaObject::invokeMethod(runner, "handleAnimation",
        Q_ARG(mineflayer_Entity *, Util::cloneEntity(entity)), Q_ARG(mineflayer_AnimationType, animation_type));
    Q_ASSERT(success);
}

void ScriptRunner::chunkUpdated(void * context, mineflayer_Int3D start, mineflayer_Int3D size)
{
    ScriptRunner * runner = reinterpret_cast<ScriptRunner *>(context);
    bool success = QMetaObject::invokeMethod(runner, "handleChunkUpdated",
        Q_ARG(mineflayer_Int3D, start), Q_ARG(mineflayer_Int3D, size));
    Q_ASSERT(success);
}

void ScriptRunner::signUpdated(void * context, mineflayer_Int3D location, mineflayer_Utf8 text)
{
    ScriptRunner * runner = reinterpret_cast<ScriptRunner *>(context);
    bool success = QMetaObject::invokeMethod(runner, "handleSignUpdated",
        Q_ARG(mineflayer_Int3D, location), Q_ARG(QString, Util::toQString(text)));
    Q_ASSERT(success);
}

void ScriptRunner::playerPositionUpdated(void * context)
{
    ScriptRunner * runner = reinterpret_cast<ScriptRunner *>(context);
    bool success = QMetaObject::invokeMethod(runner, "handlePlayerPositionUpdated");
    Q_ASSERT(success);
}

void ScriptRunner::playerHealthUpdated(void * context)
{
    ScriptRunner * runner = reinterpret_cast<ScriptRunner *>(context);
    bool success = QMetaObject::invokeMethod(runner, "handlePlayerHealthUpdated");
    Q_ASSERT(success);
}

void ScriptRunner::playerDied(void * context)
{
    ScriptRunner * runner = reinterpret_cast<ScriptRunner *>(context);
    bool success = QMetaObject::invokeMethod(runner, "handlePlayerDied");
    Q_ASSERT(success);
}

void ScriptRunner::playerSpawned(void * context)
{
    ScriptRunner * runner = reinterpret_cast<ScriptRunner *>(context);
    bool success = QMetaObject::invokeMethod(runner, "handlePlayerSpawned");
    Q_ASSERT(success);
}

void ScriptRunner::stoppedDigging(void * context, mineflayer_StoppedDiggingReason reason)
{
    ScriptRunner * runner = reinterpret_cast<ScriptRunner *>(context);
    bool success = QMetaObject::invokeMethod(runner, "handleStoppedDigging", Q_ARG(mineflayer_StoppedDiggingReason, reason));
    Q_ASSERT(success);
}

void ScriptRunner::loginStatusUpdated(void * context, mineflayer_LoginStatus status)
{
    ScriptRunner * runner = reinterpret_cast<ScriptRunner *>(context);
    bool success = QMetaObject::invokeMethod(runner, "handleLoginStatusUpdated", Q_ARG(mineflayer_LoginStatus, status));
    Q_ASSERT(success);
}

void ScriptRunner::windowOpened(void * context, mineflayer_WindowType window_type)
{
    ScriptRunner * runner = reinterpret_cast<ScriptRunner *>(context);
    bool success = QMetaObject::invokeMethod(runner, "handleWindowOpened", Q_ARG(mineflayer_WindowType, window_type));
    Q_ASSERT(success);
}

void ScriptRunner::inventoryUpdated(void * context)
{
    ScriptRunner * runner = reinterpret_cast<ScriptRunner *>(context);
    bool success = QMetaObject::invokeMethod(runner, "handleInventoryUpdated");
    Q_ASSERT(success);
}

void ScriptRunner::equippedItemChanged(void * context)
{
    ScriptRunner * runner = reinterpret_cast<ScriptRunner *>(context);
    bool success = QMetaObject::invokeMethod(runner, "handleEquippedItemChanged");
    Q_ASSERT(success);
}
