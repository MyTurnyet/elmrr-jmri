import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MockWebSocketClient } from '@/utils/websocket/__tests__/MockWebSocketClient';
import Home from '../page';

// Add proper typing for jest-dom
import '@testing-library/jest-dom';

// Mock the WebSocketClient module
jest.mock('@/utils/websocket/WebSocketClient', () => {
  return {
    WebSocketClient: jest.fn().mockImplementation(() => {
      return new MockWebSocketClient({
        autoConnect: true,
        mockResponses: [{ type: 'pong' }]
      });
    })
  };
});

describe('Home Page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the JMRI WebSocket Interface title', () => {
    render(<Home />);
    expect(screen.getByText('JMRI WebSocket Interface')).toBeInTheDocument();
  });

  it('initially shows connect button enabled and ping button disabled', () => {
    render(<Home />);
    const connectButton = screen.getByText('Connect to JMRI Server');
    const pingButton = screen.getByText('Send Ping');
    
    expect(connectButton).not.toBeDisabled();
    expect(pingButton).toBeDisabled();
  });

  it('shows initial status as "Not connected"', () => {
    render(<Home />);
    expect(screen.getByText('Not connected')).toBeInTheDocument();
  });

  it('updates status when connecting to the server', async () => {
    render(<Home />);
    const connectButton = screen.getByText('Connect to JMRI Server');
    
    fireEvent.click(connectButton);
    
    await waitFor(() => {
      expect(screen.getByText('Connected to JMRI server')).toBeInTheDocument();
    });
  });

  it('enables ping button after connecting', async () => {
    render(<Home />);
    const connectButton = screen.getByText('Connect to JMRI Server');
    
    fireEvent.click(connectButton);
    
    await waitFor(() => {
      const pingButton = screen.getByText('Send Ping');
      expect(pingButton).not.toBeDisabled();
    });
  });

  it('sends a ping and receives pong response', async () => {
    render(<Home />);
    const connectButton = screen.getByText('Connect to JMRI Server');
    
    fireEvent.click(connectButton);
    
    await waitFor(() => {
      const pingButton = screen.getByText('Send Ping');
      expect(pingButton).not.toBeDisabled();
    });
    
    const pingButton = screen.getByText('Send Ping');
    fireEvent.click(pingButton);
    
    await waitFor(() => {
      expect(screen.getByText('Received pong response from JMRI server')).toBeInTheDocument();
    });
  });

  it('disables connect button when connected', async () => {
    render(<Home />);
    const connectButton = screen.getByText('Connect to JMRI Server');
    
    fireEvent.click(connectButton);
    
    await waitFor(() => {
      expect(connectButton).toBeDisabled();
    });
  });

  it('handles connection failures', async () => {
    // Reset the mock for this specific test
    jest.resetAllMocks();
    
    // Create a failing mock implementation just for this test
    const { WebSocketClient } = jest.requireMock('@/utils/websocket/WebSocketClient');
    WebSocketClient.mockImplementationOnce(() => {
      return new MockWebSocketClient({
        shouldFail: true
      });
    });
    
    render(<Home />);
    const connectButton = screen.getByText('Connect to JMRI Server');
    
    fireEvent.click(connectButton);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to connect to JMRI server')).toBeInTheDocument();
    });
  });
}); 