# WebSocketInterface Usage Guide

The `WebSocketInterface` provides a standard contract for WebSocket client implementations in this project. Using this interface offers several benefits:

1. **Dependency Injection**: Services can depend on the interface rather than a concrete implementation
2. **Easy Testing**: Mock implementations can be used in tests
3. **Implementation Swapping**: Different WebSocket implementations can be used without changing consumer code
4. **Clear Contract**: All WebSocket client implementations follow the same API

## Basic Usage

```typescript
import { WebSocketInterface } from './WebSocketInterface';
import { WebSocketClient } from './WebSocketClient';

// Create a client implementing the interface
const client: WebSocketInterface = new WebSocketClient('localhost', 12090);

// Use methods defined by the interface
client.connect()
  .then(() => {
    client.send({ type: 'hello' });
  })
  .catch(error => {
    console.error('Connection error:', error);
  });
```

## Dependency Injection

When creating services that need WebSocket functionality, depend on the interface rather than a concrete class:

```typescript
class MyService {
  constructor(private client: WebSocketInterface) {
    // The service only knows about the interface, not the specific implementation
  }
  
  async start() {
    await this.client.connect();
    // ...
  }
}
```

## Creating Mock Implementations for Testing

When writing tests, you can create mock implementations of the interface:

```typescript
// In a test file
import { WebSocketInterface } from '../WebSocketInterface';
import { MyService } from '../MyService';

// Create a test implementation
class MockWebSocketClient implements WebSocketInterface {
  // Store data for assertions
  public sentMessages: unknown[] = [];
  private connected = false;
  private messageCallback: ((data: unknown) => void) | null = null;

  // Implement interface methods
  async connect(): Promise<void> {
    this.connected = true;
    return Promise.resolve();
  }
  
  disconnect(): void {
    this.connected = false;
  }
  
  send(data: unknown): boolean {
    this.sentMessages.push(data);
    return true;
  }
  
  // ... implement other methods ...
  
  isActive(): boolean {
    return this.connected;
  }
  
  // Helper method for tests
  simulateIncomingMessage(data: unknown): void {
    if (this.messageCallback) {
      this.messageCallback(data);
    }
  }
}

// Use in tests
test('my service sends correct message', async () => {
  const mockClient = new MockWebSocketClient();
  const service = new MyService(mockClient);
  
  await service.start();
  await service.doSomething();
  
  expect(mockClient.sentMessages).toContain({ type: 'expectedMessage' });
});
```

## Available Implementations

Currently, the project has the following implementations of the WebSocketInterface:

1. **WebSocketClient**: The standard implementation using the browser's WebSocket API
2. **MockWebSocketClient**: A mock implementation for testing

## Interface Method Reference

The WebSocketInterface defines the following methods:

| Method | Description |
|--------|-------------|
| `connect()` | Connects to the WebSocket server |
| `disconnect()` | Disconnects from the WebSocket server |
| `send(data)` | Sends data to the WebSocket server |
| `onMessage(callback)` | Sets callback for incoming messages |
| `onConnect(callback)` | Sets callback for connection events |
| `onDisconnect(callback)` | Sets callback for disconnection events |
| `onError(callback)` | Sets callback for error events |
| `isActive()` | Checks if the connection is active | 