import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { io } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import { getPoll, votePoll, checkVoteStatus } from "../lib/api";
import { toast } from "react-toastify";

const socket = io(import.meta.env.VITE_SOCKET_URL, {
  transports: ["websocket"],
});
export default function PollPage() {
  const { id } = useParams();
  const [poll, setPoll] = useState(null);
  const [voted, setVoted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState(null);

  const getDeviceToken = () => {
    let token = localStorage.getItem("deviceToken");
    if (!token) {
      token = uuidv4();
      localStorage.setItem("deviceToken", token);
    }
    return token;
  };

  useEffect(() => {
    setLoading(true);

    const deviceToken = getDeviceToken();

    Promise.all([getPoll(id), checkVoteStatus(id, deviceToken)])
      .then(([pollResponse, voteStatusResponse]) => {
        setPoll(pollResponse.data);

        if (voteStatusResponse.data.hasVoted) {
          setVoted(true);
          setSelectedOption(voteStatusResponse.data.optionId);
        }

        setLoading(false);
      })
      .catch((err) => {
        toast.error("Failed to fetch poll data. Please try again.");
        console.error("Failed to fetch poll data:", err);
        setLoading(false);
      });

    socket.emit("joinPoll", id);

    socket.on("pollUpdated", (data) => {
      if (data.pollId === id) {
        setPoll((prev) => ({
          ...prev,
          options: data.options,
        }));
      }
    });

    return () => {
      socket.off("pollUpdated");
    };
  }, [id]);

  const handleVote = (optionId) => {
    const deviceToken = getDeviceToken();
    setSelectedOption(optionId);

    votePoll(id, { optionId, deviceToken })
      .then(() => {
        toast.success("Vote submitted successfully!");
        setVoted(true);
      })
      .catch((err) => {
        const errorMessage = err.response?.data?.message;

        if (errorMessage?.includes("already voted")) {
          toast.warning("You have already voted on this poll!");
          setVoted(true);
        } else if (errorMessage?.includes("Duplicate vote")) {
          toast.warning("Duplicate vote detected. You can only vote once.");
          setVoted(true);
        } else if (err.response?.status === 404) {
          toast.error("Poll or option not found.");
        } else if (err.response?.status === 500) {
          toast.error("Server error. Please try again later.");
        } else {
          toast.error("Failed to submit vote. Please try again.");
        }

        console.error("Failed to submit vote:", err);
        setSelectedOption(null);
      });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading poll...</p>
        </div>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-lg">
          <p className="text-red-500 font-semibold text-lg">Poll not found</p>
        </div>
      </div>
    );
  }

  const totalVotes = poll.options.reduce((acc, o) => acc + o.votes, 0);

  const colors = [
    "bg-purple-500",
    "bg-blue-500",
    "bg-green-500",
    "bg-orange-500",
    "bg-pink-500",
    "bg-teal-500",
  ];

  return (
    <div className="min-h-screen bg-gray-100 p-5">
      <div className="max-w-xl mx-auto mt-12">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
            {poll.question}
          </h2>
          <p className="text-gray-500 text-sm text-center mb-8">
            {totalVotes} {totalVotes === 1 ? "vote" : "votes"} total
          </p>

          <div className="space-y-4">
            {poll.options.map((option, index) => {
              const percentage =
                totalVotes === 0
                  ? 0
                  : Math.round((option.votes / totalVotes) * 100);
              const colorClass = colors[index % colors.length];
              const isSelected = selectedOption === option._id;

              return (
                <div key={option._id} className="relative">
                  {!voted ? (
                    <button
                      onClick={() => handleVote(option._id)}
                      disabled={voted}
                      className={`w-full text-left px-5 py-4 rounded-xl border-2 transition-all duration-200 ${
                        isSelected
                          ? "border-purple-500 bg-purple-50"
                          : "border-gray-200 hover:border-purple-400 hover:bg-purple-50"
                      }`}
                    >
                      <span className="font-medium text-gray-700">
                        {option.text}
                      </span>
                    </button>
                  ) : (
                    <div
                      className={`relative overflow-hidden rounded-xl border-2 transition-all duration-300 ${
                        isSelected ? "border-purple-500" : "border-gray-200"
                      }`}
                    >
                      <div
                        className={`absolute inset-0 ${colorClass} opacity-20 transition-all duration-500`}
                        style={{ width: `${percentage}%` }}
                      />
                      <div className="relative px-5 py-4 flex justify-between items-center">
                        <span
                          className={`font-medium ${
                            isSelected ? "text-purple-700" : "text-gray-700"
                          }`}
                        >
                          {option.text}
                          {isSelected && (
                            <span className="ml-2 text-purple-500">✓</span>
                          )}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-500">
                            {option.votes}{" "}
                            {option.votes === 1 ? "vote" : "votes"}
                          </span>
                          <span
                            className={`font-bold ${
                              isSelected ? "text-purple-600" : "text-gray-700"
                            }`}
                          >
                            {percentage}%
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {voted && (
            <p className="text-center text-gray-500 text-sm mt-6">
              Thanks for voting! Results update in real-time.
            </p>
          )}
        </div>

        <div className="text-center mt-6">
          <button
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              toast.success("Link copied to clipboard!");
            }}
            className="px-6 py-3 bg-white hover:bg-gray-50 text-gray-700 rounded-xl shadow-md font-medium transition-colors"
          >
            📋 Share Poll
          </button>
        </div>
      </div>
    </div>
  );
}
