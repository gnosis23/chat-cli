import React, { useState } from 'react';
import { Box, Text } from 'ink';
import { useInput } from 'ink';

export default function ToolSelection({ toolCall, onAccept, onDecline }) {
	const [selectedIndex, setSelectedIndex] = useState(0);

	useInput((input, key) => {
		if (key.upArrow) {
			setSelectedIndex(0); // Select Accept
		}
		if (key.downArrow) {
			setSelectedIndex(1); // Select Decline
		}
		if (key.return) {
			if (selectedIndex === 0) {
				onAccept();
			} else {
				onDecline();
			}
		}
	});

	return (
		<Box flexDirection="column" gap={1}>
			<Box
				borderStyle="single"
				borderColor="yellow"
				padding={1}
				flexDirection="column"
			>
				<Text color="yellow" bold>
					! Tool Call Request
				</Text>

				<Box flexDirection="column" gap={1} marginLeft={2}>
					<Text>
						<Text bold>Tool:</Text> {toolCall.toolName}
					</Text>
					<Text>
						<Text bold>Arguments:</Text>
					</Text>
					<Box marginLeft={2}>
						<Text>{JSON.stringify(toolCall.args, null, 2)}</Text>
					</Box>
				</Box>

				<Box flexDirection="column" marginTop={1}>
					<Box>
						<Text color={selectedIndex === 0 ? 'gray' : 'white'}>
							{selectedIndex === 0 ? '➤ ' : '  '}Accept
						</Text>
					</Box>

					<Box>
						<Text color={selectedIndex === 1 ? 'gray' : 'white'}>
							{selectedIndex === 1 ? '➤ ' : '  '}Decline
						</Text>
					</Box>
				</Box>

				<Text dimColor marginTop={1}>
					Use ↑/↓ arrows to select, Enter to confirm
				</Text>
			</Box>
		</Box>
	);
}
