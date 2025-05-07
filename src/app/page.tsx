"use client";

import { useState, useEffect } from "react";
import { WebSocketClient } from "@/utils/websocket/WebSocketClient";
import { createPingCommand } from "@/utils/websocket/JMRICommands";

export default function Home() {
  const [pingStatus, setPingStatus] = useState<string>("");
  const [client, setClient] = useState<WebSocketClient | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    // Create a websocket client when component mounts
    const wsClient = new WebSocketClient('localhost', 12090);
    
    wsClient.onConnect(() => {
      console.log('Connected to JMRI WebSocket server');
      setIsConnected(true);
      setPingStatus("Connected to JMRI server");
    });
    
    wsClient.onMessage((data) => {
      console.log('Received message:', data);
      
      // Check if it's a response to our ping
      if (typeof data === 'object' && data !== null) {
        const typedData = data as { type?: string };
        
        if (typedData.type === 'pong') {
          setPingStatus("Received pong response from JMRI server");
        }
      }
    });
    
    wsClient.onDisconnect(() => {
      console.log('Disconnected from JMRI WebSocket server');
      setIsConnected(false);
      setPingStatus("Disconnected from JMRI server");
    });
    
    wsClient.onError((error) => {
      console.error('WebSocket error:', error);
      setPingStatus("Error connecting to JMRI server");
      setIsConnected(false);
    });

    setClient(wsClient);

    // Clean up on unmount
    return () => {
      if (wsClient) {
        wsClient.disconnect();
      }
    };
  }, []);

  const connectToServer = async () => {
    if (client && !isConnected) {
      setPingStatus("Connecting to JMRI server...");
      try {
        await client.connect();
      } catch (error) {
        console.error("Connection error:", error);
        setPingStatus("Failed to connect to JMRI server");
      }
    }
  };

  const sendPing = () => {
    if (client && isConnected) {
      setPingStatus("Sending ping to JMRI server...");
      const pingCommand = createPingCommand();
      client.send(pingCommand);
    } else {
      setPingStatus("Not connected to JMRI server");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-6">JMRI WebSocket Interface</h1>
      
      <div className="flex flex-col gap-4 w-full max-w-md">
        <button 
          onClick={connectToServer}
          disabled={isConnected}
          className={`px-4 py-2 rounded ${isConnected ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
        >
          Connect to JMRI Server
        </button>
        
        <button 
          onClick={sendPing}
          disabled={!isConnected}
          className={`px-4 py-2 rounded ${!isConnected ? 'bg-gray-300 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600 text-white'}`}
        >
          Send Ping
        </button>
        
        <div className="mt-4 p-4 border rounded bg-gray-50">
          <p className="font-semibold">Status:</p>
          <p className={`${pingStatus.includes("error") || pingStatus.includes("Failed") ? 'text-red-500' : pingStatus.includes("pong") ? 'text-green-500' : ''}`}>
            {pingStatus || "Not connected"}
          </p>
        </div>
      </div>
    </div>
  );
}
