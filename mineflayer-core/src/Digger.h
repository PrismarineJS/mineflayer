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
    void start(mineflayer_ItemType tool, mineflayer_ItemType block);
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

    QHash<mineflayer_Material, int> m_harvest_level;
    QHash<mineflayer_Material, float> m_tool_effectiveness;
    QHash<ToolType, QSet<mineflayer_ItemType> > m_tool_effective_against;

    // done digging when this is >= 1.0f
    float m_sum;
    mineflayer_ItemType m_tool;
    mineflayer_ItemType m_block;

    QTimer m_timer;

    Game * m_game;
private:
    bool itemCanHarvest(mineflayer_ItemType tool, mineflayer_ItemType block_type) const;

    ToolType toolType(mineflayer_ItemType tool) const;

    float strengthVsBlock(mineflayer_ItemType tool, mineflayer_ItemType block, bool underwater, bool on_ground);


private slots:

    // send 20 ticks per second (a tick every 0.05 seconds)
    void tick();

};

#endif // DIGGER_H
