"use client";
import React, { useState, useEffect } from "react";
import "./global.css";

import { signIn } from "next-auth/react";
import { setCookie,getCookie } from "cookies-next";
import { useRouter } from 'next/navigation'
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { redirect } from "@/lib/auth";
import config from "@/lib/utils"
export default function Login() {
    const router = useRouter()
  const [isLoginForm, setIsLoginForm] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    if (isLoggedIn) {
      router.replace("/watchlist");
    }
  }, [isLoggedIn]);

  const toggleForm = () => {
    setIsLoginForm((prev) => !prev);
  };

  const [loading, setLoading] = useState(false);
  const [loadings, setGoogleLoading] = useState(false);
  useEffect(() => {
    const token = getCookie('token');
    if (token) {
      window.location.href = "/watchlist";
    }
  }, []);
  const [formValues, setFormValues] = useState({
    email: "",
    password: "",
  });
 

 
  const callbackUrl = "/";

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
       if ( !formValues.email || !formValues.password) {
    toast.error("Please provide all details");
    setLoading(false);
    return;
  }

  const res = await fetch("http://34.227.101.23:8000/api/login", {
    method: "POST",
    body: JSON.stringify(formValues),
    headers: {
      "Content-Type": "application/json",
    },
  });

      if (res.status==200) {
        toast.success("Succesfully signed-in");
        const data = await res.json();
        setCookie('token', data.token, { expires: new Date(data.expiry_timestamp) });
        setIsLoggedIn(true);
        window.location.href='/watchlist';
      } else {
        toast.error("Invalid email or password");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const [formvalues, setformvalues] = useState({

    name: "",
    email: "",
    password: "",
  });
  const onSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {

    if (!formvalues.name || !formvalues.email || !formvalues.password) {
    toast.error("Please provide all details");
    setLoading(false);
    return;
  }
      const res = await fetch("http://34.227.101.23:8000/api/register", {
        method: "POST",
        body: JSON.stringify(formvalues),
        headers: {
          "Content-Type": "application/json",
        },
      });
      

      if (res.status != 200 || res.status == 500) {
        const error = await res.json();
        const message = error.message;
         toast.error(message)
      }

      const error = await res.json();
      const message = error.message;
      toast.success(message);
      setTimeout(() => {
        signIn(undefined, { callbackUrl: "/" });
      }, 2000);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormValues({ ...formValues, [name]: value });
  };

  const handlechange = (event) => {
    const { name, value } = event.target;
    setformvalues({ ...formvalues, [name]: value });
  };

  return (
    <>
      
      <div className="wrapper mb-24">
        <div className="title-text">
          <div className="title login">Login Form</div>
          <div className="title signup">Signup Form</div>
        </div>
        <div className="form-container">
          <div className="slide-controls">
            <input
              type="radio"
              name="slide"
              id="login"
              checked={isLoginForm}
              onChange={toggleForm}
            />
            <input
              type="radio"
              name="slide"
              id="signup"
              checked={!isLoginForm}
              onChange={toggleForm}
            />
            <label htmlFor="login" className="slide login">
              Login
            </label>
            <label htmlFor="signup" className="slide signup">
              Signup
            </label>
            <div className="slider-tab"></div>
          </div>
          <div className="form-inner">
            <form
              onSubmit={onSubmit}
              className={`login ${isLoginForm ? "" : "hidden"}`}
            >
              <div className="field">
                <input
                  type="text"
                  name="email"
                  value={formValues.email}
                  onChange={handleChange}
                  placeholder="Email Address"
                  required
                />
              </div>
              <div className="field">
                <input
                  type="password"
                  name="password"
                  value={formValues.password}
                  onChange={handleChange}
                  placeholder="Password"
                />
              </div>
              <div className="pass-link">
                <a href="/forgot-password">Forgot password?</a>
              </div>
              <div className="field btn">
                <div className="btn-layer"></div>
                <input
                  type="submit"
                  disabled={loading}
                  value={loading ? "Loading..." : "Sign In"}
                />
              </div>

              
            </form>
            <form
              onSubmit={onSignUp}
              className={`signup ${isLoginForm ? "hidden" : ""}`}
            >
          
              <div className="field">
                <input
                  required
                  type="name"
                  name="name"
                  value={formvalues.name}
                  onChange={handlechange}
                  placeholder="Name"
                />
              </div>
              <div className="field">
                <input
                  required
                  type="email"
                  name="email"
                  value={formvalues.email}
                  onChange={handlechange}
                  placeholder="Email address"
                />
              </div>

              
              <div className="field">
                <input
                  required
                  type="password"
                  name="password"
                  value={formvalues.password}
                  onChange={handlechange}
                  placeholder="Password"
                />
              </div>

              <div className="field btn">
                <div className="btn-layer"></div>
                <input
                  type="submit"
                  disabled={loading}
                  value={loading ? "Loading..." : "Sign Up"}
                />
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
