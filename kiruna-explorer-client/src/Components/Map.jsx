import React, { useRef, useState, useEffect } from "react";
import { MapContainer, TileLayer, Polygon, Popup, Marker, ZoomControl } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import { FeatureGroup } from "react-leaflet";
import { polygon, booleanPointInPolygon } from '@turf/turf';
import "./map.css"
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import L, { geoJSON } from "leaflet";
import { useNavigate } from "react-router-dom";
import API from "../API/API.mjs";

const HomeButton = ({ map, handleMunicipalAreas }) => {
  return (
    <div title="Municipal Area" className="custom-home-button" onClick={()=>handleMunicipalAreas()}>
      <i className="bi bi-house-door-fill text-[#464646]"></i> {/* FontAwesome Icon */}
    </div>
  );
};

function GeoreferenceMap(props){
    const navigate = useNavigate()

    const latitude = 67.8524;
    const longitude = 20.2438;

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
    const [showManually, setShowManually] = useState(true)
    const [lat, setLat] = useState(latitude);
    const [lng, setLng] = useState(longitude);
    const [tmplat, settmpLat] = useState(latitude);
    const [tmplng, settmpLng] = useState(longitude);
    const [laterr, setLaterr] = useState(false)
    const [lngerr, setLngerr] = useState(false)

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

    {/* Hide navbar at start*/}
    useEffect(() => {
        props.setNavShow(false); 
    }, []);

    {/* Refresh to show modifications*/}
    useEffect(()=>{
        //refresh
    },[showExit,showSave,presentAreas,laterr,lngerr,lng , lat])

    {/*
      const geoJson = {
          type:"Feature",
          properties:{},
          geometry:{
            type:"Point",
            coordinates:[lng,lat]
      }
        }*/}

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

    const BoundsConnected = polygon([[
      [20.245374612817344, 67.92532085836797],
      [20.65936775042602, 67.85139867724654],
      [20.246345676166037, 67.77576380313107],
      [19.86795112123954, 67.86274503663387],
      [20.245374612817344, 67.92532085836797] 
    ]]);

    {/* Check if point is in city bounds */}
    const isPointInCityBounds = (lat, lng) => {
      const point = [lng, lat];
      return booleanPointInPolygon(point, BoundsConnected);
    };

    {/* Click on area */}
    const handleClick = (e, content) => {
      
      setPopupContent("Area N."+content);
      setAlertMessage(`You selected Area N.${content}`)
      setPopupPosition(e.latlng);
      setClickedArea(content)
      setShowSave(true)
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

    {/* Handle creation/edit/delete of a area/point */}
    const onCreated = (e) => {
      setShowManually(false)
      const { layer } = e;
      console.log(layer)
      if (layer instanceof L.Polygon) {
          setAlertMessage("You selected a new custom area");
      } else if (layer instanceof L.Marker) {
          const markerPosition = layer.getLatLng();
          settmpLat(markerPosition.lat);
          settmpLng(markerPosition.lng);
          setAlertMessage("You selected a new custom point");
      }
  
      const geoJson = layer.toGeoJSON();  
      setDrawnObject(geoJson);
      setShowExit(true);
      setShowSave(true);
  };
    
  const onEdited = (e) => {
    setShowManually(false)
    console.log("onEdited", e);

    const layers = e.layers;
    layers.eachLayer((layer) => {
      const geoJson = layer.toGeoJSON();  
      setDrawnObject(geoJson);
      if (layer instanceof L.Polygon) {
        setAlertMessage("You edited the custom area");
        console.log("Modificato un poligono:", geoJson);
      } else if (layer instanceof L.Marker) {
        const markerPosition = layer.getLatLng();
        settmpLat(markerPosition.lat);
        settmpLng(markerPosition.lng);
        setAlertMessage("You edited the point position");
        console.log("Modificato un marker:", geoJson);
      } else {
        console.warn("Tipo di layer non supportato.");
      }
    });
    setShowExit(true);
    setShowSave(true);
  };
    
  const onDeleted = (e) => {
      setShowManually(true)
      setDrawnObject(null);
      setShowExit(true);
      setShowSave(false);
      setShowMuniAreas(true);
      setAlertMessage("");
      settmpLat(latitude)
      settmpLng(longitude)
  };
    
  const onDrawStart = () => {
      settmpLat("")
      settmpLng("")
      setLaterr("")
      setLngerr("")
      setShowSave(false)
      setShowExit(false);
      setPresentAreas(null);
      setShowMuniAreas(false);
      setAlertMessage("Click the map to set area points or set your point");
  };
  
  const onEditStart = () => {
      setAlertMessage("Edit your area or move the point as needed.");
      setShowExit(false);
      setShowSave(false);
  };

  {/* Handle latitude and longitude input field modification */}
  const handleLng = (event) => {
    try{
      const newLng = event.target.value;
      if (isPointInCityBounds(lat,newLng)){
        setShowSave(true)
        setLngerr(false)
        setLng(newLng);
        settmpLng(newLng)
        setAlertMessage("You selected custom point")
      }
      else{
        setLngerr(true)
        setShowSave(false)
        settmpLng(newLng || "")
        setAlertMessage("Point out of city bounds")
      }
    }catch(err){
      setAlertMessage(err.message)
    }
  };
    
  const handleLat = (event) => {
    try{
    const newLat = event.target.value;
    if (isPointInCityBounds(newLat,lng)){
      setShowSave(true)
      setLaterr(false)
      setLat(newLat);
      settmpLat(newLat)
      setAlertMessage("You selected custom point")
    }
    else{
      setLaterr(true)
      setShowSave(false)
      settmpLat(newLat || "")
      setAlertMessage("Point out of city bounds")
    }
    }
    catch(err){
      setAlertMessage(err.message)
    }
  };

  {/* Get all areas to diplay them, the first (presentAreas[0]) should be the municipality one */}
  const handleMunicipalAreas = async () => {
    try{
      if (!presentAreas){
        const allAreas = await API.getAllAreas()
        console.log(allAreas)
        setPresentAreas(allAreas)
        setPopupContent("Municipality Area");
        setAlertMessage(`You selected Municipality Area`)
        setClickedArea(1)
        setShowSave(true)
        setShowManually(false)
        settmpLat("")
        settmpLng("")
        setLaterr("")
        setLngerr("")
      }
      else{
        setPresentAreas(null)
        setPopupContent("");
        setAlertMessage(null)
        setClickedArea(null)
        setShowSave(false)
        setShowManually(true)
        settmpLat(latitude)
        settmpLng(longitude)
      }
        
    }catch(err){
      console.log(err)
    }
  }
    
  {/* Save the area selected */}
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
          else if (clickedArea){
            const area_id = clickedArea
            props.setnewAreaId(area_id)
          }
          else{
            const geoJson = {
              type:"Feature",
              properties:{},
              geometry:{
                type:"Point",
                coordinates:[lng,lat]
              }
            }
            const area_id = await API.addArea(geoJson) 
            props.setnewAreaId(area_id)
          }
          navigate(-1);
      }catch(err){
          console.log(err)
      }
  }

    return(
        <>
          <MapContainer
          
            center={[latitude, longitude]}
            zoom={13} ref={mapRef}
            zoomControl={false}
            style={{ height: "100vh", 
              width: "100vw", 
              filter: ""
            }}
            maxBounds={cityBounds}
            minZoom={12}
            >
            {mapRef.current && showMuniAreas && <HomeButton map={mapRef.current.leafletElement} handleMunicipalAreas={handleMunicipalAreas} />}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
            />
            <ZoomControl position="topright" />
            <FeatureGroup className="absolute ">
              <EditControl
                key={drawnObject}
                position="topright"
                onCreated={onCreated}
                onEdited={onEdited}
                onDeleted={onDeleted}
                onDrawStart={onDrawStart}
                onEditStart={onEditStart}
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

            {tmplat && tmplng && showManually &&
              <Marker
              position={[lat,lng]}
              icon={GenericPoints} 
              > 
              </Marker>}

            {presentAreas && <Polygon
              positions={
                presentAreas[0].geoJson.geometry.coordinates[0].map(coord => [coord[1], coord[0]])
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
          
            {popupPosition && (
              <Popup position={popupPosition}>
                <div>{popupContent}</div>
              </Popup>
            )}
          </MapContainer>

        {/* Modal exit confirm */}
        {showModal &&
          <div className="fixed z-[500] inset-0 flex items-center justify-center">
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
                className="bg-customBlue  text-white_text w-40 h-16 px-4 py-2 rounded-full text-2xl"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
        }

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
            }}
            className={`${(lngerr || laterr) && showManually && 'border-red-500 border-1'}`}
            >
              {alertMessage}
            </div>
          )}

        <div className="absolute flex flex-row bottom-5 w-100 justify-between z-[1000] max-md:flex-col max-md:block">

          {/* Editable coordinates */}
          <div
            style={{
              gap: "10px",
              display: "flex",
              marginLeft: "10px",
            }}
            className="max-md:mb-4"
          >
            <div className="flex flex-col">
              <label className="text-white mb-1 text-l text-left">Longitude</label>
              <input
                disabled={!showManually}
                id="lon"
                value={tmplng}
                onChange={(e) => handleLng(e)}
                className={`px-2 text-l py-1 text-placeholder_color text-white placeholder:text-placeholder_color bg-input_color rounded-[40px] ${
                  lngerr && showManually ? "border-red-500 border-1" : ""
                }`}
              />
            </div>
            <div className="flex flex-col">
              <label className="text-white mb-1 text-l text-left">Latitude</label>
              <input
                disabled={!showManually}
                id="lat"
                value={tmplat}
                onChange={(e) => handleLat(e)}
                className={`px-2 text-l py-1 text-placeholder_color text-white placeholder:text-placeholder_color bg-input_color rounded-[40px] ${
                  laterr && showManually ? "border-red-500 border-1" : ""
                }`}
              />
            </div>
          </div>

          {/* Exit and Save buttons */}  
          <div
          style={{
            gap: "10px",
            display: "flex",
            marginRight: "10px",
          }}
          >
            {showExit && (
              <button
                onClick={() => {
                    setShowModal(true);
                }}
                type="button"
                className="w-44 h-14 bg-[#D9D9D9] bg-opacity-60 shadow text-2xl font-normal text-black rounded-full hover:bg-[#938888]"
              >
                Exit
              </button>
            )}
            {showSave && (
              <button
                onClick={() => handleSave()}
                type="button"
                className="w-44 h-14 bg-customBlue text-white_text bg-opacity-100 shadow text-2xl font-normal rounded-full hover:bg-[#317199]"
              >
                Save
              </button>
            )}
          </div>
        </div>
        </>
    )
}

export {GeoreferenceMap}