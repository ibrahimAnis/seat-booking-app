const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const PORT = process.env.PORT || 3000;
const SECRET_KEY = "your_secret_key";

let seats = Array(10000).fill(null); // 100x100 grid

app.use(bodyParser.json());

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

app.post("/login", (req, res) => {
  const { username } = req.body;
  const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: "30s" });
  res.json({ token });
});

io.on("connection", (socket) => {
  socket.on("authenticate", (token) => {
    try {
      const decoded = jwt.verify(token, SECRET_KEY);
      socket.decoded = decoded;
      const res = {
        seats: seats,
        success: true,
      };
      socket.emit("authenticated", res);
    } catch (err) {
      const res = {
        seats: null,
        success: false,
      };
      socket.emit("authenticated", { success: false });
    }
  });

  socket.on("bookSeat", ({ req }) => {
    try {
      token = req.token;
      seatIndex = req.seatIndex;
      const decoded = jwt.verify(token, SECRET_KEY);
      console.log(decoded);
      const username = socket.decoded.username;
      if (seats[seatIndex] === null) {
        seats[seatIndex] = username;
        io.emit("seatBooked", { seatIndex, username });
        socket.emit("bookingSuccess", { username, seatIndex });
      } else {
        socket.emit("bookingFailed");
      }
    } catch (err) {
      console.log("auth failed");
      socket.emit("authenticated", { success: false });
    }
  });
});

app.get("/seats", (req, res) => {
  res.json(seats);
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
