import { WebSocketInterface } from '../WebSocketInterface';
import { WebSocketClient } from '../WebSocketClient';

/**
 * Example of a service that depends on WebSocketInterface
 * Using the interface allows for easy dependency injection and testing
 */
class ExampleService {
  private client: WebSocketInterface;

  constructor(client: WebSocketInterface) {
    this.client = client;
  }

  /**
   * Initializes the connection and sets up event handlers
   */
  async initialize(): Promise<void> {
    // Set up event handlers using the interface methods
    this.client.onMessage(this.handleMessage.bind(this));
    this.client.onConnect(this.handleConnect.bind(this));
    this.client.onDisconnect(this.handleDisconnect.bind(this));
    this.client.onError(this.handleError.bind(this));

    // Connect using the interface method
    await this.client.connect();
  }

  /**
   * Sends a command to the server
   */
  sendCommand(command: string, params: Record<string, unknown>): boolean {
    return this.client.send({
      command,
      params,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Handle incoming messages
   */
  private handleMessage(data: unknown): void {
    console.log('Message received:', data);
    // Process the message...
  }

  /**
   * Handle connection established
   */
  private handleConnect(): void {
    console.log('Connection established');
    // Do something when connected...
  }

  /**
   * Handle disconnection
   */
  private handleDisconnect(): void {
    console.log('Connection lost');
    // Handle disconnection...
  }

  /**
   * Handle errors
   */
  private handleError(error: Event): void {
    console.error('Connection error:', error);
    // Handle error...
  }

  /**
   * Cleanup and disconnect
   */
  cleanup(): void {
    this.client.disconnect();
  }
}

// Example usage:
async function runExample() {
  // Create a WebSocketClient that implements WebSocketInterface
  const client: WebSocketInterface = new WebSocketClient('localhost', 12090);
  
  // Inject the client into the service
  const service = new ExampleService(client);
  
  try {
    await service.initialize();
    
    // Send a command
    service.sendCommand('getStatus', { deviceId: 'train1' });
    
    // Wait 5 seconds then disconnect
    setTimeout(() => {
      service.cleanup();
      console.log('Example completed');
    }, 5000);
  } catch (error) {
    console.error('Failed to initialize:', error);
  }
}

// Uncomment to run the example
// runExample().catch(console.error);

export { ExampleService, runExample }; 