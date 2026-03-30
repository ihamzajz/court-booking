const express = require("express");

const {
  renderPrivacyPolicy,
  renderAccountDeletionPage,
  submitAccountDeletionRequest,
} = require("../controllers/complianceController");

const router = express.Router();

router.get("/privacy-policy", renderPrivacyPolicy);
router.get("/account-deletion", renderAccountDeletionPage);
router.post("/account-deletion", submitAccountDeletionRequest);

module.exports = router;
