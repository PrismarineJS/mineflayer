#ifndef SCRIPTRUNNER_H
#define SCRIPTRUNNER_H

#include "Game.h"

#include <QObject>
#include <QScriptEngine>
#include <QScriptEngineDebugger>
#include <QUrl>
#include <QTextStream>
#include <QTimer>
#include <QTime>
#include <QThread>
#include <QStringList>

class PhysicsDoer;

class ScriptRunner : public QObject
{
    Q_OBJECT
public:
    ScriptRunner(QUrl url, QString script_file, QStringList args, bool debug, bool headless, QStringList lib_path);

public slots:
    // start the engine
    void bootstrap();

private:
    QThread * m_thread;
    QUrl m_url;
    QString m_main_script_filename;
    QStringList m_args;
    bool m_debug;
    bool m_headless;

    QScriptEngine * m_engine;
    QScriptValue m_handler_map;
    QScriptValue m_point_class;
    QScriptValue m_entity_class;
    QScriptValue m_item_class;

    Game * m_game;
    bool m_started_game;

    bool m_exiting;

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

    QScriptEngineDebugger * m_debugger;

    QStringList m_lib_path;

    PhysicsDoer * m_physics_doer;

    QSet<QString> m_included_filenames;

private:
    void shutdown(int return_code);
    void raiseEvent(QString event_name, const QScriptValueList & args = QScriptValueList());
    static bool argCount(QScriptContext *context, QScriptValue & error, int arg_count_min, int arg_count_max = -1);
    static bool maybeThrowArgumentError(QScriptContext *context, QScriptValue & error, bool arg_is_valid);
    int nextTimerId();

    int setTimeout(QScriptValue func, int ms, QScriptValue this_obj, bool repeat);

    QString internalReadFile(const QString &path);
    QScriptValue evalJsonContents(const QString &file_contents, const QString &file_name = QString());
    void checkEngine(const QString & while_doing_what = QString());
    QScriptValue jsPoint(const Int3D &pt);
    QScriptValue jsPoint(const Double3D &pt);
    static bool fromJsPoint(QScriptContext *context, QScriptValue &error, QScriptValue point_value, Double3D &point);
    static bool fromJsPoint(QScriptContext *context, QScriptValue &error, QScriptValue point_value, Int3D &floored_point);
    QScriptValue jsItem(Item item);
    QScriptValue jsEntity(QSharedPointer<Game::Entity> entity);



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


    // hax functions
    static QScriptValue setPosition(QScriptContext * context, QScriptEngine * engine);
    static QScriptValue positionUpdateInterval(QScriptContext * context, QScriptEngine * engine);
    static QScriptValue setGravityEnabled(QScriptContext * context, QScriptEngine * engine);
    static QScriptValue attackEntity(QScriptContext * context, QScriptEngine * engine);
    static QScriptValue setJesusModeEnabled(QScriptContext * context, QScriptEngine * engine);

    static QScriptValue placeBlock(QScriptContext * context, QScriptEngine * engine);
    static QScriptValue activateBlock(QScriptContext * context, QScriptEngine * engine);


private slots:

    void movePlayerPosition();
    void handleEntitySpawned(QSharedPointer<Game::Entity> entity);
    void handleEntityDespawned(QSharedPointer<Game::Entity> entity);
    void handleEntityMoved(QSharedPointer<Game::Entity> entity);
    void handleAnimation(QSharedPointer<Game::Entity> entity, AnimationResponse::AnimationType animation_type);
    void handleChunkUpdated(const Int3D &start, const Int3D &size);
    void handleSignUpdated(const Int3D &location, QString text);
    void handlePlayerHealthUpdated();
    void handleInventoryUpdated();
    void handlePlayerDied();
    void handlePlayerSpawned();
    void handleChatReceived(QString username, QString message);
    void handleNonSpokenChatReceived(QString message);
    void handleTimeUpdated(double seconds);
    void handleLoginStatusUpdated(Server::LoginStatus status);
    void handleStoppedDigging(Game::StoppedDiggingReason reason);
    void handleWindowOpened(Message::WindowType);
    void handleEquippedItemChanged();

    void dispatchTimeout();

};


class PhysicsDoer : public QObject {
    Q_OBJECT
public:
    PhysicsDoer(Game * game);
public slots:
    void start();
    void stop();
private:
    static const int c_physics_fps;

    Game * m_game;
    QTimer * m_physics_timer;
    QTime m_physics_time;
    QThread * m_thread;
private slots:
    void doPhysics();
};

#endif // SCRIPTRUNNER_H
