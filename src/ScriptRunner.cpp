#include "ScriptRunner.h"
#include <QFile>
#include <QTimer>
#include <QMainWindow>
#include <QDebug>

ScriptRunner::ScriptRunner(QString script_file, bool debug, bool headless, QObject *parent) :
    QObject(parent),
    m_script_filename(script_file),
    m_debug(debug),
    m_headless(headless)
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
        qWarning() << "Error while evaluating script file:";
        qWarning() << m_engine.uncaughtExceptionBacktrace();
        return false;
    }

    QScriptValue ctor = m_engine.evaluate("MineflayerBot");
    if (m_engine.hasUncaughtException()) {
        qWarning() << "Error while evaluating MineflayerBot constructor:";
        qWarning() << m_engine.uncaughtExceptionBacktrace();
        return false;
    }
    m_bot = ctor.construct();
    if (m_engine.hasUncaughtException()) {
        qWarning() << "Error while calling MineflayerBot constructor:";
        qWarning() << m_engine.uncaughtExceptionBacktrace();
        return false;
    }

    QTimer::singleShot(1, this, SLOT(process()));
    return true;
}

void ScriptRunner::process()
{
    callBotMethod("process");
    QTimer::singleShot(1, this, SLOT(process()));
}

void ScriptRunner::callBotMethod(QString method_name, const QScriptValueList &args)
{
    QScriptValue method = m_bot.property(method_name);
    if (method.isValid()) {
        method.call(m_bot, args);
        if (m_engine.hasUncaughtException()) {
            qWarning() << "Error while calling method" << method_name;
            qWarning() << m_engine.uncaughtExceptionBacktrace();
            m_engine.clearExceptions();
        }
    }
}
