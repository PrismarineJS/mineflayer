# Contributing to Mineflayer Tests as an LLM

This guide explains how to add and modify tests in Mineflayer, based on the experience of working with the time-related functionality. It provides a structured approach for LLMs to help with test development and debugging.

## Test Structure

### Location
- Tests are located in `test/externalTests/`
- Each test file corresponds to a specific functionality
- Test files follow the naming convention of the feature they test (e.g., `time.js` for time-related tests)

### Basic Test Template
```javascript
const assert = require('assert')
const { once } = require('../../lib/promise_utils')

module.exports = () => async (bot) => {
  // Test implementation
}
```

## Writing Tests

### 1. Property Testing
- Define expected properties and their types
- Use `assert.strictEqual` for type checking
- Verify value ranges where applicable

Example:
```javascript
const timeProps = {
  doDaylightCycle: 'boolean',
  bigTime: 'bigint',
  time: 'number'
}

Object.entries(timeProps).forEach(([prop, type]) => {
  assert.strictEqual(typeof bot.time[prop], type)
})
```

### 2. Helper Functions
- Create reusable helper functions for common operations
- Include functions for waiting and state verification
- Use descriptive names that explain their purpose

Example:
```javascript
const waitForTime = async () => {
  await once(bot, 'time')
  await bot.test.wait(200)
}
```

### 3. Test Cases
- Organize test cases in arrays for better maintainability
- Include descriptive names and expected outcomes
- Group related tests together

Example:
```javascript
const timeTests = [
  { time: 18000, name: 'midnight', isDay: false },
  { time: 6000, name: 'noon', isDay: true }
]
```

## Running Tests

### Basic Test Execution
```bash
npm run mocha_test -- -g "mineflayer_external 1.20.4v.*time"
```

### Version-Specific Testing
- Test against multiple Minecraft versions
- Common versions to test: 1.14.4, 1.20.4, 1.21.3
- Example:
```bash
# Test for 1.14.4
npm run mocha_test -- -g "mineflayer_external 1.14.4v.*time"

# Test for 1.21.3
npm run mocha_test -- -g "mineflayer_external 1.21.3v.*time"
```

## Debugging Tests

### 1. Adding Debug Logs
- Use `console.log` for debugging (remove before final commit)
- Log important state changes and values
- Example:
```javascript
console.log('Time properties:', bot.time)
```

### 2. Common Issues
- Timing issues: Adjust wait times if needed (default 200ms)
- Version compatibility: Check packet formats across versions
- State synchronization: Ensure proper event handling

### 3. Test Output
- Watch for server startup messages
- Monitor bot commands and responses
- Check for any error messages or warnings

## Best Practices

1. **Test Organization**
   - Group related tests together
   - Use descriptive test names
   - Keep tests focused and atomic

2. **Error Handling**
   - Include clear error messages
   - Test edge cases
   - Verify state after each operation

3. **Performance**
   - Minimize wait times
   - Clean up resources
   - Avoid redundant tests

4. **Documentation**
   - Comment complex logic
   - Explain test purposes
   - Document version-specific behavior

## Common Commands

### Server Commands
```javascript
bot.test.sayEverywhere('/time set 0') // Set time
bot.test.sayEverywhere('/gamerule doDaylightCycle false') // Toggle game rules
```

### Bot Operations
```javascript
async function f () {
  await bot.test.wait(200) // Wait for specified milliseconds
  await once(bot, 'time') // Wait for specific event
}
```

## Version Compatibility

- Test against multiple Minecraft versions
- Handle version-specific packet formats
- Consider backward compatibility
- Document version-specific behavior

## Adding a New Test

When adding a new test, follow these steps:

1. **Create a new test file** in the `test/externalTests` directory. For example, `experience.js`.
2. **Write the test logic** using async/await. Avoid using the `done` callback if possible.
3. **Handle version differences** if necessary. For example, the experience command syntax differs between Minecraft versions:
   - For versions older than 1.13, use `/xp <amount> [player]`.
   - For versions 1.13 and newer, use `/xp add <player> <amount> points` or `/xp add <player> <amount> levels`.
4. **Add event listeners** for debugging if needed, and ensure they are removed at the end of the test to prevent memory leaks.
5. **Use `bot.chat`** to issue commands directly instead of `bot.test.runCommand`.
6. **Run the test** for different Minecraft versions to ensure compatibility.

Example test structure:
```javascript
const assert = require('assert')
const { once } = require('../../lib/promise_utils')

module.exports = () => async (bot) => {
  // Test logic here
  // Example: Check bot's experience state
  console.log('[experience test] Bot username:', bot.username)
  await bot.test.becomeSurvival()
  // ... more test logic ...
  // Remove event listeners at the end
  bot.removeListener('experience', expListener)
  console.log('[experience test] All checks passed!')
}
```

## Specific Details from Recent Experience

- **Version-Specific Command Syntax**: Always check the Minecraft Wiki or existing tests for the correct command syntax for each version. For example, the experience command syntax changed in 1.13.
- **Event Listener Cleanup**: Always remove event listeners at the end of the test to prevent memory leaks. Use `bot.removeListener('eventName', listenerFunction)`.
- **Use `bot.chat`**: For issuing commands, use `bot.chat` directly instead of `bot.test.runCommand` to ensure commands are sent correctly.
- **Debugging**: Use `console.log` for debugging, but remove these statements before finalizing the test.

## Title Plugin Implementation Details

### Version-Specific Title Handling
- Title packets changed significantly between versions:
  - 1.8.8 uses a single `title` packet with an action field
  - 1.14.4+ uses separate packets for different title operations
- Use `bot.supportFeature('titleUsesLegacyPackets')` to detect version
- Handle both JSON and plain text title formats

### Title Testing Strategy
```javascript
async function f () {
  // Example of testing title functionality
  const titleTests = [
    { type: 'title', text: 'Main Title' },
    { type: 'subtitle', text: 'Subtitle Text' },
    { type: 'clear' }
  ]
  for (const test of titleTests) {
    if (test.type === 'clear') {
      bot.test.sayEverywhere('/title @a clear')
    } else {
      bot.test.sayEverywhere(`/title @a ${test.type} {"text":"${test.text}"}`)
    }
    await once(bot, 'title')
    // Verify title state
  }
}
```

### Title-Specific Best Practices
1. **Event Handling**
   - Listen for both legacy and modern title events
   - Handle title clear events separately
   - Parse JSON title text properly

2. **Version Compatibility**
   - Test title display, subtitle, and clear operations
   - Verify title timing settings work
   - Check title text parsing across versions

3. **Error Prevention**
   - Handle malformed JSON in title text
   - Provide fallbacks for unsupported operations
   - Log title-related errors for debugging

## Conclusion

When adding or modifying tests:
1. Understand the feature being tested
2. Write clear, focused tests
3. Test across multiple versions
4. Include proper error handling
5. Clean up debug code before committing
6. Document any version-specific behavior

Remember to remove any debugging `console.log` statements before finalizing the changes. 
