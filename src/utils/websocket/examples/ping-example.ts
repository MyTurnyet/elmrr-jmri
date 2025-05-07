import { WebSocketClient } from '../WebSocketClient';
import { createPingCommand, getPingJsonString } from '../JMRICommands';

/**
 * Example showing how to use the JMRI ping command with WebSocketClient
 * Based on JMRI JSON Servlet documentation
 * @see http://localhost:12080/help/en/html/web/JsonServlet.shtml
 */
function pingJMRIServer() {
  // Create a client that connects to localhost:12090 (standard JMRI WebSocket port)
  const client = new WebSocketClient('localhost', 12090);
  
  // Set up event handlers
  client.onMessage((data) => {
    console.log('Received message from JMRI:', data);
    
    // Check if it's a response to our ping
    if (typeof data === 'object' && data !== null) {
      const typedData = data as { type?: string };
      
      if (typedData.type === 'pong') {
        console.log('Received pong response from server');
      }
    }
  });
  
  client.onConnect(() => {
    console.log('Connected to JMRI WebSocket server');
    
    // Method 1: Create a ping command object and send it
    const pingCommand = createPingCommand();
    client.send(pingCommand);
    
    console.log('Sent ping command:', pingCommand);
    
    // Method 2: Get a JSON string directly and send it
    // This is useful if you need to see the exact JSON that will be sent
    const pingJsonString = getPingJsonString();
    console.log('JSON string that will be sent:', pingJsonString);
    
    // You could send this directly too:
    // client.send(pingJsonString);
    
    // For demonstration purposes, disconnect after 10 seconds
    setTimeout(() => {
      console.log('Disconnecting after 10 seconds');
      client.disconnect();
    }, 10000);
  });
  
  client.onDisconnect(() => {
    console.log('Disconnected from JMRI WebSocket server');
  });
  
  client.onError((error) => {
    console.error('JMRI WebSocket connection error:', error);
  });
  
  // Connect to the server
  client.connect()
    .then(() => {
      console.log('Successfully connected to JMRI WebSocket server');
    })
    .catch((error) => {
      console.error('Failed to connect to JMRI WebSocket server:', error);
    });
  
  return client;
}

// If this file is run directly
if (require.main === module) {
  console.log('Starting JMRI ping example...');
  pingJMRIServer();
}

export { pingJMRIServer }; 