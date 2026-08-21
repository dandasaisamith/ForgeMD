/** @vitest-environment jsdom */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

describe('App Component', () => {
  it('renders the Dashboard by default', () => {
    render(<App />);
    expect(screen.getByText('ForgeMD')).toBeDefined();
    expect(screen.getByText('Convert Document')).toBeDefined();
  });
});
