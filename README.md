# Turbulent Test

Start an event reminder WebSocket server. Any client can connect and send formatted command to the server. The event reminder command lets add an event and define a time in milliseconds after which all connected clients are informed of the event reached time.

## Startup

Without any configuration the website will listen on the `8999` port. That can be changed in the configuration or with the env `TURBULENT_WS_PORT`. No console message is displayed to acknowledge the good start.

## Message Command Format

```json
{
    "command": "COMMAND_NAME",
    "options": {}
}
```
## Event Reminder Command Format

```json
{
    "command": "ADD_EVENT_REMINDER",
    "options": {
        "name": "EventName",
        "time": 1000
    }
}
```
| `time` is in milliseconds

All the message from the client must be stringify elsewhere the client will be notified by an error.

## Scripts

#### `npm run start:dev`

Starts the application in development using `nodemon` and `ts-node` to do hot reloading.

#### `npm run lint`

Lint the entire project

#### `npm run prettier-format`

Format all the files in the project

#### `npm run prettier-watch`

Format a file afther it has beem save

#### `npm run test`

Start the project tests

#### `npm run coverage`

Start the project tests and display the test coverage

## Improuvment

We can easily improve this project by adding some tests and some overall management like configuration.

Furthermore, nothing has been done for the compilation and the deployment (like a Dockerfile) and we could add some documentation too.

-----

| @Credits for the starter kit: `stemmlerjs/simple-typescript-starter`
