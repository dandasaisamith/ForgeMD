/** @vitest-environment jsdom */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from '../App';
import * as api from '../api';

vi.mock('../api', () => ({
  getHealth: vi.fn(),
  getDocuments: vi.fn()
}));

describe('App Component', () => {
  it('renders the Dashboard by default and shows health', async () => {
    api.getHealth.mockResolvedValue({
      status: 'ok',
      memory: {
        system: {
          usedPercent: '42.00'
        }
      }
    });

    render(<App />);
    expect(screen.getByText('ForgeMD')).toBeDefined();
    expect(screen.getByText('Convert Document')).toBeDefined();
    
    await waitFor(() => {
      expect(screen.getByText(/Server: OK/i)).toBeDefined();
      expect(screen.getByText(/System RAM Used: 42.00%/i)).toBeDefined();
    });
  });
});
