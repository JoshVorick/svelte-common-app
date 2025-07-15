import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { LogEntry } from '$lib/logger';

export const POST: RequestHandler = async ({ request, locals }) => {
	try {
		const logEntry: LogEntry = await request.json();
		
		// Validate log entry
		if (!logEntry.level || !logEntry.message) {
			return json({ error: 'Invalid log entry' }, { status: 400 });
		}
		
		// Log to server console with structured format
		const logMessage = `[CLIENT-${logEntry.level.toUpperCase()}] ${logEntry.message}`;
		const logContext = {
			timestamp: logEntry.timestamp,
			environment: logEntry.environment,
			client: logEntry.client,
			context: logEntry.context
		};
		
		switch (logEntry.level) {
			case 'error':
				console.error(logMessage, logContext);
				break;
			case 'warn':
				console.warn(logMessage, logContext);
				break;
			case 'info':
				console.info(logMessage, logContext);
				break;
			case 'debug':
				console.debug(logMessage, logContext);
				break;
			default:
				console.log(logMessage, logContext);
		}
		
		// Here you could also send to external logging services
		// await sendToExternalLoggingService(logEntry);
		
		return json({ success: true });
	} catch (error) {
		console.error('Failed to process log entry:', error);
		return json({ error: 'Failed to process log entry' }, { status: 500 });
	}
};