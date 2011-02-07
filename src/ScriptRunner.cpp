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
    m_server(NULL),
    m_exiting(false)
{
}

bool ScriptRunner::go()
{
    if (m_debug) {
        QScriptEngineDebugger debugger;
        debugger.attachTo(&m_engine);
        QMainWindow * debug_window = debugger.standardWindow();
        debug_window->resize(1024, 640);
        debug_window->show();
    }

    QFile script_file(m_script_filename);
    script_file.open(QIODevice::ReadOnly);
    m_engine.evaluate(script_file.readAll(), m_script_filename);
    script_file.close();
    if (m_engine.hasUncaughtException()) {
        qWarning() << "Error while evaluating script file:" << m_engine.uncaughtException().toString();
        qWarning() << m_engine.uncaughtExceptionBacktrace();
        return false;
    }

    // initialize the MF object before we run any user code
    m_engine.globalObject().setProperty("mf", m_engine.newQObject(this));

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
    m_engine.globalObject().property("mf").setProperty(prop_name, m_engine.evaluate(json));

    QScriptValue ctor = m_engine.evaluate("MineflayerBot");
    if (m_engine.hasUncaughtException()) {
        qWarning() << "Error while evaluating MineflayerBot constructor:" << m_engine.uncaughtException().toString();
        qWarning() << m_engine.uncaughtExceptionBacktrace();
        return false;
    }
    if (m_exiting)
        return false;
    m_bot = ctor.construct();
    if (m_engine.hasUncaughtException()) {
        qWarning() << "Error while calling MineflayerBot constructor:" << m_engine.uncaughtException().toString();
        qWarning() << m_engine.uncaughtExceptionBacktrace();
        return false;
    }
    if (m_exiting)
        return false;

    // connect to server
    // TODO: this data should be passed in through config or command line
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
        if (m_engine.hasUncaughtException()) {
            qWarning() << "Error while calling method" << method_name;
            qWarning() << m_engine.uncaughtException().toString();
            qWarning() << m_engine.uncaughtExceptionBacktrace();
            m_engine.clearExceptions();
        }
    }
}

void ScriptRunner::print(QString line)
{
    qDebug() << line;
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
