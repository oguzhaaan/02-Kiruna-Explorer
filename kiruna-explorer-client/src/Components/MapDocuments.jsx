import React, { useRef, useState, useEffect } from "react";
import { MapContainer, TileLayer, Polygon, Popup, Marker, ZoomControl, useMap, Tooltip } from "react-leaflet";
import "./map.css"
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import L, { geoJSON } from "leaflet";
import { useNavigate } from "react-router-dom";
import API from "../API/API.mjs";
import markerpin from "../assets/marker-pin.svg"
import polygonpin from "../assets/polygon-pin.svg"
import municipalarea from "../assets/municipal-area.svg"
import { useTheme } from "../contexts/ThemeContext.jsx";


function CenterMap({ lat, lng }) {
  const map = useMap();
  map.panTo([lat, lng]);
  return null;
}

function GeoreferenceMapDoc(props) {
  const { isDarkMode } = useTheme();
  const navigate = useNavigate()

  const latitude = 67.8558;
  const longitude = 20.2253;

  const [popupContent, setPopupContent] = useState("");
  const [popupPosition, setPopupPosition] = useState(null);
  const [showExit, setShowExit] = useState(true);
  const [presentAreas, setPresentAreas] = useState(null);
  const [clickedArea, setClickedArea] = useState(null);
  const [alertMessage, setAlertMessage] = useState("");

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
      props.setNavShow(false);
      const areas = await API.getAllAreas()
      setPresentAreas(areas)
    }
    handleAreas()
  }, []);

  {/* Refresh to show modifications*/ }
  useEffect(() => {
    //refresh
  }, [showExit, presentAreas])

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
      setAlertMessage(`You selected Area N.${content}`)
      setClickedArea(content)
    }

  };

  {/* Mouse over and out area */ }
  const handleMouseOver = (e) => {

    e.target.setStyle({
      fillOpacity: 0.7,
      opacity: 0.7
    });
    e.target.bringToFront();
  };

  const handleMouseOut = (e) => {

    e.target.setStyle({
      fillOpacity: 0.1,
      opacity: 0.1
    });
    e.target.bringToBack();
  };

  return (
    <>
      <div className={isDarkMode ? "dark" : "light"}>
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
              <Markers key={index} area={area} handleClick={handleClick} clickedArea={clickedArea}></Markers>
            )
          }

          {popupPosition && (
            <Popup position={popupPosition}>
              <div>{popupContent}</div>
            </Popup>
          )}
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

        <div className="absolute flex flex-row bottom-5 w-100 justify-end z-[1000] max-md:flex-col max-md:block">

          {/* Exit and Save buttons */}
          <div
            style={{
              gap: "10px",
              display: "flex",
              marginRight: "10px",
            }}
            className="max-md:w-100 max-md:mx-3"
          >
            {showExit && (
              <button
                onClick={() => {
                  navigate(-1)
                }}
                type="button"
                className="w-44 h-14 bg-[#D9D9D9] bg-opacity-60 shadow text-2xl font-normal text-black rounded-full hover:bg-[#938888] max-md:w-1/2 max-md:h-10"
              >
                Exit
              </button>
            )}
          </div>
        </div>
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

function Markers({ area, handleClick, clickedArea }) {
  const map = useMap()
  const [areaDoc, setAreaDoc] = useState([])
  const geometry = area.geoJson.geometry;

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
      }
      catch (err) {
        setAreaDoc("")
      }
    }
    takeDocumentsArea()

  }, [])

  return (

    geometry.type === 'Polygon' ?
      // Rendi un poligono
      (areaDoc &&
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
            <Tooltip
              permanent
            >
              {/* Permanent mantiene il Tooltip sempre visibile */}
              Descrizione del marker
            </Tooltip>
          </Marker>
          {
            clickedArea === area.id &&
            <Polygon
              positions={
                geometry.coordinates[0].map(coord => [coord[1], coord[0]]) // Inverti le coordinate per Leaflet
              }
              pathOptions={{ color: 'blue' }}
            />
          }
        </>
      )
      :
      // Rendi un punto
      (areaDoc &&
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
            <Tooltip
              permanent
            >
              {/* Permanent mantiene il Tooltip sempre visibile */}
              Descrizione del marker
            </Tooltip>
          </Marker>
        </>
      )
  );

}

export { GeoreferenceMapDoc }