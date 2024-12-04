import { React, useState, useEffect, useContext, createContext } from "react";

import API from "../API/API.mjs"

const UserContext = createContext();

// Provider Component
export const UserProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState({});
  const [isVisitorLoggedIn, setisVisitorLoggedIn] = useState(() => {
    const visitor = localStorage.getItem("isVisitorLoggedIn");
    return visitor ? JSON.parse(visitor) : false; // Default to false
  });

  // Update localStorage whenever the visitor changes
  useEffect(() => {
    localStorage.setItem("isVisitorLoggedIn", JSON.stringify(isVisitorLoggedIn));
  }, [isVisitorLoggedIn]);

  const handleVisitor = () => {
    setisVisitorLoggedIn(prev => !prev);    
  }

  const logIn = async (credentials) => {
    try {
      const user = await API.logIn(credentials);
      setIsLoggedIn(true);
      setUser(user);
    }
    catch (error) {
      throw new Error(error);
    }
  };

  const logOut = async () => {
    try {
      await API.logOut();
      setIsLoggedIn(false);
    }
    catch (error) {
      throw new Error(error);
    }
  };

  const checkAuth = async () => {
    try{
    const user = await API.getUserInfo();
    setIsLoggedIn(true);
    setUser(user);
    }
    catch(error){
      console.log(error)
    }
  };

  return (
    <UserContext.Provider
      value={{ user, isLoggedIn, logIn, logOut, checkAuth, handleVisitor, isVisitorLoggedIn }}
    >
      {children}
    </UserContext.Provider>
  );
};

// Custom Hook
export const useUserContext = () => useContext(UserContext);
