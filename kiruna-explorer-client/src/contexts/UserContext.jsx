import {React, useState, useContext, createContext } from "react";

import API from "../API/API.mjs"

const UserContext = createContext();

// Provider Component
export const UserProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState({});

  const logIn = async (credentials) => {
    try {
      const user = await API.logIn(credentials);
      setIsLoggedIn(true);
      setUser(user);
      console.log(`Welcome, ${user.username}!`, "success");
    } catch (error) {
      console.log(error, "danger");
    }
  };

  const logOut = async () => {
    await API.logOut();
    console.log(`Goodbye, ${user.username}!`, "success");
    setIsLoggedIn(false);
  };

  const checkAuth = async () => {
    const user = await API.getUserInfo();
    setIsLoggedIn(true);
    setUser(user);
  };

  return (
    <UserContext.Provider
      value={{ user, isLoggedIn, logIn, logOut, checkAuth }}
    >
      {children}
    </UserContext.Provider>
  );
};

// Custom Hook
export const useUserContext = () => useContext(UserContext);
