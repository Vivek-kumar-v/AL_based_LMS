import axiosInstance from "./axiosInstance";

export const getAllConceptsApi = async (params = {}) => {
  const res = await axiosInstance.get("/concepts", { params });
  return res.data;
};

export const getConceptDetailsApi = async (conceptId) => {
  const res = await axiosInstance.get(`/concepts/${conceptId}`);
  return res.data;
};

export const getTopPYQConceptsApi = async (params = {}) => {
  const res = await axiosInstance.get("/concepts/top-pyq", { params });
  return res.data;
};

export const getWeakConceptsApi = async () => {
  const res = await axiosInstance.get("/concepts/weak");
  return res.data;
};

export const getConceptByIdApi = async (conceptId) => {
  const res = await axiosInstance.get(`/concepts/${conceptId}`);
  return res.data;
};

