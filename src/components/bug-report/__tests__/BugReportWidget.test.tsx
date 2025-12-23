import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BugReportWidget } from '../BugReportWidget';

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

import { toast } from 'sonner';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('BugReportWidget', () => {
  const mockApiUrl = 'http://localhost:3001';

  beforeEach(() => {
    jest.clearAllMocks();
    // Default successful init response
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ appId: 'test-app-id' }),
    });
  });

  describe('Initialization', () => {
    it('should render the floating bug button', async () => {
      render(<BugReportWidget apiUrl={mockApiUrl} />);

      await waitFor(() => {
        const button = screen.getByRole('button');
        expect(button).toBeInTheDocument();
      });
    });

    it('should initialize DLA app on mount', async () => {
      render(<BugReportWidget apiUrl={mockApiUrl} />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          `${mockApiUrl}/api/bug/init/dla`,
          expect.objectContaining({
            credentials: 'include',
          })
        );
      });
    });

    it('should handle missing API URL gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      render(<BugReportWidget apiUrl="" />);

      await waitFor(() => {
        expect(mockFetch).not.toHaveBeenCalled();
      });

      consoleSpy.mockRestore();
    });

    it('should handle init API failure gracefully', async () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });

      render(<BugReportWidget apiUrl={mockApiUrl} />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      // Should not crash
      expect(screen.getByRole('button')).toBeInTheDocument();

      consoleSpy.mockRestore();
    });
  });

  describe('Dialog Interaction', () => {
    it('should open dialog when button is clicked', async () => {
      render(<BugReportWidget apiUrl={mockApiUrl} />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      const button = screen.getByRole('button');
      fireEvent.click(button);

      await waitFor(() => {
        expect(screen.getByText('Report a Bug')).toBeInTheDocument();
      });
    });

    it('should show form fields in dialog', async () => {
      render(<BugReportWidget apiUrl={mockApiUrl} />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByLabelText(/Module\/Feature/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
      });
    });
  });

  describe('Form Validation', () => {
    it('should show error when submitting without required fields', async () => {
      render(<BugReportWidget apiUrl={mockApiUrl} />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText('Report a Bug')).toBeInTheDocument();
      });

      // Click submit without filling fields
      const submitButton = screen.getByRole('button', { name: /Submit Report/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Please fill in all required fields');
      });
    });

    it('should show error when app is not configured', async () => {
      // Make init fail so appId is null
      mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });

      render(<BugReportWidget apiUrl={mockApiUrl} />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText('Report a Bug')).toBeInTheDocument();
      });

      // Fill required fields
      const moduleInput = screen.getByLabelText(/Module\/Feature/i);
      const titleInput = screen.getByLabelText(/Title/i);
      const descriptionInput = screen.getByLabelText(/Description/i);

      await userEvent.type(moduleInput, 'Dashboard');
      await userEvent.type(titleInput, 'Test Bug');
      await userEvent.type(descriptionInput, 'Test description');

      // Try to submit
      const submitButton = screen.getByRole('button', { name: /Submit Report/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('App not configured');
      });
    });
  });

  describe('Form Submission', () => {
    it('should submit bug report with form data', async () => {
      // First call is init, subsequent calls are for submit
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ appId: 'test-app-id' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ id: 'report-1', reportNumber: 'DLA-BUG-0001' }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ success: true }),
        });

      render(<BugReportWidget apiUrl={mockApiUrl} />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });

      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText('Report a Bug')).toBeInTheDocument();
      });

      // Fill required fields using fireEvent (faster than userEvent)
      const moduleInput = screen.getByLabelText(/Module\/Feature/i);
      const titleInput = screen.getByLabelText(/Title/i);
      const descriptionInput = screen.getByLabelText(/Description/i);

      fireEvent.change(moduleInput, { target: { value: 'Dashboard' } });
      fireEvent.change(titleInput, { target: { value: 'Button not working' } });
      fireEvent.change(descriptionInput, { target: { value: 'The submit button does not respond to clicks' } });

      // Submit form
      const submitButton = screen.getByRole('button', { name: /Submit Report/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          `${mockApiUrl}/api/bug/reports`,
          expect.objectContaining({
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
          })
        );
      });

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Bug report DLA-BUG-0001 created successfully');
      });
    }, 15000);

    it('should handle submission error', async () => {
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ appId: 'test-app-id' }),
        })
        .mockResolvedValueOnce({
          ok: false,
          json: () => Promise.resolve({ error: 'Server error' }),
        });

      render(<BugReportWidget apiUrl={mockApiUrl} />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1);
      });

      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText('Report a Bug')).toBeInTheDocument();
      });

      // Fill required fields using fireEvent (faster than userEvent)
      fireEvent.change(screen.getByLabelText(/Module\/Feature/i), { target: { value: 'Dashboard' } });
      fireEvent.change(screen.getByLabelText(/Title/i), { target: { value: 'Test Bug' } });
      fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'Test description' } });

      // Submit form
      fireEvent.click(screen.getByRole('button', { name: /Submit Report/i }));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Server error');
      });
    }, 15000);
  });

  describe('Screenshot Handling', () => {
    it('should show upload button when fewer than 5 screenshots', async () => {
      render(<BugReportWidget apiUrl={mockApiUrl} />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText('Report a Bug')).toBeInTheDocument();
      });

      // Should show the upload area
      expect(screen.getByText(/Max 5 screenshots/i)).toBeInTheDocument();
    });

    it('should show error for non-image files', async () => {
      render(<BugReportWidget apiUrl={mockApiUrl} />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText('Report a Bug')).toBeInTheDocument();
      });

      // Create a non-image file
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      if (input) {
        fireEvent.change(input, { target: { files: [file] } });

        await waitFor(() => {
          expect(toast.error).toHaveBeenCalledWith('test.txt is not an image');
        });
      }
    });

    it('should show error for files exceeding size limit', async () => {
      render(<BugReportWidget apiUrl={mockApiUrl} />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText('Report a Bug')).toBeInTheDocument();
      });

      // Create a large file (> 5MB)
      const largeContent = new Array(6 * 1024 * 1024).fill('a').join('');
      const file = new File([largeContent], 'large.jpg', { type: 'image/jpeg' });
      const input = document.querySelector('input[type="file"]') as HTMLInputElement;

      if (input) {
        fireEvent.change(input, { target: { files: [file] } });

        await waitFor(() => {
          expect(toast.error).toHaveBeenCalledWith('large.jpg exceeds 5MB limit');
        });
      }
    });
  });

  describe('Cancel Button', () => {
    it('should close dialog when cancel is clicked', async () => {
      render(<BugReportWidget apiUrl={mockApiUrl} />);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        expect(screen.getByText('Report a Bug')).toBeInTheDocument();
      });

      // Click cancel
      const cancelButton = screen.getByRole('button', { name: /Cancel/i });
      fireEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByText('Report a Bug')).not.toBeInTheDocument();
      });
    });
  });
});

describe('captureContext utility', () => {
  // Test the context capture logic by checking the submitted data

  it('should include browser and OS info in submission', async () => {
    const mockFetch = jest.fn();
    global.fetch = mockFetch;

    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ appId: 'test-app-id' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 'report-1', reportNumber: 'TEST-001' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

    render(<BugReportWidget apiUrl="http://localhost:3001" />);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(screen.getByText('Report a Bug')).toBeInTheDocument();
    });

    // Fill required fields using fireEvent (faster than userEvent)
    fireEvent.change(screen.getByLabelText(/Module\/Feature/i), { target: { value: 'Test' } });
    fireEvent.change(screen.getByLabelText(/Title/i), { target: { value: 'Test' } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'Test' } });

    // Submit
    fireEvent.click(screen.getByRole('button', { name: /Submit Report/i }));

    await waitFor(() => {
      const submitCall = mockFetch.mock.calls.find(
        (call) => call[0] === 'http://localhost:3001/api/bug/reports'
      );
      expect(submitCall).toBeDefined();

      const body = JSON.parse(submitCall[1].body);
      expect(body).toHaveProperty('pageUrl');
      expect(body).toHaveProperty('userAgent');
      expect(body).toHaveProperty('browserName');
      expect(body).toHaveProperty('screenWidth');
      expect(body).toHaveProperty('screenHeight');
    });
  }, 15000);
});
