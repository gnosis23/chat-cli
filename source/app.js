import React from 'react';
import { Box } from 'ink';
import Robot from './use-input.js';

export default function App({ name = 'Stranger' }) {
	return (
		<Box>
			<Robot />
		</Box>
	);
}
