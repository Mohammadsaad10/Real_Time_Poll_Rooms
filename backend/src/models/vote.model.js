import mongoose from "mongoose";

const voteSchema = new mongoose.Schema(
  {
    pollId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Poll",
      required: true,
    },

    optionId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    ipHash: {
      type: String,
      required: true,
    },

    deviceToken: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

//unique index to prevent multiple votes from the same IP and device for the same poll.
voteSchema.index({ pollId: 1, ipHash: 1 }, { unique: true }); //one vote per ip per poll
voteSchema.index({ pollId: 1, deviceToken: 1 }, { unique: true }); //one vote per deviceToken per poll

const Vote = mongoose.model("Vote", voteSchema);

export default Vote;
