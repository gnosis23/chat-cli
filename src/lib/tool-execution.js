import { convertToolResultForUser, toolsExecute } from '../tools';

export async function executeTool(pendingToolCall, { config, onAddMessage }) {
	// Execute the tool call
	const executeFn = toolsExecute[pendingToolCall.toolName];
	if (!executeFn) {
		throw new Error(`Tool ${pendingToolCall.toolName} not found`);
	}
	const result = await executeFn(pendingToolCall.args, {
		config,
		onAddMessage,
	});
	const resultUser = convertToolResultForUser({
		toolName: pendingToolCall.toolName,
		args: pendingToolCall.args,
		result,
	});

	return {
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
}
