import { render, screen } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import CopyAs from './CopyAs.svelte';

describe('CopyAs', () => {
  it('renders a curl snippet by default', () => {
    render(CopyAs, { request: { url: 'https://example/x', method: 'GET' } });
    expect(screen.getByText(/curl -X GET/)).toBeInTheDocument();
  });
});
