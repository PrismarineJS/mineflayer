#include "ScriptRunner.h"
#include <QFile>
#include <QTimer>
#include <QMainWindow>
#include <QDebug>
#include <QCoreApplication>
#include <QDir>

#include <cmath>

ScriptRunner::ScriptRunner(QUrl url, QString script_file, bool debug, bool headless, QObject *parent) :
    QObject(parent),
    m_url(url),
    m_main_script_filename(script_file),
    m_debug(debug),
    m_headless(headless),
    m_engine(NULL),
    m_game(NULL),
    m_exiting(false),
    m_return_code(0),
    m_stderr(stderr),
    m_stdout(stdout),
    m_timer_count(0)
{
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

    // initialize the MF object before we run any user code
    QScriptValue mf_obj = m_engine->newQObject(this);
    m_engine->globalObject().setProperty("mf", mf_obj);

    // init event handler framework
    {
        QString file_name = ":/js/create_handlers.js";
        m_handler_map = evalJsonContents(readFile(file_name), file_name);
    }
    // create JavaScript enums from C++ enums
    {
        QString enum_contents = readFile(":/enums/ItemTypeEnum.h").trimmed();
        QStringList lines = enum_contents.split("\n");
        QStringList values = lines.takeFirst().split(" ");
        Q_ASSERT(values.size() == 2);
        QString prop_name = values.at(1);
        Q_ASSERT(values.at(0) == "enum");
        enum_contents = lines.join("\n");
        Q_ASSERT(enum_contents.endsWith(";"));
        enum_contents.chop(1);
        mf_obj.setProperty(prop_name, evalJsonContents(enum_contents.replace("=", ":")));
    }

    // add utility functions
    mf_obj.setProperty("include", m_engine->newFunction(include, 1));
    mf_obj.setProperty("exit", m_engine->newFunction(exit, 1));
    mf_obj.setProperty("print", m_engine->newFunction(print, 1));
    mf_obj.setProperty("debug", m_engine->newFunction(debug, 1));
    mf_obj.setProperty("setTimeout", m_engine->newFunction(setTimeout, 2));
    mf_obj.setProperty("clearTimeout", m_engine->newFunction(clearTimeout, 1));
    mf_obj.setProperty("setInterval", m_engine->newFunction(setInterval, 2));
    mf_obj.setProperty("clearInterval", m_engine->newFunction(clearTimeout, 1));

    // hook up mf functions
    mf_obj.setProperty("chat", m_engine->newFunction(chat, 1));
    mf_obj.setProperty("username", m_engine->newFunction(username));
    mf_obj.setProperty("itemStackHeight", m_engine->newFunction(itemStackHeight, 1));
    mf_obj.setProperty("health", m_engine->newFunction(health, 1));
    mf_obj.setProperty("blockAt", m_engine->newFunction(blockAt, 1));


    bool file_exists;
    QString main_script_contents = readFile(m_main_script_filename, &file_exists);
    if (!file_exists) {
        qWarning() << "file not found: " << m_main_script_filename;
        shutdown(1);
    }
    m_engine->evaluate(main_script_contents, m_main_script_filename);
    if (!checkEngine("evaluating main script"))
        return false;

    if (m_exiting)
        return false;

    // connect to server
    m_game = new Game(m_url);
    bool success;
    success = connect(m_game, SIGNAL(chunkUpdated(Int3D,Int3D)), this, SLOT(handleChunkUpdated(Int3D,Int3D)));
    Q_ASSERT(success);
    success = connect(m_game, SIGNAL(playerPositionUpdated(Server::EntityPosition)), this, SLOT(movePlayerPosition(Server::EntityPosition)));
    Q_ASSERT(success);
    success = connect(m_game, SIGNAL(loginStatusUpdated(Server::LoginStatus)), this, SLOT(handleLoginStatusUpdated(Server::LoginStatus)));
    Q_ASSERT(success);
    success = connect(m_game, SIGNAL(chatReceived(QString,QString)), this, SLOT(handleChatReceived(QString,QString)));
    Q_ASSERT(success);
    success = connect(m_game, SIGNAL(playerDied()), this, SLOT(handlePlayerDied()));
    Q_ASSERT(success);
    success = connect(m_game, SIGNAL(playerHealthUpdated()), this, SLOT(handlePlayerHealthUpdated()));
    Q_ASSERT(success);
    m_game->start();

    return true;
}

QString ScriptRunner::readFile(const QString &path, bool * success)
{
    QFile file(path);
    if (!file.open(QIODevice::ReadOnly)) {
        if (success == NULL) {
            // crash
            qWarning() << "cannot open file:" << path;
            shutdown(1);
        } else {
            // report failure
            *success = false;
            return QString();
        }
    }
    QString contents = QString::fromUtf8(file.readAll());
    file.close();
    if (success != NULL)
        *success = true;
    return contents;
}

QScriptValue ScriptRunner::evalJsonContents(const QString & file_contents, const QString & file_name)
{
    QScriptValue value = m_engine->evaluate(QString("(") + file_contents + QString(")"), file_name);
    Q_ASSERT(checkEngine("evaluating json"));
    return value;
}

bool ScriptRunner::checkEngine(const QString & while_doing_what)
{
    if (m_exiting)
        return false;
    if (!m_engine->hasUncaughtException())
        return true;
    if (!while_doing_what.isEmpty())
        qWarning() << "Error while" << while_doing_what.toStdString().c_str();
    qWarning() << m_engine->uncaughtException().toString();
    qWarning() << m_engine->uncaughtExceptionBacktrace().join("\n");
    m_engine->clearExceptions();
    return false;
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
    if (! me->argCount(context, 2))
        return QScriptValue();

    QScriptValue func = context->argument(0);
    QScriptValue ms = context->argument(1);
    if (! func.isFunction() || ! ms.isNumber()) {
        qWarning() << "setTimeout: invalid argument at" << context->backtrace().join("\n");
        return QScriptValue();
    }

    return me->setTimeout(func, ms.toInteger(), context->parentContext()->thisObject(), false);
}

QScriptValue ScriptRunner::setInterval(QScriptContext *context, QScriptEngine *engine)
{
    ScriptRunner * me = (ScriptRunner *) engine->parent();
    if (! me->argCount(context, 2))
        return QScriptValue();

    QScriptValue func = context->argument(0);
    QScriptValue ms = context->argument(1);
    if (! func.isFunction() || ! ms.isNumber()) {
        qWarning() << "setInterval: invalid argument at" << context->backtrace().join("\n");
        return QScriptValue();
    }

    return me->setTimeout(func, ms.toInteger(), context->parentContext()->thisObject(), true);
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
    if (! me->argCount(context, 1))
        return QScriptValue();

    QScriptValue id = context->argument(0);
    if (! id.isNumber()) {
        qWarning() << "clearTimeout: invalid argument at" << context->backtrace().join("\n");
        return QScriptValue();
    }

    int int_id = id.toInteger();
    QTimer * ptr = me->m_timer_ptrs.value(int_id, NULL);
    me->m_timer_ptrs.remove(int_id);
    me->m_script_timers.remove(ptr);
    delete ptr;
    return QScriptValue();
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
        checkEngine(QString("calling event handler") + event_name);
    }
}

QScriptValue ScriptRunner::include(QScriptContext *context, QScriptEngine *engine)
{
    ScriptRunner * me = (ScriptRunner *) engine->parent();
    if (! me->argCount(context, 1))
        return QScriptValue();

    QScriptValue file_name_value = context->argument(0);
    if (! file_name_value.isString()) {
        qWarning() << "include: invalid argument at" << context->backtrace().join("\n");
        return QScriptValue();
    }
    QString file_name = file_name_value.toString();

    QString absolute_name = QFileInfo(me->m_main_script_filename).dir().absoluteFilePath(file_name);
    QFile file(absolute_name);
    if (!file.open(QIODevice::ReadOnly)) {
        qWarning() << "Cannot open included file:" << absolute_name;
        me->shutdown(1);;
    }
    QByteArray contents = file.readAll();
    file.close();
    engine->evaluate(QString::fromUtf8(contents), file_name);
    if (engine->hasUncaughtException()) {
        qWarning() << "Error while evaluating script file:" << engine->uncaughtException().toString();
        qWarning() << engine->uncaughtExceptionBacktrace().join("\n");
        me->shutdown(1);;
    }
    return QScriptValue();
}

QScriptValue ScriptRunner::exit(QScriptContext *context, QScriptEngine *engine)
{
    ScriptRunner * me = (ScriptRunner *) engine->parent();
    if (! me->argCount(context, 0, 1))
        return QScriptValue();
    int return_code = 0;
    if (context->argumentCount() == 1)
        return_code = context->argument(0).toInt32();
    me->shutdown(return_code);
    context->throwValue("SystemExit");
    return QScriptValue();
}

QScriptValue ScriptRunner::print(QScriptContext *context, QScriptEngine *engine)
{
    ScriptRunner * me = (ScriptRunner *) engine->parent();
    if (! me->argCount(context, 1))
        return QScriptValue();
    QString text = context->argument(0).toString();
    me->m_stdout << text;
    me->m_stdout.flush();
    return QScriptValue();
}

QScriptValue ScriptRunner::debug(QScriptContext *context, QScriptEngine *engine)
{
    ScriptRunner * me = (ScriptRunner *) engine->parent();
    if (! me->argCount(context, 1))
        return QScriptValue();
    QString line = context->argument(0).toString();
    me->m_stderr << line << "\n";
    me->m_stderr.flush();
    return QScriptValue();
}

void ScriptRunner::shutdown(int return_code)
{
    m_exiting = true;
    QCoreApplication::instance()->exit(return_code);
    m_return_code = return_code;
}

QScriptValue ScriptRunner::chat(QScriptContext *context, QScriptEngine *engine)
{
    ScriptRunner * me = (ScriptRunner *) engine->parent();
    if (! me->argCount(context, 1))
        return QScriptValue();
    QString message = context->argument(0).toString();
    me->m_game->sendChat(message);
    return QScriptValue();
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
    return me->m_game->itemStackHeight((Block::ItemType)val.toInteger());
}

QScriptValue ScriptRunner::health(QScriptContext *context, QScriptEngine *engine)
{
    ScriptRunner * me = (ScriptRunner *) engine->parent();
    if (! me->argCount(context, 0))
        return QScriptValue();
    return me->m_game->playerHealth();
}

QScriptValue ScriptRunner::blockAt(QScriptContext *context, QScriptEngine *engine)
{
    ScriptRunner * me = (ScriptRunner *) engine->parent();
    const int arg_count = 3;
    if (! me->argCount(context, arg_count))
        return QScriptValue();
    for (int i = 0; i < arg_count; i++) {
        if (! context->argument(i).isNumber()) {
            qWarning() << "blockAt: invalid argument at" << context->backtrace().join("\n");
            return QScriptValue();
        }
    }
    int x = valueToNearestInt(context->argument(0));
    int y = valueToNearestInt(context->argument(1));
    int z = valueToNearestInt(context->argument(2));
    Block block = me->m_game->blockAt(Int3D(x, y, z));
    QScriptValue result = engine->newObject();
    result.setProperty("type", block.type());
    return result;
}

int ScriptRunner::valueToNearestInt(const QScriptValue &value)
{
    return (int)std::floor(value.toNumber() + 0.5);
}

bool ScriptRunner::argCount(QScriptContext *context, int arg_count_min, int arg_count_max)
{
    if (arg_count_max == -1)
        arg_count_max = arg_count_min;
    if (arg_count_min <= context->argumentCount() && context->argumentCount() <= arg_count_max)
        return true;

    if (arg_count_min == arg_count_max)
        qWarning() << "Expected" << arg_count_min << "arguments. Received" << context->argumentCount();
    else
        qWarning() << "Expected between" << arg_count_min << "and" << arg_count_max << "arguments. Received" << context->argumentCount();
    qWarning() << m_engine->currentContext()->backtrace().join("\n");
    m_engine->abortEvaluation();
    shutdown(1);
    return false;
}

void ScriptRunner::handleChunkUpdated(const Int3D &start, const Int3D &size)
{
    raiseEvent("onChunkUpdated", QScriptValueList() << start.x << start.y << start.z << size.x << size.y << size.z);
}

void ScriptRunner::movePlayerPosition(Server::EntityPosition position)
{
    Q_UNUSED(position);
    raiseEvent("onPositionUpdated");
}

void ScriptRunner::handlePlayerHealthUpdated()
{
    raiseEvent("onHealthChanged");
}

void ScriptRunner::handlePlayerDied()
{
    raiseEvent("onDeath");
}

void ScriptRunner::handleChatReceived(QString username, QString message)
{
    raiseEvent("onChat", QScriptValueList() << username << message);
}

void ScriptRunner::handleLoginStatusUpdated(Server::LoginStatus status)
{
    switch (status) {
        case Server::Disconnected:
            qWarning() << "Got disconnected from server";
            shutdown(0);
            break;
        case Server::Success:
            raiseEvent("onConnected");
            break;
        case Server::SocketError:
            qWarning() << "Unable to connect to server";
            shutdown(1);
            break;
        default:;
    }
}
