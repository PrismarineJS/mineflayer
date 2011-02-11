#ifndef SUBCHUNKMESHGENERATOR_H
#define SUBCHUNKMESHGENERATOR_H

#include <QObject>
#include <QMutexLocker>
#include <QQueue>
#include <QThread>

#include <OGRE/OgreVector3.h>
#include <OGRE/OgreManualObject.h>

#include "Int3D.h"
#include "Block.h"

class Game;
class MainWindow;

class SubChunkMeshGenerator : public QObject {
    Q_OBJECT
public:

    struct BlockTextureCoord {
        int x;
        int y;
        int w;
        int h;
    };

    struct BlockData {
        QString name;
        QVector<QString> side_textures;
        bool see_through;
        bool partial_alpha;
        QVector<Ogre::Vector3> squish_amount;
        bool rotate;
    };

    struct SubChunkData {
        bool is_null;
        Int3D position;

        // 2 passes for each seam, and a big one for the middle. index is face + 1 so you can do NoDirection as 0.
        Ogre::SceneNode * node[6+1][2];
        Ogre::ManualObject * obj[6+1][2];

        SubChunkData() : is_null(true) {}
    };

    enum BlockFaceDirection {
        NoDirection=-1,
        NegativeY=0, // south
        PositiveY=1, // north
        NegativeZ=2, // down
        PositiveZ=3, // up
        NegativeX=4, // west
        PositiveX=5, // east
    };


    struct ReadySubChunk {
        int pass;
        BlockFaceDirection face;
        Ogre::ManualObject * obj;
        Ogre::SceneNode * node;

        Int3D sub_chunk_key;
        ReadySubChunk() {}
        ReadySubChunk(int pass, BlockFaceDirection face, Ogre::ManualObject * obj,
                      Ogre::SceneNode * node, Int3D sub_chunk_key) :
            pass(pass), face(face), obj(obj), node(node), sub_chunk_key(sub_chunk_key) {}
    };

public:
    SubChunkMeshGenerator(MainWindow * owner);
    ~SubChunkMeshGenerator() {}
    bool availableNewSubChunk() const {
        QMutexLocker locker(&m_queue_mutex);
        return !m_new_sub_chunk_queue.isEmpty();
    }
    ReadySubChunk nextNewSubChunk() {
        QMutexLocker locker(&m_queue_mutex);
        return m_new_sub_chunk_queue.dequeue();
    }
    bool availableDoneSubChunk() const {
        QMutexLocker locker(&m_queue_mutex);
        return !m_done_sub_chunk_queue.isEmpty();
    }
    ReadySubChunk nextDoneSubChunk() {
        QMutexLocker locker(&m_queue_mutex);
        return m_done_sub_chunk_queue.dequeue();
    }
    void shutDown();

    void saveSubChunkNode(ReadySubChunk ready_chunk, Ogre::SceneNode * node);
private:
    static const Int3D c_side_offset[];
    static const Int3D c_side_offset_zero[];
    static const Int3D c_zero_face[];
    static const Int3D c_sub_chunk_mesh_size;
    static const Int3D c_chunk_size;
    static const Ogre::Vector3 c_side_coord[6][2][3];
    static const Ogre::Vector2 c_tex_coord[2][3];
    static const float c_terrain_png_width;
    static const float c_terrain_png_height;
    static const float c_terrain_block_size;
    static const float c_decay_rate;
    static const float c_light_brightness[];
    static const char * c_wool_texture_names[];
    static const float c_brightness_bias[];

    MainWindow * m_owner;
    Game * m_game;
    QQueue<ReadySubChunk> m_new_sub_chunk_queue;
    QQueue<ReadySubChunk> m_done_sub_chunk_queue;
    QThread * m_thread;
    mutable QMutex m_queue_mutex;

    bool m_shutdown;


    // key is the meter coordinates of the min corner
    QHash<Int3D, SubChunkData> m_sub_chunks;
    // maps texture name to coordinates in terrain.png
    QHash<QString, BlockTextureCoord> m_terrain_tex_coords;
    // maps item type to texture name for each side
    QHash<Block::ItemType, BlockData> m_block_data;
    BlockData m_air;

private slots:
    void handleUpdatedChunk(const Int3D &start, const Int3D &size);
    void queueDeleteSubChunkMesh(const Int3D & coord);

    void initialize();

private:
    void generateSubChunkMesh(const Int3D & sub_chunk_key, BlockFaceDirection seam = NoDirection);
    void generateBlockMesh(Ogre::ManualObject * obj, const SubChunkData & chunk_data,
        const Int3D & offset, SubChunkMeshGenerator::BlockFaceDirection face, int pass);
    void generateSideMesh(Ogre::ManualObject * obj, const Int3D & absolute_position,
        const Block & block, const BlockData & block_data, BlockFaceDirection face);

    void loadResources();

    Int3D subChunkKey(const Int3D & coord);
};



#endif // SUBCHUNKMESHGENERATOR_H
