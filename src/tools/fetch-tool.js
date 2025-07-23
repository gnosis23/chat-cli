import { URL } from 'url';
import { tool } from 'ai';
import { z } from 'zod';

async function fetchUrl(url) {
	try {
		// Validate URL
		new URL(url);

		const response = await fetch(url, {
			headers: {
				'User-Agent': 'Mozilla/5.0 (compatible; ChatCLI/1.0)',
			},
		});

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}

		const html = await response.text();

		// Remove unwanted HTML elements and clean content
		const cleaned = html
			.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
			.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
			.replace(/<svg[^>]*>[\s\S]*?<\/svg>/gi, '')
			.replace(/<noscript[^>]*>[\s\S]*?<\/noscript>/gi, '')
			.replace(/<!--[\s\S]*?-->/g, '')
			.replace(/<head[^>]*>[\s\S]*?<\/head>/gi, '')
			.replace(/<header[^>]*>[\s\S]*?<\/header>/gi, '')
			.replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, '')
			.replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, '')
			.replace(/<aside[^>]*>[\s\S]*?<\/aside>/gi, '')
			.replace(/<img[^>]*>/gi, '')
			.replace(/<[^>]*>/g, ' ')
			.replace(/\s+/g, ' ')
			.trim();

		return {
			content: cleaned,
			size: cleaned.length,
			url: url,
		};
	} catch (error) {
		if (error instanceof TypeError && error.message.includes('Invalid URL')) {
			return { url, size: 0, content: 'Invalid URL format' };
		}
		return { url, size: 0, content: 'Failed to fetch url' };
	}
}

export const fetchTool = tool({
	description: 'Fetch content from a URL and return cleaned text content',
	parameters: z.object({
		url: z.string().url().describe('The URL to fetch content from'),
	}),
	execute: async ({ url }) => {
		const result = await fetchUrl(url);
		return {
			url: result.url,
			size: result.size,
			content: result.content,
		};
	},
});

export const fetchToolInfo = ({ url }, { size }) => {
	return `Fetched ${size} characters from ${url}`;
};
