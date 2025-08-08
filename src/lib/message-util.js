export function lastAssistantContent(messages) {
	const msgs = messages.filter((x) => x.role === 'assistant');
	return msgs[msgs.length - 1].content;
}
