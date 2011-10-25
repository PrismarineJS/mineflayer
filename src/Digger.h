#ifndef DIGGER_H
#define DIGGER_H

#include <QObject>
#include <QSet>
#include <QTimer>

#include "Item.h"

class Game;

// for figuring out how long digging will take.
class Digger : public QObject
{
    Q_OBJECT
public:
    explicit Digger(Game * game, QObject *parent = 0);

    // start digging against block with tool
    void start(Item::ItemType tool, Item::ItemType block);
    void stop();

    bool isActive() const { return m_timer.isActive(); }

signals:
    // emitted when digging has completed
    void finished();

private:

    enum ToolType {
        NoTool,
        Pickaxe,
        Shovel,
        Axe,
    };

    QHash<Item::Material, int> m_harvest_level;
    QHash<Item::Material, float> m_tool_effectiveness;
    QHash<ToolType, QSet<Item::ItemType> > m_tool_effective_against;

    // done digging when this is >= 1.0f
    float m_sum;
    Item::ItemType m_tool;
    Item::ItemType m_block;

    QTimer m_timer;

    Game * m_game;
private:
    bool itemCanHarvest(Item::ItemType tool, Item::ItemType block_type) const;

    ToolType toolType(Item::ItemType tool) const;

    float strengthVsBlock(Item::ItemType tool, Item::ItemType block, bool underwater, bool on_ground);


private slots:

    // send 20 ticks per second (a tick every 0.05 seconds)
    void tick();

};

#endif // DIGGER_H
