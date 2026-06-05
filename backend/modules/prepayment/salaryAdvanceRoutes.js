const express = require("express");
const router = express.Router();
const auth = require("../../middleware/authMiddleware");
const roleCheck = require("../../middleware/roleCheck");
const {
  getAllAdvances,
  getAdvancesByStatus,
  requestAdvance,
  getMyAdvances,
  updateAdvanceStatus,
  deleteAdvance
} = require("../prepayment/salaryAdvanceController");

const isAdmin = roleCheck(["company_admin", "super_admin"]);
const isEmployee = roleCheck(["employee", "company_admin", "super_admin"]);

router.get("/all", auth, isAdmin, getAllAdvances);
router.get("/:status", auth, isAdmin, getAdvancesByStatus);
router.put("/update-status/:id", auth, isAdmin, updateAdvanceStatus);
router.delete("/:id", auth, isAdmin, deleteAdvance);
router.post("/request", auth, isEmployee, requestAdvance);
router.get("/my-requests/me", auth, isEmployee, getMyAdvances);

module.exports = router;