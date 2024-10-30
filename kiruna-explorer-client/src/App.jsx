import { useEffect, useState } from "react";
import "./App.css";
import { Navigate, Route, Routes } from "react-router-dom";

import LoginPage from "./components/LoginPage";
import { useUserContext } from "./contexts/UserContext.jsx";

function App() {
  const { isLoggedIn, checkAuth } = useUserContext();

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <>
      <Routes>
        {/* <Route path="/" /> */}
        <Route
          path="/login"
          element={isLoggedIn ? <Navigate replace to="/" /> : <LoginPage />}
        />
      </Routes>
    </>
  );
}

export default App;
