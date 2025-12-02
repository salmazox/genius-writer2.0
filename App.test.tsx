import { render, screen } from '@testing-library/react';
import { test, expect } from 'vitest';
import App from './App';

test('renders landing page by default', async () => {
  render(<App />);
  const linkElement = await screen.findByText(/5 Tools/i);
  expect(linkElement).toBeInTheDocument();
});