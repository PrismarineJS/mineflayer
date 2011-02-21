#include "Item.h"

#include <QFile>
#include <QTextStream>
#include <QDebug>
#include <QStringList>

bool Item::s_initialized = false;

QHash<Item::ItemType, Item::ItemData *> Item::s_item_data;

void Item::initializeStaticData()
{
    if (s_initialized)
        return;
    s_initialized = true;

    // grab the item data from resources
    QFile item_data_file(":/game/items.txt");
    item_data_file.open(QFile::ReadOnly);
    QTextStream stream(&item_data_file);
    while (! stream.atEnd()) {
        QString line = stream.readLine().trimmed();
        if (line.isEmpty() || line.startsWith("#"))
            continue;
        QStringList parts = line.split(QRegExp("\\s+"), QString::SkipEmptyParts);
        Q_ASSERT(parts.size() == 9);

        int part_index = 0;

        ItemData * item_data = new ItemData;

        // ID
        bool ok;
        item_data->id = (ItemType)parts.at(part_index++).toInt(&ok, 0);
        Q_ASSERT(ok);

        item_data->name                 = parts.at(part_index++);
        item_data->stack_height         = parts.at(part_index++).toInt();
        item_data->placeable            = static_cast<bool>(parts.at(part_index++).toInt());
        item_data->item_activatable     = static_cast<bool>(parts.at(part_index++).toInt());
        item_data->physical             = static_cast<bool>(parts.at(part_index++).toInt());
        item_data->diggable             = static_cast<bool>(parts.at(part_index++).toInt());
        item_data->block_activatable    = static_cast<bool>(parts.at(part_index++).toInt());
        item_data->safe                 = static_cast<bool>(parts.at(part_index++).toInt());

        Q_ASSERT(parts.size() == part_index);

        s_item_data.insert(item_data->id, item_data);

    }
    item_data_file.close();

}

