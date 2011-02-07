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
    m_stdout(stdout)
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
            QTimer::singleShot(1, this, SLOT(process()));
            break;
        case Server::SocketError:
            qWarning() << "Unable to connect to server";
            exit();
            break;
        default:;
    }
}
