const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");

const {
  createCourt,
  getCourts,
  getCourtById,
  updateCourt,
  deleteCourt
} = require("../controllers/courtController");

router.post("/", upload.single("picture"), createCourt);
router.put("/:id", upload.single("picture"), updateCourt);

router.get("/", getCourts);
router.get("/:id", getCourtById);
router.delete("/:id", deleteCourt);

module.exports = router;
