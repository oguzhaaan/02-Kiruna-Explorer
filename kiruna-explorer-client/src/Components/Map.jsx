import React, { useRef, useState, useEffect } from "react";
import { MapContainer, TileLayer, Polygon, Popup, Marker } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import { FeatureGroup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import L, { geoJSON } from "leaflet";
import { useNavigate } from "react-router-dom";
import API from "../API/API.mjs";

function GeoreferenceMap(props){
    const navigate = useNavigate()

    const [popupContent, setPopupContent] = useState("");
    const [popupPosition, setPopupPosition] = useState(null);
    const [drawnObject, setDrawnObject] = useState(null);
    const [showSave, setShowSave] = useState(false);
    const [showExit, setShowExit] = useState(true);
    const [showModal, setShowModal] = useState(false)
    const [showMuniAreas, setShowMuniAreas] = useState(true)
    const [presentAreas, setPresentAreas] = useState(null);
    const [clickedArea, setClickedArea] = useState(null);
    const [alertMessage, setAlertMessage] = useState("");

    useEffect(() => {
        props.setNavShow(false); 
    }, []);

    useEffect(()=>{
        //refresh
    },[showExit,showSave,presentAreas])

    const redCenter = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
        });

    const GenericPoints = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
        });

    const mapRef = useRef(null);
    const latitude = 67.8524;
    const longitude = 20.2438;

    const cityBounds = [
        [67.92532085836797, 20.245374612817344],
        [67.85139867724654, 20.65936775042602],
        [67.77576380313107, 20.246345676166037],
        [67.86274503663387, 19.86795112123954]
      ];

      const handleClick = (e, content) => {
        setPopupContent("Area N."+content);
        setAlertMessage(`You selected Area N.${content}`)
        setPopupPosition(e.latlng);
        setClickedArea(content)
        setShowSave(true)
      };
    
      const handleMouseOver = (e) => {
        //setPopupContent((prevContent) => prevContent ? `${prevContent}, ${content}` : content);
        //setPopupPosition(null);
        e.target.setStyle({
          fillOpacity: 0.7,
          opacity: 0.7
        });
        e.target.bringToFront();
      };
    
      const handleMouseOut = (e) => {
        //setPopupContent("");
        //setPopupPosition(null);
        e.target.setStyle({
          fillOpacity: 0.1,
          opacity: 0.1
        });
        e.target.bringToBack();
      };

    const onCreated = (e) => {
        const { layer } = e;
        const geoJson  = layer.toGeoJSON()  
        setDrawnObject(geoJson);
    };
    
    const onEdited = (e) => {
        const layers = e.layers;
        layers.eachLayer((layer) => {
            const newPolygon = layer.getLatLngs()[0].map(latlng => [latlng.lat, latlng.lng]);
            setDrawnObject(newPolygon);
            print(newPolygon)
        });
    };
        
    const onDeleted = (e) => {
        setDrawnObject(null);
        setShowExit(true)
        setShowSave(false)
        setShowMuniAreas(true)
        setAlertMessage("");
    }

    const onDrawStart = () =>{
        setShowExit(false)
        setPresentAreas(null)
        setShowMuniAreas(false)
        setAlertMessage("");
    }

    const onEditStop = () =>{
        setShowExit(true)
        setShowSave(true)
        setAlertMessage(`You selected new Custom Area`)
    }

    const handleMunicipalAreas = async () =>{
      try{
        if (!presentAreas){
          const allAreas = await API.getAllAreas()
          console.log(allAreas)
          setPresentAreas(allAreas)
          setPopupContent("Municipality Area");
          setAlertMessage(`You selected Municipality Area`)
          setClickedArea(1)
          setShowSave(true)
        }
        else{
          setPresentAreas(null)
          setPopupContent("");
          setAlertMessage(null)
          setClickedArea(null)
          setShowSave(false)
        }
        
      }catch(err){
        console.log(err)
      }
    }
    
    const handleSave = async () =>{
        try{
            //If he drows a new area
            if(drawnObject){
              console.log(drawnObject)
              const area_id = await API.addArea(drawnObject) 
              props.setnewAreaId(area_id)
              setDrawnObject(null)
            }
            //if he clicked an existing one
            else{
              const area_id = clickedArea
              props.setnewAreaId(area_id)
            }
            navigate(-1);
        }catch(err){
            console.log(err)
        }
    }

    return(
        <>
        <button style={{position: "absolute", zIndex: "100", marginTop: "5.5rem", marginLeft: "0.6rem"}}>
          Save
        </button>
          <MapContainer
            center={[latitude, longitude]}
            zoom={13} ref={mapRef}
            style={{ height: "100vh", 
              width: "100vw", 
              filter: "invert(100%) hue-rotate(180deg) brightness(200%) contrast(90%)" 
            }}
            maxBounds={cityBounds}
            minZoom={12}>
    
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
            />
            <FeatureGroup>
              <EditControl
                key={drawnObject}
                position="topright"
                onCreated={onCreated}
                onEdited={onEdited}
                onDeleted={onDeleted}
                onDrawStart={onDrawStart}
                onEditStop={onEditStop}
                draw={{
                  rectangle: false,
                  circle: false,
                  circlemarker: false,
                  marker: drawnObject == null,
                  polyline: false,
                  polygon: drawnObject == null
                }}
                edit={
                  {
                    remove: true
                  }
                }
              />
            </FeatureGroup>

            {presentAreas && <Polygon
              positions={
                presentAreas[0].geoJson.geometry.coordinates[0].map(coord => [coord[1], coord[0]]) // Inverti le coordinate per Leaflet
              }
              pathOptions={{ color: 'blue' }}
              eventHandlers={{
                mouseover: (e) => handleMouseOver(e),
                click: (e) => handleClick(e, area.id),
                mouseout: (e) => handleMouseOut(e)
              }}
            />}
            {/* Visualize All present Areas*/}
            {/*
              presentAreas && presentAreas.map((area)=>{
                const geometry = area.geoJson.geometry;
                
                if (geometry.type === 'Polygon' || geometry.type === 'MultiPolygon') {
                  // Rendi un poligono
                  return (
                    <Polygon
                      key={area.id}
                      positions={
                        geometry.coordinates[0].map(coord => [coord[1], coord[0]]) // Inverti le coordinate per Leaflet
                      }
                      pathOptions={{ color: 'blue' }}
                      eventHandlers={{
                        mouseover: (e) => handleMouseOver(e),
                        click: (e) => handleClick(e, area.id),
                        mouseout: (e) => handleMouseOut(e)
                      }}
                    />
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
            */}
          
            <Marker position={[latitude, longitude]}
            icon={redCenter}>
                <Popup>
                <div>{"Center Of Kiruna"}</div>
              </Popup>
            </Marker>
            {popupPosition && (
              <Popup position={popupPosition}>
                <div>{popupContent}</div>
              </Popup>
            )}
          </MapContainer>

          {showMuniAreas && <div style={{
                position: "absolute",
                justifySelf: "center",
                top: "30%",
                right: "20px",
                display: "flex",
                gap: "10px",
                zIndex: "1000"
            }}>
            <button
              onClick={()=>handleMunicipalAreas()}
              type="button"
              className="w-15 bg-[#4388B2] shadow text-sm font-normal rounded-xl p-2 hover:bg-[#317199]"
            > <i className="bi bi-house-door fs-5"></i> <br/> Municipal <br/> Area</button>
        </div>}

        <div style={{
                position: "absolute",
                bottom: "20px",
                right: "20px",
                display: "flex",
                gap: "10px",
                zIndex: "1000"
            }}>
            {showExit && <button
              onClick={()=>{setShowModal(true)}}
              type="button"
              className="w-44 h-14 bg-[#D9D9D9] bg-opacity-60 shadow text-2xl  font-normal text-black rounded-full hover:bg-[#938888]"
            >
              Exit
            </button>}
            {showSave && <button
              onClick={()=>handleSave()}
              type="button"
              className="w-44 h-14  bg-[#4388B2] bg-opacity-100 shadow text-2xl  font-normal rounded-full hover:bg-[#317199]"
            >
              Save
            </button>}
          </div>

        {showModal &&
          <div className="fixed inset-0 flex items-center justify-center">
            <div className="flex flex-col justify-items-center align-items-center bg-box_color backdrop-blur-2xl drop-shadow-xl rounded-3xl text-white font-sans p-6">
            <div className="text-2xl mb-2 font-bold">Are you really sure to exit?</div>
            <div className="text-l font-bold">Your changes will be discarded</div>
            <div className="flex justify-center space-x-2 mt-10">
              <button
                onClick={()=>setShowModal(false)}
                className="bg-customGray text-black w-40 h-16 opacity-60 px-4 py-2 rounded-full text-2xl"
              >
                Cancel
              </button>
              <button
                onClick={()=>{navigate(-1),setDrawnObject(null)}}
                className="bg-customBlue  text-white w-40 h-16 px-4 py-2 rounded-full text-2xl"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
        }

        {/* Messaggio di avviso in basso al centro */}
        {alertMessage && (
            <div style={{
              position: "fixed",
              bottom: "20px",
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              color: "#fff",
              padding: "10px 20px",
              borderRadius: "10px",
              fontSize: "20px",
              zIndex: 1000,
            }}>
              {alertMessage}
            </div>
          )}
        </>
    )
}

export {GeoreferenceMap}