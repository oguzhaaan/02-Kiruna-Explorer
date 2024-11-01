import { useEffect, useState } from "react";
import "./App.css";
import { useUserContext } from "./contexts/UserContext.jsx";
import Document from "./Components/Document.jsx";
import { Container } from "react-bootstrap";
import { Route, Routes, Outlet } from "react-router-dom";
import {NavHeader} from "./Components/NavHeader.jsx"

function App() {
  const { checkAuth } = useUserContext;

  useEffect(() => {
    //checkAuth();
  }, []);

  return (
    <>
      <Routes>
        <Route path="/documents" element={<Document/>} />
        <Route element={
          <>
          <NavHeader/>
          <Container fluid className="m-0 p-0">
            <Outlet/>
          </Container>
          </>
        }>

        <Route index element={
          <>
          </>
        } />

        </Route>
      </Routes>
    </>
  );
}

export default App;
