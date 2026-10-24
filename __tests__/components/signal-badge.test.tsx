import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SignalBadge } from '@/components/pulse';

describe('SignalBadge', () => {
  it('exposes its status and explanation as visible text', () => {
    render(
      <SignalBadge
        status="Simulation"
        description="No device permissions are required."
        tone="info"
      />,
    );

    expect(screen.getByRole('status')).toHaveTextContent('Simulation');
    expect(screen.getByText('No device permissions are required.')).toBeVisible();
  });
});
