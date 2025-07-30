import { experimental_createMCPClient } from 'ai';
import { Experimental_StdioMCPTransport } from 'ai/mcp-stdio';

export async function initMcp(config) {
	try {
		let tools = {};
		const { mcpServers = {} } = config;
		const mcpServerNames = Object.keys(mcpServers);
		for (let mcp of mcpServerNames) {
			const server = mcpServers[mcp];
			if (server.command === 'node' || server.command === 'npx') {
				const transport = new Experimental_StdioMCPTransport({
					command: server.command,
					args: server.args || [],
				});
				const client = await experimental_createMCPClient({
					transport,
				});
				const toolSet = await client.tools();
				if (process.env.DEBUG === '1') {
					console.log('load mcp tools:', Object.keys(toolSet));
				}
				tools = { ...tools, ...toolSet };
			}
		}
		config.tools = tools;
	} catch (err) {
		console.log('Invalid mcpServers', err.message, config.mcpServers);
	}
}
