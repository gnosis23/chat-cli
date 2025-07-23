import { fetchTool, fetchToolInfo } from './fetch-tool.js';
import { weatherTool, weatherToolInfo } from './weather-tool.js';

export const toolsObject = {
	fetch: fetchTool,
	weather: weatherTool,
};

export const getToolResult = (toolResult) => {
	let result;
	switch (toolResult.toolName) {
		case 'fetch':
			result = fetchToolInfo(toolResult.args, toolResult.result);
			break;
		case 'weather':
			result = weatherToolInfo(toolResult.args, toolResult.result);
			break;
		default:
			result = {
				title: `Tool ${toolResult.toolName} executed`,
				text: JSON.stringify(toolResult.result),
			};
	}
	return result;
};
