/// <reference types="jest" />

import { WebSocketClient } from '../WebSocketClient';

type CallbackFunction = () => void;
type MessageCallback = (event: { data: string }) => void;
type ErrorCallback = (error: Event) => void;

interface CallbackMap {
  open?: CallbackFunction;
  close?: CallbackFunction;
  message?: MessageCallback;
  error?: ErrorCallback;
}

/**
 * Mock WebSocket class to replace the browser's WebSocket
 * in the test environment
 */
class MockWebSocket {
  private static instance: MockWebSocket | null = null;
  private url: string;
  private callbacks: CallbackMap = {};
  
  constructor(url: string) {
    this.url = url;
    MockWebSocket.instance = this;
  }

  public static getInstance(): MockWebSocket | null {
    return MockWebSocket.instance;
  }

  public addEventListener(event: string, callback: CallbackFunction | MessageCallback | ErrorCallback): void {
    if (event === 'open' || event === 'close') {
      this.callbacks[event] = callback as CallbackFunction;
    } else if (event === 'message') {
      this.callbacks[event] = callback as MessageCallback;
    } else if (event === 'error') {
      this.callbacks[event] = callback as ErrorCallback;
    }
  }

  public set onopen(callback: CallbackFunction) {
    this.callbacks.open = callback;
  }

  public set onclose(callback: CallbackFunction) {
    this.callbacks.close = callback;
  }

  public set onmessage(callback: MessageCallback) {
    this.callbacks.message = callback;
  }

  public set onerror(callback: ErrorCallback) {
    this.callbacks.error = callback;
  }

  public close(): void {
    if (this.callbacks.close) {
      this.callbacks.close();
    }
  }

  public send(data: string): void {
    // This would normally send to the server
    // For tests, we'll just simulate a response
    console.log(`Mock sending: ${data}`);
  }

  public mockServerMessage(data: unknown): void {
    if (this.callbacks.message) {
      this.callbacks.message({ data: typeof data === 'string' ? data : JSON.stringify(data) });
    }
  }

  public mockOpen(): void {
    if (this.callbacks.open) {
      this.callbacks.open();
    }
  }

  public mockClose(): void {
    if (this.callbacks.close) {
      this.callbacks.close();
    }
  }

  public mockError(error: Event): void {
    if (this.callbacks.error) {
      this.callbacks.error(error);
    }
  }
}

// Replace global WebSocket with our mock
global.WebSocket = MockWebSocket as unknown as typeof WebSocket;

describe('WebSocketClient', () => {
  let webSocketClient: WebSocketClient;
  let mockSocket: MockWebSocket;
  
  beforeEach(() => {
    // Create a new client before each test
    webSocketClient = new WebSocketClient('localhost', 12090);
  });

  afterEach(() => {
    // Clean up after each test
    webSocketClient.disconnect();
  });

  test('should create WebSocketClient with default parameters', () => {
    const client = new WebSocketClient();
    expect(client).toBeInstanceOf(WebSocketClient);
  });
  
  test('should create WebSocketClient with custom parameters', () => {
    const client = new WebSocketClient('example.com', 8080, '/ws');
    expect(client).toBeInstanceOf(WebSocketClient);
  });

  test('should connect to WebSocket server', async () => {
    const connectPromise = webSocketClient.connect();
    
    // Get the MockWebSocket instance and simulate server accepting connection
    mockSocket = MockWebSocket.getInstance() as MockWebSocket;
    mockSocket.mockOpen();
    
    await connectPromise;
    expect(webSocketClient.isActive()).toBe(true);
  });

  test('should handle connection errors', async () => {
    const connectPromise = webSocketClient.connect();
    
    // Get the MockWebSocket instance and simulate error
    mockSocket = MockWebSocket.getInstance() as MockWebSocket;
    
    // Set up error callback
    let errorOccurred = false;
    webSocketClient.onError(() => {
      errorOccurred = true;
    });
    
    mockSocket.mockError(new Event('error'));
    
    try {
      await connectPromise;
      fail('Should have thrown an error');
    } catch {
      expect(errorOccurred).toBe(true);
    }
  });

  test('should disconnect from WebSocket server', async () => {
    const connectPromise = webSocketClient.connect();
    
    mockSocket = MockWebSocket.getInstance() as MockWebSocket;
    mockSocket.mockOpen();
    
    await connectPromise;
    expect(webSocketClient.isActive()).toBe(true);
    
    webSocketClient.disconnect();
    expect(webSocketClient.isActive()).toBe(false);
  });

  test('should send message to server', async () => {
    const connectPromise = webSocketClient.connect();
    
    mockSocket = MockWebSocket.getInstance() as MockWebSocket;
    mockSocket.mockOpen();
    
    await connectPromise;
    
    const sendResult = webSocketClient.send({ test: 'data' });
    expect(sendResult).toBe(true);
  });

  test('should not send message when disconnected', () => {
    const sendResult = webSocketClient.send({ test: 'data' });
    expect(sendResult).toBe(false);
  });

  test('should handle received messages', async () => {
    const messageData = { type: 'test', value: 'hello' };
    let receivedData: unknown = null;
    
    webSocketClient.onMessage((data) => {
      receivedData = data;
    });
    
    const connectPromise = webSocketClient.connect();
    mockSocket = MockWebSocket.getInstance() as MockWebSocket;
    mockSocket.mockOpen();
    
    await connectPromise;
    
    mockSocket.mockServerMessage(messageData);
    expect(receivedData).toEqual(messageData);
  });

  test('should handle connection events', async () => {
    let connected = false;
    let disconnected = false;
    
    webSocketClient.onConnect(() => {
      connected = true;
    });
    
    webSocketClient.onDisconnect(() => {
      disconnected = true;
    });
    
    const connectPromise = webSocketClient.connect();
    mockSocket = MockWebSocket.getInstance() as MockWebSocket;
    mockSocket.mockOpen();
    
    await connectPromise;
    expect(connected).toBe(true);
    
    mockSocket.mockClose();
    expect(disconnected).toBe(true);
  });
}); 