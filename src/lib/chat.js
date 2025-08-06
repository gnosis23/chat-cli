import { streamText, APICallError, InvalidToolArgumentsError } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { toolsObject, convertToolResultForUser } from '../tools';

const convertToAISdkMessages = (messages) => {
	const list = messages
		.filter((x) => x.role != 'gui')
		.map((message) => {
			if (message.role === 'tool') {
				// remove title in content
				return {
					role: 'tool',
					content: message.content.map((x) => ({
						type: 'tool-result',
						toolCallId: x.toolCallId,
						toolName: x.toolName,
						args: x.args,
						result: x.result,
					})),
				};
			}
			return message;
		});

	if (process.env.DEBUG === '1') {
		console.log('messages:');
		console.log(JSON.stringify(list, null, 2));
	}

	return list;
};

export async function generateTextAuto({
	config,
	messages,
	onChangeMessage,
	onChunk,
	onSelect,
}) {
	const currentMessages = [...messages];

	const model =
		config.model ||
		process.env.CHATCLI_MODEL ||
		'deepseek/deepseek-chat-v3-0324';

	const openai = createOpenAI({
		baseURL: 'https://openrouter.ai/api/v1',
		apiKey: config.apiKey || process.env.OPENROUTER_API_KEY,
		// custom settings, e.g.
		headers: {
			'X-Title': 'chat-cli',
		},
	});

	// main loop
	let maxStep = config.maxStep || 100;
	while (maxStep) {
		maxStep -= 1;

		const streamResult = streamText({
			model: openai.chat(model),
			messages: convertToAISdkMessages(currentMessages),
			temperature: config.temperature || 0.7,
			tools: { ...config.tools, ...toolsObject },
			onStepFinish({ text, toolCalls, toolResults }) {
				if (text) {
					currentMessages.push({ role: 'assistant', content: text });
				}

				if (toolCalls.length) {
					currentMessages.push({
						role: 'assistant',
						content: toolCalls.map((toolCall) => ({
							type: 'tool-call',
							toolCallId: toolCall.toolCallId,
							toolName: toolCall.toolName,
							args: toolCall.args || {},
						})),
					});
				}

				if (toolResults.length) {
					currentMessages.push({
						role: 'tool',
						content: toolResults.map((toolResult) => {
							const resultForUser = convertToolResultForUser(toolResult);
							return {
								type: 'tool-result',
								toolCallId: toolResult.toolCallId,
								toolName: toolResult.toolName,
								result: toolResult.result,
								// custom field
								title: resultForUser.title,
								text: resultForUser.text,
							};
						}),
					});
				}

				if (process.env.DEBUG === '1') {
					console.log('---------------------------------------------------');
					console.log('onStepFinish:');
					console.log('text:', text);
					console.log('toolCalls:', toolCalls);
					console.log('toolResults:', toolResults);
					console.log('---------------------------------------------------');
				}

				onChangeMessage?.([...currentMessages]);
			},
			onError(e) {
				const error = e?.error || e;
				let errorMessage;
				if (APICallError.isInstance(error)) {
					errorMessage = `Unauthorized request. ${error.message} or set your $OPENROUTER_API_KEY.`;
				} else if (InvalidToolArgumentsError.isInstance(error)) {
					errorMessage = `call ${error.toolName} failed: ${error.message}`;
				} else {
					console.error('Error in AI chat:', error);
					errorMessage = 'Unknown error';
				}

				currentMessages.push({
					role: 'assistant',
					content: errorMessage,
				});
				onChangeMessage?.([...currentMessages]);
			},
		});

		let fullMessage = '';
		for await (const textPart of streamResult.textStream) {
			fullMessage += textPart;
			// Estimate tokens: roughly 4 characters per token
			const estimatedTokens = Math.ceil(fullMessage.length / 4);
			onChunk?.(textPart, fullMessage, estimatedTokens);
		}

		const finishReason = await streamResult.finishReason;
		const usage = await streamResult.usage;

		const lastMessage = currentMessages[currentMessages.length - 1];
		const { role: lastType, content: lastContent } = lastMessage;
		if (
			lastType === 'assistant' &&
			Array.isArray(lastContent) &&
			lastContent[0].type === 'tool-call'
		) {
			if (
				['Weather', 'Bash', 'WriteFile', 'UpdateFile'].includes(
					lastContent[0].toolName
				)
			) {
				// wait for user select
				onSelect(lastContent[0]);
				break;
			}
		}

		if (process.env.DEBUG === '1') {
			currentMessages.push({
				role: 'gui',
				content: [
					{ type: 'finishReason', text: finishReason },
					{ type: 'usage', usage },
				],
			});
			onChangeMessage?.([...currentMessages]);
		}

		// Can be one of the following:
		// - `stop`: model generated stop sequence
		// - `length`: model generated maximum number of tokens
		// - `content-filter`: content filter violation stopped the model
		// - `tool-calls`: model triggered tool calls
		// - `error`: model stopped because of an error
		// - `other`: model stopped for other reasons
		if (finishReason !== 'tool-calls') {
			break;
		}
	}

	if (maxStep === 0) {
		currentMessages.push({
			role: 'gui',
			content: [{ type: 'maxStep', text: 'reach max step, continue?' }],
		});
		onChangeMessage?.([...currentMessages]);
	}

	return currentMessages;
}
