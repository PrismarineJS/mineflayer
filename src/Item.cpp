#include "Item.h"

#include <cmath>

#include <QFile>
#include <QTextStream>
#include <QDebug>
#include <QStringList>

bool Item::s_initialized = false;

QHash<Item::ItemType, Item::ItemData *> Item::s_item_data;
QHash<QString, Item::ItemData *> Item::s_item_by_name;
QHash<_Item::Recipe, _Item::Recipe *> Item::s_recipes;
QMultiHash<Item, _Item::Recipe *> Item::s_item_recipe;
QHash<QString, Item::Material> Item::s_materials;

void Item::initializeStaticData()
{
    if (s_initialized)
        return;
    s_initialized = true;

    {
        // grab the materials lookup table
        QFile materials_file(":/game/materials.txt");
        materials_file.open(QFile::ReadOnly);
        QTextStream stream(&materials_file);
        while (! stream.atEnd()) {
            QString line = stream.readLine().trimmed();
            if (line.isEmpty() || line.startsWith("#"))
                continue;
            QStringList parts = line.split(QRegExp("\\s+"), QString::SkipEmptyParts);
            Q_ASSERT(parts.size() == 2);

            int part_index = 0;

            QString name = parts.at(part_index++);
            Material value = static_cast<Material>(parts.at(part_index++).toInt());
            s_materials.insert(name, value);

            Q_ASSERT(parts.size() == part_index);

        }
        materials_file.close();
    }

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
            Q_ASSERT(parts.size() == 11);

            int part_index = 0;

            ItemData * item_data = new ItemData;

            // ID
            bool ok;
            item_data->id                   = (ItemType)parts.at(part_index++).toInt(&ok, 0);
            Q_ASSERT(ok);

            item_data->name                 = parts.at(part_index++);
            item_data->stack_height         = parts.at(part_index++).toInt();
            item_data->placeable            = static_cast<bool>(parts.at(part_index++).toInt());
            item_data->item_activatable     = static_cast<bool>(parts.at(part_index++).toInt());
            item_data->physical             = static_cast<bool>(parts.at(part_index++).toInt());
            item_data->diggable             = static_cast<bool>(parts.at(part_index++).toInt());
            item_data->block_activatable    = static_cast<bool>(parts.at(part_index++).toInt());
            item_data->safe                 = static_cast<bool>(parts.at(part_index++).toInt());
            item_data->hardness             = static_cast<float>(parts.at(part_index++).toFloat());

            // material
            QString material_name = parts.at(part_index++);
            Q_ASSERT(s_materials.contains(material_name));
            item_data->material             = s_materials.value(material_name);

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
        _Item::Recipe * recipe = NULL;
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

                recipe = new _Item::Recipe;
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
                _Item::Ingredient ingredient;
                ingredient.item = parseItem(ingredient_parts.at(0), &ingredient.metadata_matters);
                ingredient.result = (ingredient_parts.size() > 1) ? parseItem(ingredient_parts.at(1)) : Item();
                Q_ASSERT(part_index == parts.size());

                recipe->ingredients.append(ingredient);
                Q_ASSERT(ingredient_count == recipe->ingredients.size());
                Q_UNUSED(ingredient_count);
            } else {
                Q_ASSERT(! done_parsing_design);
                // design
                design << line;
            }

        }
        recipe_file.close();
    }

    // create mapping from item type
    for (QHash<_Item::Recipe, _Item::Recipe *>::iterator it = s_recipes.begin();
        it != s_recipes.end(); ++it)
    {
        _Item::Recipe * recipe = it.value();
        s_item_recipe.insert(recipe->result, recipe);
    }
}

void Item::setJesusModeEnabled(bool value)
{
    s_item_data.value(Water)->physical = value;
    s_item_data.value(Water)->safe = !value;
    s_item_data.value(StationaryWater)->physical = value;
    s_item_data.value(StationaryWater)->safe = !value;
}

Item Item::parseItem(QString item_string, bool * metadata_matters)
{
    QStringList parts = item_string.split(":", QString::SkipEmptyParts);
    int part_index = 0;
    Item item;
    item.type = s_item_by_name.value(parts.at(part_index++))->id;
    item.count = 1;
    item.metadata = 0;
    if (parts.size() > part_index)
        item.count = parts.at(part_index++).toInt();

    bool _metadata_matters = false;
    if (parts.size() > part_index) {
        item.metadata = parts.at(part_index++).toInt();
        _metadata_matters = true;
    }

    Q_ASSERT(parts.size() == part_index);

    if (metadata_matters != NULL)
        *metadata_matters = _metadata_matters;

    return item;
}


uint qHash(const _Item::Recipe & recipe)
{
    const int big_prime = 8191;
    const int big_prime_2 = 131071;

    uint h = 0;
    h = h * big_prime + recipe.size.width();
    h = h * big_prime + recipe.size.height();

    if (recipe.size.width() == 0) {
        // no design - only the ingredients matter. we have conveniently sorted them.
        for (int i = 0; i < recipe.ingredients.size(); i++) {
            const _Item::Ingredient * ingredient = &(recipe.ingredients.at(i));
            h = h * big_prime + ingredient->item.type;
            if (ingredient->metadata_matters)
                h = h * big_prime + ingredient->item.metadata;
        }
    } else {
        foreach (int ingredient_index, recipe.design) {
            if (ingredient_index == -1) {
                h = h * big_prime + big_prime_2;
            } else {
                const _Item::Ingredient * ingredient = &(recipe.ingredients.at(ingredient_index));

                h = h * big_prime + ingredient->item.type;
                if (ingredient->metadata_matters)
                    h = h * big_prime + ingredient->item.metadata;
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

bool _Item::Recipe::operator ==(const _Item::Recipe & other) const
{
    if (size != other.size)
        return false;

    if (size.width() == 0) {
        // only compare ingredient list - assume both are sorted
        if (ingredients.size() != other.ingredients.size())
            return false;

        for (int i = 0; i < ingredients.size(); i++) {
            const _Item::Ingredient * this_ingredient  = &(ingredients.at(i));
            const _Item::Ingredient * other_ingredient = &(other.ingredients.at(i));

            if (! (*this_ingredient == *other_ingredient))
                return false;
        }
    } else {
        // compare design
        if (design.size() != other.design.size())
            return false;

        for (int i = 0; i < design.size(); i++) {
            int this_ingredient_index = design.at(i);
            int other_ingredient_index= other.design.at(i);

            if (this_ingredient_index == -1 && other_ingredient_index == -1)
                continue;

            if (this_ingredient_index == -1 || other_ingredient_index == -1)
                return false;

            const _Item::Ingredient * this_ingredient  = &(ingredients.at(this_ingredient_index));
            const _Item::Ingredient * other_ingredient = &(other.ingredients.at(other_ingredient_index));

            if (! (*this_ingredient == *other_ingredient))
                return false;
        }
    }

    return true;
}

bool Item::operator ==(const Item & other) const
{
    return other.type == this->type && other.metadata == this->metadata;
}


bool _Item::Ingredient::operator <(const Ingredient & other) const
{
    return this->item.type < other.item.type ||
        (this->item.type == other.item.type && this->item.metadata < other.item.metadata);
}

bool _Item::Ingredient::operator ==(const Ingredient & other) const
{
    return this->item.type == other.item.type &&
            (! this->metadata_matters || this->item.metadata == other.item.metadata) &&
            this->result == other.result;
}

const _Item::Recipe * Item::recipeFor(const _Item::Recipe & recipe)
{
    _Item::Recipe * result = s_recipes.value(recipe, NULL);

    if (result != NULL)
        return result;

    // can't try flipping if there is no design.
    if (recipe.size.width() == 0 || (recipe.size.width() == 1 && recipe.size.height() == 1))
        return NULL;

    // try flipping the recipe horizontally and see if we get any results
    _Item::Recipe flipped_recipe = recipe; // copy
    for (int y = 0; y < flipped_recipe.size.height(); y++) {
        for (int x = 0; x < std::floor(flipped_recipe.size.width() / 2); x++) {
            int index = y*flipped_recipe.size.width()+x;
            int index2= y*flipped_recipe.size.width()+(flipped_recipe.size.width() - 1 - x);
            int tmp = flipped_recipe.design.at(index);
            flipped_recipe.design.replace(index, flipped_recipe.design.at(index2));
            flipped_recipe.design.replace(index2, tmp);
        }
    }

    return s_recipes.value(flipped_recipe, NULL);
}
