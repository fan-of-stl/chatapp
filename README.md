# Chat Application Backend

This repository contains the backend code for a chat application built using [Strapi](https://strapi.io/), a headless CMS that enables the creation and management of APIs quickly and efficiently.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [WebSocket Integration](#websocket-integration)
- [Testing WebSocket](#testing-websocket)
- [License](#license)

## Features

- User authentication and management
- Chat messaging functionality
- WebSocket support for real-time communication
- Chat session persistence in a local database
- Support for handling user disconnections and logging events

## Technologies Used

- [Strapi](https://strapi.io/) - Headless CMS
- Node.js - JavaScript runtime
- WebSocket - Real-time communication
- PostgreSQL / MongoDB - Database (configure as per your choice)

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/fan-of-stl/chatapp.git
   cd chatapp
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Configure your database connection in the `config/database.js` file based on your preferred database (PostgreSQL or MongoDB).

## Configuration

### Environment Variables

Create a `.env` file in the root directory and set the following variables:

```env
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
```

Make sure to replace the values with your actual database connection string and JWT secret.

## Running the Application

To run the Strapi application in development mode, use the following command:

```bash
npm run develop
```

Your Strapi application will be available at `http://localhost:1337`.

## API Endpoints

### Authentication

- **Login**

  - **Endpoint**: `POST /api/auth/local`
  - **Request Body**: 
    ```json
    {
      "identifier": "user_email_or_username",
      "password": "user_password"
    }
    ```
  - **Response**: Returns a JWT token upon successful login.

### Chat Sessions

- **Create Chat Session**

  - **Endpoint**: `POST /api/chat-sessions`
  - **Request Body**: 
    ```json
    {
      "message": "Chat message content",
      "userId": "associated_user_id"
    }
    ```

## WebSocket Integration

The backend supports WebSocket communication for real-time messaging. When a client connects, they can send messages, and the server will echo back the same messages. On disconnection, a message will be logged in the chat sessions.

### WebSocket Server Setup

Ensure that the WebSocket server is properly configured in your Strapi application. The WebSocket server is set to listen for incoming connections and handle message events.

#### Example WebSocket Code

```javascript
const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', (ws) => {
  ws.on('message', async (message) => {
    const parsedMessage = JSON.parse(message);
    
    const userId = parsedMessage.userId; // Extract userId from the message
    const chatMessage = parsedMessage.content; // Extract message content

    if (chatMessage) {
      // Echo back the same message
      ws.send(`Server received: ${chatMessage}`);

      // Save the message to Strapi
      await strapi.entityService.create("api::chat-session.chat-session", {
        data: {
          message: chatMessage,
          userId: userId,
          timestamp: new Date(),
        },
      });
    }
  });

  ws.send('Welcome to the WebSocket server!');
});
```

## Testing WebSocket

You can use [Postman](https://www.postman.com/) to test WebSocket connections by following these steps:

1. Open Postman.
2. Create a new WebSocket request by selecting the "WebSocket" tab.
3. Enter the WebSocket URL: `ws://localhost:1337`.
4. Send messages and observe responses.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
