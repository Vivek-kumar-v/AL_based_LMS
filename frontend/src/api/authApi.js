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

export const updateProfileApi = async (payload) => {
  return axiosInstance.put("/users/update-profile", payload);
};

export const uploadAvatarApi = async (file) => {
  const formData = new FormData();
  formData.append("avatar", file);

  return axiosInstance.post("/users/upload-avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const changePasswordApi = async (payload) => {
  return axiosInstance.put("/users/change-password", payload);
};

export const deleteAccountApi = async () => {
  return axiosInstance.delete("/users/delete-account");
};
