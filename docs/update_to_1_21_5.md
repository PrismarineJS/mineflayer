# Mineflayer 1.21.5 Support Plan

## Current Status

As of July 2025, Mineflayer has partial 1.21.5 support with several critical issues remaining. The version is already listed in `testedVersions` but tests are failing due to protocol changes in 1.21.5.

## Key Issues Identified

Based on the analysis of pull requests and issues, the main problems for 1.21.5 support are:

### 1. Chunk Protocol Changes (CRITICAL - BLOCKING ALL TESTS)
- **Issue**: Network has small changes to chunk format where size is now auto-computed to save a byte
- **Status**: **CONFIRMED** - prismarine-chunk fix is implemented but still failing with "Target offset is beyond the bounds of the internal SmartBuffer data"
- **Impact**: **ALL TESTS FAIL** - Chunk loading completely broken, bot can't even spawn properly
- **Error Location**: 
  - `BitArrayNoSpan.js:183:30` - BitArray.readBuffer
  - `PaletteContainer.js:34:15` - DirectPaletteContainer.readBuffer
  - `PaletteChunkSection.js:118:12` - ChunkSection.read
  - `ChunkColumn.js:255:41` - ChunkColumn.load
- **Root Cause**: The dynamic size computation `Math.ceil(constants.BLOCK_SECTION_VOLUME * bitsPerValue / 64)` is still incorrect
- **Dependencies**: Requires fix in prismarine-chunk size calculation logic

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

### 🚨 **Why Tests Are Still Failing**
**CONFIRMED**: The fix is implemented but still not working correctly. The issue is in the size computation logic.

**Root Cause Analysis:**
1. ✅ **Fix is implemented**: `noSizePrefix` detection and logic is present in the code
2. ✅ **Version detection works**: `mcData.version['>=']('1.21.5')` returns `true` correctly
3. ❌ **Size computation is wrong**: The dynamic size calculation `Math.ceil(constants.BLOCK_SECTION_VOLUME * bitsPerValue / 64)` is still causing buffer overflow
4. ❌ **Buffer reading fails**: Still getting "Target offset is beyond the bounds of the internal SmartBuffer data"

**The Problem:**
The issue is in the `readBuffer` method in `PaletteContainer.js`. The computed size is still incorrect for the actual data being sent by the server.

## Specific Recommendations

### 1. **Fix the Size Computation** (URGENT)
The current formula `Math.ceil(constants.BLOCK_SECTION_VOLUME * bitsPerValue / 64)` is wrong. Need to:

1. **Analyze actual packet data**: Use packet capture to see the real size being sent
2. **Fix the calculation**: The formula needs to account for the actual data structure
3. **Test with real 1.21.5 data**: Verify against actual Minecraft 1.21.5 server packets

### 2. **Debug the Buffer Reading** (High Priority)
Add debug logging to understand exactly what's happening:

```javascript
// In PaletteContainer.js readBuffer method
console.log('noSizePrefix:', this.noSizePrefix)
console.log('bitsPerValue:', bitsPerValue)
console.log('computed longs:', longs)
console.log('buffer remaining:', smartBuffer.remaining())
```

### 3. **Compare with Working Version** (Medium Priority)
Compare the 1.21.5 chunk data with 1.21.4 to understand the exact difference in format.

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

## References

- [PrismarineJS/prismarine-chunk#289](https://github.com/PrismarineJS/prismarine-chunk/pull/289)
- [PrismarineJS/mineflayer#3691](https://github.com/PrismarineJS/mineflayer/pull/3691)
- [PrismarineJS/mineflayer#3641](https://github.com/PrismarineJS/mineflayer/issues/3641)
- [PrismarineJS/minecraft-data#1029](https://github.com/PrismarineJS/minecraft-data/pull/1029)
- [PrismarineJS/node-minecraft-protocol#1408](https://github.com/PrismarineJS/node-minecraft-protocol/pull/1408) 