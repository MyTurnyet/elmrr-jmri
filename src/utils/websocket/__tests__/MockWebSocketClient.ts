import { WebSocketInterface } from '../WebSocketInterface';

/**
 * Mock implementation of WebSocketInterface for testing
 */
export class MockWebSocketClient implements WebSocketInterface {
  private connected: boolean = false;
  private messageHandler: ((data: unknown) => void) | null = null;
  private connectHandler: (() => void) | null = null;
  private disconnectHandler: (() => void) | null = null;
  private errorHandler: ((error: Event) => void) | null = null;
  
  // Store sent messages for assertions
  public sentMessages: unknown[] = [];
  
  // Configurable response to simulate server behavior
  private mockResponses: unknown[] = [];
  private autoConnect: boolean = true;
  private shouldFail: boolean = false;

  constructor(options?: {
    autoConnect?: boolean;
    shouldFail?: boolean;
    mockResponses?: unknown[];
  }) {
    if (options) {
      this.autoConnect = options.autoConnect ?? true;
      this.shouldFail = options.shouldFail ?? false;
      this.mockResponses = options.mockResponses ?? [];
    }
  }

  /**
   * Simulates connecting to a server
   */
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.shouldFail) {
        const error = new Event('error');
        if (this.errorHandler) {
          this.errorHandler(error);
        }
        reject(error);
        return;
      }

      setTimeout(() => {
        this.connected = true;
        if (this.connectHandler) {
          this.connectHandler();
        }
        resolve();
      }, this.autoConnect ? 0 : 100);
    });
  }

  /**
   * Simulates disconnecting from a server
   */
  disconnect(): void {
    this.connected = false;
    if (this.disconnectHandler) {
      this.disconnectHandler();
    }
  }

  /**
   * Simulates sending data to a server
   */
  send(data: unknown): boolean {
    if (!this.connected) {
      return false;
    }

    this.sentMessages.push(data);
    
    // If we have a response queued up, simulate receiving it
    if (this.mockResponses.length > 0 && this.messageHandler) {
      const response = this.mockResponses.shift();
      setTimeout(() => {
        if (this.messageHandler && this.connected) {
          this.messageHandler(response);
        }
      }, 10);
    }
    
    return true;
  }

  /**
   * Register message handler
   */
  onMessage(callback: (data: unknown) => void): void {
    this.messageHandler = callback;
  }

  /**
   * Register connect handler
   */
  onConnect(callback: () => void): void {
    this.connectHandler = callback;
  }

  /**
   * Register disconnect handler
   */
  onDisconnect(callback: () => void): void {
    this.disconnectHandler = callback;
  }

  /**
   * Register error handler
   */
  onError(callback: (error: Event) => void): void {
    this.errorHandler = callback;
  }

  /**
   * Check if connected
   */
  isActive(): boolean {
    return this.connected;
  }

  /**
   * Test helper to simulate receiving a message from the server
   */
  simulateMessage(data: unknown): void {
    if (this.connected && this.messageHandler) {
      this.messageHandler(data);
    }
  }

  /**
   * Test helper to simulate server disconnection
   */
  simulateDisconnect(): void {
    this.connected = false;
    if (this.disconnectHandler) {
      this.disconnectHandler();
    }
  }

  /**
   * Test helper to simulate server error
   */
  simulateError(error: Event): void {
    if (this.errorHandler) {
      this.errorHandler(error);
    }
  }
} 