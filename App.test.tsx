import { render, screen } from '@testing-library/react';
import { test, expect } from 'vitest';
import App from './App';

test('renders landing page by default', async () => {
  render(<App />);
  const linkElement = await screen.findByText(/10x Faster with AI/i);
  expect(linkElement).toBeInTheDocument();
});