import { useState } from "react";
import { useNavigate } from "react-router";
import { createPoll } from "../lib/api";
import { toast } from "react-toastify";

export default function CreatePoll() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [pollId, setPollId] = useState("");
  const navigate = useNavigate();

  const handleOptionChange = (index, value) => {
    const updated = [...options];
    updated[index] = value;
    setOptions(updated);
  };

  const addOption = () => {
    setOptions([...options, ""]);
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = () => {
    if (!question.trim()) {
      toast.error("Please enter a question");
      return;
    }
    if (options.some((opt) => !opt.trim())) {
      toast.error("Please fill in all options");
      return;
    }

    createPoll({
      question,
      options,
    })
      .then((response) => {
        toast.success("Poll created successfully!");
        navigate(`/polls/${response.data.pollId}`);
      })
      .catch((error) => {
        toast.error("Failed to create poll. Please try again.");
        console.error("Failed to create poll:", error);
      });
  };

  const handleGoToPoll = () => {
    if (!pollId.trim()) {
      toast.error("Please enter a poll ID");
      return;
    }
    navigate(`/polls/${pollId.trim()}`);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-5">
      <div className="max-w-md mx-auto mt-12 p-8 bg-white rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Create a Poll
        </h2>

        <label className="text-sm font-semibold text-gray-600 mb-1 block">
          Your Question
        </label>
        <input
          className="w-full px-4 py-3 text-base border-2 border-gray-200 rounded-lg outline-none focus:border-purple-500 transition-colors mb-4"
          placeholder="What do you want to ask?"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />

        <div className="mt-5">
          <label className="text-sm font-semibold text-gray-600 mb-1 block">
            Options
          </label>
          {options.map((opt, index) => (
            <div key={index} className="flex gap-2 items-center mb-3">
              <input
                className="flex-1 px-4 py-3 text-base border-2 border-gray-200 rounded-lg outline-none focus:border-purple-500 transition-colors"
                placeholder={`Option ${index + 1}`}
                value={opt}
                onChange={(e) => handleOptionChange(index, e.target.value)}
              />
              {options.length > 2 && (
                <button
                  className="px-3 py-2 bg-red-400 hover:bg-red-500 text-white rounded-lg cursor-pointer text-base transition-colors"
                  onClick={() => removeOption(index)}
                  title="Remove option"
                >
                  ✕
                </button>
              )}
            </div>
          ))}

          <button
            className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer text-sm font-medium mb-5 transition-colors"
            onClick={addOption}
          >
            + Add Option
          </button>
        </div>

        <button
          className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg cursor-pointer text-base font-semibold transition-colors"
          onClick={handleSubmit}
        >
          Create Poll
        </button>
      </div>

      <div className="max-w-md mx-auto mt-6 p-6 bg-white rounded-2xl shadow-lg">
        <h3 className="text-lg font-semibold text-gray-700 mb-4 text-center">
          Already have a poll?
        </h3>
        <div className="flex gap-2">
          <input
            className="flex-1 px-4 py-3 text-base border-2 border-gray-200 rounded-lg outline-none focus:border-purple-500 transition-colors"
            placeholder="Enter Poll ID"
            value={pollId}
            onChange={(e) => setPollId(e.target.value)}
          />
          <button
            className="px-5 py-3 bg-gray-700 hover:bg-gray-800 text-white rounded-lg cursor-pointer text-base font-medium transition-colors"
            onClick={handleGoToPoll}
          >
            Go
          </button>
        </div>
      </div>
    </div>
  );
}
