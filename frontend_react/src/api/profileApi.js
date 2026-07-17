import api from "./axios";

const profileApi = {
  me() {
    return api.get("/me");
  },

  update(formData) {
    return api.post("/profile", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },

  changePassword(data) {
    return api.put("/profile/password", data);
  },
};

export default profileApi;