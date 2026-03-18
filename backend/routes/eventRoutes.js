const express = require("express");
const router = express.Router();
const upload = require("../middleware/uploadEvents");

const {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
} = require("../controllers/eventController");

router.post("/", upload.single("picture"), createEvent);
router.put("/:id", upload.single("picture"), updateEvent);

router.get("/", getEvents);
router.get("/:id", getEventById);
router.delete("/:id", deleteEvent);

module.exports = router;
