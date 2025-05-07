# JMRI Docker Container

[![Run Jest Tests](https://github.com/MyTurnyet/elmrr-jmri/actions/workflows/jest-tests.yml/badge.svg)](https://github.com/MyTurnyet/elmrr-jmri/actions/workflows/jest-tests.yml)

This project provides Docker configuration to run JMRI (Java Model Railroad Interface) in a container.

## What is JMRI?

JMRI (Java Model Railroad Interface) is open-source software for model railroad computer control. It includes tools like DecoderPro for programming DCC decoders, PanelPro for creating control panels, and more. For details, visit [JMRI.org](https://www.jmri.org/).

## Prerequisites

- Docker and Docker Compose installed on your system
- Basic understanding of Docker concepts
- Network-based connection to your model railroad (like DCC-EX, LocoNet over TCP, etc.)

## Quick Start

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/jmri-docker.git
   cd jmri-docker
   ```

2. Build and start the container:
   ```bash
   docker-compose up -d
   ```

3. Access JMRI web interface at: http://localhost:3081

4. If you use WiThrottle-compatible apps (like Engine Driver), connect to host IP on port 12090

## WebSocket Client Utility

This project includes a TypeScript WebSocketClient utility that can connect to the JMRI WebSocket server running on port 12090. This allows your web application to communicate with JMRI.

### Features

- Easy connection to the JMRI WebSocket server
- Automatic reconnection with exponential backoff
- Event-based API for handling messages, connections, and errors
- JSON parsing of messages

### Usage

```typescript
import { WebSocketClient } from '@/utils/websocket/WebSocketClient';

// Create a client that connects to localhost:12090
const client = new WebSocketClient('localhost', 12090);

// Set up event handlers and connect
client.onMessage((data) => console.log('Received:', data));
client.connect().then(() => console.log('Connected'));
```

For more details, see the [WebSocketClient documentation](src/utils/websocket/README.md) and [example usage](src/utils/websocket/examples/basic-usage.ts).

## Configuration

By default, this setup runs JMRI in headless mode using `JmriFaceless`. JMRI data is persisted in the `./jmri-data` directory on your host.

### Running Different JMRI Applications

You can run different JMRI applications by changing the `command` in docker-compose.yml:

- **JmriFaceless** (default): Headless mode for server operation
- **DecoderPro**: For programming decoders (requires X11 forwarding for GUI)
- **PanelPro**: For building control panels (requires X11 forwarding for GUI)

### Hardware Connections

This Docker setup is optimized for network-based connections to your layout:

- Use DCC command stations with network interfaces
- Use IP-based serial port servers for USB/serial devices
- For direct USB connections, uncomment `network_mode: "host"` in docker-compose.yml and see USB Access section below

## USB/Serial Access

To access USB or serial devices directly:

1. Uncomment `network_mode: "host"` in docker-compose.yml
2. Make sure your user has permissions to access the devices
3. Restart the container

For more advanced USB device mapping, see Docker documentation on device mapping.

## X11 Forwarding (For GUI Applications)

To run GUI applications like DecoderPro or PanelPro:

### On Linux:

```bash
# Allow X server connections
xhost +local:docker

# Run with X11 socket mounted
docker-compose -f docker-compose.yml -f docker-compose.x11.yml up
```

See the docker-compose.x11.yml file for details.

## Updating JMRI Version

To update the JMRI version:

1. Edit the Dockerfile and change `ENV JMRI_VERSION="5.10"` to the desired version
2. Rebuild the container:
   ```bash
   docker-compose build --no-cache
   docker-compose up -d
   ```

## Troubleshooting

### Container Fails to Start

Check logs with:
```bash
docker-compose logs
```

### Network Connection Issues

If you can't connect to network-based hardware:
- Try using host networking mode by uncommenting `network_mode: "host"` in docker-compose.yml
- Verify that ports are properly exposed and not blocked by firewalls

## License

This Docker configuration is provided under MIT license. JMRI itself is covered by the GNU General Public License v2.
