/**
 * Models and utilities for JMRI WebSocket commands
 */

/**
 * Base interface for all JMRI WebSocket commands
 */
export interface JMRICommandBase {
  type: string;
  method?: string;
  data?: Record<string, unknown>;
  list?: string;
}

/**
 * Ping command to test connectivity with JMRI server
 * Format based on JMRI JSON Servlet documentation
 * @see http://localhost:12080/help/en/html/web/JsonServlet.shtml
 */
export interface JMRIPingCommand extends JMRICommandBase {
  type: 'ping';
}

/**
 * Type guard to check if an object is a JMRI command
 * @param obj The object to check
 * @returns True if the object is a JMRI command
 */
export function isJMRICommand(obj: unknown): obj is JMRICommandBase {
  return typeof obj === 'object' && 
         obj !== null && 
         'type' in obj &&
         typeof (obj as JMRICommandBase).type === 'string';
}

/**
 * Creates a ping command to send to JMRI server
 * According to JMRI documentation, ping requires only the type field
 * @returns A properly formatted JMRI ping command
 */
export function createPingCommand(): JMRIPingCommand {
  return {
    type: 'ping'
  };
}

/**
 * Converts a JMRI command to a JSON string suitable for sending over WebSocket
 * @param command The JMRI command to convert
 * @returns JSON string representation of the command
 */
export function commandToJson(command: JMRICommandBase): string {
  return JSON.stringify(command);
}

/**
 * Helper function to directly get a JSON string for a ping command
 * @returns JSON string ready to send over WebSocket
 */
export function getPingJsonString(): string {
  return commandToJson(createPingCommand());
} 