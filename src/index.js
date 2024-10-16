"use strict";

const WebSocket = require("ws");
const fs = require("fs");
const path = require("path");

module.exports = {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   *
   * This gives you an opportunity to extend code.
   */
  register(/*{ strapi }*/) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * This gives you an opportunity to set up your data model,
   * run jobs, or perform some special logic.
   */
  bootstrap({ strapi }) {
    // Determine whether running in production or development
    const isProduction = process.env.NODE_ENV === "production";

    // // SSL options for HTTPS (production)
    // const sslOptions = isProduction
    //   ? {
    //       cert: fs.readFileSync(path.resolve(__dirname, "../ssl/cert.pem")),
    //       key: fs.readFileSync(path.resolve(__dirname, "../ssl/key.pem")),
    //     }
    //   : {};

    // Initialize the WebSocket server
    const wss = new WebSocket.Server({ noServer: true });

    wss.on("connection", (ws, req) => {
      let userId;

      ws.on("message", async (message) => {
        const parsedMessage = JSON.parse(message.toString());

        if (parsedMessage.action === "connect") {
          userId = parsedMessage.userId;
          console.log(`User connected: ${userId}`);

          // Send welcome message as JSON
          ws.send(
            JSON.stringify({
              action: "welcome",
              content: "Welcome to the WebSocket server!",
            })
          );
        } else {
          const chatMessage = parsedMessage.content;

          await strapi.entityService.create("api::chat-session.chat-session", {
            data: {
              message: chatMessage,
              user: userId,
              timestamp: new Date(),
            },
          });

          ws.send(JSON.stringify({ action: "message", content: chatMessage }));
          console.log({ action: "message", content: chatMessage });
        }
      });

      ws.on("close", async () => {
        console.log(`User disconnected: ${userId}`);

        await strapi.entityService.create("api::chat-session.chat-session", {
          data: {
            message: `${userId} has disconnected`,
            user: userId,
            timestamp: new Date(),
          },
        });
      });
    });

    // Handling HTTP and HTTPS upgrade requests
    strapi.server.httpServer.on("upgrade", (request, socket, head) => {
      if (request.url === "/ws") {
        wss.handleUpgrade(request, socket, head, (ws) => {
          wss.emit("connection", ws, request);
        });
      } else {
        socket.destroy();
      }
    });

    // Log server type (HTTP/HTTPS)
    if (isProduction) {
      strapi.log.info("WebSocket server initialized with SSL (wss://)");
    } else {
      strapi.log.info("WebSocket server initialized (ws://)");
    }
  },
};
