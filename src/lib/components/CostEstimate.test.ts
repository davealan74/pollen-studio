import { render, screen } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import CostEstimate from './CostEstimate.svelte';
import type { CostInput } from '$pollinations/pricing';

describe('CostEstimate', () => {
  it('displays the cell count and surcharge', () => {
    const cells: CostInput[] = [
      { surface: 'image', model: 'flux', width: 1024, height: 1024, quality: 'high' },
      { surface: 'image', model: 'flux', width: 1024, height: 1024, quality: 'high' }
    ];
    render(CostEstimate, { cells });
    expect(screen.getByText(/2 cells/)).toBeInTheDocument();
    expect(screen.getByText(/2\.50/)).toBeInTheDocument();
  });
});
