"use client"
import {getCookie} from "cookies-next"
import { useRouter } from 'next/navigation'
export default Redirect = () => {
    const router = useRouter();
  const token = getCookie('token');
  if (!token) {
   router.replace("/");
  }
};
