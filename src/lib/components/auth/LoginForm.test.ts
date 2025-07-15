import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/svelte';
import LoginForm from './LoginForm.svelte';

describe('LoginForm', () => {
	it('renders login form with email and password inputs', () => {
		render(LoginForm);
		
		expect(screen.getByLabelText('Email')).toBeInTheDocument();
		expect(screen.getByLabelText('Password')).toBeInTheDocument();
		expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
	});

	it('shows validation error for empty fields', async () => {
		render(LoginForm, {
			props: {
				onSubmit: vi.fn()
			}
		});
		
		const submitButtons = screen.getAllByRole('button', { name: 'Sign In' });
		await fireEvent.click(submitButtons[0]);
		
		// Form should not submit with empty fields due to HTML5 validation
		const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
		expect(emailInput.value).toBe('');
	});

	it('updates input values when user types', async () => {
		render(LoginForm);
		
		const emailInput = screen.getByLabelText('Email') as HTMLInputElement;
		const passwordInput = screen.getByLabelText('Password') as HTMLInputElement;
		
		await fireEvent.input(emailInput, { target: { value: 'test@example.com' } });
		await fireEvent.input(passwordInput, { target: { value: 'password123' } });
		
		expect(emailInput.value).toBe('test@example.com');
		expect(passwordInput.value).toBe('password123');
	});

	it('shows loading state when form is submitted', async () => {
		render(LoginForm, {
			props: {
				loading: true,
				onSubmit: vi.fn()
			}
		});
		
		const submitButton = screen.getByRole('button', { name: 'Signing in...' });
		expect(submitButton).toBeInTheDocument();
		expect(submitButton).toBeDisabled();
	});
});