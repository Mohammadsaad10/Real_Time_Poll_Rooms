import Poll from "../models/poll.model.js";
import Vote from "../models/vote.model.js";
import { hashIP } from "../utils/hash.js";

//create a new poll
export const createPoll = async (req, res) => {
  try {
    const { question, options } = req.body;

    if (!question || !options || options.length < 2) {
      return res
        .status(400)
        .json({ message: "Question and at least two options are required." });
    }

    //formatting options because the model expects an array of objects with text and votes properties.
    const formattedOptions = options.map((option) => ({ text: option }));

    const newPoll = await Poll.create({ question, options: formattedOptions });

    res.status(201).json({
      pollId: newPoll._id,
      newPoll,
      message: "Poll created successfully.",
    });
  } catch (error) {
    console.error("Error creating poll:", error);
    res.status(500).json({ message: "Failed to create poll." });
  }
};

//Get poll by id
export const getPoll = async (req, res) => {
  try {
    const pollId = req.params.id;

    const poll = await Poll.findById(pollId);

    if (!poll) {
      return res.status(404).json({ message: "Poll not found." });
    }

    res.status(200).json(poll);
  } catch (error) {
    console.error("Error fetching poll:", error);
    res.status(500).json({ message: "Failed to fetch poll." });
  }
};

//vote on a poll option.
export const votePoll = async (req, res) => {
  try {
    const { optionId, deviceToken } = req.body;

    if (!deviceToken) {
      return res.status(400).json({ message: " Device Token is required!" });
    }

    const pollId = req.params.id;

    const poll = await Poll.findById(pollId);

    if (!poll) {
      return res.status(404).json({ message: "Poll not found." });
    }

    const option = poll.options.id(optionId);

    if (!option) {
      return res.status(404).json({ message: "Option not found." });
    }

    //Get IP and Hash it.
    const ip = req.ip;
    const ipHash = hashIP(ip);

    //App level duplicate check.
    const existingVote = await Vote.findOne({
      pollId: poll._id,
      $or: [{ ipHash }, { deviceToken }],
    });

    if (existingVote) {
      return res
        .status(400)
        .json({ message: "You have already voted on this poll." });
    }

    //save vote record.
    await Vote.create({
      pollId: poll._id,
      optionId,
      ipHash,
      deviceToken,
    });

    //earlier we were updating the option in memory and then saving the entire poll document which can lead to concurrency issues.
    //option.votes += 1;
    //await poll.save();

    //Now we are using mongodb's atomic update operator $inc for preventing concurrency issues and ensuring accurate vote counts even when multiple votes are cast simultaneously.

    await Poll.updateOne(
      { _id: pollId, "options._id": optionId },
      { $inc: { "options.$.votes": 1 } },
    );

    const updatedPoll = await Poll.findById(pollId);

    const io = req.app.get("io");
    io.to(pollId).emit("pollUpdated", {
      pollId,
      options: updatedPoll.options,
    });

    res
      .status(200)
      .json({ updatedPoll, message: "Vote recorded successfully." });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        message: "Duplicate vote detected",
      });
    }

    console.error("Error voting on poll:", error);
    res.status(500).json({ message: "Failed to vote on poll." });
  }
};

//Check if user has voted on a poll
export const checkVoteStatus = async (req, res) => {
  try {
    const pollId = req.params.id;
    const { deviceToken } = req.query;

    if (!deviceToken) {
      return res.status(200).json({ hasVoted: false, optionId: null });
    }

    const ip = req.ip;
    const ipHash = hashIP(ip);

    const existingVote = await Vote.findOne({
      pollId,
      $or: [{ ipHash }, { deviceToken }],
    });

    if (existingVote) {
      return res
        .status(200)
        .json({ hasVoted: true, optionId: existingVote.optionId });
    }

    res.status(200).json({ hasVoted: false, optionId: null });
  } catch (error) {
    console.error("Error checking vote status:", error);
    res.status(500).json({ message: "Failed to check vote status." });
  }
};
