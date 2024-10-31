import { useEffect, useState } from "react";
import "./App.css";
import LoginPage from "./components/LoginPage";
import { Container } from "react-bootstrap";
import { Route, Routes, Outlet, Navigate } from "react-router-dom";
import { useUserContext } from "./contexts/UserContext.jsx";
import {NavHeader} from "./Components/NavHeader.jsx"
import { HomePage } from "./Components/HomePage.jsx";

function App() {
  const { isLoggedIn, checkAuth } = useUserContext();

  const [navShow, setNavShow] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <>
      <Routes>

        <Route element={
          <>
          <NavHeader isLoggedIn={isLoggedIn} navShow={navShow} setNavShow={setNavShow}/> 
          <Container fluid className="m-0 p-0">
            <Outlet/>
          </Container>
          </>
        }>

        <Route index element={
          <HomePage/>
        } />

        <Route path="/login" element={isLoggedIn ? <Navigate replace to="/" /> : <LoginPage setNavShow={setNavShow}/>}/>
        
        </Route>
      </Routes>
    </>
  );
}

export default App;
