#include "SubChunkMeshGenerator.h"
#include "MainWindow.h"

#include <QFile>
#include <QStringList>
#include <QCoreApplication>

const Int3D SubChunkMeshGenerator::c_side_offset[] = {
    Int3D(0, -1, 0),
    Int3D(0, 1, 0),
    Int3D(0, 0, -1),
    Int3D(0, 0, 1),
    Int3D(-1, 0, 0),
    Int3D(1, 0, 0),
};

const Int3D SubChunkMeshGenerator::c_side_offset_zero[] = {
    Int3D(0, 0, 0),
    Int3D(0, 1, 0),
    Int3D(0, 0, 0),
    Int3D(0, 0, 1),
    Int3D(0, 0, 0),
    Int3D(1, 0, 0),
};

const Int3D SubChunkMeshGenerator::c_zero_face[] = {
    Int3D(1, 0, 1),
    Int3D(1, 0, 1),
    Int3D(1, 1, 0),
    Int3D(1, 1, 0),
    Int3D(0, 1, 1),
    Int3D(0, 1, 1),
};

const Ogre::Vector3 SubChunkMeshGenerator::c_side_coord[6][2][3] = {
    {
        {Ogre::Vector3(0, 0, 1), Ogre::Vector3(0, 0, 0), Ogre::Vector3(1, 0, 1)},
        {Ogre::Vector3(1, 0, 1), Ogre::Vector3(0, 0, 0), Ogre::Vector3(1, 0, 0)},
    },
    {
        {Ogre::Vector3(1, 1, 1), Ogre::Vector3(1, 1, 0), Ogre::Vector3(0, 1, 1)},
        {Ogre::Vector3(0, 1, 1), Ogre::Vector3(1, 1, 0), Ogre::Vector3(0, 1, 0)},
    },
    {
        {Ogre::Vector3(0, 0, 0), Ogre::Vector3(0, 1, 0), Ogre::Vector3(1, 0, 0)},
        {Ogre::Vector3(1, 0, 0), Ogre::Vector3(0, 1, 0), Ogre::Vector3(1, 1, 0)},
    },
    {
        {Ogre::Vector3(0, 1, 1), Ogre::Vector3(0, 0, 1), Ogre::Vector3(1, 1, 1)},
        {Ogre::Vector3(1, 1, 1), Ogre::Vector3(0, 0, 1), Ogre::Vector3(1, 0, 1)},
    },
    {
        {Ogre::Vector3(0, 1, 1), Ogre::Vector3(0, 1, 0), Ogre::Vector3(0, 0, 1)},
        {Ogre::Vector3(0, 0, 1), Ogre::Vector3(0, 1, 0), Ogre::Vector3(0, 0, 0)},
    },
    {
        {Ogre::Vector3(1, 0, 1), Ogre::Vector3(1, 0, 0), Ogre::Vector3(1, 1, 1)},
        {Ogre::Vector3(1, 1, 1), Ogre::Vector3(1, 0, 0), Ogre::Vector3(1, 1, 0)},
    },

};
const Ogre::Vector2 SubChunkMeshGenerator::c_tex_coord[2][3] = {
    {Ogre::Vector2(0, 0), Ogre::Vector2(0, 1), Ogre::Vector2(1, 0)},
    {Ogre::Vector2(1, 0), Ogre::Vector2(0, 1), Ogre::Vector2(1, 1)},
};
const Int3D SubChunkMeshGenerator::c_sub_chunk_mesh_size(16, 16, 16);
const Int3D SubChunkMeshGenerator::c_chunk_size(16, 16, 128);

const float SubChunkMeshGenerator::c_terrain_png_height = 256.0f;
const float SubChunkMeshGenerator::c_terrain_png_width = 256.0f;
const float SubChunkMeshGenerator::c_terrain_block_size = 16.0f;

const float SubChunkMeshGenerator::c_decay_rate = 0.80f;
const float SubChunkMeshGenerator::c_light_brightness[] = {
    0.0351843720888,
    0.043980465111,
    0.0549755813888,
    0.068719476736,
    0.08589934592,
    0.1073741824,
    0.134217728,
    0.16777216,
    0.2097152,
    0.262144,
    0.32768,
    0.4096,
    0.512,
    0.64,
    0.8,
    1.0
};

const float SubChunkMeshGenerator::c_brightness_bias[] = {
    0.8f * 0.8f,
    0.8f * 0.8f,
    0.8f * 0.8f * 0.8f,
    1.0f,
    0.8f,
    0.8f,
};
const char * SubChunkMeshGenerator::c_wool_texture_names[] = {
    "Wool",
    "OrangeWool",
    "MagentaWool",
    "LightBlueWool",
    "YellowWool",
    "LightGreenWool",
    "PinkWool",
    "GrayWool",
    "LightGrayWool",
    "CyanWool",
    "PurpleWool",
    "BlueWool",
    "BrownWool",
    "DarkGreenWool",
    "RedWool",
    "BlackWool",
};

SubChunkMeshGenerator::SubChunkMeshGenerator(MainWindow * owner) :
    QObject(NULL),
    m_owner(owner),
    m_shutdown(false)
{

    // run in our own thread
    m_thread = new QThread(this);
    m_thread->start();
    this->moveToThread(m_thread);

    bool success;
    success = connect(QCoreApplication::instance(), SIGNAL(aboutToQuit()), this, SLOT(cleanup()));
    Q_ASSERT(success);
    success = QMetaObject::invokeMethod(this, "initialize", Qt::QueuedConnection);
    Q_ASSERT(success);
}

void SubChunkMeshGenerator::initialize()
{
    m_air.see_through = true;
    m_air.partial_alpha = false;
    m_air.name = "Air";

    loadResources();

    bool success;
    success = connect(m_owner->game(), SIGNAL(chunkUpdated(Int3D,Int3D)), this, SLOT(handleUpdatedChunk(Int3D,Int3D)));
    Q_ASSERT(success);
    success = connect(m_owner->game(), SIGNAL(unloadChunk(Int3D)), this, SLOT(queueDeleteSubChunkMesh(Int3D)));
    Q_ASSERT(success);
    m_owner->game()->start();
}

void SubChunkMeshGenerator::cleanup()
{
    m_shutdown = true;
    m_thread->exit();
}

void SubChunkMeshGenerator::loadResources()
{
    // grab all the solid block data from resources
    QFile blocks_file(":/graphics/blocks.txt");
    blocks_file.open(QFile::ReadOnly);
    QTextStream stream(&blocks_file);
    while(! stream.atEnd()) {
        QString line = stream.readLine().trimmed();
        if (line.isEmpty() || line.startsWith("#"))
            continue;
        QStringList parts = line.split(QRegExp("\\s+"), QString::SkipEmptyParts);
        Q_ASSERT(parts.size() == 17);
        BlockData block_data;
        block_data.side_textures.resize(6);
        block_data.squish_amount.resize(6);
        int index = 0;
        Item::ItemType id = (Item::ItemType) parts.at(index++).toInt();
        block_data.name = parts.at(index++);
        for (int i = 0; i < 6; i++) {
            QString texture = parts.at(index++);
            if (texture != "-")
                block_data.side_textures.replace(i, texture);
        }
        block_data.see_through = (bool)parts.at(index++).toInt();
        block_data.partial_alpha = (bool)parts.at(index++).toInt();
        for (int i = 0; i < 6; i++) {
            Int3D squish = c_side_offset[i] * parts.at(index++).toInt();
            block_data.squish_amount.replace(i, Ogre::Vector3(squish.x, squish.y, squish.z)/c_terrain_block_size);
        }
        block_data.rotate = (bool)parts.at(index++).toInt();
        m_block_data.insert(id, block_data);
    }
    blocks_file.close();
}

void SubChunkMeshGenerator::handleUpdatedChunk(const Int3D &start, const Int3D &size)
{
    Q_ASSERT(QThread::currentThread() == m_thread);

    // update every sub chunk that the updated region touches
    Int3D min = subChunkKey(start);
    Int3D max = subChunkKey(start+size);
    if (min == max)
        max += c_sub_chunk_mesh_size;
    Int3D it;
    for (it.x = min.x; it.x < max.x; it.x+=c_sub_chunk_mesh_size.x) {
        for (it.y = min.y; it.y < max.y; it.y+=c_sub_chunk_mesh_size.y) {
            for (it.z = min.z; it.z < max.z; it.z+=c_sub_chunk_mesh_size.z) {
                if (m_shutdown) {
                    qDebug() << "Skipping chunk update; shutting down";
                    return;
                }
                // regenerate the seams if this chunk is new
                if (! m_sub_chunks.contains(it)) {
                    for (int side = 0; side < 6; side++) {
                        generateSubChunkMesh(it, (BlockFaceDirection)side);
                    }
                }
                generateSubChunkMesh(it);
            }
        }
    }
}


void SubChunkMeshGenerator::generateSubChunkMesh(const Int3D & sub_chunk_key, BlockFaceDirection seam)
{
    Q_ASSERT(QThread::currentThread() == m_thread);

    SubChunkData chunk_data = m_sub_chunks.value(sub_chunk_key);
    bool replace_chunk = true;
    if (chunk_data.is_null) {
        // initialize chunk data
        replace_chunk = false;
        chunk_data.is_null = false;
        chunk_data.position = sub_chunk_key;
        // init pointers to NULL
        for (int side = -1; side < 6; side++) {
            for (int pass = 0; pass < 2; pass++) {
                chunk_data.obj[side+1][pass] = NULL;
                chunk_data.node[side+1][pass] = NULL;
            }
        }
        m_sub_chunks.insert(sub_chunk_key, chunk_data);

    }

    ReadySubChunk done_chunks[7][2];

    int face_min, face_max;
    if (seam == NoDirection) {
        face_min = -1;
        face_max = 5;
    } else {
        face_min = face_max = seam;
    }
    for (int face = face_min; face <= face_max; face++) {
        if (seam != NoDirection && face != seam)
            continue;
        for (int pass = 0; pass < 2; pass++) {
            if (replace_chunk) {
                done_chunks[face+1][pass] = ReadySubChunk(pass,
                    (BlockFaceDirection)face, chunk_data.obj[face+1][pass],
                    chunk_data.node[face+1][pass], sub_chunk_key);
            }
            m_owner->ogreMutex()->lock();
            Ogre::ManualObject * obj = new Ogre::ManualObject(m_owner->nextManualObjectString());
            obj->begin(pass == 0 ? "TerrainOpaque" : "TerrainTransparent", Ogre::RenderOperation::OT_TRIANGLE_LIST);
            m_owner->ogreMutex()->unlock();

            Int3D offset;
            if (face == NoDirection) {
                for (offset.x = 0; offset.x < c_sub_chunk_mesh_size.x; offset.x++) {
                    for (offset.y = 0; offset.y < c_sub_chunk_mesh_size.y; offset.y++) {
                        for (offset.z = 0; offset.z < c_sub_chunk_mesh_size.z; offset.z++) {
                            generateBlockMesh(obj, chunk_data, offset, NoDirection, pass);
                        }
                    }
                }
            } else {
                for (offset.x = 0; offset.x <= (c_sub_chunk_mesh_size.x-1) * c_zero_face[face].x; offset.x++) {
                    for (offset.y = 0; offset.y <= (c_sub_chunk_mesh_size.y-1) * c_zero_face[face].y; offset.y++) {
                        for (offset.z = 0; offset.z <= (c_sub_chunk_mesh_size.z-1) * c_zero_face[face].z; offset.z++) {
                            Int3D offset2 = offset + c_side_offset_zero[face] * (c_sub_chunk_mesh_size - 1);
                            generateBlockMesh(obj, chunk_data, offset2, (BlockFaceDirection)face, pass);
                        }
                    }
                }
            }

            m_queue_mutex.lock();
            m_new_sub_chunk_queue.enqueue(ReadySubChunk(pass,
                (BlockFaceDirection)face, obj,
                m_owner->sceneNodeForPass(pass), sub_chunk_key));

            chunk_data = m_sub_chunks.value(sub_chunk_key);
            // chunk_data.node[pass] is set in frameRenderingQueued by the other thread after it creates it.
            chunk_data.node[face+1][pass] = NULL;
            chunk_data.obj[face+1][pass] = obj;
            m_sub_chunks.insert(sub_chunk_key, chunk_data);
            m_queue_mutex.unlock();
        }
    }

    if (replace_chunk) {
        // put delete old stuff on queue
        m_queue_mutex.lock();
        for (int face = face_min; face <= face_max; face++) {
            if (seam != NoDirection && face != seam)
                continue;
            for (int pass = 0; pass < 2; pass++)
                m_done_sub_chunk_queue.enqueue(done_chunks[face+1][pass]);
        }
        m_queue_mutex.unlock();
    }
}

void SubChunkMeshGenerator::generateBlockMesh(Ogre::ManualObject * obj,
    const SubChunkData & chunk_data, const Int3D & offset,
    BlockFaceDirection face, int pass)
{
    Int3D absolute_position = chunk_data.position + offset;
    Block block = m_owner->game()->blockAt(absolute_position);

    BlockData block_data = m_block_data.value(block.type(), m_air);

    // skip air
    if (block_data.side_textures.isEmpty())
        return;

    // first pass, skip partially transparent stuff
    if (pass == 0 && block_data.partial_alpha)
        return;

    // second pass, only do partially transparent stuff
    if (pass == 1 && !block_data.partial_alpha)
        return;

    if (face == NoDirection) {
        // for every side
        for (int side_index = 0; side_index < 6; side_index++) {
            // skip chunk seams
            if ((offset.x == 0 && side_index == NegativeX) ||
                (offset.y == 0 && side_index == NegativeY) ||
                (offset.z == 0 && side_index == NegativeZ) ||
                (offset.x == c_sub_chunk_mesh_size.x-1 && side_index == PositiveX) ||
                (offset.y == c_sub_chunk_mesh_size.y-1 && side_index == PositiveY) ||
                (offset.z == c_sub_chunk_mesh_size.z-1 && side_index == PositiveZ))
            {
                continue;
            }
            generateSideMesh(obj, absolute_position, block, block_data, (BlockFaceDirection)side_index);
        }
    } else {
        // only the one side
        generateSideMesh(obj, absolute_position, block, block_data, face);
    }
}

void SubChunkMeshGenerator::generateSideMesh(Ogre::ManualObject * obj,
    const Int3D & absolute_position, const Block & block,
    const BlockData & block_data, BlockFaceDirection side_index)
{
    if (block_data.side_textures.at(side_index).isEmpty())
        return;


    // if the block on this side is opaque or the same block, skip
    Block neighbor_block = m_owner->game()->blockAt(absolute_position + c_side_offset[side_index]);
    Item::ItemType side_type = neighbor_block.type();
    if ((side_type == block.type() && (block_data.partial_alpha || side_type == Item::Glass)) ||
        ! m_block_data.value(side_type, m_air).see_through)
    {
        return;
    }

    // add this side to mesh
    Ogre::Vector3 abs_block_loc(absolute_position.x, absolute_position.y, absolute_position.z);

    // special cases for textures
    QString texture_name = block_data.side_textures.at(side_index);
    switch (block.type()) {
        case Item::Wood:
        if (side_index != NegativeZ && side_index != PositiveZ) {
            switch (block.woodMetadata()) {
            case Item::NormalTrunkTexture:
                texture_name = "WoodSide";
                break;
            case Item::RedwoodTrunkTexture:
                texture_name = "RedwoodTrunkSide";
                break;
            case Item::BirchTrunkTexture:
                texture_name = "BirchTrunkSide";
                break;
            }
        }
        break;
        case Item::Leaves:
        {
            switch (block.leavesMetadata()) {
            case Item::NormalLeavesTexture:
                texture_name = "LeavesRegular";
                break;
            case Item::RedwoodLeavesTexture:
                texture_name = "RedwoodLeaves";
                break;
            case Item::BirchLeavesTexture:
                texture_name = "BirchLeaves";
                break;
            }
        }
        break;
        case Item::Farmland:
        if (side_index == PositiveZ)
            texture_name = block.farmlandMetadata() == 0 ? "FarmlandDry" : "FarmlandWet";
        break;
        case Item::Crops:
        texture_name = QString("Crops") + QString::number(block.cropsMetadata());
        break;
        case Item::Wool:
        texture_name = c_wool_texture_names[block.woolMetadata()];
        break;
        case Item::Furnace:
        case Item::BurningFurnace:
        case Item::Dispenser:
        {
            if (side_index != NegativeZ && side_index != PositiveZ) {
                if ((block.furnaceMetadata() == Item::EastFacingFurnace && side_index == PositiveX) ||
                    (block.furnaceMetadata() == Item::WestFacingFurnace && side_index == NegativeX) ||
                    (block.furnaceMetadata() == Item::NorthFacingFurnace && side_index == PositiveY) ||
                    (block.furnaceMetadata() == Item::SouthFacingFurnace && side_index == NegativeY))
                {
                    texture_name = block_data.side_textures.value(NegativeY);
                } else {
                    texture_name = "FurnaceBack";
                }
            }
        }
        break;
        case Item::Pumpkin:
        case Item::JackOLantern:
        {
            if (side_index != NegativeZ && side_index != PositiveZ) {
                if ((block.pumpkinMetadata() == Item::EastFacingPumpkin && side_index == PositiveX) ||
                    (block.pumpkinMetadata() == Item::WestFacingPumpkin && side_index == NegativeX) ||
                    (block.pumpkinMetadata() == Item::NorthFacingPumpkin && side_index == PositiveY) ||
                    (block.pumpkinMetadata() == Item::SouthFacingPumpkin && side_index == NegativeY))
                {
                    texture_name = block_data.side_textures.value(NegativeY);
                } else {
                    texture_name = "PumpkinBack";
                }
            }
        }
        break;
        case Item::RedstoneWire_placed:
        {
            if (block.redstoneMetadata() == 0) {
                texture_name = "RedWire4wayOff";
            } else {
                texture_name = "RedWire4wayOn";
            }
        }
        break;
        default:;
    }
    MainWindow::BlockTextureCoord btc = m_owner->texCoords(texture_name);

    Ogre::Vector3 squish = block_data.squish_amount.at(side_index);

    float brightness;
    int night_darkness = 0;
    brightness = c_light_brightness[qMax(neighbor_block.skyLight() - night_darkness, neighbor_block.light())];

    Ogre::ColourValue color = Ogre::ColourValue::White;
    if (block.type() == Item::Grass && side_index == PositiveZ)
        color.setAsRGBA(0x8DD55EFF);
    else if (block.type() == Item::Leaves)
        color.setAsRGBA(0x8DD55EFF);

    color *= brightness;
    color *= c_brightness_bias[side_index];

    for (int triangle_index = 0; triangle_index < 2; triangle_index++) {
        for (int point_index = 0; point_index < 3; point_index++) {
            Ogre::Vector3 pos = c_side_coord[side_index][triangle_index][point_index] - squish;
            if (block_data.rotate) {
                pos -= 0.5f;
                pos = Ogre::Quaternion(Ogre::Degree(45), Ogre::Vector3::UNIT_Z) * pos;
                pos += 0.5f;
            }
            obj->position(pos + abs_block_loc);

            Ogre::Vector2 tex_coord = c_tex_coord[triangle_index][point_index];
            obj->textureCoord((btc.x+tex_coord.x*btc.w) / c_terrain_png_width, (btc.y+tex_coord.y*btc.h) / c_terrain_png_height);

            obj->colour(color);
        }
    }
}

void SubChunkMeshGenerator::queueDeleteSubChunkMesh(const Int3D &coord)
{
    Q_ASSERT(QThread::currentThread() == m_thread);

    // queue for deletion every sub chunk within the chunk.
    Int3D min = subChunkKey(coord);
    Int3D max = subChunkKey(coord+c_chunk_size);
    Int3D it;
    m_queue_mutex.lock();
    for (it.x = min.x; it.x < max.x; it.x+=c_sub_chunk_mesh_size.x) {
        for (it.y = min.y; it.y < max.y; it.y+=c_sub_chunk_mesh_size.y) {
            for (it.z = min.z; it.z < max.z; it.z+=c_sub_chunk_mesh_size.z) {
                SubChunkData chunk_data = m_sub_chunks.value(it);
                if (chunk_data.is_null)
                    continue;
                for (int side = -1; side < 6; side++) {
                    for (int i = 0; i < 2; i++) {
                        m_done_sub_chunk_queue.enqueue(ReadySubChunk(i, (BlockFaceDirection) side,
                            chunk_data.obj[side+1][i],
                            chunk_data.node[side+1][i], it));
                    }
                }
                m_sub_chunks.remove(it);
            }
        }
    }
    m_queue_mutex.unlock();
}

void SubChunkMeshGenerator::saveSubChunkNode(ReadySubChunk ready_chunk, Ogre::SceneNode * node)
{
    SubChunkData chunk_data = m_sub_chunks.value(ready_chunk.sub_chunk_key);
    if (! chunk_data.is_null) {
        chunk_data.node[ready_chunk.face+1][ready_chunk.pass] = node;
        m_sub_chunks.insert(ready_chunk.sub_chunk_key, chunk_data);
    }
}


Int3D SubChunkMeshGenerator::subChunkKey(const Int3D & coord)
{
    return coord - (coord % c_sub_chunk_mesh_size);
}
