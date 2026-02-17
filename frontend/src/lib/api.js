import { axiosInstance } from "./axios.js";

export const createPoll = async ({ question, options }) => {
  const response = await axiosInstance.post("/polls/create", {
    question,
    options,
  });
  return response;
};

export const getPoll = async (pollId) => {
  const response = await axiosInstance.get(`/polls/${pollId}`);
  return response;
};

export const checkVoteStatus = async (pollId, deviceToken) => {
  const response = await axiosInstance.get(`/polls/${pollId}/vote-status`, {
    params: { deviceToken },
  });
  return response;
};

export const votePoll = async (pollId, { optionId, deviceToken }) => {
  const response = await axiosInstance.post(`/polls/${pollId}/vote`, {
    optionId,
    deviceToken,
  });
  return response;
};
