import { convertToolResultForUser, toolsExecute } from '../tools';

export async function execute(pendingToolCall, { config, setMessages }) {
	// Execute the tool call
	const executeFn = toolsExecute[pendingToolCall.toolName];
	if (!executeFn) {
		throw new Error(`Tool ${pendingToolCall.toolName} not found`);
	}
	const result = await executeFn(pendingToolCall.args, { config, setMessages });
	const resultUser = convertToolResultForUser({
		toolName: pendingToolCall.toolName,
		args: pendingToolCall.args,
		result,
	});

	// Add tool result to messages
	const toolResultMessage = {
		role: 'tool',
		content: [
			{
				type: 'tool-result',
				toolCallId: pendingToolCall.toolCallId,
				toolName: pendingToolCall.toolName,
				result: result,
				title: `${resultUser.title}`,
				text: resultUser.text,
			},
		],
	};

	return toolResultMessage;
}
