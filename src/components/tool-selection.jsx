import React, { useState } from 'react';
import { Box, Text } from 'ink';
import { useInput } from 'ink';

function short(params) {
	if (!params) return '';

	let ret = JSON.stringify(params, null, 2);
	if (ret.length > 128) {
		ret = ret.slice(0, 128) + '...\n';
	}

	return ret;
}

export default function ToolSelection({
	toolCall,
	onAccept,
	onAcceptAuto,
	onDecline,
}) {
	const [selectedIndex, setSelectedIndex] = useState(0);
	const params = short(toolCall.args);

	useInput((input, key) => {
		if (key.upArrow) {
			setSelectedIndex((selectedIndex + 3 - 1) % 3); // Select Accept
		}
		if (key.downArrow) {
			setSelectedIndex((selectedIndex + 1) % 3); // Select Decline
		}
		if (key.return) {
			if (selectedIndex === 0) {
				onAccept();
			} else if (selectedIndex === 1) {
				onAcceptAuto();
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
					<Box>
						<Text>{params}</Text>
					</Box>
				</Box>

				<Box flexDirection="column" marginTop={1} marginBottom={1}>
					<Box>
						<Text color={selectedIndex === 0 ? '#0098df' : 'gray'}>
							{selectedIndex === 0 ? '➤ ' : '  '}Accept
						</Text>
					</Box>

					<Box>
						<Text color={selectedIndex === 1 ? '#0098df' : 'gray'}>
							{selectedIndex === 1 ? '➤ ' : '  '}Accept + (Auto Mode)
						</Text>
					</Box>

					<Box>
						<Text color={selectedIndex === 2 ? '#0098df' : 'gray'}>
							{selectedIndex === 2 ? '➤ ' : '  '}Decline
						</Text>
					</Box>
				</Box>

				<Text dimColor>Use ↑/↓ arrows to select, Enter to confirm</Text>
			</Box>
		</Box>
	);
}
