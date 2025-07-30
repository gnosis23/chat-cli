import { fetchTool, fetchToolInfo } from './fetch-tool.js';
import { weatherTool, weatherToolInfo } from './weather-tool.js';
import { bashTool, bashToolInfo } from './bash-tool.js';
import { readFileTool, readFileToolInfo } from './read-file-tool.js';
import { writeFileTool, writeFileToolInfo } from './write-file-tool.js';
import { updateFileTool, updateFileToolInfo } from './update-file-tool.js';
import { grepTool, grepToolInfo } from './grep-tool.js';
import { globTool, globToolInfo } from './glob-tool.js';
import { writeTodoTool, writeTodoToolInfo } from './write-todo-tool.js';

export const toolsObject = {
	fetch: fetchTool,
	weather: weatherTool,
	bash: bashTool,
	readFile: readFileTool,
	writeFile: writeFileTool,
	updateFile: updateFileTool,
	grep: grepTool,
	glob: globTool,
	writeTodo: writeTodoTool,
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
		case 'bash':
			result = bashToolInfo(toolResult.args, toolResult.result);
			break;
		case 'readFile':
			result = readFileToolInfo(toolResult.args, toolResult.result);
			break;
		case 'writeFile':
			result = writeFileToolInfo(toolResult.args, toolResult.result);
			break;
		case 'updateFile':
			result = updateFileToolInfo(toolResult.args, toolResult.result);
			break;
		case 'grep':
			result = grepToolInfo(toolResult.args, toolResult.result);
			break;
		case 'glob':
			result = globToolInfo(toolResult.args, toolResult.result);
			break;
		case 'writeTodo':
			result = writeTodoToolInfo(toolResult.args, toolResult.result);
			break;
		default:
			result = {
				title: `Tool ${toolResult.toolName} executed`,
				text: JSON.stringify(toolResult.result),
			};
	}
	return result;
};
