import axiosInstance from "./axiosInstance";

export const getDashboardApi = async () => {
  const res = await axiosInstance.get("/dashboard");
  return res.data;
};
