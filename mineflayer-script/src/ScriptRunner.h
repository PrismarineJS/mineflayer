#ifndef SCRIPTRUNNER_H
#define SCRIPTRUNNER_H

#include "mineflayer-core/src/mineflayer-core.h"
#include "StdinReader.h"

#ifdef MINEFLAYER_GUI_ON
#include <QScriptEngineDebugger>
#include <QMainWindow>
#endif

#include <QObject>
#include <QScriptEngine>
#include <QUrl>
#include <QTextStream>
#include <QTimer>
#include <QTime>
#include <QThread>
#include <QStringList>
#include <QSet>

class PhysicsDoer;

class ScriptRunner : public QObject
{
    Q_OBJECT
public:
    ScriptRunner(QUrl url, QString script_file, QStringList args, bool debug, QStringList lib_path);

public slots:
    // start the engine
    void bootstrap();

private:
    QThread * m_thread;
    QUrl m_url;
    QString m_main_script_filename;
    QStringList m_args;
    bool m_debug;

    QScriptEngine * m_engine;
    QScriptValue m_handler_map;
    QScriptValue m_point_class;
    QScriptValue m_entity_class;
    QScriptValue m_item_class;

    mineflayer_GamePtr m_game;
    bool m_started_game;

    bool m_exiting;

    StdinReader m_stdin_reader;
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

#ifdef MINEFLAYER_GUI_ON
    QScriptEngineDebugger * m_debugger;
#endif

    QStringList m_lib_path;

    QSet<QString> m_included_filenames;
private:
    void raiseEvent(QString event_name, const QScriptValueList & args = QScriptValueList());
    static bool argCount(QScriptContext *context, QScriptValue & error, int arg_count_min, int arg_count_max = -1);
    static bool maybeThrowArgumentError(QScriptContext *context, QScriptValue & error, bool arg_is_valid);
    int nextTimerId();

    int setTimeout(QScriptValue func, int ms, QScriptValue this_obj, bool repeat);

    QString internalReadFile(const QString &path);
    QScriptValue evalJsonContents(const QString &file_contents, const QString &file_name = QString());
    void checkEngine(const QString & while_doing_what = QString());
    QScriptValue jsPoint(const mineflayer_Int3D &pt);
    QScriptValue jsPoint(const mineflayer_Double3D &pt);
    static bool fromJsPoint(QScriptContext *context, QScriptValue &error, QScriptValue point_value, mineflayer_Double3D &point);
    static bool fromJsPoint(QScriptContext *context, QScriptValue &error, QScriptValue point_value, mineflayer_Int3D &floored_point);
    QScriptValue jsItem(mineflayer_Item item);
    QScriptValue jsEntity(mineflayer_Entity * entity);



    // JavaScript utils
    static QScriptValue include(QScriptContext *context, QScriptEngine *engine);
    static QScriptValue exit(QScriptContext *context, QScriptEngine *engine);
    static QScriptValue print(QScriptContext *context, QScriptEngine *engine);
    static QScriptValue debug(QScriptContext *context, QScriptEngine *engine);
    static QScriptValue setTimeout(QScriptContext * context, QScriptEngine * engine);
    static QScriptValue clearTimeout(QScriptContext * context, QScriptEngine * engine);
    static QScriptValue setInterval(QScriptContext * context, QScriptEngine * engine);
    static QScriptValue clearInterval(QScriptContext * context, QScriptEngine * engine);
    static QScriptValue readFile(QScriptContext * context, QScriptEngine * engine);
    static QScriptValue writeFile(QScriptContext * context, QScriptEngine * engine);
    static QScriptValue args(QScriptContext * context, QScriptEngine * engine);

    // mf functions
    static QScriptValue chat(QScriptContext *context, QScriptEngine *engine);
    static QScriptValue timeOfDay(QScriptContext *context, QScriptEngine *engine);
    static QScriptValue itemStackHeight(QScriptContext * context, QScriptEngine * engine);
    static QScriptValue isPhysical(QScriptContext * context, QScriptEngine * engine);
    static QScriptValue isSafe(QScriptContext * context, QScriptEngine * engine);
    static QScriptValue isDiggable(QScriptContext * context, QScriptEngine * engine);
    static QScriptValue health(QScriptContext * context, QScriptEngine * engine);
    static QScriptValue blockAt(QScriptContext * context, QScriptEngine * engine);
    static QScriptValue isBlockLoaded(QScriptContext * context, QScriptEngine * engine);
    static QScriptValue signTextAt(QScriptContext * context, QScriptEngine * engine);
    static QScriptValue self(QScriptContext * context, QScriptEngine * engine);
    static QScriptValue setControlState(QScriptContext * context, QScriptEngine * engine);
    static QScriptValue clearControlStates(QScriptContext * context, QScriptEngine * engine);
    static QScriptValue lookAt(QScriptContext * context, QScriptEngine * engine);
    static QScriptValue respawn(QScriptContext * context, QScriptEngine * engine);
    static QScriptValue entity(QScriptContext * context, QScriptEngine * engine);
    static QScriptValue startDigging(QScriptContext * context, QScriptEngine * engine);
    static QScriptValue stopDigging(QScriptContext * context, QScriptEngine * engine);
    static QScriptValue canPlaceBlock(QScriptContext * context, QScriptEngine * engine);

    static QScriptValue selectEquipSlot(QScriptContext * context, QScriptEngine * engine);
    static QScriptValue selectedEquipSlot(QScriptContext * context, QScriptEngine * engine);
    static QScriptValue openInventoryWindow(QScriptContext * context, QScriptEngine * engine);
    static QScriptValue clickInventorySlot(QScriptContext * context, QScriptEngine * engine);
    static QScriptValue clickUniqueSlot(QScriptContext * context, QScriptEngine * engine);
    static QScriptValue clickOutsideWindow(QScriptContext * context, QScriptEngine * engine);
    static QScriptValue closeWindow(QScriptContext * context, QScriptEngine * engine);

    static QScriptValue inventoryItem(QScriptContext * context, QScriptEngine * engine);
    static QScriptValue uniqueWindowItem(QScriptContext * context, QScriptEngine * engine);

    static QScriptValue dimension(QScriptContext * context, QScriptEngine * engine);


    // hax functions
    static QScriptValue setPosition(QScriptContext * context, QScriptEngine * engine);
    static QScriptValue setGravityEnabled(QScriptContext * context, QScriptEngine * engine);
    static QScriptValue attackEntity(QScriptContext * context, QScriptEngine * engine);
    static QScriptValue setJesusModeEnabled(QScriptContext * context, QScriptEngine * engine);

    static QScriptValue placeBlock(QScriptContext * context, QScriptEngine * engine);
    static QScriptValue activateItem(QScriptContext * context, QScriptEngine * engine);
    static QScriptValue activateBlock(QScriptContext * context, QScriptEngine * engine);


private slots:
    void dispatchTimeout();
    void cleanup();
    void handleReadLine(QString line);

private slots: // non-static callbacks
    void handlePlayerPositionUpdated();
    void handleEntitySpawned(mineflayer_Entity * entity);
    void handleEntityDespawned(mineflayer_Entity * entity);
    void handleEntityMoved(mineflayer_Entity * entity);
    void handleAnimation(mineflayer_Entity * entity, mineflayer_AnimationType animation_type);
    void handleChunkUpdated(const mineflayer_Int3D &start, const mineflayer_Int3D &size);
    void handleSignUpdated(const mineflayer_Int3D &location, QString text);
    void handlePlayerHealthUpdated();
    void handleInventoryUpdated();
    void handlePlayerDied();
    void handlePlayerSpawned(int world);
    void handleChatReceived(QString username, QString message);
    void handleNonSpokenChatReceived(QString message);
    void handleTimeUpdated(double seconds);
    void handleLoginStatusUpdated(mineflayer_LoginStatus status);
    void handleStoppedDigging(mineflayer_StoppedDiggingReason reason);
    void handleWindowOpened(mineflayer_WindowType window_type);
    void handleEquippedItemChanged();


private: // static callbacks
    static void chatReceived (void * context, mineflayer_Utf8 username, mineflayer_Utf8 message);
    static void timeUpdated (void * context, double seconds);
    static void nonSpokenChatReceived (void * context, mineflayer_Utf8 message);

    static void entitySpawned(void * context, mineflayer_Entity * entity);
    static void entityDespawned(void * context, mineflayer_Entity * entity);
    static void entityMoved(void * context, mineflayer_Entity * entity);
    static void animation(void * context, mineflayer_Entity * entity, mineflayer_AnimationType animation_type);

    static void chunkUpdated(void * context, mineflayer_Int3D start, mineflayer_Int3D size);
    static void signUpdated(void * context, mineflayer_Int3D location, mineflayer_Utf8 text);
    static void playerPositionUpdated(void * context);
    static void playerHealthUpdated(void * context);
    static void playerDied(void * context);
    static void playerSpawned(void * context, int world);
    static void stoppedDigging(void * context, mineflayer_StoppedDiggingReason reason);
    static void loginStatusUpdated(void * context, mineflayer_LoginStatus status);

    static void windowOpened(void * context, mineflayer_WindowType window_type);

    static void inventoryUpdated(void * context);
    static void equippedItemChanged(void * context);
};


#endif // SCRIPTRUNNER_H
