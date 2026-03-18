const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const multer = require("multer");
const http = require("http");
const { Server } = require("socket.io");
const { initSocketServer } = require("./socket");

dotenv.config();

const app = express();
const server = http.createServer(app);

app.use(
  cors({
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
      : "*",
  })
);
app.use(express.json());

const path = require("path");

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/courts", require("./routes/courtRoutes"));
app.use("/api/events", require("./routes/eventRoutes"));
app.use("/api/event-bookings", require("./routes/eventBookingRoutes"));
app.use("/api/bookings", require("./routes/bookingRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/slides", require("./routes/slideRoutes"));
app.use("/api/faqs", require("./routes/faqRoutes"));
app.use("/api/news", require("./routes/newsRoutes"));

app.get("/", (req, res) => {
  res.send("Court Booking API running");
});

app.use((err, _req, res, next) => {
  if (!err) return next();

  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: err.message });
  }

  if (err.message === "Only images allowed") {
    return res.status(400).json({ message: err.message });
  }

  console.error(err);
  return res.status(500).json({ message: "Server error" });
});

const PORT = process.env.PORT || 5000;

initSocketServer(server, Server);

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
