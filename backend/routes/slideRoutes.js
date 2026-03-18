const express = require("express");

const {
  getPublicSlides,
  getAllSlidesAdmin,
  createSlide,
  updateSlide,
  deleteSlide,
  reorderSlides,
} = require("../controllers/slideController");
const uploadSlides = require("../middleware/uploadSlides");

const router = express.Router();

router.get("/", getPublicSlides);
router.get("/admin/all", getAllSlidesAdmin);
router.put("/reorder", reorderSlides);
router.post("/", uploadSlides.single("picture"), createSlide);
router.put("/:id", uploadSlides.single("picture"), updateSlide);
router.delete("/:id", deleteSlide);

module.exports = router;
