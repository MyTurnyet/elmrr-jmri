/**
 * Interface defining the WebSocket client functionality
 */
export interface WebSocketInterface {
  /**
   * Connects to the WebSocket server
   * @returns A promise that resolves when connected
   */
  connect(): Promise<void>;

  /**
   * Disconnects from the WebSocket server
   */
  disconnect(): void;

  /**
   * Sends data to the WebSocket server
   * @param data The data to send
   * @returns True if the data was sent successfully
   */
  send(data: unknown): boolean;

  /**
   * Sets the callback for when a message is received
   * @param callback The callback function
   */
  onMessage(callback: (data: unknown) => void): void;

  /**
   * Sets the callback for when the connection is established
   * @param callback The callback function
   */
  onConnect(callback: () => void): void;

  /**
   * Sets the callback for when the connection is closed
   * @param callback The callback function
   */
  onDisconnect(callback: () => void): void;

  /**
   * Sets the callback for when an error occurs
   * @param callback The callback function
   */
  onError(callback: (error: Event) => void): void;

  /**
   * Checks if the client is connected
   * @returns True if connected
   */
  isActive(): boolean;
} 