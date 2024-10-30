import { useEffect, useState } from "react";
import "./App.css";
import { Container } from "react-bootstrap";
import { Route, Routes, Outlet } from "react-router-dom";
import { useUserContext } from "./contexts/UserContext.jsx";
import {NavHeader} from "./Components/NavHeader.jsx"

function App() {
  const { checkAuth } = useUserContext;

  useEffect(() => {
    //checkAuth();
  }, []);

  return (
    <>
      <Routes>
        <Route element={
          <>
          <NavHeader/>
          <Container fluid>
            <Outlet/>
          </Container>
          </>
        }>

        <Route index element={
          <></>
        } />

        </Route>
      </Routes>
    </>
  );
}

export default App;
