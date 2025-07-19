# AI Chat CLI

A terminal-based AI chat application built with [Ink](https://github.com/vadimdemedes/ink), providing an interactive chat interface with simulated bot responses.

## Features

- **Interactive Terminal UI**: Clean, React-based interface in your terminal
- **Real-time Messaging**: Send messages and receive bot responses
- **Message History**: Persistent chat history during session
- **Loading States**: Visual feedback while processing responses
- **Keyboard Navigation**: Full keyboard support for seamless interaction

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
├── app.js          # Main React component wrapper
├── chat-cli.js     # CLI entry point with Ink rendering
├── use-input.jsx   # Core chat application component
├── components/     # Reusable UI components
│   └── ai-message.jsx
└── hooks/          # Custom React hooks
    └── use-ai-chat.js
```

## Technical Details

- **Runtime**: Node.js >=16 (ES modules)
- **Framework**: React with Ink for CLI rendering
- **Build**: Babel with @babel/preset-react for JSX
- **Testing**: AVA with ink-testing-library
- **Styling**: Ink components with color support

## Usage

Once running, simply type your message and press Enter to send. The AI bot will respond with simulated messages. Use Ctrl+C to exit.

## Development

### Prerequisites
- Node.js 16 or higher
- npm

### Setup
```bash
git clone <repository-url>
cd ink-app
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
