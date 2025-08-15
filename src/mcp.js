import { experimental_createMCPClient } from 'ai';
import { Experimental_StdioMCPTransport } from 'ai/mcp-stdio';

export async function initMcp({ config, logMessages, quiet }) {
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
					stderr: 'ignore',
				});
				const client = await experimental_createMCPClient({
					transport,
				});
				const toolSet = await client.tools();
				if (process.env.DEBUG === '1') {
					logMessages.push('load mcp tools:', Object.keys(toolSet));
				}
				tools = { ...tools, ...toolSet };
			}
		}

		if (!quiet && Object.keys(tools).length) {
			logMessages.push(`  Loaded ${Object.keys(tools).length} Mcp.\n`);
		}

		config.tools = tools;
	} catch (err) {
		if (!quiet)
			logMessages.push('Invalid mcpServers', err.message, config.mcpServers);
	}
}
