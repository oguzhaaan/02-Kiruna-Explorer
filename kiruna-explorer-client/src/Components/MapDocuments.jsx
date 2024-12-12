import React, { useRef, useState, useEffect } from "react";
import { MapContainer, TileLayer, Polygon, Popup, Marker, ZoomControl, useMap, Tooltip, GeoJSON } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-markercluster"
import "./map.css"
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import L, { geoJSON } from "leaflet";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../API/API.mjs";
import markerpin from "../assets/marker-pin.svg";
import polygonpin from "../assets/polygon-pin.svg";
import markerpinselected from "../assets/marker-pin-selected.svg"
import municipalarea from "../assets/municipal-area.svg"
import { useTheme } from "../contexts/ThemeContext.jsx";
import { getIcon } from "./Utilities/DocumentIcons.jsx";
import { formatString } from "./Utilities/StringUtils.js";
import { SingleDocumentMap } from "./SingleDocumentMap.jsx";
import { collect } from "@turf/turf";
import { DocumentsNavMap } from "./DocumentsNavMap.jsx";

function calculateCentroid(coordinates) {
  const polygon = L.polygon(coordinates.map(coord => [coord[1], coord[0]])); // Inverti [lng, lat] -> [lat, lng]

  const bounds = polygon.getBounds();

  // return center
  return bounds.getCenter();
}

function calculateBounds(coordinates) {
  const polygon = L.polygon(coordinates.map(coord => [coord[1], coord[0]])); // Inverti [lng, lat] -> [lat, lng]

  return polygon.getBounds();
}

const SwitchMapButton = ({ toggleMap, isSatelliteMap }) => {
  return (
    <div title={isSatelliteMap ? "Street View" : "Satellite View"} className="custom-switch-button" onClick={() => {
      toggleMap();
    }}
      onKeyUp={(e) => {
        if (e.key === 'Enter') {
          toggleMap();
        }
      }}>
      <i className="bi bi-arrow-left-right text-[#464646]"></i>
    </div>
  );
};

function GeoreferenceMapDoc(props) {
  const { isDarkMode, isSatelliteMap, toggleMap } = useTheme();
  const location = useLocation();
  const currentRoute = location.pathname;

  //define default  position to "center of Kiruna"
  const center = [68.20805, 20.593249999999998]

  const boundaries = L.latLngBounds(
    L.latLng(67.3562, 17.8998),  // sud-ovest
    L.latLng(69.0599, 23.2867)   // nord-est
  );

  const [presentAreas, setPresentAreas] = useState(null);
  const [clickedAreas, setClickedAreas] = useState({});
  const [alertMessage, setAlertMessage] = useState("");
  const [OpenTooltipDocs, setOpenTooltipDocs] = useState(null)
  const [ShowSingleDocument, setShowSingleDocument] = useState(false);
  const [documentId, setDocumentId] = useState(null);
  const [hoveredArea, setHoveredArea] = useState(null)

  const isSingleDoc = currentRoute.includes("documents") || currentRoute.includes("diagram")

  const [clickedDocs, setClickedDocs] = useState({});
  const [areaCounts, setAreaCounts] = useState({});

  const mapRef = useRef(null);

  const handleDocumentClick = (doc, highlighted=null) => {
    const { id, areaId } = doc;
    let wasClicked, newClickedState
    if (highlighted===null){
    wasClicked = clickedDocs[id];
    newClickedState = !wasClicked;
    }
    else{
      newClickedState = !highlighted
    }
    setClickedDocs((prev) => ({
        ...prev,
        [id]: newClickedState,
    }));

    setHoveredArea(null)

    setAreaCounts((prev) => {
        const currentCount = prev[areaId] || 0;
        const newCount = newClickedState ? currentCount + 1 : currentCount - 1;

        // Toggle area if a 0 <-> 1 transition occurs
        if (
            (currentCount === 0 && newCount === 1) ||
            (currentCount === 1 && newCount === 0)
        ) {
            setAreaSelected(areaId);
        }

        return {
            ...prev,
            [areaId]: Math.max(newCount, 0),
        };
    });
};

  const setAreaSelected = (areaId, hover = null) => {
    let activate
    if (!clickedAreas[areaId]) {
      activate = true
    }
    else {
      activate = false
    }

    setClickedAreas(prev => ({
      ...prev,
      [areaId]: activate,
    }));
  };

  {/* Hide navbar at start and take all present areas*/ }
  useEffect(() => {
    const handleAreas = async () => {
      if (props.setNavShow) props.setNavShow(true);
      const areas = await API.getAllAreas()
      setPresentAreas(areas)
      //console.log(areas)
    }
    handleAreas()
  }, []);

  {/* Refresh to show modifications*/ }
  useEffect(() => {
    //refresh
  }, [presentAreas, ShowSingleDocument, props.municipalGeoJson, props.showArea, isSatelliteMap, isDarkMode, alertMessage, clickedAreas, clickedDocs])

  // Mouse over the area
  const handleMouseOver = (id, content) => {
    if (id === 1 && content !== 0) {
      setAlertMessage(`${content} documents in Municipal Area`)
    }
    else if (content !== 0) {
      setAlertMessage(`${content} documents in this spot`)
    }
    else {
      setAlertMessage("The document selected is in this spot")
    }
    setHoveredArea(id)
  };
  // Mouse out the area
  const handleMouseOut = (id) => {
    setHoveredArea(null)
    setAlertMessage(``)
  };

  return (
    <>
      <div className={isDarkMode ? "dark" : "light"}>
        {ShowSingleDocument && <SingleDocumentMap setShowArea={props.setShowArea} municipalGeoJson={props.municipalGeoJson} setDocumentId={setDocumentId} id={documentId} setShowSingleDocument={setShowSingleDocument}></SingleDocumentMap>}
        <MapContainer
          center={center}
          zoom={5} ref={mapRef}
          zoomControl={false}
          scrollWheelZoom={!isSingleDoc}
          className={`${isSingleDoc ? "h-[50vh] w-[80vh]" : " h-screen w-screen"}`}
          maxBounds={boundaries}
          minZoom={8}
        >
          <TileLayer
            key={`${isDarkMode}-${isSatelliteMap}`}
            attribution={isSatelliteMap ? '&copy; <a href="https://www.esri.com/">Esri</a> contributors' : "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors"}
            url={isSatelliteMap ? "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}" : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"}
            className={isSatelliteMap ? " " : `${isDarkMode ? "custom-tile-layer" : ""}`}
          />
          <SwitchMapButton toggleMap={toggleMap} isSatelliteMap={isSatelliteMap}></SwitchMapButton>

          {!isSingleDoc && <DocumentsNavMap clickedDocs={clickedDocs} handleDocumentClick={handleDocumentClick} setShowDiagramDoc={props.setShowDiagramDoc}></DocumentsNavMap>}

          <ZoomControl position="topright" />
          {props.municipalGeoJson && <GeoJSON data={props.municipalGeoJson} pathOptions={{ color: `${isDarkMode ? "#CCCCCC" : "grey"}`, weight: 2, dashArray: "5, 5" }} />}
          {/* Visualize All present Areas*/}
          {

            presentAreas && <MarkerClusterGroup
              showCoverageOnHover={false}  // Disabilita il poligono di copertura al passaggio del mouse
              maxClusterRadius={50}       // Riduce il raggio massimo dei cluster
              spiderfyOnMaxZoom={true}    // Espande i marker alla massima distanza di zoom
              disableClusteringAtZoom={14} // Disabilita il clustering a zoom elevati
              iconCreateFunction={(cluster) => {
                const count = cluster.getChildCount(); // Numero di marker nel cluster

                // Colori personalizzati in base al numero di marker
                let clusterColor = count > 10 ? 'red' : count > 5 ? 'orange' : 'green';

                return L.divIcon({
                  html: `
                    <div style="
                      background-color: ${clusterColor};
                      border-radius: 50%;
                      width: 50px;
                      height: 50px;
                      display: flex;
                      align-items: center;
                      justify-content: center;
                      color: white;
                      font-size: 16px;
                      font-weight: bold;
                      border: 2px solid white;">
                      ${count}
                    </div>
                  `,
                  className: '', // Lascia vuoto per evitare stili predefiniti
                  iconSize: L.point(50, 50), // Dimensioni del cluster
                });
              }}
            >
              {presentAreas.map((area, index) =>
                <Markers key={index} setShowArea={props.setShowArea} showArea={props.showArea} isSingleDoc={isSingleDoc} currentDocAreaId={props.currentDocAreaId} center={center} area={area} boundaries={boundaries} setDocumentId={setDocumentId} setShowSingleDocument={setShowSingleDocument} handleMouseOver={handleMouseOver} handleMouseOut={handleMouseOut} OpenTooltipDocs={OpenTooltipDocs} setOpenTooltipDocs={setOpenTooltipDocs} clickedAreas={clickedAreas} setAreaSelected={setAreaSelected} hoveredArea={hoveredArea} handleDocumentClick={handleDocumentClick}></Markers>
              )
              }
            </MarkerClusterGroup>
          }
        </MapContainer>

        {/* Alert message */}
        {alertMessage && !isSingleDoc && (<Message alertMessage={alertMessage} setAlertMessage={setAlertMessage}></Message>)}
      </div>
    </>
  )
}

function Message({ alertMessage, setAlertMessage }) {
  {/* Clear Alert message after 5 sec*/ }
  useEffect(() => {
    if (alertMessage != "") {
      const tid = setTimeout(() => {
        setAlertMessage("")
      }, 5000)
      return () => clearTimeout(tid);
    }
  }, [alertMessage])

  return (
    <div style={{
      position: "fixed",
      top: "20px",
      left: "50%",
      transform: "translateX(-50%)",
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      color: "#fff",
      padding: "10px 20px",
      borderRadius: "10px",
      fontSize: "20px",
      zIndex: 1000,
      textAlign: "center"
    }}
      className={` max-md:text-xs`}
    >
      {alertMessage}
    </div>
  )
}

function Markers({ showArea, setShowArea, area, currentDocAreaId, center, boundaries, isSingleDoc, handleMouseOver, handleMouseOut, clickedAreas, setDocumentId, setShowSingleDocument, OpenTooltipDocs, setOpenTooltipDocs, setAreaSelected, hoveredArea, handleDocumentClick }) {
  const map = useMap()
  const [areaDoc, setAreaDoc] = useState([])
  const geometry = area.geoJson.geometry;
  const [isZoomLevelLow, setIsZoomLevelLow] = useState(false); // Stato per controllare il livello di zoom
  const { isDarkMode } = useTheme();
  const [groupedDocs, setGroupedDocs] = useState([]);

  const navigate = useNavigate()

  // //console.log(geometry.coordinates[0])
  const GenericPoints = L.icon({
    iconUrl: markerpin,
    iconSize: [35, 45],
    iconAnchor: [20, 40], // Imposta l'ancoraggio (es. al centro-inferiore dell'icona)
    shadowSize: [41, 41]
  });

  const PointSelected = L.icon({
    iconUrl: markerpinselected,
    iconSize: [45, 55],
    iconAnchor: [20, 50], // Imposta l'ancoraggio (es. al centro-inferiore dell'icona)
    shadowSize: [41, 41]
  });

  const GenericPolygon = L.icon({
    iconUrl: polygonpin,
    iconSize: [30, 41],
    iconAnchor: [20, 40], // Imposta l'ancoraggio (es. al centro-inferiore dell'icona)
    shadowSize: [41, 41]
  });

  const MunicipalArea = L.icon({
    iconUrl: municipalarea,
    iconSize: [30, 41],
    iconAnchor: [20, 40], // Imposta l'ancoraggio (es. al centro-inferiore dell'icona)
    shadowSize: [41, 41]
  });

  const handleAreaDocuments = async (areaid) =>{
    try{
      const areadocs = await API.getDocumentsFromArea(areaid)
      const highlighted = clickedAreas[areaid] 
      for (let doc of areadocs){
        handleDocumentClick(doc, highlighted)
      }
    }catch(err){
      console.log(err)
    }
  } 

  useEffect(() => {
    const takeDocumentsArea = async () => {
      try {
        const docs = await API.getDocumentsFromArea(area.id)
        //console.log(docs);
        setAreaDoc(docs)
        const groupedByType = docs.reduce((acc, item) => {
          if (!acc[item.type]) {
            acc[item.type] = 0;
          }
          // Incrementa il conteggio per il tipo corrente
          acc[item.type]++;
          return acc;
        }, {})
        ////console.log(groupedByType)
        setGroupedDocs(Object.entries(groupedByType))
      } catch (err) {
        setAreaDoc([])
      }
    }
    takeDocumentsArea()
  }, [])

  useEffect(() => {
    // Funzione per monitorare il livello di zoom
    const handleZoom = () => {
      if (map.getZoom() <= 10) {
        setIsZoomLevelLow(true); // Livello di zoom basso, mostra solo il numero di documenti
        setOpenTooltipDocs(null);
      } else {
        setIsZoomLevelLow(false); // Livello di zoom alto, mostra anche le icone
      }
    };

    map.on('zoomend', handleZoom);
    // Controllo iniziale del livello di zoom
    handleZoom();

    // Pulizia del listener quando il componente viene smontato
    return () => {
      map.off('zoomend', handleZoom);
    };
  }, [map]);

  useEffect(() => {
    const setCurrentView = () => {
      if (geometry.type === "Polygon") {
        map.fitBounds(calculateBounds(geometry.coordinates[0]))
      }
      else if (geometry.type === "MultiPolygon") {
        map.fitBounds(boundaries)
      }
      else {
        map.setView([geometry.coordinates[1], geometry.coordinates[0]], 14)
      }
      handleMouseOver(area.id, areaDoc.length)
      setShowArea(null)
    }
    if (currentDocAreaId == area.id || showArea == area.id) setCurrentView()
  }, [currentDocAreaId, showArea, areaDoc])

  return (
    geometry.type === 'Polygon' || geometry.type === "MultiPolygon" ? (
      areaDoc && (
        <>
          <Marker
            position={area.id === 1 ? center : calculateCentroid(geometry.coordinates[0])} // Inverti lat/lng per Leaflet
            icon={area.id === 1 ? MunicipalArea : GenericPolygon} // Puoi scegliere di usare un'icona personalizzata per i punti
            eventHandlers={{
              click: (e) => {
                if (isSingleDoc) {
                  setShowArea(area.id)
                  navigate("/mapDocuments")
                }
                else {
                  map.fitBounds(area.id === 1 ? boundaries : calculateBounds(geometry.coordinates[0]))
                  setAreaSelected(area.id)
                  handleAreaDocuments(area.id)
                }
              },
              mouseover: (e) => handleMouseOver(area.id, areaDoc.length),
              mouseout: (e) => handleMouseOut(area.id),
            }}
          >
            {OpenTooltipDocs !== area.id && !isSingleDoc ? (
              <div style={{ zIndex: -100 }}>
                <Tooltip permanent className="cursor-pointer border-none text-black_text dark:text-white_text bg-box_white_color dark:bg-box_color backdrop-blur-2xl outline outline-1 outline-[#00000055] dark:outline-[#FFFFFF55]">
                  <div onClick={() => { setOpenTooltipDocs(area.id) }} style={{ cursor: 'pointer', pointerEvents: 'auto' }}>
                    {/* Se il livello di zoom è basso, mostra solo il numero di documenti */}
                    {isZoomLevelLow ? (
                      <span className="w-full counter-documents text-lg">{areaDoc.length}</span>
                    ) : (
                      <div className=" flex flex-row ">
                        {groupedDocs &&
                          groupedDocs.map(([type, num]) => (
                            <div key={type} style={{ display: 'flex', minWidth: '4em', minHeight: '1.5em', margin: '5px', flexDirection: 'row' }}>
                              <img
                                src={getIcon({ type: type }, { darkMode: isDarkMode })}
                                alt={type}
                                style={{ width: '30px', height: '30px', marginRight: '5px' }}
                              />
                              <span className="counter-documents text-lg">{num}</span>
                            </div>
                          ))
                        }
                      </div>
                    )}
                  </div>
                </Tooltip>
              </div>
            ) :

              (!isSingleDoc &&
                <Tooltip permanent className="cursor-pointer border-none text-black_text dark:text-white_text bg-white_text dark:bg-black_text outline outline-1 outline-[#00000055] dark:outline-[#FFFFFF55]">
                  <div style={{ cursor: 'pointer', pointerEvents: 'auto' }}>
                    <ListDocuments setDocumentId={setDocumentId} setShowSingleDocument={setShowSingleDocument} docs={areaDoc} setOpenTooltipDocs={setOpenTooltipDocs}></ListDocuments>
                  </div>
                </Tooltip>
              )
            }
          </Marker>

          {(clickedAreas[area.id] || hoveredArea === area.id) && (
            area.id != 1 ?
              <Polygon
                positions={geometry.coordinates[0].map(coord => [coord[1], coord[0]])} // Inverti le coordinate per Leaflet
                pathOptions={{ color: "#a020f0" }}
              /> :
              <GeoJSON
                data={area.geoJson}
                pathOptions={{ color: "red" }}
              >
              </GeoJSON>
          )}
        </>
      )
    ) : (
      areaDoc && (
        <>
          <Marker
            key={area.id}
            position={[geometry.coordinates[1], geometry.coordinates[0]]} // Inverti lat/lng per Leaflet
            icon={(clickedAreas[area.id] || hoveredArea === area.id) ? PointSelected : GenericPoints} // Puoi scegliere di usare un'icona personalizzata per i punti
            eventHandlers={{
              click: (e) => {
                if (isSingleDoc) {
                  setShowArea(area.id)
                  navigate("/mapDocuments")
                }
                else {
                  map.setView([geometry.coordinates[1], geometry.coordinates[0]], 15);
                  setAreaSelected(area.id)
                  handleAreaDocuments(area.id)
                }
              },
              mouseover: (e) => handleMouseOver(area.id, areaDoc.length),
              mouseout: (e) => handleMouseOut(e),
            }}
          >
            {OpenTooltipDocs !== area.id && !isSingleDoc ? (
              <div style={{ zIndex: -100 }}>
                <Tooltip permanent className="cursor-pointer border-none text-black_text dark:text-white_text bg-box_white_color dark:bg-box_color backdrop-blur-2xl outline outline-1 outline-[#00000055] dark:outline-[#FFFFFF55]" >
                  <div onClick={() => { setOpenTooltipDocs(area.id); }} style={{ cursor: 'pointer', pointerEvents: 'auto' }}>
                    {/* Se il livello di zoom è basso, mostra solo il numero di documenti */}
                    {isZoomLevelLow ? (
                      <span className="w-full counter-documents text-lg">{areaDoc.length}</span>
                    ) : (
                      <div className=" flex flex-row ">
                        {
                          groupedDocs.map(([type, num]) => (
                            <div key={type} style={{ display: 'flex', minWidth: '4em', minHeight: '1.5em', margin: '5px', flexDirection: 'row' }}>
                              <img
                                src={getIcon({ type: type }, { darkMode: isDarkMode })}
                                alt={type}
                                style={{ width: '30px', height: '30px', marginRight: '5px' }}
                              />
                              <span className="counter-documents text-lg">{num}</span>
                            </div>
                          ))
                        }
                      </div>
                    )}
                  </div>
                </Tooltip>
              </div>
            ) :

              (!isSingleDoc &&
                <Tooltip permanent className="cursor-pointer border-none text-black_text dark:text-white_text bg-white_text dark:bg-black_text outline outline-1 outline-[#00000055] dark:outline-[#FFFFFF55]">
                  <div style={{ cursor: 'pointer', pointerEvents: 'auto' }}>
                    <ListDocuments setDocumentId={setDocumentId} setShowSingleDocument={setShowSingleDocument} docs={areaDoc} setOpenTooltipDocs={setOpenTooltipDocs}></ListDocuments>
                  </div>
                </Tooltip>
              )
            }
          </Marker>
        </>
      )
    )
  );
}
function ListDocuments({ docs, setOpenTooltipDocs, setDocumentId, setShowSingleDocument }) {
  const { isDarkMode } = useTheme();
  const [query, setQuery] = useState("");

  const filteredDocs = docs.filter((e) => {
    return (e.title.toLowerCase().includes(query.toLowerCase()) || e.type.toLowerCase().includes(query.toLowerCase()));
  })

  return (
    <div
      className={`${isDarkMode ? "dark" : "light"} inset-0 flex items-center justify-center scrollbar-thin scrollbar-webkit`}
    >
      <div
        className="flex flex-col drop-shadow-xl rounded-xl text-black_text dark:text-white_text font-sans p-2 max-h-[300px] overflow-y-auto overflow-x-hidden w-[250px]"
      >
        {/* Header con il pulsante per chiudere */}
        <div className="w-full flex justify-between text-center text-xl mb-2">
          Documents
          <button
            onClick={() => setOpenTooltipDocs(null)}
            className="text-black_text dark:text-white_text text-base hover:text-gray-600"
          >
            <i className="bi bi-x-lg text-2xl"></i>
          </button>
        </div>
        <div className="z-[0] relative mb-1">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-black_text">
            <i className="bi bi-search"></i>
          </span>
          <input
            type="text"
            placeholder="Search"
            input={query}
            onChange={(e) => setQuery(e.target.value)}
            className="outline outline-1 outline-customGray1 dark:outline-none bg-search_dark_color w-auto py-2 pl-10 pr-4 text-black_text rounded-[50px] placeholder-black_text"
          />
        </div>
        {/* Lista di documenti */}
        {filteredDocs.map((doc) => (
          <DocumentItem
            setDocumentId={setDocumentId}
            setShowSingleDocument={setShowSingleDocument}
            key={doc.id}
            documentId={doc.id}
            title={doc.title}
            type={doc.type}
          />
        ))}
      </div>
    </div>
  );
}

const DocumentItem = ({ documentId, title, type, setShowSingleDocument, setDocumentId }) => {
  const { isDarkMode } = useTheme();

  return (
    <div
      className="flex flex-row items-center rounded-lg m-1 bg-[#7878782e] p-3 text-black_text dark:text-white_text cursor-pointer w-full"
      onClick={() => {
        setDocumentId(documentId);
        setShowSingleDocument(true);

      }
      }
    >
      {/* Icona del documento */}
      <img src={getIcon({ type: type }, { darkMode: isDarkMode })} className="w-9 h-9 mr-2" alt="type_icon" />

      {/* Titolo del documento con ellissi per il testo lungo */}
      <div
        className="text-lg truncate"
        style={{ maxWidth: "200px" }} // Ridotto a 200px per adattarsi alla larghezza
      >
        {formatString(title)}
      </div>
    </div>
  );
};

export { GeoreferenceMapDoc, calculateBounds, calculateCentroid }
