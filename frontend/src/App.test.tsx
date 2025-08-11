import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock fetch for API calls
global.fetch = jest.fn();

beforeEach(() => {
  (fetch as jest.Mock).mockClear();
});

test('renders deepfake detection app', () => {
  // Mock successful health check
  (fetch as jest.Mock).mockResolvedValueOnce({
    json: async () => ({
      success: true,
      data: {
        status: 'healthy',
        services: {
          flask: true,
          cors: true,
          deepfake_detector: true,
          model_loaded: true
        }
      }
    })
  });

  render(<App />);

  // Check if main heading is present
  const heading = screen.getByText(/🛡️ Deepfake Detection/i);
  expect(heading).toBeTruthy();

  // Check if subtitle is present
  const subtitle = screen.getByText(/Advanced AI-powered video authenticity analysis/i);
  expect(subtitle).toBeTruthy();
});

test('shows checking status initially', () => {
  // Mock pending fetch
  (fetch as jest.Mock).mockImplementation(() => new Promise(() => { }));

  render(<App />);

  // Should show checking status initially
  const checkingStatus = screen.getByText(/🔄 Checking.../i);
  expect(checkingStatus).toBeTruthy();
});

test('renders upload section when API is online', async () => {
  // Mock successful health check
  (fetch as jest.Mock).mockResolvedValueOnce({
    json: async () => ({
      success: true,
      data: {
        status: 'healthy',
        services: {
          flask: true,
          cors: true,
          deepfake_detector: true,
          model_loaded: true
        }
      }
    })
  });

  render(<App />);

  // Wait for API check to complete and check for upload section
  const uploadSection = await screen.findByText(/Upload Video for Analysis/i);
  expect(uploadSection).toBeTruthy();

  // Check for file input label
  const fileInputLabel = screen.getByText(/Choose Video File/i);
  expect(fileInputLabel).toBeTruthy();
});

test('shows offline message when API is unavailable', async () => {
  // Mock failed health check
  (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

  render(<App />);

  // Should show offline status
  const offlineStatus = await screen.findByText(/❌ Offline/i);
  expect(offlineStatus).toBeTruthy();

  // Should show service unavailable message
  const unavailableMessage = await screen.findByText(/Service Unavailable/i);
  expect(unavailableMessage).toBeTruthy();
});