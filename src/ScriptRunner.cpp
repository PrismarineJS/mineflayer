#include "ScriptRunner.h"
#include <QFile>
#include <QTimer>
#include <QMainWindow>
#include <QDebug>
#include <QCoreApplication>

ScriptRunner::ScriptRunner(QUrl url, QString script_file, bool debug, bool headless, QObject *parent) :
    QObject(parent),
    m_url(url),
    m_script_filename(script_file),
    m_debug(debug),
    m_headless(headless),
    m_engine(NULL),
    m_game(NULL),
    m_exiting(false),
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

    // add some javascript utility classes
    m_engine->globalObject().setProperty("setTimeout", m_engine->newFunction(setTimeout, 2));
    m_engine->globalObject().setProperty("clearTimeout", m_engine->newFunction(clearTimeout, 1));
    m_engine->globalObject().setProperty("setInterval", m_engine->newFunction(setInterval, 2));
    m_engine->globalObject().setProperty("clearInterval", m_engine->newFunction(clearTimeout, 1));


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
    m_game->sendChat(message);
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
    return me->m_game->itemStackHeight((Block::ItemType)val.toInteger());
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

void ScriptRunner::handleChunkUpdated(const Int3D &start, const Int3D &size)
{
    callBotMethod("onChunkUpdated", QScriptValueList() << start.x << start.y << start.z << size.x << size.y << size.z);
}

void ScriptRunner::movePlayerPosition(Server::EntityPosition position)
{
    Q_UNUSED(position);
    callBotMethod("onPositionUpdated");
}

void ScriptRunner::handlePlayerHealthUpdated()
{
    callBotMethod("onHealthChanged");
}

void ScriptRunner::handlePlayerDied()
{
    callBotMethod("onDeath");
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
            break;
        case Server::SocketError:
            qWarning() << "Unable to connect to server";
            exit();
            break;
        default:;
    }
}
