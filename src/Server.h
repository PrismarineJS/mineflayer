#ifndef MESSAGE_HANDLER_H
#define MESSAGE_HANDLER_H

#include "Messages.h"
#include "IncomingMessageParser.h"
#include "Chunk.h"

#include <QObject>
#include <QThread>
#include <QTcpSocket>
#include <QSharedPointer>
#include <QUrl>
#include <QTimer>
#include <QNetworkAccessManager>
#include <QNetworkReply>

// sends and receives messages and translates to/from notch's data formats and coordinate system.
// abstracts data format, but not semantics and policies.
// you have to know how often to send a player position and look, but you don't need to how the data is stored in the message.
// this object runs in its own thread which it manages for you.
class Server : public QObject
{
    Q_OBJECT
public:
    enum LoginStatus {
        DisconnectedStatus,
        ConnectingStatus,
        WaitingForHandshakeResponseStatus,
        WaitingForSessionIdStatus,
        WaitingForNameVerificationStatus,
        WaitingForLoginResponseStatus,
        SuccessStatus,
        SocketErrorStatus,
    };

    struct EntityPosition {
        Double3D pos; // south, up, west
        Double3D vel; // m/s
        double height; // [0.1, 1.65] how tall you are.
        float yaw; // [0, 2pi] rotation around vertical axis. 0 is east. pi/2 is north, etc
        float pitch; // [-pi/2, pi/2] 0 is parallel to the ground. pi/2 is up. -pi/2 is down.
        bool on_ground;
    };

    explicit Server(QUrl connection_info);
    ~Server();

    static const Int3D c_chunk_size;
    static const Int3D c_column_size;


signals:
    void loginStatusUpdated(Server::LoginStatus status);
    // emitted in addition to login status
    void loginCompleted(int entity_id);

    void chatReceived(QString message);
    void timeUpdated(double seconds);
    void playerHealthStatusUpdated(int new_health, int new_food, float new_food_saturation);

    void namedPlayerSpawned(int entity_id, QString player_name, Server::EntityPosition position, Item::ItemType held_item);
    void pickupSpawned(int entity_id, Item item, Server::EntityPosition position);
    void mobSpawned(int entity_id, MobSpawnResponse::MobType mob_type, Server::EntityPosition position);

    void entityDestroyed(int entity_id);
    // use the .x .y .z for relative motion
    void entityMovedRelatively(int entity_id, Server::EntityPosition movement);
    // use .yaw and .pitch
    void entityLooked(int entity_id, Server::EntityPosition look);
    // use .x .y .z for relative motion and .yaw and .pitch
    void entityLookedAndMovedRelatively(int entity_id, Server::EntityPosition position);
    // use .x .y .z for absolute position
    void entityMoved(int entity_id, Server::EntityPosition position);
    void animation(int entity_id, Message::AnimationType animation);
    void entityEffect(int entity_id, int effect_id, int amplifier, int duration);
    void removeEntityEffect(int entity_id, int effect_id);

    void mapChunkUpdated(QSharedPointer<Chunk> chunk);
    // will always be contained within a chunk
    void multiBlockUpdate(Int3D chunk_corner, QHash<Int3D, Block> new_blocks);
    void blockUpdate(Int3D absolute_location, Block new_block);
    void unloadChunk(const Int3D & coord);
    void playerPositionAndLookUpdated(Server::EntityPosition position);
    void windowItemsUpdated(int window_id, QVector<Item> items);
    void windowSlotUpdated(int window_id, int slot, Item item);
    void holdingChange(int slot);
    void transaction(int window_id, int action_id, bool accepted);
    void openWindow(int window_id, Message::WindowType inventory_type, int number_of_slots);
    void signUpdated(Int3D position, QString text);
    void respawned(int world);
    void playerPing(QString name, int ping);
    void playerDisconnected(QString name);

public slots:
    // actually connect to the server
    void socketConnect();

public:
    void sendPositionAndLook(EntityPosition positionAndLook);
    // sends a chat message. can start with '/' to be a command.
    void sendChat(QString message);
    void sendRespawnRequest(int world);
    void sendDiggingStatus(Message::DiggingStatus status, const Int3D & coord);
    void sendBlockPlacement(const Int3D & coord, Message::BlockFaceDirection face, Item block);
    void sendClickEntity(int self_entity_id, int target_entity_id, bool right_click);
    void sendAnimation(int entity_id, Message::AnimationType animation_type);

    void sendWindowClick(qint8 window_id, qint16 slot, bool is_right_click, qint16 action_id, bool is_shift, Item item);
    void sendHoldingChange(qint16 slot);
    void sendCloseWindow(qint8 window_id);

private:
    static const QString c_auth_server;
    static const QString c_session_server;
    QUrl m_connection_info;

    QThread * m_thread;
    QTcpSocket * m_socket;
    IncomingMessageParser * m_parser;
    QNetworkAccessManager * m_network;

    static const int c_notchian_tick_ms;
    static const int c_physics_fps;
    static const int c_protocol_version;
    QTimer * m_physics_timer;

    LoginStatus m_login_state;


    QString m_connection_hash;

private:
    void changeLoginState(LoginStatus state);

    static void fromIntPixels(EntityPosition & destination, Int3D pixels);
    static Int3D fromChunkCoordinates(int chunk_x, int chunk_z);
    static void fromNotchianYawPitch(EntityPosition & destination, float notchian_yaw, float notchian_pitch);
    static void fromNotchianYawPitchBytes(EntityPosition & destination, qint8 yaw_out_of_255, qint8 pitch_out_of_255);
    static void toNotchianYawPitch(const EntityPosition &source, float & destination_notchian_yaw, float & destination_notchian_pitch);
    QByteArray notchUrlEncode(QString param);

private slots:
    void initialize();
    void handleConnected();
    void cleanup();
    void processIncomingMessage(QSharedPointer<IncomingResponse>);
    void handleSocketError(QAbstractSocket::SocketError);
    void sendMessage(QSharedPointer<OutgoingRequest> message);
    void handleFinishedRequest(QNetworkReply *);
};


#endif
