import {useEffect, useState} from "react";
import "./App.css";
import LoginPage from "./Components/LoginPage.jsx";
import {Container} from "react-bootstrap";
import {Route, Routes, Outlet, Navigate} from "react-router-dom";
import {useUserContext} from "./contexts/UserContext.jsx";
import {NavHeader} from "./Components/NavHeader.jsx"
import {HomePage} from "./Components/HomePage.jsx";
import LinkDocuments from "./Components/LinkDocuments.jsx";
import {GeoreferenceMap} from "./Components/Map.jsx";
import DocumentClass from "./classes/Document.mjs";
import {GeoreferenceMapDoc} from "./Components/MapDocuments.jsx";
import {ThemeProvider} from "./contexts/ThemeContext.jsx";
import {NewDocumentProvider} from "./contexts/NewDocumentContext.jsx";
import API from "./API/API.mjs";
import DocumentsPage from "./Components/DocumentsPage.jsx";
import DiagramBoard from "./Components/Diagram/DiagramBoard.tsx";
import {NodePositionProvider} from "./contexts/NodePositionContext.tsx";

function App() {
    const {user, isLoggedIn, checkAuth, isVisitorLoggedIn} = useUserContext();

    const [navShow, setNavShow] = useState(true);
    const [newAreaId, setnewAreaId] = useState(null);
    const [newDocument, setNewDocument] = useState(new DocumentClass());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [connections, setConnections] = useState([]);
    const [mode, setMode] = useState("return");
    const [docId, setoriginalDocId] = useState(-1);
    const [updateAreaId, setUpdateAreaId] = useState({areaId: null, docId: null})
    const [municipalGeoJson, setMunicipalGeoJson] = useState(null)
    const [showArea, setShowArea] = useState(null)
    const [showDiagramDoc, setShowDiagramDoc] = useState(null)

    useEffect(() => {
        try {
            checkAuth();
        } catch (err) {
            console.log(err)
        }
    }, []);

  // get municipal area
  useEffect(() => {
      const getMunicipalArea = async () => {
        const muniArea = await API.getAreaById(1)
        //console.log( muniArea)
        setMunicipalGeoJson(muniArea)
      }
      if ((isLoggedIn || isVisitorLoggedIn) && !municipalGeoJson) getMunicipalArea().catch(e => console.log("Failed to run promise", e))
  }, [isLoggedIn, isVisitorLoggedIn])

    return (
        <>
            <ThemeProvider>
                    <Routes>

                        <Route element={
                            <>
                                <NavHeader isLoggedIn={isLoggedIn} navShow={navShow} setNavShow={setNavShow}/>
                                <Container fluid className="m-0 p-0">
                                    <Outlet/>
                                </Container>
                            </>
                        }>

            <Route path="/" element={(isLoggedIn || isVisitorLoggedIn) ? (<Navigate replace to="/mapDocuments" />)  : <HomePage /> } />

                            <Route path="/login" element={isLoggedIn ? (user.role === "urban_planner" ?
                                    <Navigate replace to="/mapDocuments"/> : user.role === "resident" ?
                                        <Navigate replace to="/mapDocuments"/> : <LoginPage setNavShow={setNavShow}/>) :
                                <LoginPage setNavShow={setNavShow}/>}/>

                            <Route path="/documents" element={(isLoggedIn && user.role === "urban_planner") ?
                                <NewDocumentProvider>
                                    <DocumentsPage setShowArea={setShowArea} municipalGeoJson={municipalGeoJson}
                                               updateAreaId={updateAreaId} setUpdateAreaId={setUpdateAreaId}
                                               setoriginalDocId={setoriginalDocId} setMode={setMode}
                                               connections={connections} setConnections={setConnections}
                                               setNavShow={setNavShow} setIsModalOpen={setIsModalOpen}
                                               isModalOpen={isModalOpen} newAreaId={newAreaId}
                                               setnewAreaId={setnewAreaId} setNewDocument={setNewDocument}
                                               newDocument={newDocument}/></NewDocumentProvider> : <Navigate replace to="/"/>}/>

                            <Route path="/documents/:id" element={(isLoggedIn && user.role === "urban_planner") ?
                                <NewDocumentProvider>
                                    <DocumentsPage setShowArea={setShowArea} municipalGeoJson={municipalGeoJson}
                                               updateAreaId={updateAreaId} setUpdateAreaId={setUpdateAreaId}
                                               setoriginalDocId={setoriginalDocId} setMode={setMode}
                                               connections={connections} setConnections={setConnections}
                                               setNavShow={setNavShow} setIsModalOpen={setIsModalOpen}
                                               isModalOpen={isModalOpen} newAreaId={newAreaId}
                                               setnewAreaId={setnewAreaId} setNewDocument={setNewDocument}
                                               newDocument={newDocument}/></NewDocumentProvider> : <Navigate replace to="/"/>}/>

                            <Route path="/map" element={(isLoggedIn && user.role === "urban_planner") ?
                                <GeoreferenceMap municipalGeoJson={municipalGeoJson} setUpdateAreaId={setUpdateAreaId}
                                                 updateAreaId={updateAreaId} setNavShow={setNavShow}
                                                 setnewAreaId={setnewAreaId}/> : <Navigate replace to="/"/>}/>

                            <Route path="/mapDocuments" element={(isLoggedIn || isVisitorLoggedIn) ?
                                <GeoreferenceMapDoc showArea={showArea} setShowArea={setShowArea}
                                                    setNavShow={setNavShow} municipalGeoJson={municipalGeoJson}
                                                    setShowDiagramDoc={setShowDiagramDoc}
                                                    /> :
                                <Navigate replace to="/"/>}/>

                            <Route path="/linkDocuments" element={(isLoggedIn && user.role === "urban_planner") ?
                                <LinkDocuments setOriginalDocId={setoriginalDocId} originalDocId={docId} mode={mode}
                                               setConnectionsInForm={setConnections}/> : <Navigate replace to="/"/>}/>

                            <Route path="/diagram" element={(isLoggedIn || isVisitorLoggedIn) ?
                                <NodePositionProvider><DiagramBoard setShowArea={setShowArea} municipalGeoJson={municipalGeoJson}/></NodePositionProvider> :
                                <Navigate replace to="/"/>}/>

                            <Route path="*" element={isLoggedIn ? (user.role === "urban_planner" ?
                                <Navigate replace to="/mapDocuments"/> : user.role === "resident" ?
                                    <Navigate replace to="/mapDocuments"/> : <HomePage/>) : <HomePage/>}/>


                        </Route>
                    </Routes>
            </ThemeProvider>
        </>
    );
}

export default App;
