# Text Input

Architecture Overview

CustomInput
├── State Management
│   ├── lines: string[]             # Array of text lines
│   ├── cursorPos: {row, col}       # Current cursor position
│   ├── viewport: {startRow, endRow}# Visible lines
│   └── wrapWidth: number           # Terminal width for auto-wrapping
├── Core Methods
│   ├── handleKeyPress(key)         # Process key events
│   ├── moveCursor(direction)       # Cursor navigation
│   ├── insertText(text)            # Text insertion
│   ├── deleteText(direction)       # Text deletion
│   └── getBuffer()                 # Access internal state
└── Rendering
├── renderLines()               # Display text with cursor
├── renderCursor()              # Visual cursor indicator
└── renderViewport()            # Handle scrolling

1. State Structure

```
const [buffer, setBuffer] = useState({
	lines: [""],                    // Array of text lines
	cursor: { row: 0, col: 0 },     // Current cursor position
	scrollOffset: 0                 // Viewport scroll position
});
```

2. Cursor Movement System

- Horizontal: Move between characters within a line
- Vertical: Move between lines, handle line length differences
- Edge Cases: Start/end of lines, empty lines, line wrapping

3. Multi-line Text Handling

- Auto-wrapping: Split long text at terminal width
- Line breaking: Insert new lines at cursor position
- Line merging: Handle backspace at line start

4. Buffer Access API

// Read operations
getLine(row)          // Get specific line
getCursorLine()       // Get line at cursor
getSelection(start, end) // Get text range

// Write operations
setLine(row, text)    // Replace entire line
insertAt(row, col, text) // Insert at position
deleteRange(start, end) // Delete text range

5. Key Binding Design

| Key        | Action                       |
|------------|------------------------------|
| Arrow keys | Cursor movement              |
| Enter      | New line / split line        |
| Backspace  | Delete character/merge lines |
| Home/End   | Jump to line start/end       |
| Ctrl+Arrow | Word-level navigation        |
