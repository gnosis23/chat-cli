import { fetchTool, fetchToolInfo } from './fetch-tool.js';
import { weatherTool, weatherToolInfo } from './weather-tool.js';

export const toolsObject = {
	fetch: fetchTool,
	weather: weatherTool,
};

export const getToolInfoText = (toolResult) => {
	let text = null;
	switch (toolResult.toolName) {
		case 'fetch':
			text = fetchToolInfo(toolResult.args, toolResult.result);
			break;
		case 'weather':
			text = weatherToolInfo(toolResult.args, toolResult.result);
			break;
		default:
			text = `Tool ${toolResult.toolName} executed with result: ${JSON.stringify(toolResult.result)}`;
	}
	return text;
};
