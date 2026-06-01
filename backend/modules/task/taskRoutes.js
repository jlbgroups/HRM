const express = require("express");
const router = express.Router();

const auth = require("../../middleware/authMiddleware");
const taskController = require("./taskController");

router.get("/my-team", auth, taskController.getMyTeam);
router.post("/assign", auth, taskController.assignTask);
router.get("/assigned", auth, taskController.getAssignedTasks);
router.get("/my-tasks", auth, taskController.getMyTasks);
router.patch("/:id/status", auth, taskController.updateTaskStatus);

module.exports = router;