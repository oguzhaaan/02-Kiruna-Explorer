import React, { useRef, useState, useEffect } from "react";
import { MapContainer, TileLayer, Polygon, Popup, Marker, ZoomControl, useMap } from "react-leaflet";
import "./map.css"
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import L, { geoJSON } from "leaflet";
import { useNavigate } from "react-router-dom";
import API from "../API/API.mjs";

function CenterMap({ lat, lng }) {
  const map = useMap(); 
  map.panTo([lat, lng]);
  return null; 
}

const HomeButton = ({ handleMunicipalAreas }) => {
  return (
    <div title="Municipal Area" className="custom-home-button" onClick={()=>{}}>
      <CenterMap lat={67.8524} lng={20.2438}></CenterMap>
      <i className="bi bi-house-door-fill"></i> 
    </div>
  );
};

function GeoreferenceMapDoc(props){
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

    {/* Clear Alert message after 5 sec*/}
    useEffect(()=>{
      if (alertMessage!=""){
        const tid = setTimeout(()=>{
          setAlertMessage("")
        },5000)
        return () => clearTimeout(tid);
      }
    },[alertMessage])

    {/* Hide navbar at start and take all present areas*/}
    useEffect(() => {
        const handleAreas = async () =>{
            props.setNavShow(false); 
            const areas = await API.getAllAreas()
            setPresentAreas(areas)
        }
        handleAreas()
    }, []);

    {/* Refresh to show modifications*/}
    useEffect(()=>{
        //refresh
    },[showExit,presentAreas])

    const GenericPoints = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
        });

    const cityBounds = [
        [67.92532085836797, 20.245374612817344],
        [67.85139867724654, 20.65936775042602],
        [67.77576380313107, 20.246345676166037],
        [67.86274503663387, 19.86795112123954]
      ];

    {/* Click on area */}
    const handleClick = (e, content) => {
      
      setPopupContent("Area N."+content);
      setAlertMessage(`You selected Area N.${content}`)
      setPopupPosition(e.latlng);
      setClickedArea(content)
    };
    
    {/* Mouse over and out area */}
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
  
    return(
        <>
          <MapContainer
          
            center={[latitude, longitude]}
            zoom={13} ref={mapRef}
            zoomControl={false}
            style={{ height: "100vh", 
              width: "100vw", 
              filter: "invert(100%) hue-rotate(180deg) brightness(200%) contrast(90%)" 
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
              presentAreas && presentAreas.map((area)=>{
                /*
                const [areaDoc, setAreaDoc] = useState([])

                useEffect(()=>{
                    const takeDocumentsArea = async ()=>{
                        const docs = await API.getDocumentsFromArea(area.id)
                        setAreaDoc(docs)
                    }
                    takeDocumentsArea()
                },[])
                */
                const geometry = area.geoJson.geometry;
                
                if (geometry.type === 'Polygon' || geometry.type === 'MultiPolygon') {
                  // Rendi un poligono
                  return (
                    <Marker
                      key={area.id}
                      position={geometry.coordinates[0].map(coord => [coord[1], coord[0]])[0]} // Inverti lat/lng per Leaflet
                      icon={GenericPoints} // Puoi scegliere di usare un'icona personalizzata per i punti
                      eventHandlers={{
                        click: (e) => handleClick(e, area.id)
                      }}
                    >
                      <Popup>{`Area ID: ${area.id}`}</Popup>
                    </Marker>
                  );
                } else if (geometry.type === 'Point') {
                  // Rendi un punto
                  return (
                    <Marker
                      key={area.id}
                      position={[geometry.coordinates[1], geometry.coordinates[0]]} // Inverti lat/lng per Leaflet
                      icon={GenericPoints} // Puoi scegliere di usare un'icona personalizzata per i punti
                      eventHandlers={{
                        click: (e) => handleClick(e, area.id)
                      }}
                    >
                      <Popup>{`Area ID: ${area.id}`}</Popup>
                    </Marker>
                  );
                }
                return null; // Gestione nel caso in cui il tipo di geometria non sia supportato
              })
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
        </>
    )
}

export {GeoreferenceMapDoc}