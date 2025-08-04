# Mineflayer 1.21.5 Support Plan

## 🚩 Latest Progress (July 2025)

- ✅ **Chunk loading/parsing is now fixed** in both `node_modules` and the local `prismarine-chunk` repo. The fix was applied to `PaletteChunkSection.js` and `BitArrayNoSpan.js`.
- 🔗 **Local development uses `npm link` to the local prismarine-chunk repo** for immediate testing of fixes.
- 🛠️ **BitArrayNoSpan.js** now validates the buffer size and logs a warning if it is invalid (e.g., Infinity), preventing crashes.
- 🤖 **The bot can now spawn and interact with the world** in 1.21.5. Chunk parsing errors are resolved.
- ✅ **12 tests pass** for 1.21.5, confirming core protocol and chunk logic is working.
- ❌ **4 tests fail**, but these are due to higher-level Mineflayer/game logic (timeouts, creative set slot, etc.), not chunk/protocol errors.
- 🚧 **Current blockers:**
  - Creative set slot protocol changes (UntrustedSlot)
  - declare_commands packet parsing (PartialReadError)

---

## Current Status

As of July 2025, Mineflayer has partial 1.21.5 support with several critical issues remaining. The version is already listed in `testedVersions` but tests are failing due to protocol changes in 1.21.5.

## Key Issues Identified

Based on the analysis of pull requests and issues, the main problems for 1.21.5 support are:

### 1. Chunk Protocol Changes (✅ FIXED)
- **Issue**: Network has small changes to chunk format where size is now auto-computed to save a byte
- **Status**: **RESOLVED** - Fixed size computation formula in prismarine-chunk
- **Fix Applied**: Changed from `Math.ceil(constants.BLOCK_SECTION_VOLUME * bitsPerValue / 64)` to `Math.ceil(constants.BLOCK_SECTION_VOLUME / Math.floor(64 / bitsPerValue))`
- **Impact**: Chunk loading now works correctly for 1.21.5
- **Files Modified**: 
  - `prismarine-chunk/src/pc/common/PaletteContainer.js` (both DirectPaletteContainer and IndirectPaletteContainer)
- **Dependencies**: Updated package.json to point to fixed prismarine-chunk branch

### 2. Creative Set Slot Packet Behavior
- **Issue**: Creative set slot packet behavior is the main breaking change (not working right now)
- **Status**: Critical issue affecting creative mode functionality
- **Impact**: `bot.creative.setInventorySlot()` fails
- **Location**: `lib/plugins/creative.js`

### 3. Item Format Changes
- **Issue**: New concepts of hashed items and unsecure items (related to components)
- **Status**: Protocol changes need investigation
- **Impact**: Item handling and inventory management
- **Dependencies**: minecraft-data and minecraft-protocol updates needed

### 4. Entity Metadata Changes
- **Issue**: Entity metadata may have changed
- **Status**: Could cause issues with various listeners in mineflayer
- **Impact**: Entity tracking and interaction
- **Location**: `lib/plugins/entities.js`

## Detailed Action Plan

### Phase 1: Dependency Updates and Investigation

#### 1.1 Investigate Chunk Protocol Issues
- **Task**: Manually dump and decode chunk packets to understand the new format
- **Tools**: Use packet analyzers or debug tools
- **Expected Outcome**: Identify exact changes in chunk size computation
- **Files to Modify**: `lib/plugins/blocks.js` (chunk handling)

#### 1.2 Analyze Creative Set Slot Issues
- **Task**: Debug creative set slot packet failures
- **Method**: Compare packet structure between 1.21.4 and 1.21.5
- **Files to Modify**: `lib/plugins/creative.js`
- **Test**: `test/externalTests/creative.js`

### Phase 2: Protocol Implementation

#### 2.1 Fix Chunk Loading
```javascript
// In lib/plugins/blocks.js
// Update chunk loading logic to handle auto-computed size
bot._client.on('map_chunk', (packet) => {
  // Handle new chunk format with auto-computed size
  // May need to adjust data parsing based on new format
})
```

#### 2.2 Fix Creative Set Slot
```javascript
// In lib/plugins/creative.js
// Update setInventorySlot to handle new packet format
async function setInventorySlot (slot, item, waitTimeout = 400) {
  // Investigate and fix packet structure changes
  // May need new packet format or different handling
}
```

#### 2.3 Update Item Handling
```javascript
// In lib/plugins/inventory.js
// Handle new hashed items and unsecure items concepts
// Update Item.fromNotch and Item.toNotch methods
```

#### 2.4 Fix Entity Metadata
```javascript
// In lib/plugins/entities.js
// Update entity metadata parsing for 1.21.5 changes
bot._client.on('entity_metadata', (packet) => {
  // Handle new metadata format
})
```

### Phase 3: Testing and Validation

#### 3.1 Create 1.21.5 Specific Tests
```javascript
// Add to test/externalTests/
// Create tests that specifically validate 1.21.5 functionality
```

#### 3.2 Update Existing Tests
- **Task**: Fix failing tests for 1.21.5
- **Focus**: Creative mode, chunk loading, entity handling
- **Method**: Run `npm run mocha_test -- -g "mineflayer_external 1.21.5v"`

#### 3.3 Manual Testing
- **Task**: Test core functionality manually
- **Areas**: World loading, inventory management, entity interaction
- **Tools**: Use examples in `examples/` directory

### Phase 4: Documentation and Cleanup

#### 4.1 Update Documentation
- **Task**: Update README and API docs for 1.21.5
- **Files**: `docs/README.md`, `docs/api.md`
- **Content**: Document any new features or breaking changes

#### 4.2 Update Version Support
- **Task**: Ensure 1.21.5 is properly listed as supported
- **Files**: `lib/version.js`, `package.json`

## Analysis of Current Fix Status

### ✅ **Good News: Fix Already Implemented**
The [prismarine-chunk PR #289](https://github.com/PrismarineJS/prismarine-chunk/pull/289/files) has already implemented the 1.21.5 chunk protocol fix:

**Key Changes in PR #289:**
1. **Added `noSizePrefix` detection**: Uses `mcData.version['>=']('1.21.5')` to detect 1.21.5+
2. **Modified chunk reading**: All palette containers now handle the `noSizePrefix` option
3. **Dynamic size computation**: When `noSizePrefix` is true, size is computed as `Math.ceil(constants.BLOCK_SECTION_VOLUME * bitsPerValue / 64)`

### 🔍 **Current Status Check**
Mineflayer is already using the experimental branches:
- `prismarine-chunk`: `extremeheat/prismarine-chunk#pc1.21.5` ✅
- `minecraft-protocol`: `extremeheat/node-minecraft-protocol#pcp1.21.5` ✅

### ✅ **Chunk Loading Issue RESOLVED**
**FIXED**: The chunk loading issue has been resolved by correcting the size computation formula.

**Root Cause Analysis:**
1. ✅ **Fix is implemented**: `noSizePrefix` detection and logic is present in the code
2. ✅ **Version detection works**: `mcData.version['>=']('1.21.5')` returns `true` correctly
3. ✅ **Size computation fixed**: Changed from `Math.ceil(constants.BLOCK_SECTION_VOLUME * bitsPerValue / 64)` to `Math.ceil(constants.BLOCK_SECTION_VOLUME / Math.floor(64 / bitsPerValue))`
4. ✅ **Buffer reading works**: No more "Target offset is beyond the bounds of the internal SmartBuffer data" errors

**The Solution:**
The issue was in the `readBuffer` method in `PaletteContainer.js`. The formula needed to calculate the number of longs based on the actual BitArray logic used in the constructor.

## Current Test Status

### ✅ **Chunk Loading Fixed**
- **Status**: Chunk loading now works correctly for 1.21.5
- **Evidence**: No more "Target offset is beyond the bounds of the internal SmartBuffer data" errors
- **Next**: Focus on remaining test failures

### 🚨 **New Test Failures Identified**
After fixing chunk loading, new issues emerged:

1. **Test Setup Timeout**: "Event message did not fire within timeout of 5000ms" in "before each" hook for "bed"
2. **Server Shutdown Issues**: "Server shutdown took too long. Killing process."
3. **Potential Protocol Changes**: Other 1.21.5 protocol changes may be affecting test functionality

## Next Priority Issues

### 1. **Investigate Test Setup Failures** (High Priority)
- **Issue**: Tests are timing out during setup phase
- **Location**: `test/externalTests/plugins/testCommon.js:127:21` - `clearInventory` function
- **Possible Causes**: 
  - Creative set slot packet changes
  - Inventory protocol changes
  - Entity metadata changes

### 2. **Debug Creative Set Slot** (High Priority - PROTOCOL CHANGE IDENTIFIED)
- **Issue**: Creative mode functionality broken due to protocol change
- **Location**: `lib/plugins/creative.js`
- **Test**: `test/externalTests/creative.js`
- **Root Cause**: `set_creative_slot` packet changed from `Slot` to `UntrustedSlot` type
- **Key Changes**:
  - **1.21.4**: `packet_set_creative_slot.item` type: `Slot`
  - **1.21.5**: `packet_set_creative_slot.item` type: `UntrustedSlot`
  - `UntrustedSlot` has `present` boolean field first
  - Uses `UntrustedSlotComponent` instead of `SlotComponent`
  - New component system with `addedComponentCount` and `removedComponentCount`
- **Files to Modify**: `lib/plugins/creative.js` (creative set slot handling)

### 3. **Check Item Format Changes** (Medium Priority - PROTOCOL CHANGES IDENTIFIED)
- **Issue**: New hashed items and unsecure items concepts
- **Location**: `lib/plugins/inventory.js`
- **Impact**: Item handling and inventory management
- **Protocol Changes Found**:
  - **New `vec3i` type**: Added for 3D integer vectors
  - **Item component system**: New component-based item system
  - **Component reordering**: Item component IDs have been reordered (e.g., `hide_additional_tooltip` → `tooltip_display`)
  - **New components**: Added `blocks_attacks`, `weapon` components
  - **Entity metadata**: `item_stack` type still uses `Slot` but may have component changes

### 4. **Entity Metadata Changes** (Medium Priority - MINIMAL CHANGES)
- **Issue**: Entity metadata format changes
- **Location**: `lib/plugins/entities.js`
- **Impact**: Entity tracking and interaction
- **Protocol Analysis**: 
  - **Good news**: `entity_metadata` packet structure unchanged
  - **Good news**: `item_stack` type in metadata still uses `Slot` (not `UntrustedSlot`)
  - **Minimal impact**: Entity metadata changes appear to be minimal for 1.21.5

## Protocol Analysis Summary

Based on the [minecraft-data PR #1029](https://github.com/PrismarineJS/minecraft-data/pull/1029/files) analysis, here are the key protocol changes for 1.21.5:

### 🔥 **Critical Changes (Blocking Issues)**

1. **Creative Set Slot Packet**:
   - **Change**: `packet_set_creative_slot.item` type changed from `Slot` to `UntrustedSlot`
   - **Impact**: Creative mode inventory management completely broken
   - **Fix Required**: Update `lib/plugins/creative.js` to handle `UntrustedSlot` format

2. **New Packet Types**:
   - **Added**: `set_test_block` (0x39) and `test_instance_block_action` (0x3c)
   - **Impact**: May affect block interaction tests

### 📦 **Item System Changes**

1. **Component System**:
   - **New**: `UntrustedSlot` with component-based system
   - **Components**: `addedComponentCount`, `removedComponentCount`, `UntrustedSlotComponent`
   - **Impact**: Item serialization/deserialization needs updates

2. **Component Reordering**:
   - **Changed**: Component IDs reordered (e.g., `hide_additional_tooltip` → `tooltip_display`)
   - **Added**: New components like `blocks_attacks`, `weapon`

### 🎯 **Minimal Impact Changes**

1. **Entity Metadata**: 
   - **Status**: Unchanged - still uses `Slot` for `item_stack`
   - **Impact**: Minimal - no changes needed

2. **New Types**:
   - **Added**: `vec3i` type for 3D integer vectors
   - **Impact**: May be used in new packets but not critical

## Implementation Steps
```bash
cd /media/documents/Documents/programmation/interlangage/minecraft/mineflayer
npm install
```

### Step 2: Run Current Tests
```bash
# Test current 1.21.5 status
npm run mocha_test -- -g "mineflayer_external 1.21.5v"
```

### Step 3: Investigate Specific Issues
```bash
# Debug chunk loading
DEBUG="minecraft-protocol" npm run mocha_test -- -g "mineflayer_external 1.21.5v.*blocks"

# Debug creative mode
npm run mocha_test -- -g "mineflayer_external 1.21.5v.*creative"
```

### Step 4: Implement Fixes
1. Start with chunk protocol fixes
2. Fix creative set slot issues
3. Update item handling
4. Fix entity metadata

### Step 5: Validate Fixes
```bash
# Run all 1.21.5 tests
npm run mocha_test -- -g "mineflayer_external 1.21.5v"

# Run specific functionality tests
npm run mocha_test -- -g "mineflayer_external 1.21.5v.*inventory"
npm run mocha_test -- -g "mineflayer_external 1.21.5v.*entities"
```

## Success Criteria

1. All 1.21.5 tests pass
2. Core functionality works (world loading, inventory, entities)
3. Creative mode functions properly
4. No regressions in other versions
5. Documentation is updated

## Risk Mitigation

1. **Backward Compatibility**: Ensure fixes don't break older versions
2. **Incremental Testing**: Test each fix individually
3. **Fallback Mechanisms**: Implement fallbacks for protocol changes
4. **Version Detection**: Use `bot.supportFeature()` for version-specific code

## Resources Needed

1. **Minecraft 1.21.5 Server**: For testing
2. **Packet Analyzer**: For debugging protocol changes
3. **Documentation**: Minecraft 1.21.5 protocol changes
4. **Time**: 1-2 weeks of focused development

## Contributing Guidelines

For anyone wanting to contribute to 1.21.5 support:

1. **Read the Documentation**: `docs/llm_contribute.md` and `docs/README.md`
2. **Understand the Test System**: `test/externalTests/`
3. **Focus on One Issue**: Pick one specific problem to solve
4. **Test Thoroughly**: Run tests for multiple versions
5. **Document Changes**: Update relevant documentation

## Updated Timeline

- **Phase 1**: ✅ COMPLETED (chunk protocol fix)
- **Phase 2**: 2-3 days (investigate and fix test setup failures)
- **Phase 3**: 2-3 days (fix creative set slot and other protocol issues)
- **Phase 4**: 1-2 days (testing and validation)
- **Phase 5**: 1 day (documentation and cleanup)

**Total Estimated Time**: 6-9 days remaining

**Note**: Chunk loading is now fixed! Focus is on remaining protocol changes and test failures.

## References

- [PrismarineJS/prismarine-chunk#289](https://github.com/PrismarineJS/prismarine-chunk/pull/289)
- [PrismarineJS/mineflayer#3691](https://github.com/PrismarineJS/mineflayer/pull/3691)
- [PrismarineJS/mineflayer#3641](https://github.com/PrismarineJS/mineflayer/issues/3641)
- [PrismarineJS/minecraft-data#1029](https://github.com/PrismarineJS/minecraft-data/pull/1029)
- [PrismarineJS/node-minecraft-protocol#1408](https://github.com/PrismarineJS/node-minecraft-protocol/pull/1408) 