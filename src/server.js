const express = require("express");
const mongoose = require('mongoose');
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const usersRoutes = require('./routes/users-route');
const { UserService } = require("./services/users.service");
mongoose.connect('mongodb://localhost/ochat', {useNewUrlParser: true, useUnifiedTopology: true})
.then(()=> {
  console.log('Connected to db...');
}).catch(err=> console.log('Could not connect to db'));

app.use(express.static("public"));

let users = [];

const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

// app.use('/auth', usersRoutes);

io.on("connection", (socket) => {
  console.log('connected user');
  if (users.indexOf(socket.id) == -1) {
    users.push(socket.id);
  }

  socket.emit("users count", (userCount) => {
    userCount = users.length;
    io.emit("users count", userCount);
  });

  socket.on("chat message", (msg, user) => {

    console.log(msg)
    let message = `${socket.id}: ${msg}`;
    if (user) {
      io.to(user).emit("chat message", message);
      io.to(socket.id).emit("chat message", message);
    } else {
      io.emit("chat message", message);
    }
  });


  socket.on("register user", (userName) => {
    console.log(userName)
    const service = new UserService();
    service.addUser(userName).then( r=>{
      console.log('result==> ',r);
      io.emit("register user", r);
    }).catch(e=>{
      console.log(e)
      io.emit("register  user", e);
    })
    
  });

  socket.on("disconnect", (socket) => {
    var i = users.indexOf(socket);
    users.splice(i, 1);

    io.emit("users count", users.length);
  });
});

http.listen(PORT, () => {
  console.log(`listening on port : ${PORT}`);
});
