import axiosInstance from "./axiosInstance";

export const markConceptRevisedApi = async (conceptId) => {
  const res = await axiosInstance.post(`/revision/${conceptId}`);
  return res.data;
};
