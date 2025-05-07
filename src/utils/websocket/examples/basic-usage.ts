import { WebSocketClient } from '../WebSocketClient';

/**
 * Example of how to use the WebSocketClient with a JMRI WebSocket server on port 12090
 */
function connectToJMRIWebSocket() {
  // Create a client that connects to localhost:12090
  const client = new WebSocketClient('localhost', 12090);
  
  // Set up event handlers
  client.onMessage((data) => {
    console.log('Received message from JMRI:', data);
    
    // Handle different message types based on their content
    // Safely type-check before accessing properties
    if (typeof data === 'object' && data !== null) {
      const typedData = data as { type?: string; data?: { name?: string; state?: string } };
      
      if (typedData.type === 'hello') {
        console.log('Received hello message from server');
      } else if (typedData.type === 'sensor' && typedData.data?.name && typedData.data?.state) {
        console.log(`Sensor ${typedData.data.name} changed to ${typedData.data.state}`);
      }
    }
  });
  
  client.onConnect(() => {
    console.log('Connected to JMRI WebSocket server');
    
    // Send a hello message when connected
    client.send({
      type: 'hello',
      data: {}
    });
    
    // Example: subscribe to sensor updates
    client.send({
      type: 'subscribe',
      data: {
        type: 'sensor'
      }
    });
  });
  
  client.onDisconnect(() => {
    console.log('Disconnected from JMRI WebSocket server');
    
    // You might want to try reconnecting after a delay
    setTimeout(() => {
      console.log('Attempting to reconnect...');
      client.connect().catch(err => console.error('Reconnection failed:', err));
    }, 5000);
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
    
  // For demonstration purposes, disconnect after 60 seconds
  setTimeout(() => {
    console.log('Disconnecting after 60 seconds');
    client.disconnect();
  }, 60000);
  
  return client;
}

// If this file is run directly
if (require.main === module) {
  console.log('Starting WebSocketClient example...');
  connectToJMRIWebSocket();
}

export { connectToJMRIWebSocket }; 