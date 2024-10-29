import { useEffect, useState } from "react";
import "./App.css";
import { Route, Routes } from "react-router-dom";
import { useUserContext } from "./contexts/UserContext.mjs";

function App() {
  const { checkAuth } = useUserContext;

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <>
      <Routes>
        <Route path="/" />
      </Routes>
    </>
  );
}

export default App;
