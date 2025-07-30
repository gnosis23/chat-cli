import { tool } from 'ai';
import { z } from 'zod';
import { writeTodos } from '../lib/todo';

export const writeTodoTool = tool({
	description: `
    Update the todo list with new tasks or status changes. This tool should be called at the beginning and end of complex tasks to track progress.
    
    Use this tool when:
    - Starting a new complex task to create the initial todo list
    - Updating task status to 'in_progress' when starting work
    - Marking tasks as 'completed' when finished
    - Adding new tasks discovered during implementation
    
    input:
    {
      // The updated todo list
      todos: {
        content: string;
        status: "pending" | "in_progress" | "completed";
        priority: "high" | "medium" | "low";
        id: string;
      }[];
    }
  `,
	parameters: z.object({
		todos: z.array(
			z.object({
				content: z.string(),
				status: z.enum(['pending', 'in_progress', 'completed']),
				priority: z.enum(['high', 'medium', 'low']),
				id: z.string(),
			})
		),
	}),
	execute: async ({ todos }) => {
		writeTodos(todos);
		return {
			newTodos: todos,
		};
	},
});

export const writeTodoToolInfo = ({ todos }, { newTodos }) => {
	const completedCount = newTodos.filter(
		(x) => x.status === 'completed'
	).length;

	const progressText =
		completedCount > 0
			? `${completedCount}/${newTodos.length} completed`
			: `${todos.length} todos`;

	const todoList = newTodos.map((x, index) => {
		let stateIcon = '';
		let textStyle = '';

		switch (x.status) {
			case 'pending':
				stateIcon = '[ ]';
				textStyle = x.content; // Regular text for pending
				break;
			case 'in_progress':
				stateIcon = '[-]';
				textStyle = `**${x.content}**`; // Bold for in progress
				break;
			case 'completed':
				stateIcon = '[x]';
				textStyle = `~~${x.content}~~`; // Strikethrough for completed
				break;
		}

		return `- ${stateIcon}: ${textStyle}`;
	});

	return {
		title: `${progressText}`,
		text: `${todoList.join('\n')}\n`,
	};
};
