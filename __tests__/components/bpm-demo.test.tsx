import { it, expect } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BpmDemo } from '@/components/pulse/marketing/BpmDemo';

it('updates the ratio, reports out-of-range targets honestly, and resets', async () => {
  const user = userEvent.setup();
  render(<BpmDemo />);
  expect(screen.getByRole('status')).toHaveTextContent('172.0 BPM');
  await user.click(screen.getByRole('radio', { name: '1:2 Half time' }));
  expect(screen.getByRole('status')).toHaveTextContent('86.0 BPM');
  fireEvent.change(screen.getByRole('slider'), { target: { value: '200' } });
  expect(screen.getByRole('status')).toHaveTextContent('100.0 BPM');
  await user.click(screen.getByRole('radio', { name: '2:1 Double time' }));
  expect(screen.getByRole('status')).toHaveTextContent('400.0 BPM');
  expect(screen.getByRole('status')).toHaveTextContent('outside the planned 40–240 BPM track range');
  await user.click(screen.getByRole('button', { name: /Reset demo/ }));
  expect(screen.getByRole('radio', { name: '1:1 Every step' })).toBeChecked();
  expect(screen.getByRole('slider')).toHaveValue('172');
});

it('keeps increment controls inside the valid cadence range', async () => {
  const user = userEvent.setup();
  render(<BpmDemo />);
  fireEvent.change(screen.getByRole('slider'), { target: { value: '40' } });
  expect(screen.getByRole('button', { name: 'Decrease cadence' })).toBeDisabled();
  await user.click(screen.getByRole('button', { name: 'Increase cadence' }));
  expect(screen.getByRole('slider')).toHaveValue('41');
  fireEvent.change(screen.getByRole('slider'), { target: { value: '240' } });
  expect(screen.getByRole('button', { name: 'Increase cadence' })).toBeDisabled();
  expect(screen.getByRole('slider')).toHaveAttribute('aria-valuetext', '240 steps per minute');
});
