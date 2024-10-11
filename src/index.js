"use strict";
const webSocket = require("ws");
const strapi = require("@strapi/strapi");
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
    const wss = new webSocket.Server({ noServer: true });

    wss.on("connection", (ws, req) => {
      let userId;

      ws.on("message", async (message) => {
        
        const parsedMessage = JSON.parse(message.toString());

       
        if (parsedMessage.action === "connect") {
          userId = parsedMessage.userId;
          console.log(`User connected: ${userId}`);
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

      ws.send("Welcome to the WebSocket server!");
    });

    strapi.server.httpServer.on("upgrade", (request, socket, head) => {
      if (request.url === "/ws") {
        wss.handleUpgrade(request, socket, head, (ws) => {
          wss.emit("connection", ws, request);
        });
      } else {
        socket.destroy();
      }
    });

    strapi.log.info("WebSocket server initialized");
  },
};
