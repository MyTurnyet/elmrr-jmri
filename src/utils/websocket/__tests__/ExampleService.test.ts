import { ExampleService } from '../examples/UsingInterface';
import { MockWebSocketClient } from './MockWebSocketClient';
import { WebSocketInterface } from '../WebSocketInterface';

describe('ExampleService', () => {
  let mockClient: MockWebSocketClient;
  let service: ExampleService;

  beforeEach(() => {
    // Create a mock client with predefined responses
    mockClient = new MockWebSocketClient({
      autoConnect: true,
      mockResponses: [
        { type: 'status', status: 'ok', deviceId: 'train1' }
      ]
    });
    
    // Inject the mock client that implements WebSocketInterface
    service = new ExampleService(mockClient);
  });

  afterEach(() => {
    service.cleanup();
  });

  test('should initialize and connect successfully', async () => {
    // Initialize the service (which will connect using the mock)
    await service.initialize();
    
    // Verify the connection is active
    expect(mockClient.isActive()).toBe(true);
  });

  test('should send commands correctly', async () => {
    await service.initialize();
    
    // Send a command to the mock
    const result = service.sendCommand('getStatus', { deviceId: 'train1' });
    
    // Verify the command was sent
    expect(result).toBe(true);
    expect(mockClient.sentMessages.length).toBe(1);
    expect(mockClient.sentMessages[0]).toMatchObject({
      command: 'getStatus',
      params: { deviceId: 'train1' }
    });
  });

  test('should handle received messages', async () => {
    // Spy on console.log
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    await service.initialize();
    
    // Simulate receiving a message from the server
    mockClient.simulateMessage({ data: 'test-data' });
    
    // Verify the message was handled
    expect(consoleSpy).toHaveBeenCalledWith(
      'Message received:',
      { data: 'test-data' }
    );
    
    consoleSpy.mockRestore();
  });

  test('should handle disconnection', async () => {
    // Spy on console.log
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    await service.initialize();
    
    // Simulate server disconnection
    mockClient.simulateDisconnect();
    
    // Verify disconnection was handled
    expect(consoleSpy).toHaveBeenCalledWith('Connection lost');
    expect(mockClient.isActive()).toBe(false);
    
    consoleSpy.mockRestore();
  });

  test('should handle connection errors', async () => {
    // Create a client configured to fail
    const failingClient: WebSocketInterface = new MockWebSocketClient({
      shouldFail: true
    });
    
    // Create a service with the failing client
    const errorService = new ExampleService(failingClient);
    
    // Spy on console.error
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    // Expect initialization to fail
    await expect(errorService.initialize()).rejects.toBeInstanceOf(Event);
    
    // Verify error was handled
    expect(consoleSpy).toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });
}); 