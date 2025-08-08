import { fetchExecute, fetchTool, fetchToolInfo } from './fetch-tool.js';
import {
	weatherExecute,
	weatherTool,
	weatherToolInfo,
} from './weather-tool.js';
import { bashExecute, bashTool, bashToolInfo } from './bash-tool.js';
import {
	readFileExecute,
	readFileTool,
	readFileToolInfo,
} from './read-file-tool.js';
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
import { grepExecute, grepTool, grepToolInfo } from './grep-tool.js';
import { globExecute, globTool, globToolInfo } from './glob-tool.js';
import {
	writeTodoExecute,
	writeTodoTool,
	writeTodoToolInfo,
} from './write-todo-tool.js';
import { lsExecute, lsTool, lsToolInfo } from './ls-tool.js';
import { taskExecute, taskTool, taskToolInfo } from './task-tool.js';

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
	Task: taskTool,
};

export const toolsExecute = {
	Fetch: fetchExecute,
	Weather: weatherExecute,
	Bash: bashExecute,
	ReadFile: readFileExecute,
	WriteFile: writeFileExecute,
	UpdateFile: updateFileExecute,
	Grep: grepExecute,
	Glob: globExecute,
	WriteTodo: writeTodoExecute,
	LS: lsExecute,
	Task: taskExecute,
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
		case 'Task':
			result = taskToolInfo(toolResult.args, toolResult.result);
			break;
		default:
			result = {
				title: `Tool ${toolResult.toolName} executed`,
				text: JSON.stringify(toolResult.result),
			};
	}
	return result;
};
