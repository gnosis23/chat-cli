# AI Chat CLI

A terminal-based AI chat application built with [Ink](https://github.com/vadimdemedes/ink), providing an interactive chat interface with simulated bot responses.

## Features

- **Interactive Terminal UI**: Clean, React-based interface in your terminal
- **Real-time Messaging**: Send messages and receive bot responses
- **Message History**: Persistent chat history during session
- **Loading States**: Visual feedback while processing responses
- **Advanced Text Input**: Full keyboard shortcuts and cursor navigation
- **Multi-line Support**: Shift+Enter for new lines (when enabled)

## Quick Start

### Development Mode
```bash
# Install dependencies
npm install

# Build and watch for changes
npm run dev

# In another terminal, run the CLI
npm start
```

### Production Build
```bash
# Build the project
npm run build

# Run the built CLI
node dist/chat-cli.js
```

## Development Commands

| Command | Description |
|---------|-------------|
| `npm run build` | Transpile JSX to `dist/` |
| `npm run dev` | Build with watch mode |
| `npm start` | Run built CLI |
| `npm test` | Run prettier, linting, and tests |
| `npm run format` | Auto-fix formatting |

## Project Structure

```
src/
├── app.js               # Main React component wrapper
├── chat-cli.js          # CLI entry point with Ink rendering
├── chat.jsx             # Core chat application component
├── constant.js          # Application constants
├── components/          # Reusable UI components
│   ├── ai-message.jsx   # AI message display component
│   ├── history-message.jsx  # Message history component
│   └── text-input.jsx   # Advanced text input with keyboard shortcuts
└── hooks/               # Custom React hooks
    └── use-ai-chat.js   # AI chat state management
```

## Advanced Text Input Features

The chat interface includes a sophisticated text input component with full keyboard navigation:

### Cursor Navigation
- **Arrow Keys**: Move cursor left/right
- **Ctrl+F / Ctrl+B**: Forward/backward character (Emacs-style)
- **Ctrl+Left/Right**: Move by word boundaries

### Text Editing Shortcuts
- **Ctrl+A**: Move to beginning of line
- **Ctrl+E**: Move to end of line
- **Ctrl+U**: Clear to start of line
- **Ctrl+K**: Clear to end of line
- **Ctrl+W**: Delete previous word
- **Ctrl+D**: Delete character at cursor
- **Ctrl+H**: Backspace
- **Ctrl+L**: Clear entire line
- **Backspace/Delete**: Standard character deletion

### Multi-line Input (when enabled)
- **Shift+Enter**: Insert new line
- **Up/Down Arrow**: Navigate between lines

## Technical Details

- **Runtime**: Node.js >=16 (ES modules)
- **Framework**: React with Ink for CLI rendering
- **Build**: Babel with @babel/preset-react for JSX
- **Testing**: AVA with ink-testing-library
- **Styling**: Ink components with color support

## Usage

Once running, simply type your message and press Enter to send. The AI bot will respond with simulated messages.

**Basic Commands:**
- Type regular messages to chat with the AI
- Press **Enter** to send a message
- Use **Ctrl+C** to exit the application
- Use **Ctrl+C** during AI response to cancel

**Keyboard Shortcuts:**
- All standard text editing shortcuts work in the input field
- Arrow keys for cursor navigation
- Emacs-style keybindings (Ctrl+A, Ctrl+E, etc.)

## Development

### Prerequisites
- Node.js 16 or higher
- npm

### Setup
```bash
git clone https://github.com/gnosis23/chat-cli.git
cd chat-cli
npm install
npm run dev
```

### Testing
```bash
# Run all tests
npm test

# Run linter only
npx xo

# Run formatter
npm run format
```
