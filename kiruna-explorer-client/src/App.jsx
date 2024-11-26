import { useEffect, useState } from "react";
import "./App.css";
import LoginPage from "./Components/LoginPage.jsx";
import { Container } from "react-bootstrap";
import { Route, Routes, Outlet, Navigate } from "react-router-dom";
import { useUserContext } from "./contexts/UserContext.jsx";
import { NavHeader } from "./Components/NavHeader.jsx"
import { HomePage } from "./Components/HomePage.jsx";
import { Document } from "./Components/Document.jsx";
import LinkDocuments from "./Components/LinkDocuments.jsx";
import { GeoreferenceMap } from "./Components/Map.jsx";
import DocumentClass from "./classes/Document.mjs";
import { GeoreferenceMapDoc } from "./Components/MapDocuments.jsx";
import { ThemeProvider } from "./contexts/ThemeContext.jsx";
import API from "./API/API.mjs";

function App() {
  const { user, isLoggedIn, checkAuth } = useUserContext();

  const [navShow, setNavShow] = useState(true);
  const [newAreaId, setnewAreaId] = useState(null);
  const [newDocument, setNewDocument] = useState(new DocumentClass());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [connections, setConnections] = useState([]);
  const [mode, setMode] = useState("return");
  const [docId, setoriginalDocId] = useState(-1);
  const [updateAreaId, setUpdateAreaId] = useState({ areaId: null, docId: null })
  const [municipalGeoJson, setMunicipalGeoJson] = useState(null)

  useEffect(() => {
    try {
      checkAuth();
    }
    catch (err) {
      //console.log(err)
    }
  }, []);

  // get municipal area
  useEffect(() => {
    const getMunicipalArea = async () => {
        const muniArea = await API.getAreaById(1)
        console.log(muniArea)
        setMunicipalGeoJson(muniArea)
    }
    getMunicipalArea()
}, [])

  return (
    <>
      <ThemeProvider>
        <Routes>

          <Route element={
            <>
              <NavHeader isLoggedIn={isLoggedIn} navShow={navShow} setNavShow={setNavShow} />
              <Container fluid className="m-0 p-0">
                <Outlet />
              </Container>
            </>
          }>

            <Route path="/" element={isLoggedIn ? (user.role === "urban_planner" ? <Navigate replace to="/documents" /> : user.role === "resident" ? <Navigate replace to="/mapDocuments" /> : <HomePage />) : <HomePage />} />

            <Route path="/login" element={ isLoggedIn ? (user.role === "urban_planner" ? <Navigate replace to="/documents" /> : user.role === "resident" ? <Navigate replace to="/mapDocuments" /> : <LoginPage setNavShow={setNavShow} />) : <LoginPage setNavShow={setNavShow} />} />

            <Route path="/documents" element={(isLoggedIn && user.role === "urban_planner") ? <Document updateAreaId={updateAreaId} setUpdateAreaId={setUpdateAreaId} setoriginalDocId={setoriginalDocId} setMode={setMode} connections={connections} setConnections={setConnections} setNavShow={setNavShow} setIsModalOpen={setIsModalOpen} isModalOpen={isModalOpen} newAreaId={newAreaId} setnewAreaId={setnewAreaId} setNewDocument={setNewDocument} newDocument={newDocument} /> : <Navigate replace to="/" />} />

            <Route path="/documents/:id" element={(isLoggedIn && user.role === "urban_planner") ? <Document updateAreaId={updateAreaId} setUpdateAreaId={setUpdateAreaId} setoriginalDocId={setoriginalDocId} setMode={setMode} connections={connections} setConnections={setConnections} setNavShow={setNavShow} setIsModalOpen={setIsModalOpen} isModalOpen={isModalOpen} newAreaId={newAreaId} setnewAreaId={setnewAreaId} setNewDocument={setNewDocument} newDocument={newDocument} /> : <Navigate replace to="/" />} />

            <Route path="/map" element={(isLoggedIn && user.role === "urban_planner")  ? <GeoreferenceMap municipalGeoJson={municipalGeoJson} setUpdateAreaId={setUpdateAreaId} updateAreaId={updateAreaId} setNavShow={setNavShow} setnewAreaId={setnewAreaId} /> : <Navigate replace to="/" />} />

            <Route path="/mapDocuments" element={isLoggedIn ? <GeoreferenceMapDoc setNavShow={setNavShow} /> : <Navigate replace to="/" />} />

            <Route path="/linkDocuments" element={(isLoggedIn && user.role === "urban_planner") ? <LinkDocuments setOriginalDocId={setoriginalDocId} originalDocId={docId} mode={mode} setConnectionsInForm={setConnections} /> : <Navigate replace to="/" />} />

            <Route path="*" element={isLoggedIn ? (user.role === "urban_planner" ? <Navigate replace to="/documents" /> : user.role === "resident" ? <Navigate replace to="/mapDocuments" /> : <HomePage />) : <HomePage />} />


          </Route>
        </Routes>
      </ThemeProvider>
    </>
  );
}

export default App;
