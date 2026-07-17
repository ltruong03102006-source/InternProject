import api from "./axios";

const documentApi = {
  getAll(params = {}) {
    return api.get("/documents", { params });
  },

  getById(id) {
    return api.get(`/documents/${id}`);
  },

  create(formData) {
    return api.post("/documents", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  download(id) {
    return api.get(`/documents/${id}/download`, {
      responseType: "blob",
    });
  },

  remove(id) {
    return api.delete(`/documents/${id}`);
  },
};

export default documentApi;