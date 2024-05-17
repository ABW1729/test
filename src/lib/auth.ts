"use client"
import {getCookie} from "cookies-next"
import { useRouter } from 'next/navigation'
export const redirect = () => {
  const token = getCookie('token');
  if (!token) {
   router.replace("/");
  }
};
