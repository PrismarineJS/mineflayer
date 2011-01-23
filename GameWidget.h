#ifndef GAMEWIDGET_H
#define GAMEWIDGET_H

#include <QGLWidget>
#include <QHash>
#include <QSharedPointer>
#include <QLinkedList>

class GameWidget : public QGLWidget
{
    Q_OBJECT
public:
    struct ChunkCoord {
        int x;
        int y;
        int z;
    };

    struct EntityCoord {
        double x;
        double y;
        double z;
    };

public:
    explicit GameWidget(QWidget *parent = 0);

    void start(QString user, QString password, QString server);

protected:
    void paintGL();
    void resizeGL(int w, int h);
    void initializeGL();
    void mouseMoveEvent(QMouseEvent *);
    void mousePressEvent(QMouseEvent *);
    void mouseReleaseEvent(QMouseEvent *);

private:
    class Chunk {
    public:
        int getType(ChunkCoord coord) const;
        int getMetadata(ChunkCoord coord) const;
        int getLight(ChunkCoord coord) const;
        int getSkyLight(ChunkCoord coord) const;

    private:
        QVector<int> m_type;
        QVector<int> m_metadata;
        QVector<int> m_light;
        QVector<int> m_sky_light;

        int m_size_x;
        int m_size_y;
        int m_size_z;

    private:
        int indexOf(ChunkCoord coord) const;
    };

    struct Entity {
        EntityCoord coord;
        double stance;
        float yaw;
        float pitch;
        bool on_ground;
    };

    QHash<ChunkCoord, QSharedPointer<Chunk> > m_chunks;
    QLinkedList<QSharedPointer<Entity> > m_entities;
    QSharedPointer<Entity> m_player;
};

uint qHash(GameWidget::ChunkCoord coord);

#endif // GAMEWIDGET_H
