import { MockWebSocketClient } from './MockWebSocketClient';

describe('MockWebSocketClient', () => {
  let client: MockWebSocketClient;

  beforeEach(() => {
    client = new MockWebSocketClient();
  });

  test('should connect successfully by default', async () => {
    await client.connect();
    expect(client.isActive()).toBe(true);
  });

  test('should disconnect properly', async () => {
    await client.connect();
    client.disconnect();
    expect(client.isActive()).toBe(false);
  });

  test('should fail to connect when configured', async () => {
    const failingClient = new MockWebSocketClient({ shouldFail: true });
    await expect(failingClient.connect()).rejects.toBeInstanceOf(Event);
    expect(failingClient.isActive()).toBe(false);
  });

  test('should store sent messages', async () => {
    await client.connect();
    client.send({ test: 'data' });
    client.send({ test: 'more data' });
    
    expect(client.sentMessages.length).toBe(2);
    expect(client.sentMessages[0]).toEqual({ test: 'data' });
    expect(client.sentMessages[1]).toEqual({ test: 'more data' });
  });

  test('should fail to send when not connected', () => {
    const result = client.send({ test: 'data' });
    expect(result).toBe(false);
    expect(client.sentMessages.length).toBe(0);
  });

  test('should call message handler on simulated message', async () => {
    const mockHandler = jest.fn();
    client.onMessage(mockHandler);
    
    await client.connect();
    client.simulateMessage({ test: 'received data' });
    
    expect(mockHandler).toHaveBeenCalledWith({ test: 'received data' });
  });

  test('should not deliver messages when disconnected', async () => {
    const mockHandler = jest.fn();
    client.onMessage(mockHandler);
    
    await client.connect();
    client.disconnect();
    client.simulateMessage({ test: 'data' });
    
    expect(mockHandler).not.toHaveBeenCalled();
  });

  test('should trigger connect handler', async () => {
    const mockHandler = jest.fn();
    client.onConnect(mockHandler);
    
    await client.connect();
    
    expect(mockHandler).toHaveBeenCalled();
  });

  test('should trigger disconnect handler', async () => {
    const mockHandler = jest.fn();
    client.onDisconnect(mockHandler);
    
    await client.connect();
    client.disconnect();
    
    expect(mockHandler).toHaveBeenCalled();
  });

  test('should trigger error handler', () => {
    const mockHandler = jest.fn();
    client.onError(mockHandler);
    
    const error = new Event('error');
    client.simulateError(error);
    
    expect(mockHandler).toHaveBeenCalledWith(error);
  });

  test('should automatically send mock responses', async () => {
    const responseClient = new MockWebSocketClient({
      mockResponses: [
        { type: 'response', data: 'test1' },
        { type: 'response', data: 'test2' }
      ]
    });
    
    const mockHandler = jest.fn();
    responseClient.onMessage(mockHandler);
    
    await responseClient.connect();
    responseClient.send({ type: 'request' });
    
    // Wait for the response timeout
    await new Promise(resolve => setTimeout(resolve, 20));
    
    expect(mockHandler).toHaveBeenCalledWith({ type: 'response', data: 'test1' });
  });
}); 