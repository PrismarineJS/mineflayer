#include "ScriptRunner.h"
#include <QFile>
#include <QTimer>
#include <QMainWindow>
#include <QDebug>

ScriptRunner::ScriptRunner(QString script_file, bool debug, bool headless, QObject *parent) :
    QObject(parent),
    m_script_filename(script_file),
    m_debug(debug),
    m_headless(headless),
    m_server(NULL)
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

    QScriptValue ctor = m_engine.evaluate("MineflayerBot");
    if (m_engine.hasUncaughtException()) {
        qWarning() << "Error while evaluating MineflayerBot constructor:" << m_engine.uncaughtException().toString();
        qWarning() << m_engine.uncaughtExceptionBacktrace();
        return false;
    }
    m_bot = ctor.construct();
    if (m_engine.hasUncaughtException()) {
        qWarning() << "Error while calling MineflayerBot constructor:" << m_engine.uncaughtException().toString();
        qWarning() << m_engine.uncaughtExceptionBacktrace();
        return false;
    }
    m_engine.globalObject().setProperty("mf", m_engine.newQObject(this));

    // connect to server
    QUrl connection_settings;
    connection_settings.setHost("localhost");
    connection_settings.setPort(25565);
    connection_settings.setUserName("superbot");
    m_server = new Server(connection_settings);
    bool success;
    success = connect(m_server, SIGNAL(mapChunkUpdated(QSharedPointer<Chunk>)), this, SLOT(updateChunk(QSharedPointer<Chunk>)));
    Q_ASSERT(success);
    success = connect(m_server, SIGNAL(playerPositionUpdated(Server::EntityPosition)), this, SLOT(movePlayerPosition(Server::EntityPosition)));
    Q_ASSERT(success);
    success = connect(m_server, SIGNAL(loginStatusUpdated(Server::LoginStatus)), this, SLOT(handleLoginStatusUpdated(Server::LoginStatus)));
    Q_ASSERT(success);
    success = connect(m_server, SIGNAL(chatReceived(QString)), this, SLOT(handleChatReceived(QString)));
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

void ScriptRunner::updateChunk(QSharedPointer<Chunk> chunk)
{
    // TODO
}

void ScriptRunner::movePlayerPosition(Server::EntityPosition position)
{
    // TODO
}

void ScriptRunner::handleLoginStatusUpdated(Server::LoginStatus status)
{
    if (status == Server::Success) {
        callBotMethod("onConnected");
        QTimer::singleShot(1, this, SLOT(process()));
    }
}

void ScriptRunner::handleChatReceived(QString message)
{
    callBotMethod("onChat", QScriptValueList() << "user" << message);
}
