# WebSocketClient

A simple WebSocket client implementation that connects to a specified WebSocket server.

## Features

- Easy connection to WebSocket servers with configurable host, port, and path
- Automatic reconnection with exponential backoff
- Event-based API for handling messages, connections, disconnections, and errors
- JSON parsing of messages
- Promise-based connection API
- Type-safe implementation with TypeScript
- Interface-based design for easy testing and implementation swapping

## Installation

This class is included as part of the project. No additional installation is needed.

## Usage

```typescript
import { WebSocketClient } from '@/utils/websocket/WebSocketClient';
import { WebSocketInterface } from '@/utils/websocket/WebSocketInterface';

// Create a client that connects to localhost:12090
const client: WebSocketInterface = new WebSocketClient('localhost', 12090);

// Set up event handlers
client.onMessage((data) => {
  console.log('Received message:', data);
});

client.onConnect(() => {
  console.log('Connected to server');
});

client.onDisconnect(() => {
  console.log('Disconnected from server');
});

client.onError((error) => {
  console.error('Connection error:', error);
});

// Connect to the server
client.connect()
  .then(() => {
    console.log('Successfully connected');
    
    // Send a message
    client.send({ type: 'hello', message: 'world' });
  })
  .catch((error) => {
    console.error('Failed to connect:', error);
  });

// Later, when done
client.disconnect();
```

## API

### Interface

The `WebSocketInterface` defines the contract for WebSocket client implementations:

```typescript
interface WebSocketInterface {
  connect(): Promise<void>;
  disconnect(): void;
  send(data: unknown): boolean;
  onMessage(callback: (data: unknown) => void): void;
  onConnect(callback: () => void): void;
  onDisconnect(callback: () => void): void;
  onError(callback: (error: Event) => void): void;
  isActive(): boolean;
}
```

### Constructor

```typescript
constructor(host: string = 'localhost', port: number = 12090, path: string = '/')
```

- `host`: The hostname or IP address of the WebSocket server (default: 'localhost')
- `port`: The port number of the WebSocket server (default: 12090)
- `path`: The path to connect to on the WebSocket server (default: '/')

### Methods

#### `connect(): Promise<void>`

Connects to the WebSocket server. Returns a Promise that resolves when connected or rejects if an error occurs.

#### `disconnect(): void`

Disconnects from the WebSocket server.

#### `send(data: unknown): boolean`

Sends data to the WebSocket server. Data can be a string or any JSON-serializable object.
Returns `true` if the message was sent successfully, `false` otherwise.

#### `onMessage(callback: (data: unknown) => void): void`

Sets a callback function to be called when a message is received from the server.

#### `onConnect(callback: () => void): void`

Sets a callback function to be called when a connection is established.

#### `onDisconnect(callback: () => void): void`

Sets a callback function to be called when the connection is closed.

#### `onError(callback: (error: Event) => void): void`

Sets a callback function to be called when an error occurs.

#### `isActive(): boolean`

Returns `true` if the client is currently connected to the server, `false` otherwise.

## Testing

Tests are written using Jest and can be run using:

```bash
npm test
```

The tests use a mock WebSocket implementation to simulate client-server communication. 