import { it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Navigation } from '@/components/pulse/marketing/Navigation';

it('opens navigation, closes with Escape, and restores focus', async () => {
  const user = userEvent.setup();
  render(<Navigation />);
  const toggle = screen.getByRole('button', { name: /Menu/ });
  await user.click(toggle);
  expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await user.tab();
  expect(screen.getByRole('link', { name: 'Product' })).toHaveFocus();
  await user.keyboard('{Escape}');
  expect(toggle).toHaveAttribute('aria-expanded', 'false');
  expect(toggle).toHaveFocus();
});

it('closes the disclosure after selecting a section', async () => {
  const user = userEvent.setup();
  render(<Navigation />);
  const toggle = screen.getByRole('button', { name: /Menu/ });
  await user.click(toggle);
  await user.click(screen.getByRole('link', { name: 'Demo' }));
  expect(toggle).toHaveAttribute('aria-expanded', 'false');
});
