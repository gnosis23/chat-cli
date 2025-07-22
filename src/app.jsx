import React from 'react';
import {Box} from 'ink';
import {GAP_SIZE} from './constant.js';
import ChatApp from './chat.jsx';

export default function App({config = {}}) {
	return (
		<Box flexDirection="column">
			<Box flexDirection="column" gap={GAP_SIZE} display={'flex'}>
				<ChatApp config={config} />
			</Box>
		</Box>
	);
}
