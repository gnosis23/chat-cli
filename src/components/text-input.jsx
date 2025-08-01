import React, { useState, useEffect } from 'react';
import { useInput, Text, Box } from 'ink';
import { commands } from '../commands/index.js';

const Input = ({ value, cursorPosition }) => {
	const beforeCursor = value.slice(0, cursorPosition) || null;
	const cursorChar = value.slice(cursorPosition, cursorPosition + 1) || ' ';
	const afterCursor = value.slice(cursorPosition + 1) || null;

	return (
		<Box>
			<Text>{beforeCursor}</Text>
			<Text backgroundColor="white" color="black">
				{cursorChar}
			</Text>
			<Text>{afterCursor}</Text>
		</Box>
	);
};

export default function TextInput({
	value = '',
	onChange,
	onSubmit,
	placeholder = '',
	prefix = '> ',
	isLoading,
}) {
	const [cursorPosition, setCursorPosition] = useState(0);
	const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);
	const [showCommands, setShowCommands] = useState(false);

	const commandList = Object.keys(commands);
	const filteredCommands = value.startsWith('/')
		? commandList.filter((cmd) => cmd.startsWith(value))
		: [];

	useEffect(() => {
		// Show commands when input starts with /
		const shouldShow =
			value.startsWith('/') &&
			value.length > 0 &&
			!filteredCommands.includes(value);
		setShowCommands(shouldShow);

		// Reset selection when commands change
		// if (shouldShow && filteredCommands.length > 0) {
		// 	setSelectedCommandIndex(0);
		// }
	}, [value, filteredCommands]);

	const onArrowKeyAndEnter = (input, key) => {
		if (showCommands && filteredCommands.length > 0) {
			if (key.upArrow) {
				setSelectedCommandIndex((prev) =>
					prev > 0 ? prev - 1 : filteredCommands.length - 1
				);
				return true; // Prevent default handling
			}
			if (key.downArrow) {
				setSelectedCommandIndex((prev) => (prev + 1) % filteredCommands.length);
				return true; // Prevent default handling
			}
			if (key.return && filteredCommands.length > 0) {
				// Auto-complete the selected command
				const index =
					selectedCommandIndex >= filteredCommands.length
						? 0
						: selectedCommandIndex;
				const selectedCommand = filteredCommands[index];
				onChange(selectedCommand);
				setCursorPosition(selectedCommand.length);
				setShowCommands(false);
				return true; // Prevent default handling
			}
		}
		return false; // Allow default handling
	};

	useEffect(() => {
		// Ensure cursor position stays within bounds when value changes externally
		if (cursorPosition > value.length) {
			setCursorPosition(value.length);
		}
	}, [value, cursorPosition]);

	useInput((input, key) => {
		let newValue = value;
		let newCursorPosition = cursorPosition;
		let shouldSubmit = false;

		if (onArrowKeyAndEnter && onArrowKeyAndEnter(input, key)) {
			return;
		}

		// Handle paste events by checking for longer input strings
		if (input && input.length > 1 && !key.ctrl && !key.meta) {
			// This is likely a paste operation - replace newlines with spaces
			const processedInput = input.replace(/\n/g, ' ');
			const beforeCursor = newValue.slice(0, cursorPosition);
			const afterCursor = newValue.slice(cursorPosition);
			newValue = beforeCursor + processedInput + afterCursor;
			newCursorPosition = cursorPosition + processedInput.length;
		} else if (key.return) {
			// Enter to submit
			shouldSubmit = true;
		} else if (key.backspace || key.delete) {
			if (cursorPosition > 0) {
				const beforeCursor = newValue.slice(0, cursorPosition - 1);
				const afterCursor = newValue.slice(cursorPosition);
				newValue = beforeCursor + afterCursor;
				newCursorPosition = Math.max(0, cursorPosition - 1);
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
			// Regular character input - filter out newlines and replace with spaces
			if (input === '\n') {
				return; // Ignore newline
			}
			const processedInput = input.replace(/\n/g, ' ');
			const beforeCursor = newValue.slice(0, cursorPosition);
			const afterCursor = newValue.slice(cursorPosition);
			newValue = beforeCursor + processedInput + afterCursor;
			newCursorPosition = cursorPosition + processedInput.length;
		} else {
			return;
		}

		if (shouldSubmit) {
			onSubmit && onSubmit(value);
		} else {
			setCursorPosition(newCursorPosition);
			onChange && onChange(newValue);
		}
	});

	return (
		<>
			<Box display="flex" borderStyle="single" borderColor="white">
				<Text>{prefix}</Text>
				<Input value={value} cursorPosition={cursorPosition} />
			</Box>
			{/* Command suggestions */}
			{showCommands && filteredCommands.length > 0 && (
				<Box flexDirection="column">
					{filteredCommands.map((cmd, index) => (
						<Box key={cmd} paddingLeft={2}>
							<Text
								color={index === selectedCommandIndex ? 'white' : 'gray'}
								backgroundColor={
									index === selectedCommandIndex ? 'blue' : undefined
								}
							>
								{cmd} - {commands[cmd].description}
							</Text>
						</Box>
					))}
				</Box>
			)}

			{/* Help text - hidden when commands are shown */}
			{!showCommands && (
				<Box marginBottom={1}>
					<Text color="white" dimColor>
						{isLoading
							? 'Press Ctrl+C to cancel'
							: 'Press Enter to send | Press Ctrl+C to exit | "/" to list commands'}
					</Text>
				</Box>
			)}
		</>
	);
}
