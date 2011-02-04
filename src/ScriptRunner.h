#ifndef SCRIPTRUNNER_H
#define SCRIPTRUNNER_H

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
    // call when we want to spend some CPU cycles on the bot
    void process();

private:
    QString m_script_filename;
    bool m_debug;
    bool m_headless;

    QScriptEngine m_engine;
    QScriptValue m_bot;

    void callBotMethod(QString method_name, const QScriptValueList & args = QScriptValueList());
};

#endif // SCRIPTRUNNER_H
