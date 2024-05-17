"use client";
import React, { useState, useEffect } from "react";
import "./global.css";

import { signIn } from "next-auth/react";
import { ChangeEvent } from "react";
import { setCookie,getCookie } from "cookies-next";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { redirect } from "@/lib/auth";
import config from "@/lib/utils"
export default function Login() {
  const [isLoginForm, setIsLoginForm] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    if (!isLoggedIn) {
      redirect();
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

  const res = await fetch("${config.apiUrl}/api/login", {
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
      const res = await fetch("${config.apiUrl}/api/register", {
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

              <div className="field btn">
                <div className="btn-layer"></div>
                <a
                  onClick={async () => {
                    setGoogleLoading(true);
                    signIn("google", { callbackUrl });
                    setGoogleLoading(false);
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height: "100%",
                    width: "100%",
                    zIndex: 1,
                    position: "relative",
                    background: "none",
                    border: "none",
                    color: "#fff",
                    borderRadius: "15px",
                    fontSize: "20px",
                    fontWeight: 500,
                    textDecoration: "none",
                    cursor: "pointer",
                  }}
                >
                  {loadings ? "Loading" : (<><p className="mr-2">Continue with</p><svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="35" height="35" viewBox="0 0 48 48">
<path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
</svg></>)}
                </a>
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
