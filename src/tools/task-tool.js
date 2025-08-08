import { tool } from 'ai';
import { z } from 'zod';
import { generateTextAuto } from '../lib/chat.js';
import { getSystemPrompt } from '../lib/prompt.js';
import { lastAssistantContent } from '../lib/message-util.js';

const taskDescription = `
Launch a new agent that has access to the following tools: Bash, Glob, Grep, LS, ReadFile, UpdateFile, WriteFile, Fetch, TodoWrite. 
When you are searching for a keyword or file and are not confident that you will find the right match in the first few tries, use the Agent tool to perform the search for you.

When to use the Agent tool:
- If you are searching for a keyword like "config" or "logger", or for questions like "which file does X?", the Agent tool is strongly recommended

When NOT to use the Agent tool:
- If you want to read a specific file path, use the Read or Glob tool instead of the Agent tool, to find the match more quickly
- If you are searching for a specific class definition like "class Foo", use the Glob tool instead, to find the match more quickly
- If you are searching for code within a specific file or set of 2-3 files, use the Read tool instead of the Agent tool, to find the match more quickly
- Writing code and running bash commands (use other tools for that)

Note:
- When the agent is done, it will return a single message back to you. The result returned by the agent is not visible to the user. To show the user the result, you should send a text message back to the user with a concise summary of the result.
- The agent's outputs should generally be trusted
- Clearly tell the agent whether you expect it to write code or just to do research (search, file reads, web fetches, etc.), since it is not aware of the user's intent
`;

export const taskTool = tool({
	description: taskDescription,
	parameters: z.object({
		prompt: z.string().describe('The task for the agent to perform'),
	}),
});

export const taskExecute = async ({ prompt }, { config, onAddMessage }) => {
	try {
		onAddMessage({
			role: 'gui',
			content: [{ type: 'info', text: `task(${prompt}) created` }],
		});

		const messagesRef = {
			current: [
				{ role: 'system', content: getSystemPrompt({ custom: true }) },
				{ role: 'user', content: prompt },
			],
		};

		const resultMessages = await generateTextAuto({
			isTask: true,
			config,
			messagesRef,
			onAddMessage: (x) => {
				// if (process.env.DEBUG === '1') {
				// 	console.log('---- onChangeMessage ----');
				// 	console.log(JSON.stringify(lastAssistantContent(x), null, 2));
				// 	console.log('\n');
				// }
				messagesRef.current.push(x);
			},
			onChunk: null,
			onSelect: () => null,
		});

		// console.log(
		// 	'==== result ====',
		// 	JSON.stringify(resultMessages, null, 2),
		// 	'----------------'
		// );

		return { text: lastAssistantContent(resultMessages) };
	} catch (error) {
		// console.log('error', error);
		return { error: `Failed to run task: ${error.message}` };
	}
};

export const taskToolInfo = ({ prompt }, { text, error }) => {
	return {
		title: prompt,
		text: error
			? `${error}`
			: typeof text === 'string'
				? text
				: JSON.stringify(text),
	};
};
