import axios from "axios";

export const getExerciseList = async () => {
  return axios.get("/api/exercise/list", {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
};