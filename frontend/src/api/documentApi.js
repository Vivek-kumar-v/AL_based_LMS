import axiosInstance from "./axiosInstance";

export const uploadDocumentApi = async (formData) => {
  const res = await axiosInstance.post("/documents/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};

export const getAllNotesApi = async () => {
  const res = await axiosInstance.get("/documents/notes");
  return res.data;
};

export const getAllPYQsApi = async () => {
  const res = await axiosInstance.get("/documents/pyqs");
  return res.data;
};

export const deleteDocumentApi = async (documentId) => {
  const res = await axiosInstance.delete(`/documents/${documentId}`);
  return res.data;
};

export const processOCRApi = async (documentId) => {
  const res = await axiosInstance.post(`/documents/${documentId}/ocr/`);
  return res.data;
};

export const getDocumentLLMTextApi = async (documentId) => {
  return axiosInstance.get(`/documents/${documentId}/llm-text`);
};


export const updateDocumentApi = async (documentId, data) => {
  return axiosInstance.patch(`/documents/${documentId}`, data);
};

export const getDocumentByIdApi = async (documentId) => {
  return axiosInstance.get(`/documents/${documentId}`);
};


export const smartSearchApi = (params) =>
  axiosInstance.get("/search/documents", { params });
