import { tool } from 'ai';
import { z } from 'zod';

export const weatherTool = tool({
	description: 'Get the weather of a city',
	parameters: z.object({
		city: z.string().describe('The city name to get the weather for'),
	}),
	execute: async ({ city }) => ({
		city,
		temperature: 33,
	}),
});

export const weatherToolInfo = ({ city }, { temperature }) => {
	return `The current temperature in ${city} is ${temperature}°C.`;
};
