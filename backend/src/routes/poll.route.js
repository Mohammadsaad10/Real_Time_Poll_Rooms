import { Router } from "express";
import {
  createPoll,
  getPoll,
  votePoll,
  checkVoteStatus,
} from "../controllers/poll.controller.js";

const router = Router();

router.post("/create", createPoll);
router.get("/:id", getPoll);
router.get("/:id/vote-status", checkVoteStatus);
router.post("/:id/vote", votePoll);

export default router;
