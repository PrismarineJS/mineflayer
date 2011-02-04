#ifndef SCRIPTRUNNER_H
#define SCRIPTRUNNER_H

#include "Server.h"

#include <QObject>
#include <QScriptEngine>
#include <QScriptEngineDebugger>

class ScriptRunner : public QObject
{
    Q_OBJECT
public:
    ScriptRunner(QString script_file, bool debug, bool headless, QObject * parent = NULL);

    // start the engine. returns success
    bool go();

public slots:
    void print(QString line);
    void chat(QString message);

signals:

private:
    QString m_script_filename;
    bool m_debug;
    bool m_headless;

    QScriptEngine m_engine;
    QScriptValue m_bot;

    Server * m_server;
private:

    void callBotMethod(QString method_name, const QScriptValueList & args = QScriptValueList());

private slots:
    // call when we want to spend some CPU cycles on the bot
    void process();
    void updateChunk(QSharedPointer<Chunk> chunk);
    void movePlayerPosition(Server::EntityPosition position);
    void handleLoginStatusUpdated(Server::LoginStatus status);
    void handleChatReceived(QString message);
};

#endif // SCRIPTRUNNER_H
