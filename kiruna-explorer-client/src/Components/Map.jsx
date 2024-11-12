import React, {useRef, useState, useEffect} from "react";
import {MapContainer, TileLayer, Polygon, Popup, Marker, ZoomControl} from "react-leaflet";
import {EditControl} from "react-leaflet-draw";
import {FeatureGroup} from "react-leaflet";
import "./map.css"
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import L, {geoJSON} from "leaflet";
import {useNavigate} from "react-router-dom";
import API from "../API/API.mjs";
import {useTheme} from "../contexts/ThemeContext.jsx";

function GeoreferenceMap(props) {
    const { isDarkMode } = useTheme();
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

    const mapRef = useRef(null);

    useEffect(() => {
        props.setNavShow(false);
    }, []);

    useEffect(() => {
        //refresh
    }, [showExit, showSave, presentAreas])

    const GenericPoints = L.icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    const latitude = 67.8524;
    const longitude = 20.2438;

    const cityBounds = [
        [67.92532085836797, 20.245374612817344],
        [67.85139867724654, 20.65936775042602],
        [67.77576380313107, 20.246345676166037],
        [67.86274503663387, 19.86795112123954]
    ];

    const handleClick = (e, content) => {

        setPopupContent("Area N." + content);
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
        const {layer} = e;

        if (layer instanceof L.Polygon) {
            setAlertMessage("You selected a new custom area");
        } else if (layer instanceof L.Marker) {
            setAlertMessage("You selected a new custom point");
        }

        const geoJson = layer.toGeoJSON();
        setDrawnObject(geoJson);
        setShowExit(true);
        setShowSave(true);
    };

    const onEdited = (e) => {
        console.log("onEdited", e);

        const layers = e.layers;
        layers.eachLayer((layer) => {
            if (layer instanceof L.Polygon) {
                const newPolygon = layer.getLatLngs()[0].map(latlng => [latlng.lat, latlng.lng]);
                setDrawnObject(newPolygon);
                setAlertMessage("You edited the custom area");
                console.log("Modificato un poligono:", newPolygon);
            } else if (layer instanceof L.Marker) {
                const markerPosition = layer.getLatLng();
                setDrawnObject(markerPosition);
                setAlertMessage("You edited the point position");
                console.log("Modificato un marker:", markerPosition);
            } else {
                console.warn("Tipo di layer non supportato.");
            }
        });
        setShowExit(true);
        setShowSave(true);
    };

    const onDeleted = (e) => {
        setDrawnObject(null);
        setShowExit(true);
        setShowSave(false);
        setShowMuniAreas(true);
        setAlertMessage("");
    };

    const onDrawStart = () => {
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

    const handleMunicipalAreas = async () => {
        try {
            if (!presentAreas) {
                const allAreas = await API.getAllAreas()
                console.log(allAreas)
                setPresentAreas(allAreas)
                setPopupContent("Municipality Area");
                setAlertMessage(`You selected Municipality Area`)
                setClickedArea(1)
                setShowSave(true)
            } else {
                setPresentAreas(null)
                setPopupContent("");
                setAlertMessage(null)
                setClickedArea(null)
                setShowSave(false)
            }

        } catch (err) {
            console.log(err)
        }
    }

    const handleSave = async () => {
        try {
            //If he drows a new area
            if (drawnObject) {
                console.log(drawnObject)
                const area_id = await API.addArea(drawnObject)
                props.setnewAreaId(area_id)
                setDrawnObject(null)
            }
            //if he clicked an existing one
            else {
                const area_id = clickedArea
                props.setnewAreaId(area_id)
            }
            navigate(-1);
        } catch (err) {
            console.log(err)
        }
    }

    return (
        <div className={isDarkMode ? "dark" : "light"}>
            {showModal &&
                <div className="z-[500] fixed inset-0 flex items-center justify-center">
                    <div
                        className="flex flex-col justify-items-center align-items-center bg-box_white_color dark:bg-box_color backdrop-blur-2xl drop-shadow-xl rounded-xl text-black_text dark:text-white_text font-sans p-6">
                        <div className="text-xl mb-2 font-bold">Are you really sure to exit?</div>
                        <div className="text-sm font-normal">Your changes will be discarded</div>
                        <div className="flex justify-center space-x-2 mt-10">
                            <button
                                onClick={() => setShowModal(false)}
                                className="bg-[#FFFFFFcc] dark:bg-customGray hover:bg-[#FFFFFFff] dark:hover:bg-[#938888] transition text-black w-40 h-16 opacity-60 px-4 py-2 rounded-xl text-xl"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    navigate(-1);
                                    setDrawnObject(null)
                                }}
                                className="bg-primary_color_light dark:bg-customBlue hover:bg-blue-300 dark:hover:bg-[#317199] transition text-black_text dark:text-white_text w-40 h-16 px-4 py-2 rounded-xl text-xl"
                            >
                                Exit
                            </button>
                        </div>
                    </div>
                </div>
            }

            <MapContainer

                center={[latitude, longitude]}
                zoom={13} ref={mapRef}
                zoomControl={false} // Disabilita il controllo zoom di default
                style={{
                    height: "100vh",
                    width: "100vw",
                    //filter: "invert(100%) hue-rotate(180deg) brightness(200%) contrast(90%)"
                }}
                maxBounds={cityBounds}
                minZoom={12}

            >

                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://tile.openstreetmap.de/{z}/{x}/{y}.png"
                />
                <ZoomControl position="topright"/>
                <FeatureGroup>
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

                {presentAreas && <Polygon
                    positions={
                        presentAreas[0].geoJson.geometry.coordinates[0].map(coord => [coord[1], coord[0]]) // Inverti le coordinate per Leaflet
                    }
                    pathOptions={{color: 'blue'}}
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

            {showMuniAreas && <div style={{
                position: "absolute",
                justifySelf: "center",
                top: "50%",
                right: "20px",
                display: "flex",
                gap: "10px",
                zIndex: "1000"
            }}>
                <button
                    onClick={() => handleMunicipalAreas()}
                    type="button"
                    className="w-15 bg-customBlue text-white_text shadow text-sm font-normal rounded-xl p-2 hover:bg-[#63addb]"
                ><i className="bi bi-house-door fs-5"></i> <br/> Municipal <br/> Area
                </button>
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
                    onClick={() => {
                        setShowModal(true)
                    }}
                    type="button"
                    className="w-28 py-2 bg-[#D9D9D9] bg-opacity-60 shadow text-xl  font-normal text-black rounded-3xl hover:bg-[#938888] transition"
                >
                    Exit
                </button>}
                {showSave && <button
                    onClick={() => handleSave()}
                    type="button"
                    className="w-28 py-2 bg-customBlue transition text-white_text bg-opacity-100 shadow text-xl font-normal rounded-3xl hover:bg-[#317199]"
                >
                    Save
                </button>}
            </div>

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
        </div>
    )
}

export {GeoreferenceMap}