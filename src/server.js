const express = require("express");

const mongoose = require("mongoose");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const usersRoutes = require("./routes/users-route");
const { UserService } = require("./services/users.service");

// var config = JSON.parse(process.env.APP_CONFIG); // Production
const cfg = require("./config/config.development.json");
var config = cfg.APP_CONFIG; // Development
const mongoPassword = config.mongo.password;

mongoose
  .connect( 
    "mongodb://localhost/ochat",// +
      // config.mongo.user +
      // ":" +
      // encodeURIComponent(mongoPassword) +
      // "@" +
      // config.mongo.hostString,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("Connected to db...");
  })
  .catch((err) => console.log("Could not connect to db", err));

app.use(express.static("public"));

var onlineUsers = [];

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", async (socket) => {
  if (socket.handshake.query && socket.handshake.query.token) {
    addOrUpdateUser(socket.handshake.query.token, socket.id);

    const service = new UserService();

    let currentUser = await service.getUser(socket.handshake.query.token);

    if (
      onlineUsers.indexOf(currentUser.username) == -1 &&
      currentUser != null
    ) {
      onlineUsers.push(currentUser.username);
    }

    socket.on("online users", (users) => {
      users = { onlineUsers: onlineUsers };
      io.emit("online users", users);
    });

    socket.on("chat message", async (msg, toUser) => {
      let message = `${currentUser.username}: ${msg}`;
      if (toUser) {
        const toInfo = await service.getUser(toUser);
        io.to(toInfo).emit("chat message", message);
        io.to(socket.id).emit("chat message", message);
      } else {
        io.emit("chat message", message);
      }
    });

    socket.on("disconnect", (socket) => {
      var i = onlineUsers.indexOf(currentUser.username);
      onlineUsers.splice(i, 1);
      const users = { onlineUsers: onlineUsers };
      io.emit("online users", users);
    });

    socket.on('buzz', (socket)=>{
      io.emit('buzz', `${currentUser} buzzed!!!`);
    })
  } else {
    socket.on("register user", async (username, password) => {
      const service = new UserService();
      service
        .addUser(username, password, socket.id)
        .then((r) => {
          io.emit("register user", r);
        })
        .catch((e) => {
          io.emit("register  user", e);
        });
    });
  }
});

async function addOrUpdateUser(username, connectionId) {
  const service = new UserService();
  const result = await service.syncUserInfo(username, connectionId);
  return result;
}

http.listen(PORT, () => {
  console.log(`listening on port : ${PORT}`);
});
