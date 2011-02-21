#include "Item.h"

#include <QFile>
#include <QTextStream>
#include <QDebug>
#include <QStringList>

bool Item::s_initialized = false;

QHash<Item::ItemType, Item::ItemData *> Item::s_item_data;
QHash<QString, Item::ItemData *> Item::s_item_by_name;
QHash<Item::Recipe, Item::Recipe *> Item::s_recipes;
QMultiHash<Item, Item::Recipe *> Item::s_item_recipe;

void Item::initializeStaticData()
{
    if (s_initialized)
        return;
    s_initialized = true;

    {
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

    // create an indexing using name
    for (QHash<Item::ItemType, Item::ItemData*>::iterator it = s_item_data.begin();
        it != s_item_data.end(); ++it)
    {
        Item::ItemData * item_data = it.value();
        s_item_by_name.insert(item_data->name, item_data);
    }

    {
        // grab the recipe data from resources
        QFile recipe_file(":/game/recipes.txt");
        recipe_file.open(QFile::ReadOnly);
        QTextStream stream(&recipe_file);

        bool recipe_start = true;
        bool done_parsing_design = false;
        Recipe * recipe = NULL;
        QStringList design;
        while (! stream.atEnd()) {
            QString line = stream.readLine().trimmed();
            if (line.isEmpty() || line.startsWith("#")) {
                if (! recipe_start) {
                    Q_ASSERT(recipe != NULL);

                    if (recipe->size.width() == 0) {
                        qSort(recipe->ingredients);
                    }

                    s_recipes.insert(*recipe, recipe);
                    recipe = NULL;
                    recipe_start = true;
                }
                continue;
            }
            if (recipe_start) {
                // get the result information

                Q_ASSERT(recipe == NULL);

                recipe = new Recipe;
                recipe->result = parseItem(line);

                recipe_start = false;
                done_parsing_design = false;
                design.clear();
            } else if (line.contains("=")) {
                if (! done_parsing_design) {
                    done_parsing_design = true;

                    // handle completed design
                    if (design.size() == 0)
                        recipe->size = QSize(0, 0);
                    else
                        recipe->size = QSize(design.at(0).size(), design.size());

                    recipe->design.resize(recipe->size.width() * recipe->size.height());

                    for (int y = 0; y < design.size(); y++) {
                        QString design_line = design.at(y);
                        for (int x = 0; x < design_line.size(); x++) {
                            int palette_index_plus_one = design_line.mid(x, 1).toInt();
                            recipe->design.replace(y*recipe->size.width()+x, palette_index_plus_one-1);
                        }
                    }
                }

                // this line is ingredient palette
                QStringList parts = line.split("=", QString::KeepEmptyParts);
                int part_index = 0;
                int ingredient_count = parts.at(part_index++).toInt();
                QStringList ingredient_parts = parts.at(part_index++).split(",");
                Ingredient ingredient;
                ingredient.item = parseItem(ingredient_parts.at(0), &ingredient.metadata_matters);
                ingredient.result = (ingredient_parts.size() > 1) ? parseItem(ingredient_parts.at(1)) : new Item;
                Q_ASSERT(part_index == parts.size());

                recipe->ingredients.append(ingredient);
                Q_ASSERT(ingredient_count == recipe->ingredients.size());
            } else {
                Q_ASSERT(! done_parsing_design);
                // design
                design << line;
            }

        }
        recipe_file.close();
    }

    // create mapping from item type
    for (QHash<Recipe, Recipe *>::iterator it = s_recipes.begin();
        it != s_recipes.end(); ++it)
    {
        Item::Recipe * recipe = it.value();
        s_item_recipe.insert(*(recipe->result), recipe);
    }
}

Item * Item::parseItem(QString item_string, bool * metadata_matters)
{
    QStringList parts = item_string.split(":", QString::SkipEmptyParts);
    int part_index = 0;
    Item * item = new Item;
    item->type = s_item_by_name.value(parts.at(part_index++))->id;
    item->count = 1;
    item->metadata = 0;
    if (parts.size() > part_index)
        item->count = parts.at(part_index++).toInt();

    bool _metadata_matters = false;
    if (parts.size() > part_index) {
        item->metadata = parts.at(part_index++).toInt();
        _metadata_matters = true;
    }

    Q_ASSERT(parts.size() == part_index);

    if (metadata_matters != NULL)
        *metadata_matters = _metadata_matters;

    return item;
}


uint qHash(const Item::Recipe & recipe)
{
    const int big_prime = 8191;
    const int big_prime_2 = 131071;

    uint h = 0;
    h = h * big_prime + recipe.size.width();
    h = h * big_prime + recipe.size.height();

    if (recipe.size.width() == 0) {
        // no design - only the ingredients matter. we have conveniently sorted them.
        for (int i = 0; i < recipe.ingredients.size(); i++) {
            const Item::Ingredient * ingredient = &(recipe.ingredients.at(i));
            h = h * big_prime + ingredient->item->type;
            if (ingredient->metadata_matters)
                h = h * big_prime + ingredient->item->metadata;
        }
    } else {
        foreach (int ingredient_index, recipe.design) {
            if (ingredient_index == -1) {
                h = h * big_prime + big_prime_2;
            } else {
                const Item::Ingredient * ingredient = &(recipe.ingredients.at(ingredient_index));

                h = h * big_prime + ingredient->item->type;
                if (ingredient->metadata_matters)
                    h = h * big_prime + ingredient->item->metadata;
            }
        }
    }

    return h;
}

uint qHash(const Item & item)
{
    const int big_prime = 8191;

    uint h = 0;
    h = h * big_prime + item.type;
    h = h * big_prime + item.metadata;

    return h;
}

bool Item::Recipe::operator ==(const Recipe & other) const
{
    // TODO: this probabably works but if we have any collisions we're SCREWED.
    return qHash(this) == qHash(other);
}

bool Item::operator ==(const Item & other) const
{
    return other.type == this->type && other.metadata == this->metadata;
}


bool Item::Ingredient::operator <(const Ingredient & other) const
{
    return this->item->type < other.item->type || this->item->metadata < other.item->metadata;
}
