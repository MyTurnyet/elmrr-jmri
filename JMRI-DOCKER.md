# JMRI Docker Setup

This setup uses the `jsa1987/jmri-docker` image to run JMRI (Java Model Railroad Interface) in a Docker container.

## Available Image Tags

- `jsa1987/jmri-docker:testing` - JMRI v5.11.4
- `jsa1987/jmri-docker:stable` - Stable version
- `jsa1987/jmri-docker:jmri-5.10` - JMRI v5.10
- `jsa1987/jmri-docker:jmri-5.8` - JMRI v5.8

## Getting Started

1. Make sure Docker and Docker Compose are installed on your system
2. Create a directory for JMRI configuration:
   ```bash
   mkdir -p jmri_config
   ```
3. Start the container:
   ```bash
   docker-compose up -d
   ```

## Configuration

The docker-compose.yml exposes the following ports:

- 12080: Web interface
- 1234: Default LocoNet over TCP port
- 12090: WiThrottle server
- 2056: JMRI JSON server
- 5901: VNC server
- 6901: noVNC web interface

## Accessing JMRI

JMRI can be accessed through multiple interfaces:

### VNC Access (Recommended)
The JMRI graphical interface is available via the noVNC web interface at:
http://localhost:6901/vnc.html

You can also connect directly to the VNC server on port 5901 using any VNC client.

### WiThrottle Server
The WiThrottle server is running on port 12090. You can connect to it using WiThrottle-compatible mobile apps.

### JMRI JSON Server
The JMRI JSON server is available on port 2056 for programmatic access.

## Using Hardware Controllers

If you need to connect hardware controllers via USB, add the appropriate device mappings in the `devices` section of docker-compose.yml.

## Persistence

JMRI configuration is stored in the `./jmri_config` directory which is mounted to the container. This ensures your settings persist between container restarts. 