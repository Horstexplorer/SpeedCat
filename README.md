# SpeedCat
###### A free and open-source, self-hosted tool for estimating network performance.  

Developed with TypeScript, React, and native web APIs, SpeedCat is built for universal compatibility across desktop and mobile platforms, accessible through any modern web browser.  
All calculations are handled by the client, requiring only a web server of your choice to host the necessary static files.  
Tests are conducted exclusively between the client and your self-hosted server, ensuring privacy and peace of mind.  

A demo is available at [demo.speedc.at](https://demo.speedc.at). Please handle with care; it's a lightweight environment.

<table>
  <tr>
    <td>
      <img src=".github/images/desktop.png" alt="Speedcat Desktop View">
    </td>
    <td>
      <img src=".github/images/mobile.png" alt="Speedcat Mobile View">
    </td>
  </tr>
</table>

## Setup
### Prebuilt Docker image
Ready-to-use Docker images using Nginx are available and easily deployable with Docker Compose.
```yaml
services:
  speedcat:
    image: ghcr.io/horstexplorer/speedcat:<release>
    container_name: SpeedCat
    restart: unless-stopped
    ports:
      - 8080:8080
```

### Manual
Build the application using npm, then deploy it on your own web server or within a custom Docker container.
```bash
# Install dependencies
npm install

# Build application
npm run build

# Generate test file payloads (not required for building the docker image in the next step)
./test-file-setup.sh
```
Either copy the contents of the `dist` folder to your web server’s root directory or build a local Docker image for deployment.
```bash
# With docker build
docker build -t speedcat:selfbuilt .

# or buildx
docker buildx build -t speedcat:selfbuilt .
```

## Customization
You can customize the payload files available to SpeedCat by modifying the `test-file-index.json`.  
At a minimum, the configuration should include the following structure:
```json
{
  "testFiles": [
    {
      "path": "test-files/0-mibibytes",
      "byteSize": 0,
      "flags": {
        "default": true
      }
    },
    {
      "path": "test-files/25-mibibytes",
      "byteSize": 26214400,
      "flags": {
        "default": true,
        "selectable": true
      }
    }
  ]
}
```
Each entry in the `test-file-index.json` must include:

- A valid `path` pointing to a directory (using `test-files` is a recommended choice).
- A unique `filename` to avoid collisions.
- A `byteSize` value used to generate the file with random data.

Optional properties:

- `selectable`: Determines if the file is shown as an option in the UI.
- `default`: Marks the file as pre-selected in the UI.

To ensure correct operation, the configuration must include:

- **One file** with:
    - `byteSize`: `0`
    - `default`: `true`

- **One file** with:
    - `byteSize`: greater than `0`
    - `selectable`: `true`
    - `default`: `true`