import {getCookie} from "cookies-next"
export const redirect = () => {
  const token = getCookie('token');
  if (!token) {
    window.location.href = "/";
  }
};
