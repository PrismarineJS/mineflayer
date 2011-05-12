(function () {
    // keep track of state
    // what window is open
    var open_window = mf.WindowType.None;
    mf.onWindowOpened(function(window_type) {
        open_window = window_type;
    });
    var old_close_window = mf.closeWindow;
    mf.closeWindow = function() {
        open_window = mf.WindowType.None;
        old_close_window();
    }
    // how much time has passed
    var start_date = new Date()

    function createBlankState() {
        return {
            'open_window': mf.WindowType.None,
            'armor_slots': [], // 0 - 3
            'inventory_slots': [], // 0 - 35
            'in_window_hand': undefined,
            'time_passed': 0, // float seconds
        };
    }

    function computeCurrentState() {
        var state = createBlankState();
        state.open_window = open_window;

        var now_date = new Date();
        state.time_passed = (now_date - start_date) / 1000;
        return state;
    }

    // state compare functions
    var cmp = {
        eq: function(a, b) {
            return a === b;
        },
        neq: function(a, b) {
            return ! eq(a, b);
        },
        gt: function(a, b) {
            return a > b;
        },
        lte: function(a, b) {
            return ! gt(a, b);
        },
        lt: function(a, b) {
            return a < b;
        },
        gte: function(a, b) {
            return ! gt(a, b);
        },
    };

    var set = {
        // state modification functions
        simple: function(state, state_id, value) {
            state[state_id] = value;
        },
        add: function(state, state_id, value) {
            state[state_id] += value;
        },
    };

    var get = {
        simple: function() {
            return function(state, state_id) { return state[state_id]; };
        },
        inventory_count: function(item_type) {
            return function(state, state_id) {
                // count how many items of item_type in inventory
                var sum = 0;
                for (var i = 0; i < state.inventory_slots.length; i++) {
                    if (state.inventory_slots[i].type === item_type) {
                        sum += state.inventory_slots[i].count;
                    }
                }
                for (var i = 0; i < state.armor_slots.length; i++) {
                    if (state.armor_slots[i].type === item_type) {
                        sum += state.armor_slots[i].count;
                    }
                }
                return sum;
            }
        },
    };

    function invSlotForItem(item_type) {
        for (var i = 0; i < 36; i++) {
            if (mf.inventoryItem(i).type === item_type) {
                return i;
            }
        }
        return -1;
    }
    function armorSlotForItem(item_type) {
        for (var i = 5; i <= 8; i++) {
            if (mf.uniqueWindowItem(i).type === item_type) {
                return i;
            }
        }
        return -1;
    }

    // actions data structure
    var actions = {
        OpenInventoryWindow: {
            requirements: [
                function (state) { return state['open_window'] === mf.WindowType.None },
            ],
            effects: [
                ['open_window', set.simple, mf.WindowType.Inventory],
            ],
            execute: function () {
                mf.openInventoryWindow();
            }
        },
        CloseCurrentWindow: {
            requirements: [
                ['open_window', get.simple, cmp.neq, mf.WindowType.None],
            ],
            effects: [
                ['open_window', set.simple, mf.WindowType.None],
            ],
            execute: function () {
                mf.closeWindow();
            }
        },
        // takes ItemType parameter
        LeftClickInventoryItem: function(item_type) {
            return {
                requirements: [
                    function (state) { return inventory_count(item_type) >= 1; },
                    function (state) { return state['open_window'] === mf.WindowType.Inventory; },
                ],
                effects: [
                    ['inventory_slots', set.inventory_slot_for_type(item_type), get.state('in_window_hand')],
                    ['in_window_hand', set.simple, get.inventory_slot_for_type(item_type)],
                ],
                execute: function(item_type) {
                    var inv_slot = invSlotForItem(item_type);
                    if (inv_slot !== -1) {
                        mf.clickInventorySlot(inv_slot, mf.MouseButton.Left);
                    } else {
                        mf.clickUniqueSlot(armorSlotForItem(item_type), mf.MouseButton.Left);
                    }
                },
            };
        }
    };
    // give each action a name property
    for (var action_name in actions) {
        actions[action_name].name = action_name;
    }

    // maps state id to list of relevant actions
    var relevant_actions = {
        'open_window': [actions.OpenInventoryWindow, actions.CloseCurrentWindow],
        'inventory_slots': [],
        'in_window_hand': [],
        'time_passed': [],
    }

    chat_commands.registerCommand("achieve", function(username, args, responder_func) {
        var goals = [
            [['open_window'], function (state) { return state['open_window'] === mf.WindowType.Inventory; }],
        ];
        var start_state = computeCurrentState();
        var actions_to_take = the_algorithm(start_state, goal_state);
        responder_func("Figured it out. Here's what to do:");
        for (var i = 0; i < actions_to_take.length; i++) {
            responder_func((i+1) + ". " + actions_to_take.name);
        }
    });

    function the_algorithm(start_state, goals) {
        while (true) {
            // determine whether goals are achieved
            var unachieved_goals = [];
            var goals_achieved = true;
            for (var i = 0; i < goals.length; i++) {
                if (! goals[i][1](start_state)) {
                    goals_achieved = false;
                    unachieved_goals.push(
                }
            }
            if (goals_achieved) {
                break;
            }
        
            // find actions whose effects fulfill the goal state
            var actions_to_try = relevant_actions[];

            // new goal state is the Action or Law's prereqs
        }
    }
})();
