import { describe, it, expect } from 'vitest';
import { cn } from './utils';

describe('cn utility function', () => {
	it('merges class names correctly', () => {
		const result = cn('px-4', 'py-2', 'bg-blue-500');
		expect(result).toBe('px-4 py-2 bg-blue-500');
	});

	it('handles conditional classes', () => {
		const isActive = true;
		const result = cn('base-class', isActive && 'active-class');
		expect(result).toBe('base-class active-class');
	});

	it('handles conflicting Tailwind classes', () => {
		const result = cn('px-4', 'px-8');
		expect(result).toBe('px-8');
	});

	it('handles empty and undefined values', () => {
		const result = cn('px-4', undefined, '', 'py-2');
		expect(result).toBe('px-4 py-2');
	});

	it('handles array of classes', () => {
		const result = cn(['px-4', 'py-2'], 'bg-blue-500');
		expect(result).toBe('px-4 py-2 bg-blue-500');
	});
});