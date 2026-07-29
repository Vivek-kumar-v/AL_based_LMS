import axiosInstance from "./axiosInstance";

export const askAIApi = async (data) => {
  const res = await axiosInstance.post("/ai/ask", data);
  return res.data;
};