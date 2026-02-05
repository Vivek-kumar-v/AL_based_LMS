import axiosInstance from "./axiosInstance";

export const registerStudentApi = async (formData) => {
  // formData must include avatar file
  const res = await axiosInstance.post("/users/register", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const loginStudentApi = (data) => {
  return axiosInstance.post("/users/login", data);
};

export const logoutStudentApi = async () => {
  const res = await axiosInstance.post("/users/logout");
  return res.data;
};

export const getProfileApi = async () => {
  const res = await axiosInstance.get("/users/profile");
  return res.data;
};
