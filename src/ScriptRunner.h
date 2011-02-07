#ifndef SCRIPTRUNNER_H
#define SCRIPTRUNNER_H

#include "Game.h"

#include <QObject>
#include <QScriptEngine>
#include <QScriptEngineDebugger>
#include <QUrl>
#include <QTextStream>

class ScriptRunner : public QObject
{
    Q_OBJECT
public:
    ScriptRunner(QUrl url, QString script_file, bool debug, bool headless, QObject * parent = NULL);

    // start the engine. returns success
    bool go();

public slots:
    void print(QString text);
    void debug(QString line);
    void chat(QString message);
    void exit();

public:
    // functions that JavaScript uses
    static QScriptValue username(QScriptContext * context, QScriptEngine * engine);
    static QScriptValue itemStackHeight(QScriptContext * context, QScriptEngine * engine);

private:
    QUrl m_url;
    QString m_script_filename;
    bool m_debug;
    bool m_headless;

    QScriptEngine * m_engine;
    QScriptValue m_bot;

    Game * m_game;

    bool m_exiting;

    QTextStream m_stderr;
    QTextStream m_stdout;
private:

    void callBotMethod(QString method_name, const QScriptValueList & args = QScriptValueList());
    bool argCount(QScriptContext *context, int arg_count);

private slots:
    // call when we want to spend some CPU cycles on the bot
    void process();

    void movePlayerPosition(Server::EntityPosition position);
    void handleChunkUpdated(const Int3D &start, const Int3D &size);
    void handlePlayerHealthUpdated();
    void handlePlayerDied();
    void handleChatReceived(QString username, QString message);
    void handleLoginStatusUpdated(Server::LoginStatus status);
};

#endif // SCRIPTRUNNER_H
