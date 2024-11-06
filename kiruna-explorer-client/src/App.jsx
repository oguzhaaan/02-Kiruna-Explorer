import { useEffect, useState } from "react";
import "./App.css";
import LoginPage from "./components/LoginPage";
import { Container } from "react-bootstrap";
import { Route, Routes, Outlet, Navigate } from "react-router-dom";
import { useUserContext } from "./contexts/UserContext.jsx";
import { NavHeader } from "./Components/NavHeader.jsx"
import { HomePage } from "./Components/HomePage.jsx";
import { Document } from "./Components/Document.jsx";
import { SingleDocument } from "./Components/SingleDocument.jsx";
import LinkDocuments from "./Components/LinkDocuments.jsx";
import { GeoreferenceMap } from "./Components/Map.jsx";
import DocumentClass from "./classes/Document.mjs";

function App() {
  const { user, isLoggedIn, checkAuth } = useUserContext();

  const [navShow, setNavShow] = useState(true);
  const [newAreaId, setnewAreaId] = useState(null);
  const [newDocument, setNewDocument] = useState(new DocumentClass());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [connections, setConnections] = useState([]);
  const [mode, setMode] = useState("return");
  const [docId, setoriginalDocId] = useState(-1);

  useEffect(() => {
    try {
      checkAuth();
    }
    catch (err) {
      console.log(err)
    }
  }, []);

  return (
    <>
      <Routes>

        <Route element={
          <>
            <NavHeader isLoggedIn={isLoggedIn} navShow={navShow} setNavShow={setNavShow} />
            <Container fluid className="m-0 p-0">
              <Outlet />
            </Container>
          </>
        }>



          <Route path="/" element={isLoggedIn ? <Navigate replace to="/documents" /> : <HomePage />} />

          <Route path="/login" element={isLoggedIn ? <Navigate replace to="/documents" /> : <LoginPage setNavShow={setNavShow} />} />

          <Route path="/documents" element={isLoggedIn ? <Document setoriginalDocId={setoriginalDocId} setMode={setMode} connections={connections} setNavShow={setNavShow} setIsModalOpen={setIsModalOpen} isModalOpen={isModalOpen} newAreaId={newAreaId} setNewDocument={setNewDocument} newDocument={newDocument} /> : <Navigate replace to="/" />} />

          <Route path="/documents/:id" element={isLoggedIn ? <Document setoriginalDocId={setoriginalDocId} setMode={setMode} setNavShow={setNavShow} setIsModalOpen={setIsModalOpen} isModalOpen={isModalOpen} newAreaId={newAreaId} setNewDocument={setNewDocument} newDocument={newDocument} /> : <Navigate replace to="/" />} />

          <Route path="/map" element={isLoggedIn ? <GeoreferenceMap setNavShow={setNavShow} setnewAreaId={setnewAreaId} /> : <Navigate replace to="/" />} />

          <Route path="/linkDocuments" element={ isLoggedIn ? <LinkDocuments setOriginalDocId = { setoriginalDocId } originalDocId = { docId } mode = { mode } setConnectionsInForm = { setConnections }/> : <Navigate replace to = "/" />} />

        </Route>
      </Routes>
    </>
  );
}

export default App;
