import api from "./axios";

const subjectApi = {
  getAll(params = {}) {
    return api.get("/subjects", { params });
  },

  getById(id) {
    return api.get(`/subjects/${id}`);
  },

  create(data) {
    return api.post("/subjects", data);
  },

  update(id, data) {
    return api.patch(`/subjects/${id}`, data);
  },

  remove(id) {
    return api.delete(`/subjects/${id}`);
  },
};

export default subjectApi;