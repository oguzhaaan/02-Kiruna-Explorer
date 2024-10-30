import { useEffect, useState } from "react";
import "./App.css";
import { Route, Routes } from "react-router-dom";
import { useUserContext } from "./contexts/UserContext.jsx";
import Document from "./Components/Document.jsx";

function App() {
  const { checkAuth } = useUserContext;

  useEffect(() => {
    //checkAuth();
  }, []);

  return (
    <>
      <Routes>
        <Route path="/document" element={<Document />} />
      </Routes>
    </>
  );
}

export default App;
