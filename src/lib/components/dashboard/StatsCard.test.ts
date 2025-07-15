import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/svelte';
import StatsCard from './StatsCard.svelte';

describe('StatsCard', () => {
	it('renders stats card with title and value', () => {
		render(StatsCard, {
			props: {
				title: 'Total Users',
				value: '1,234',
				change: '+20.1% from last month'
			}
		});
		
		expect(screen.getByText('Total Users')).toBeInTheDocument();
		expect(screen.getByText('1,234')).toBeInTheDocument();
		expect(screen.getByText('+20.1% from last month')).toBeInTheDocument();
	});

	it('renders without change text when not provided', () => {
		render(StatsCard, {
			props: {
				title: 'Revenue',
				value: '$12,345'
			}
		});
		
		expect(screen.getByText('Revenue')).toBeInTheDocument();
		expect(screen.getByText('$12,345')).toBeInTheDocument();
	});

	it('applies correct CSS classes', () => {
		render(StatsCard, {
			props: {
				title: 'Active Sessions',
				value: '567',
				change: '+8.2% from last month'
			}
		});
		
		const titleElement = screen.getByText('Active Sessions');
		const valueElement = screen.getByText('567');
		
		expect(titleElement).toHaveClass('text-sm', 'font-medium', 'text-gray-500');
		expect(valueElement).toHaveClass('text-2xl', 'font-bold');
	});
});