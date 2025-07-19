import React from 'react';
import {Box} from 'ink';
import ChatApp from './use-input.js';

export default function App({ config = {} }) {
	return (
		<Box>
			<ChatApp config={config} />
		</Box>
	);
}
