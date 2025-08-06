import { fetchTool, fetchToolInfo } from './fetch-tool.js';
import {
	weatherExecute,
	weatherTool,
	weatherToolInfo,
} from './weather-tool.js';
import { bashExecute, bashTool, bashToolInfo } from './bash-tool.js';
import { readFileTool, readFileToolInfo } from './read-file-tool.js';
import {
	writeFileExecute,
	writeFileTool,
	writeFileToolInfo,
} from './write-file-tool.js';
import {
	updateFileExecute,
	updateFileTool,
	updateFileToolInfo,
} from './update-file-tool.js';
import { grepTool, grepToolInfo } from './grep-tool.js';
import { globTool, globToolInfo } from './glob-tool.js';
import { writeTodoTool, writeTodoToolInfo } from './write-todo-tool.js';
import { lsTool, lsToolInfo } from './ls-tool.js';

export const toolsObject = {
	Fetch: fetchTool,
	Weather: weatherTool,
	Bash: bashTool,
	ReadFile: readFileTool,
	WriteFile: writeFileTool,
	UpdateFile: updateFileTool,
	Grep: grepTool,
	Glob: globTool,
	WriteTodo: writeTodoTool,
	LS: lsTool,
};

export const toolsExecute = {
	Weather: weatherExecute,
	Bash: bashExecute,
	WriteFile: writeFileExecute,
	UpdateFile: updateFileExecute,
};

export const convertToolResultForUser = (toolResult) => {
	let result;
	switch (toolResult.toolName) {
		case 'Fetch':
			result = fetchToolInfo(toolResult.args, toolResult.result);
			break;
		case 'Weather':
			result = weatherToolInfo(toolResult.args, toolResult.result);
			break;
		case 'Bash':
			result = bashToolInfo(toolResult.args, toolResult.result);
			break;
		case 'ReadFile':
			result = readFileToolInfo(toolResult.args, toolResult.result);
			break;
		case 'WriteFile':
			result = writeFileToolInfo(toolResult.args, toolResult.result);
			break;
		case 'UpdateFile':
			result = updateFileToolInfo(toolResult.args, toolResult.result);
			break;
		case 'Grep':
			result = grepToolInfo(toolResult.args, toolResult.result);
			break;
		case 'Glob':
			result = globToolInfo(toolResult.args, toolResult.result);
			break;
		case 'WriteTodo':
			result = writeTodoToolInfo(toolResult.args, toolResult.result);
			break;
		case 'LS':
			result = lsToolInfo(toolResult.args, toolResult.result);
			break;
		default:
			result = {
				title: `Tool ${toolResult.toolName} executed`,
				text: JSON.stringify(toolResult.result),
			};
	}
	return result;
};
