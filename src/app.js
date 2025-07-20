import React from 'react';
import {Box} from 'ink';
import ChatApp from './chat.js';

export default function App({ config = {} }) {
	return (
		<Box flexDirection="column">
			<Box flexDirection="column" gap={2} display={"flex"}>
				<ChatApp config={config} />
			</Box>
		</Box>
	);
}
