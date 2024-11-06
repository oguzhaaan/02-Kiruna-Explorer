import React, { useRef, useState, useEffect } from "react";
import { MapContainer, TileLayer, Polygon, Popup, Marker } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import { FeatureGroup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import L from "leaflet";
import { useNavigate } from "react-router-dom";

function GeoreferenceMap(props){
    const navigate = useNavigate()

    const [popupContent, setPopupContent] = useState("");
    const [popupPosition, setPopupPosition] = useState(null);
    const [drawnObject, setDrawnObject] = useState(null);
    const [showSave, setShowSave] = useState(false);
    const [showExit, setShowExit] = useState(true);

    useEffect(() => {
        props.setNavShow(false); 
    }, []);

    useEffect(()=>{
        //refresh
    },[showExit,showSave])

    const redCenter = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
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

    const onCreated = (e) => {
        const { layerType, layer } = e;
        
        if (layerType === 'polygon') {
            const newPolygon = layer.getLatLngs()[0].map(latlng => [latlng.lat, latlng.lng]);
            setDrawnObject(newPolygon);
            const geoJson = layer.toGeoJSON();
            console.log(geoJson);
        }
        else if (layerType === 'marker') {
            setDrawnObject([layer.getLatLng().lat, layer.getLatLng().lng]);
        }
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
    }

    const onDrawStart = () =>{
        setShowExit(false)
    }

    const onEditStop = () =>{
        setShowExit(true)
        setShowSave(true)
    }
    
    const handleSave = async () =>{
        try{
            //TODO add area api
            const area_id = 1 
            props.setnewAreaId(area_id)
            setDrawnObject(null)
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

          <div style={{
                position: "absolute",
                justifySelf: "center",
                top: "30%",
                right: "20px",
                display: "flex",
                gap: "10px",
                zIndex: "1000"
            }}>
            <button
              type="button"
              className="w-15 bg-[#4388B2] shadow text-sm font-normal rounded-xl p-2 hover:bg-[#317199]"
            > <i className="bi bi-house-door fs-5"></i> <br/> Municipal <br/> Area</button>
        </div>

        <div style={{
                position: "absolute",
                bottom: "20px",
                right: "20px",
                display: "flex",
                gap: "10px",
                zIndex: "1000"
            }}>
            {showExit && <button
              onClick={()=>{setDrawnObject(null),navigate(-1)}}
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
        </>
    )
}

export {GeoreferenceMap}