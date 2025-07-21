import React from 'react';
import {Box, Text} from 'ink';
import Markdown from 'ink-markdown';
import dedent from 'dedent';
import {GAP_SIZE} from '../constant.js';

const prefixes = {
	user: '>',
	bot: '⏺',
	system: '*',
};

export const HistoryMessage = ({message, index}) => {
	const text = dedent(message.text);
	return (
		<Box key={index} display="flex" marginBottom={1}>
			<Text>{prefixes[message.type]}</Text>
			<Box
				flexDirection="column"
				paddingLeft={GAP_SIZE}
				paddingRight={GAP_SIZE}
			>
				<Markdown>{text}</Markdown>
			</Box>
		</Box>
	);
};
