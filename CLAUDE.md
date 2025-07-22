# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a CLI chat application built with [Ink](https://github.com/vadimdemedes/ink), a React-based framework for building command-line interfaces. The app provides an interactive chat interface in the terminal with message history, input handling, and simulated bot responses.

## Architecture

```
src/
├── app.js          # Main React component wrapper
├── chat-cli.js     # CLI entry point with Ink rendering
└── use-input.jsx   # Core chat application component
```

### Key Components

- **ChatApp (use-input.jsx)**: Main chat interface with message state, input handling, and rendering
- **App (app.js)**: Simple wrapper component
- **chat-cli.js**: CLI bootstrap using meow for argument parsing and Ink for rendering

### State Management

The chat app uses React hooks for state:

- `messages`: Array of chat messages with types (system/user/bot)
- `currentInput`: Current text input
- `loading`: Loading state for bot responses
- `useInput`: Ink hook for keyboard input handling

## Development Commands

### Build & Run

```bash
npm run build          # Transpile JSX to dist/
npm run dev           # Build with watch mode
npm start            # Run built CLI
```

### Testing & Linting

```bash
npm test             # Run prettier, xo linting, and ava tests
npm run format       # Auto-fix prettier formatting
```

### Manual Testing

```bash
node dist/chat-cli.js  # Run built CLI directly
```

## Testing Framework

- **AVA**: Test runner with JSX support via import-jsx
- **ink-testing-library**: For testing Ink component rendering
- **Current tests**: Basic greeting tests in test.js (may need updates for chat functionality)

## Technical Details

- **Runtime**: Node.js >=16 (ES modules)
- **Build**: Babel with @babel/preset-react for JSX
- **Styling**: Ink components with color support
- **Linting**: XO with React plugin
- **Formatting**: Prettier with @vdemedes/prettier-config

## File Structure Notes

- Source files in `src/` are ES modules with JSX
- Built files output to `dist/` (ignored in git)
- `chat-cli.js` is the executable entry point after build
