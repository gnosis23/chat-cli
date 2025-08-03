# AI Chat CLI

A terminal-based AI chat application built with [Ink](https://github.com/vadimdemedes/ink), providing an interactive chat interface with simulated bot responses.

## Features

- **Interactive Terminal UI**: Clean, React-based interface in your terminal
- **Real-time Messaging**: Send messages and receive bot responses
- **Message History**: Persistent chat history during session
- **Loading States**: Visual feedback while processing responses
- **Advanced Text Input**: Full keyboard shortcuts and cursor navigation

## Quick Start

### Development Mode

```bash
# Install dependencies
pnpm install

# Build and watch for changes
pnpm run dev

# In another terminal, run the CLI
pnpm start
```

### Production Build

```bash
# Build the project
pnpm run build

# Run the built CLI
node dist/chat-cli.js
```

## Development Commands

| Command           | Description                      |
| ----------------- | -------------------------------- |
| `pnpm run build`  | Transpile JSX to `dist/`         |
| `pnpm run dev`    | Build with watch mode            |
| `pnpm start`      | Run built CLI                    |
| `pnpm test`       | Run prettier, linting, and tests |
| `pnpm run format` | Auto-fix formatting              |

## Project Structure

```
src/
├── app.js               # Main React component wrapper
├── chat-cli.js          # CLI entry point with Ink rendering
├── use-input.jsx        # Core chat application component
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

### Built-in Commands

Type these commands directly in the chat interface:

| Command     | Description |
| ----------- | ----------- |
| `/commands` | List all available commands |
| `/mcp`      | Show MCP (Model Context Protocol) status and available servers |
| `/tools`    | Show built-in tools         |
| `/config`   | Show configs                |

## Technical Details

- **Runtime**: Node.js >=16 (ES modules)
- **Framework**: React with Ink for CLI rendering
- **Build**: Babel with @babel/preset-react for JSX
- **Testing**: AVA with ink-testing-library
- **Styling**: Ink components with color support
- **Command Architecture**: Modern ES6+ with object destructuring for cleaner parameter handling

## Usage

### Interactive Mode

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

### CLI Mode

Use CLI mode to send a prompt directly to the AI and exit immediately after receiving the response:

```bash
# Send a prompt and exit
node dist/chat-cli.js -p "What is the capital of France?"

# Or use the long form
node dist/chat-cli.js --prompt "Explain quantum computing"

# With custom model and temperature
node dist/chat-cli.js -p "Write a haiku" --model deepseek-chat --temperature 0.9 -p "hello"
```

In CLI mode:
- No welcome message is shown
- User input is disabled
- The program exits automatically after the AI response
- Perfect for scripting and automation

## Configuration

### OpenRouter API Key

This chat CLI uses OpenRouter for AI responses. You need to set your OpenRouter API key as an environment variable:

```bash
# Set your OpenRouter API key (macOS/Linux)
export OPENROUTER_API_KEY="your-api-key-here"
```

You can obtain an API key from [OpenRouter](https://openrouter.ai/settings/keys).

The CLI supports two types of configuration files for customizing the AI assistant behavior and system prompts:

### Configuration Files

#### 1. Global Configuration (`~/.chat-cli.md`)
This file contains global instructions that apply to all projects and sessions. It's loaded from your home directory and affects the AI's behavior regardless of which directory you're in.

**Location**: `~/.chat-cli.md` (Markdown format)

**Example usage**:
```markdown
# Global AI Instructions

## Personal Preferences
- Always use TypeScript when possible
- Prefer functional programming patterns
- Use descriptive variable names

## Project Standards
- Follow conventional commits
- Use 2 spaces for indentation
- Prefer arrow functions over function declarations

## Development Environment
- Use pnpm for package management
- Run tests before committing changes
- Use VS Code as the primary editor
```

#### 2. Project Configuration (`./chat-cli.md`)
This file contains project-specific instructions that are loaded when you're in a specific project directory. It overrides or extends the global configuration.

**Location**: `./chat-cli.md` in your project root (Markdown format)

**Example usage**:
```markdown
# Project-Specific AI Instructions

## Project Overview
This is a React-based e-commerce application using Next.js and TypeScript.

## Coding Standards
- Use Tailwind CSS for styling
- Follow Next.js App Router conventions
- Use React Server Components where appropriate
- Implement proper TypeScript types

## Dependencies
- Next.js 14 with App Router
- TypeScript 5.0+
- Tailwind CSS 3.0+
- Prisma for database ORM

## Testing
- Use Jest and React Testing Library
- Write tests for all new components
- Achieve 80%+ test coverage

## API Standards
- Use RESTful conventions
- Implement proper error handling
- Use Zod for validation
```

### Configuration Loading Order
1. Global configuration (`~/.chat-cli.md`) is loaded first
2. Project configuration (`./chat-cli.md`) is loaded second and can override global settings
3. Both configurations are merged into the system prompt

### Mcp Servers

Add `mcpServers` in `~/.chat-cli.json` (JSON format for MCP server configuration):

```json
{
  "mcpServers": {
    "sequential-thinking": {
      "command": "npx",
      "args": [
        "-y",
        "@modelcontextprotocol/server-sequential-thinking"
      ]
    }
  }
}
```

## Development

### Prerequisites

- Node.js 16 or higher
- pnpm

### Setup

```bash
git clone https://github.com/gnosis23/chat-cli.git
cd chat-cli
pnpm install
pnpm run dev
```

### Testing

```bash
# Run all tests
pnpm test

# Run linter only
pnpm xo

# Run formatter
pnpm run format
```

## Supported Platforms

- MacOS
- Linux
