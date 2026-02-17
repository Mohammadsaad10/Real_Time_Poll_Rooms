import mongoose from "mongoose";

const optionSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
    },
    votes: {
      type: Number,
      default: 0,
    },
  },
  { _id: true },
);

const pollSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
    },
    options: {
      type: [optionSchema],
      validate: [
        (arr) => arr.length >= 2,
        "At least two options are required.",
      ],
    },
  },
  { timestamps: true },
);

const Poll = mongoose.model("Poll", pollSchema);
export default Poll;
