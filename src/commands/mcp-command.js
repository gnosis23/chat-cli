export function showMcpCommand({ config }) {
	const keys = Object.keys(config.tools);
	console.log('--------------------------------------');
	console.log('Mcp Tools:');
	keys.forEach((key) => {
		console.log(`- ${key}`);
	});
	console.log('--------------------------------------\n');
}
