import { useEffect, useState } from "react";
import "./App.css";
import { Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "./components/LoginPage";
import { Container } from "react-bootstrap";
import { Route, Routes, Outlet } from "react-router-dom";
import { useUserContext } from "./contexts/UserContext.jsx";
import {NavHeader} from "./Components/NavHeader.jsx"

function App() {
  const { isLoggedIn, checkAuth } = useUserContext();

  useEffect(() => {
    //checkAuth();
  }, []);

  return (
    <>
      <Routes>
        {/* <Route path="/" /> */}
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

        <Route path="/login" element={isLoggedIn ? <Navigate replace to="/" /> : <LoginPage />}/>
        
        </Route>
      </Routes>
    </>
  );
}

export default App;
