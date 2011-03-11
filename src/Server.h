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
    enum LoginStatus
    {
        Disconnected,
        Connecting,
        WaitingForHandshakeResponse,
        WaitingForSessionId,
        WaitingForNameVerification,
        WaitingForLoginResponse,
        Success,
        SocketError,
    };

    struct EntityPosition
    {
        Double3D pos; // east, north, up
        Double3D vel; // m/s
        double height; // [0.1, 1.65] how tall you are.
        float yaw; // [0, 2pi] rotation around z axis. 0 is +x. pi/2 is +y. pi is -x. 3pi/2 is -y.
        float pitch; // [-pi/2, pi/2] 0 is parallel to the ground. pi/2 is up. -pi/2 is down.
        bool on_ground;
        EntityPosition(): pos(), vel(), height(0),yaw(0.0f),pitch(0.0f),on_ground(false) {}
    };


    explicit Server(QUrl connection_info);
    ~Server();

signals:
    void loginStatusUpdated(Server::LoginStatus status);
    // emitted in addition to login status
    void loginCompleted(int entity_id);

    void chatReceived(QString message);
    void timeUpdated(double seconds);
    void playerHealthUpdated(int new_health);

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
    void animation(int entity_id, AnimationResponse::AnimationType animation);

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

public slots:
    // actually connect to the server
    void socketConnect();

    void finishWritingAndDisconnect();

public:
    void sendPositionAndLook(EntityPosition positionAndLook);
    // sends a chat message. can start with '/' to be a command.
    void sendChat(QString message);
    void sendRespawnRequest();
    void sendDiggingStatus(Message::DiggingStatus status, const Int3D & coord);
    void sendBlockPlacement(const Int3D & coord, Message::BlockFaceDirection face, Item block);
    void sendClickEntity(int self_entity_id, int target_entity_id, bool right_click);
    void sendAnimation(int entity_id, Message::AnimationType animation_type);

    void sendWindowClick(qint8 window_id, qint16 slot, bool is_right_click, qint16 action_id, Item item);
    void sendHoldingChange(qint16 slot);
    void sendCloseWindow(qint8 window_id);

private:
    static const Message::BlockFaceDirection c_to_notch_face[];
    static const QString c_auth_server;
    QUrl m_connection_info;

    QThread * m_socket_thread;
    QTcpSocket * m_socket;
    IncomingMessageParser * m_parser;
    QNetworkAccessManager * m_network;

    static const float c_walking_speed; // m/s
    static const int c_notchian_tick_ms;
    static const int c_physics_fps;
    static const float c_gravity; // m/s^2
    QTimer * m_physics_timer;

    LoginStatus m_login_state;


    QString m_connection_hash;

private:
    void changeLoginState(LoginStatus state);

    static void fromNotchianDoubleMeters(EntityPosition & destination, Double3D notchian);
    static void fromNotchianIntPixels(EntityPosition & destination, Int3D pixels);
    static Int3D fromNotchianChunk(int notchian_chunk_x, int notchian_chunk_z);
    static Int3D fromNotchianIntMeters(Int3D notchian_xyz);
    static Int3D fromNotchianIntMetersWithoutOffByOneCorrection(Int3D notchian_xyz);
    static void toNotchianDoubleMeters(const EntityPosition &source, double & destination_notchian_x, double & destination_notchian_y, double & destination_notchian_z);
    static Int3D toNotchianIntMeters(const Int3D &source);
    static void fromNotchianYawPitch(EntityPosition & destination, float notchian_yaw, float notchian_pitch);
    static void fromNotchianYawPitchBytes(EntityPosition & destination, qint8 yaw_out_of_255, qint8 pitch_out_of_255);
    static void toNotchianYawPitch(const EntityPosition &source, float & destination_notchian_yaw, float & destination_notchian_pitch);
    static Message::BlockFaceDirection toNotchianFace(Message::BlockFaceDirection face);
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
