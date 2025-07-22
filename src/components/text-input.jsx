import React, {useState, useEffect} from 'react';
import {useInput, Text, Box} from 'ink';

export default function TextInput({
	value = '',
	onChange,
	onSubmit,
	placeholder = '',
	multiline = false,
	maxLines = 10,
	prefix = '> ',
}) {
	const [cursorPosition, setCursorPosition] = useState(0);
	const [lines, setLines] = useState(['']);

	const renderInput = () => {
		if (multiline) {
			const displayLines = lines.length > 0 ? lines : [''];
			const cursorLineIndex = getCursorLineIndex();
			const cursorLinePosition = getCursorLinePosition();
			
			return displayLines.map((line, index) => {
				const isCursorLine = index === cursorLineIndex;
				
				if (isCursorLine) {
					const beforeCursor = line.slice(0, cursorLinePosition);
					const cursorChar = line.slice(cursorLinePosition, cursorLinePosition + 1) || ' ';
					const afterCursor = line.slice(cursorLinePosition + 1);
					
					return (
						<Text key={index}>
							{beforeCursor}
							<Text backgroundColor="white" color="black">
								{cursorChar}
							</Text>
							{afterCursor}
						</Text>
					);
				}
				
				return <Text key={index}>{line || ' '}</Text>;
			});
		} else {
			const beforeCursor = value.slice(0, cursorPosition);
			const cursorChar = value.slice(cursorPosition, cursorPosition + 1) || ' ';
			const afterCursor = value.slice(cursorPosition + 1);
			
			return (
				<Text>
					{prefix}
					{beforeCursor}
					<Text backgroundColor="white" color="black">
						{cursorChar}
					</Text>
					{afterCursor}
				</Text>
			);
		}
	};

	const getCursorLineIndex = () => {
		const currentValue = multiline ? lines.join('\n') : value;
		const linesArray = currentValue.split('\n');
		let charCount = 0;

		for (let i = 0; i < linesArray.length; i++) {
			if (cursorPosition <= charCount + linesArray[i].length) {
				return i;
			}
			charCount += linesArray[i].length + 1; // +1 for newline
		}

		return linesArray.length - 1;
	};

	const getCursorLinePosition = () => {
		const currentValue = multiline ? lines.join('\n') : value;
		const linesArray = currentValue.split('\n');
		let charCount = 0;

		for (let i = 0; i < linesArray.length; i++) {
			if (cursorPosition <= charCount + linesArray[i].length) {
				return cursorPosition - charCount;
			}
			charCount += linesArray[i].length + 1; // +1 for newline
		}

		return linesArray[linesArray.length - 1]?.length || 0;
	};

	useEffect(() => {
		if (multiline) {
			setLines(value.split('\n').length > 0 ? value.split('\n') : ['']);
		}
		// Don't reset cursor position here - let operations handle it
	}, [value, multiline]);

	useInput((input, key) => {
		let newValue = multiline ? lines.join('\n') : value;
		let newCursorPosition = cursorPosition;
		let shouldSubmit = false;

		if (key.return) {
			if (multiline && key.shift) {
				// Shift+Enter for new line in multiline mode
				const beforeCursor = newValue.slice(0, cursorPosition);
				const afterCursor = newValue.slice(cursorPosition);
				newValue = beforeCursor + '\n' + afterCursor;
				newCursorPosition = cursorPosition + 1;
			} else {
				// Enter to submit
				shouldSubmit = true;
			}
		} else if (key.backspace || key.delete) {
			if (cursorPosition > 0) {
				const beforeCursor = newValue.slice(0, cursorPosition - 1);
				const afterCursor = newValue.slice(cursorPosition);
				newValue = beforeCursor + afterCursor;
				newCursorPosition = cursorPosition - 1;
			}
		} else if (key.leftArrow) {
			if (key.ctrl || key.meta) {
				// Ctrl+Left: move to start of previous word
				const beforeCursor = newValue.slice(0, cursorPosition);
				const match = beforeCursor.match(/\b\w+\W*$/);
				if (match) {
					newCursorPosition = cursorPosition - match[0].length;
				} else {
					newCursorPosition = 0;
				}
			} else {
				// Left arrow: move cursor left
				newCursorPosition = Math.max(0, cursorPosition - 1);
			}
		} else if (key.rightArrow) {
			if (key.ctrl || key.meta) {
				// Ctrl+Right: move to start of next word
				const afterCursor = newValue.slice(cursorPosition);
				const match = afterCursor.match(/^\W*\b\w+/);
				if (match) {
					newCursorPosition = cursorPosition + match[0].length;
				} else {
					newCursorPosition = newValue.length;
				}
			} else {
				// Right arrow: move cursor right
				newCursorPosition = Math.min(newValue.length, cursorPosition + 1);
			}
		} else if (key.upArrow && multiline) {
			// Up arrow: move cursor up in multiline mode
			const currentLines = newValue.split('\n');
			let charCount = 0;
			let targetLine = -1;
			let targetLineStart = 0;

			for (let i = 0; i < currentLines.length; i++) {
				const lineLength = currentLines[i].length + 1; // +1 for newline
				if (
					cursorPosition >= charCount &&
					cursorPosition <= charCount + currentLines[i].length
				) {
					targetLine = Math.max(0, i - 1);
					targetLineStart = currentLines
						.slice(0, targetLine)
						.reduce((sum, line) => sum + line.length + 1, 0);
					break;
				}
				charCount += lineLength;
			}

			if (targetLine >= 0) {
				const linePos =
					cursorPosition - (charCount - currentLines[targetLine].length - 1);
				newCursorPosition =
					targetLineStart + Math.min(linePos, currentLines[targetLine].length);
			}
		} else if (key.downArrow && multiline) {
			// Down arrow: move cursor down in multiline mode
			const currentLines = newValue.split('\n');
			let charCount = 0;
			let targetLine = -1;
			let targetLineStart = 0;

			for (let i = 0; i < currentLines.length; i++) {
				const lineLength = currentLines[i].length + 1; // +1 for newline
				if (
					cursorPosition >= charCount &&
					cursorPosition <= charCount + currentLines[i].length
				) {
					targetLine = Math.min(currentLines.length - 1, i + 1);
					targetLineStart = currentLines
						.slice(0, targetLine)
						.reduce((sum, line) => sum + line.length + 1, 0);
					break;
				}
				charCount += lineLength;
			}

			if (targetLine >= 0 && targetLine < currentLines.length) {
				const linePos =
					cursorPosition -
					(charCount - currentLines[targetLine - 1].length - 1);
				newCursorPosition =
					targetLineStart + Math.min(linePos, currentLines[targetLine].length);
			}
		} else if (key.ctrl || key.meta) {
			// Ctrl shortcuts
			switch (input.toLowerCase()) {
				case 'a':
					// Ctrl+A: move cursor to start
					newCursorPosition = 0;
					break;
				case 'e':
					// Ctrl+E: move cursor to end
					newCursorPosition = newValue.length;
					break;
				case 'u':
					// Ctrl+U: clear to start
					newValue = newValue.slice(cursorPosition);
					newCursorPosition = 0;
					break;
				case 'k':
					// Ctrl+K: clear to end
					newValue = newValue.slice(0, cursorPosition);
					break;
				case 'w':
					// Ctrl+W: delete previous word
					const beforeCursor = newValue.slice(0, cursorPosition);
					const match = beforeCursor.match(/(\s*\S*)$/);
					if (match) {
						newValue =
							newValue.slice(0, cursorPosition - match[1].length) +
							newValue.slice(cursorPosition);
						newCursorPosition = cursorPosition - match[1].length;
					}
					break;
				case 'h':
					// Ctrl+H: backspace (same as backspace)
					if (cursorPosition > 0) {
						newValue =
							newValue.slice(0, cursorPosition - 1) +
							newValue.slice(cursorPosition);
						newCursorPosition = cursorPosition - 1;
					}
					break;
				case 'd':
					// Ctrl+D: delete character at cursor (same as delete)
					if (cursorPosition < newValue.length) {
						newValue =
							newValue.slice(0, cursorPosition) +
							newValue.slice(cursorPosition + 1);
					}
					break;
				case 'l':
					// Ctrl+L: clear line
					newValue = '';
					newCursorPosition = 0;
					break;
				case 'f':
					// Ctrl+F: forward character (same as right arrow)
					newCursorPosition = Math.min(newValue.length, cursorPosition + 1);
					break;
				case 'b':
					// Ctrl+B: backward character (same as left arrow)
					newCursorPosition = Math.max(0, cursorPosition - 1);
					break;
				default:
					return;
			}
		} else if (input && !key.ctrl && !key.meta) {
			// Regular character input
			const beforeCursor = newValue.slice(0, cursorPosition);
			const afterCursor = newValue.slice(cursorPosition);
			newValue = beforeCursor + input + afterCursor;
			newCursorPosition = cursorPosition + 1;
		} else {
			return;
		}

		if (shouldSubmit) {
			onSubmit && onSubmit(multiline ? lines.join('\n') : value);
		} else {
			setCursorPosition(newCursorPosition);
			if (multiline) {
				setLines(newValue.split('\n'));
			}
			onChange && onChange(newValue);
		}
	});

	return (
		<Box
			flexDirection={multiline ? 'column' : 'row'}
			borderStyle="single"
			borderColor="white"
			maxHeight={multiline ? maxLines + 2 : 3}
		>
			{renderInput()}
		</Box>
	);
}
