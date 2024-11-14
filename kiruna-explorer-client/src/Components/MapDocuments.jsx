import React, { useRef, useState, useEffect } from "react";
import { MapContainer, TileLayer, Polygon, Popup, Marker, ZoomControl, useMap, Tooltip } from "react-leaflet";
import "./map.css"
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import L, { geoJSON } from "leaflet";
import { useNavigate } from "react-router-dom";
import API from "../API/API.mjs";
import markerpin from "../assets/marker-pin.svg";
import polygonpin from "../assets/polygon-pin.svg";
import municipalarea from "../assets/municipal-area.svg"
import { useTheme } from "../contexts/ThemeContext.jsx";
import { getIcon } from "./Utilities/DocumentIcons.jsx";
import { formatString } from "./Document.jsx";
import { SingleDocumentMap } from "./SingleDocumentMap.jsx";

function GeoreferenceMapDoc(props) {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate()

  const latitude = 67.8558;
  const longitude = 20.2253;

  const [presentAreas, setPresentAreas] = useState(null);
  const [clickedArea, setClickedArea] = useState(null);
  const [alertMessage, setAlertMessage] = useState("");
  const [OpenTooltipDocs, setOpenTooltipDocs] = useState(null)
  const [ShowSingleDocument, setShowSingleDocument] = useState(false);
  const [documentId, setDocumentId] = useState(null);


  const mapRef = useRef(null);

  {/* Clear Alert message after 5 sec*/ }
  useEffect(() => {
    if (alertMessage != "") {
      const tid = setTimeout(() => {
        setAlertMessage("")
      }, 5000)
      return () => clearTimeout(tid);
    }
  }, [alertMessage])

  {/* Hide navbar at start and take all present areas*/ }
  useEffect(() => {
    const handleAreas = async () => {
      props.setNavShow(true);
      const areas = await API.getAllAreas()
      setPresentAreas(areas)
    }
    handleAreas()
  }, []);

  {/* Refresh to show modifications*/ }
  useEffect(() => {
    //refresh
  }, [presentAreas, ShowSingleDocument])

  const cityBounds = [
    [67.92532085836797, 20.245374612817344],
    [67.85139867724654, 20.65936775042602],
    [67.77576380313107, 20.246345676166037],
    [67.86274503663387, 19.86795112123954]
  ];

  {/* Click on area */ }
  const handleClick = (e, content) => {

    if (content === clickedArea) {
      setClickedArea(null)
    } else {
      if (content === 1) {
        setAlertMessage(`Municipal Area`)
      }
      else {
        setAlertMessage(`Area N.${content}`)
      }
      setClickedArea(content)
    }

  };

  return (
    <>
      <div className={isDarkMode ? "dark" : "light"}>
        {ShowSingleDocument && <SingleDocumentMap id={documentId} setShowSingleDocument={setShowSingleDocument}></SingleDocumentMap>}
        <MapContainer

          center={[latitude, longitude]}
          zoom={13} ref={mapRef}
          zoomControl={false}
          style={{
            height: "100vh",
            width: "100vw",
            filter: isDarkMode ? "invert(100%) hue-rotate(180deg) brightness(200%) contrast(90%)" : ""
          }}
          maxBounds={cityBounds}
          minZoom={12}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
          />
          <ZoomControl position="topright" />

          {/* Visualize All present Areas*/}
          {
            presentAreas && presentAreas.map((area, index) =>
              <Markers key={index} area={area} setDocumentId={setDocumentId} setShowSingleDocument={setShowSingleDocument} handleClick={handleClick} OpenTooltipDocs={OpenTooltipDocs} setOpenTooltipDocs={setOpenTooltipDocs} clickedArea={clickedArea}></Markers>
            )
          }
        </MapContainer>

        {/* Alert message */}
        {alertMessage && (
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
        )}
      </div>
    </>
  )
}

function calculateCentroid(coordinates) {
  let xSum = 0, ySum = 0, area = 0;

  const n = coordinates.length;
  for (let i = 0; i < n; i++) {
    const [x1, y1] = coordinates[i];
    const [x2, y2] = coordinates[(i + 1) % n];

    const a = x1 * y2 - x2 * y1;
    xSum += (x1 + x2) * a;
    ySum += (y1 + y2) * a;
    area += a;
  }

  area *= 0.5;
  const centroidX = xSum / (6 * area);
  const centroidY = ySum / (6 * area);

  return [centroidY, centroidX]; // Restituisci in formato [latitudine, longitudine]
}

function Markers({ area, handleClick, clickedArea, setDocumentId, setShowSingleDocument, OpenTooltipDocs, setOpenTooltipDocs }) {
  const map = useMap()
  const [areaDoc, setAreaDoc] = useState([])
  const geometry = area.geoJson.geometry;
  const [isZoomLevelLow, setIsZoomLevelLow] = useState(false); // Stato per controllare il livello di zoom
  const { isDarkMode } = useTheme();
  const [groupedDocs, setGroupedDocs] = useState([]);


  console.log(geometry.coordinates[0])
  const GenericPoints = L.icon({
    iconUrl: markerpin,
    iconSize: [35, 45],
    iconAnchor: [20, 40], // Imposta l'ancoraggio (es. al centro-inferiore dell'icona)
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

  useEffect(() => {
    const takeDocumentsArea = async () => {
      try {
        const docs = await API.getDocumentsFromArea(area.id)
        setAreaDoc(docs)
        const groupedByType = docs.reduce((acc, item) => {
          if (!acc[item.type]) {
            acc[item.type] = 0;
          }
          // Incrementa il conteggio per il tipo corrente
          acc[item.type]++;
          return acc;
        }, {})
        console.log(groupedByType)
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
      if (map.getZoom() <= 13) {
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

  return (
    geometry.type === 'Polygon' ? (
      areaDoc && (
        <>
          <Marker
            position={calculateCentroid(geometry.coordinates[0])} // Inverti lat/lng per Leaflet
            icon={area.id === 1 ? MunicipalArea : GenericPolygon} // Puoi scegliere di usare un'icona personalizzata per i punti
            eventHandlers={{
              click: (e) => {
                handleClick(e, area.id),
                  map.panTo(calculateCentroid(geometry.coordinates[0]))
              }
            }}
          >
            {OpenTooltipDocs !== area.id ? (
              <div style={{zIndex:-100}}>
              <Tooltip permanent className=" cursor-pointer">
                <div onClick={() => { setOpenTooltipDocs(area.id) }} style={{ cursor: 'pointer', pointerEvents: 'auto' }}>
                  {/* Se il livello di zoom è basso, mostra solo il numero di documenti */}
                  {isZoomLevelLow ? (
                    <span className="w-full counter-documents text-lg">{areaDoc.length}</span>
                  ) : (
                    <div className=" flex flex-row ">
                      {
                        groupedDocs.map(([type, num]) => (
                          <div key={type} style={{ display: 'flex', minWidth: '4em', minHeight: '1.5em', margin: '5px', flexDirection: 'row' }}>
                            <img
                              src={getIcon({ type: type }, { isDarkMode })}
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

              (
                <Tooltip permanent className=" cursor-pointer">
                  <div style={{ cursor: 'pointer', pointerEvents: 'auto' }}>
                    <ListDocuments setDocumentId={setDocumentId} setShowSingleDocument={setShowSingleDocument} docs={areaDoc} setOpenTooltipDocs={setOpenTooltipDocs}></ListDocuments>
                  </div>
                </Tooltip>
              )
            }
          </Marker>

          {clickedArea === area.id && (
            <Polygon
              positions={geometry.coordinates[0].map(coord => [coord[1], coord[0]])} // Inverti le coordinate per Leaflet
              pathOptions={{ color: 'blue' }}
            />
          )}
        </>
      )
    ) : (
      areaDoc && (
        <>
          <Marker
            key={area.id}
            position={[geometry.coordinates[1], geometry.coordinates[0]]} // Inverti lat/lng per Leaflet
            icon={GenericPoints} // Puoi scegliere di usare un'icona personalizzata per i punti
            eventHandlers={{
              click: (e) => {
                handleClick(e, area.id),
                  map.panTo([geometry.coordinates[1], geometry.coordinates[0]])
              }
            }}
          >
            {OpenTooltipDocs !== area.id ? (
              <div style={{zIndex:-100}}>
              <Tooltip permanent className=" cursor-pointer" >
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
                              src={getIcon({ type: type }, { isDarkMode })}
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

              (
                <Tooltip permanent className=" cursor-pointer">
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

  return (
    <div
      className={`${isDarkMode ? "dark" : "light"} inset-0 flex items-center justify-center scrollbar-thin scrollbar-webkit`}
    >
      <div
        className="flex flex-col backdrop-blur-2xl drop-shadow-xl rounded-xl text-black_text font-sans p-2 max-h-[300px] overflow-y-auto overflow-x-hidden w-[250px]"
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
                className="outline outline-1 outline-customGray1 dark:outline-none bg-search_dark_color w-auto py-2 pl-10 pr-4 text-black_text rounded-[50px] placeholder-black_text"
            />
        </div>
        {/* Lista di documenti */}
        {docs.map((doc) => (
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
      className="flex flex-row items-center rounded-lg m-1 bg-[#7878782e] p-3 text-black cursor-pointer w-full"
      onClick={() => {
        setDocumentId(documentId);
        setShowSingleDocument(true);

      }
      }
    >
      {/* Icona del documento */}
      <img src={getIcon({ type }, { isDarkMode })} className="w-9 h-9 mr-2" alt="type_icon" />

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

export { GeoreferenceMapDoc }
