import React from 'react';
import { Box, Text } from 'ink';

const text = `
	 ######   ######  ##       ####
	##    ## ##    ## ##        ##
	##       ##       ##        ##
	##       ##       ##        ##
	##       ##       ##        ##
	##    ## ##    ## ##        ##
	 ######   ######  ######## ####
`;

export function Welcome() {
	return (
		<Box>
			<Text>{text}</Text>
		</Box>
	);
}
