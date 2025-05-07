/**
 * A simple WebSocket client that connects to a specified port
 */
export class WebSocketClient {
  private socket: WebSocket | null = null;
  private url: string;
  private isConnected: boolean = false;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectTimeout: NodeJS.Timeout | null = null;

  // Event callbacks
  private onMessageCallback: ((data: unknown) => void) | null = null;
  private onConnectCallback: (() => void) | null = null;
  private onDisconnectCallback: (() => void) | null = null;
  private onErrorCallback: ((error: Event) => void) | null = null;

  /**
   * Creates a new WebSocketClient
   * @param host The host to connect to (defaults to localhost)
   * @param port The port to connect to (defaults to 12090)
   * @param path The path to connect to (defaults to /)
   */
  constructor(
    host: string = 'localhost',
    port: number = 12090,
    path: string = '/'
  ) {
    this.url = `ws://${host}:${port}${path}`;
  }

  /**
   * Connects to the WebSocket server
   * @returns A promise that resolves when connected
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket && this.isConnected) {
        resolve();
        return;
      }

      try {
        this.socket = new WebSocket(this.url);

        this.socket.onopen = () => {
          this.isConnected = true;
          this.reconnectAttempts = 0;
          if (this.onConnectCallback) this.onConnectCallback();
          resolve();
        };

        this.socket.onclose = () => {
          this.isConnected = false;
          if (this.onDisconnectCallback) this.onDisconnectCallback();
          this.attemptReconnect();
        };

        this.socket.onerror = (error) => {
          if (this.onErrorCallback) this.onErrorCallback(error);
          reject(error);
        };

        this.socket.onmessage = (event) => {
          if (this.onMessageCallback) {
            try {
              const data = JSON.parse(event.data);
              this.onMessageCallback(data);
            } catch {
              this.onMessageCallback(event.data);
            }
          }
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Disconnects from the WebSocket server
   */
  disconnect(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      this.isConnected = false;
    }
  }

  /**
   * Sends data to the WebSocket server
   * @param data The data to send
   * @returns True if the data was sent successfully
   */
  send(data: unknown): boolean {
    if (!this.socket || !this.isConnected) {
      return false;
    }

    try {
      const message = typeof data === 'string' ? data : JSON.stringify(data);
      this.socket.send(message);
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }

  /**
   * Attempts to reconnect to the WebSocket server
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnect attempts reached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
    
    this.reconnectTimeout = setTimeout(() => {
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      this.connect().catch(() => {});
    }, delay);
  }

  /**
   * Sets the callback for when a message is received
   * @param callback The callback function
   */
  onMessage(callback: (data: unknown) => void): void {
    this.onMessageCallback = callback;
  }

  /**
   * Sets the callback for when the connection is established
   * @param callback The callback function
   */
  onConnect(callback: () => void): void {
    this.onConnectCallback = callback;
  }

  /**
   * Sets the callback for when the connection is closed
   * @param callback The callback function
   */
  onDisconnect(callback: () => void): void {
    this.onDisconnectCallback = callback;
  }

  /**
   * Sets the callback for when an error occurs
   * @param callback The callback function
   */
  onError(callback: (error: Event) => void): void {
    this.onErrorCallback = callback;
  }

  /**
   * Checks if the client is connected
   * @returns True if connected
   */
  isActive(): boolean {
    return this.isConnected;
  }
} 