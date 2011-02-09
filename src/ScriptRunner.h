#ifndef SCRIPTRUNNER_H
#define SCRIPTRUNNER_H

#include "Game.h"

#include <QObject>
#include <QScriptEngine>
#include <QScriptEngineDebugger>
#include <QUrl>
#include <QTextStream>
#include <QTimer>

class ScriptRunner : public QObject
{
    Q_OBJECT
public:
    ScriptRunner(QUrl url, QString script_file, bool debug, bool headless, QObject * parent = NULL);

    // start the engine. returns success
    bool go();
    int returnCode() { return m_return_code; }

private:
    QUrl m_url;
    QString m_main_script_filename;
    bool m_debug;
    bool m_headless;

    QScriptEngine * m_engine;
    QScriptValue m_handler_map;

    Game * m_game;

    bool m_exiting;
    int m_return_code;

    QTextStream m_stderr;
    QTextStream m_stdout;

    struct TimedFunction {
        int id;
        bool repeat;
        QScriptValue this_ref;
        QScriptValue function;
        TimedFunction() {}
        TimedFunction(int id, bool repeat, QScriptValue this_ref, QScriptValue function) :
            id(id),
            repeat(repeat),
            this_ref(this_ref),
            function(function) {}
    };

    QHash<int, QTimer *> m_timer_ptrs;
    QHash<QTimer *, TimedFunction> m_script_timers;
    int m_timer_count;
private:
    void shutdown(int return_code);
    void raiseEvent(QString event_name, const QScriptValueList & args = QScriptValueList());
    bool argCount(QScriptContext *context, int arg_count_min, int arg_count_max = -1);
    int nextTimerId();

    int setTimeout(QScriptValue func, int ms, QScriptValue this_obj, bool repeat);

    QString readFile(const QString &path, bool * success = NULL);
    QScriptValue evalJsonContents(const QString &file_contents, const QString &file_name = QString());
    bool checkEngine(const QString & while_doing_what = QString());
    static int valueToNearestInt(const QScriptValue & value);
    QScriptValue jsPoint(const Int3D &pt);
    QScriptValue jsPoint(double x, double y, double z);


    // functions that JavaScript uses
    static QScriptValue include(QScriptContext *context, QScriptEngine *engine);
    static QScriptValue exit(QScriptContext *context, QScriptEngine *engine);
    static QScriptValue print(QScriptContext *context, QScriptEngine *engine);
    static QScriptValue debug(QScriptContext *context, QScriptEngine *engine);
    static QScriptValue setTimeout(QScriptContext * context, QScriptEngine * engine);
    static QScriptValue clearTimeout(QScriptContext * context, QScriptEngine * engine);
    static QScriptValue setInterval(QScriptContext * context, QScriptEngine * engine);
    static QScriptValue clearInterval(QScriptContext * context, QScriptEngine * engine);

    static QScriptValue chat(QScriptContext *context, QScriptEngine *engine);
    static QScriptValue username(QScriptContext * context, QScriptEngine * engine);
    static QScriptValue itemStackHeight(QScriptContext * context, QScriptEngine * engine);
    static QScriptValue health(QScriptContext * context, QScriptEngine * engine);
    static QScriptValue blockAt(QScriptContext * context, QScriptEngine * engine);
    static QScriptValue playerState(QScriptContext * context, QScriptEngine * engine);

    static QScriptValue Point(QScriptContext * context, QScriptEngine * engine);

private slots:

    void movePlayerPosition();
    void handleChunkUpdated(const Int3D &start, const Int3D &size);
    void handlePlayerHealthUpdated();
    void handlePlayerDied();
    void handleChatReceived(QString username, QString message);
    void handleLoginStatusUpdated(Server::LoginStatus status);

    void dispatchTimeout();
};

#endif // SCRIPTRUNNER_H
