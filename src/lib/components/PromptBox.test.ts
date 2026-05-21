import { render, screen, fireEvent } from '@testing-library/svelte';
import { describe, it, expect } from 'vitest';
import PromptBox from './PromptBox.svelte';

describe('PromptBox', () => {
  it('renders placeholder', () => {
    render(PromptBox, { value: '', placeholder: 'hi there' });
    expect(screen.getByPlaceholderText('hi there')).toBeInTheDocument();
  });
  it('emits via bind:value', async () => {
    render(PromptBox, { value: '' });
    const ta = screen.getByRole('textbox') as HTMLTextAreaElement;
    await fireEvent.input(ta, { target: { value: 'hello' } });
    expect(ta.value).toBe('hello');
  });
});
