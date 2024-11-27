import React, { useRef, useState, useEffect } from "react";
import { MapContainer, TileLayer, Polygon, Popup, Marker, ZoomControl, useMap, Tooltip, GeoJSON } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import MarkerClusterGroup from "react-leaflet-markercluster"
import { FeatureGroup } from "react-leaflet";
import * as turf from '@turf/turf';
import "./map.css"
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import L, { geoJSON, contains, featureGroup, bounds } from "leaflet";
import { useNavigate } from "react-router-dom";
import API from "../API/API.mjs";
import { useTheme } from "../contexts/ThemeContext.jsx";
import markerpin from "../assets/marker-pin.svg"
import polygonpin from "../assets/polygon-pin.svg"
import municipalarea from "../assets/municipal-area.svg"
import { getIcon } from "./Utilities/DocumentIcons.jsx";
import Alert from "./Alert.jsx";

function CenterMap({ latlng }) {
    const map = useMap();
    map.panTo(latlng);
    return null;
}

function calculateCentroid(coordinates) {
    const polygon = L.polygon(coordinates.map(coord => [coord[1], coord[0]])); // Inverti [lng, lat] -> [lat, lng]

    const bounds = polygon.getBounds();

    // return center
    return bounds.getCenter();
}

function calculateBounds(coordinates, Municipal = false) {
    if (Municipal) {
        let bounds = L.latLngBounds();

        console.log("Processing MultiPolygon");

        // Itera su ciascun poligono del MultiPolygon
        coordinates.forEach(polygonCoordinates => {
            // Ogni poligono potrebbe avere anelli multipli (esterno e isole)
            polygonCoordinates.forEach(ring => {
                // Inverti [lng, lat] in [lat, lng] e calcola i bounds di ogni anello
                const latLngs = ring.map(coord => [coord[1], coord[0]]);
                const polygonBounds = L.polygon(latLngs).getBounds();
                bounds.extend(polygonBounds); // Estendi i bounds complessivi
            });
        });
        console.log("Bounds" + bounds)
        return bounds;
    }
    else {
        const polygon = L.polygon(coordinates.map(coord => [coord[1], coord[0]])); // Inverti [lng, lat] -> [lat, lng]

        return polygon.getBounds();
    }
}

const HomeButton = ({ handleMunicipalAreas }) => {
    const map = useMap()
    return (
        <div title="Municipal Area" className="custom-home-button" onClick={() => {
            handleMunicipalAreas(), map.setView([68.20805, 20.593249999999998], 8)
        }}>
            <i className="bi bi-house-door-fill text-[#464646]"></i>
        </div>
    );
};

function GeoreferenceMap(props) {
    const { isDarkMode } = useTheme();
    const navigate = useNavigate()

    const center = [68.20805, 20.593249999999998]

    const boundaries = L.latLngBounds(
        L.latLng(67.3562, 17.8998),  // sud-ovest
        L.latLng(69.0599, 23.2867)   // nord-est
    );

    const [drawnObject, setDrawnObject] = useState(null);
    const [showSave, setShowSave] = useState(false);
    const [showExit, setShowExit] = useState(true);
    const [showModal, setShowModal] = useState(false)
    const [showMuniAreas, setShowMuniAreas] = useState(true)
    const [presentAreas, setPresentAreas] = useState(null);
    const [clickedArea, setClickedArea] = useState(null);
    const [alertMessage, setAlertMessage] = useState("");
    const [alertCustomMessage, setAlertCustomMessage] = useState(['', '']);
    const [showManually, setShowManually] = useState(false)
    const [markerLayer, setMarkerLayer] = useState(null);
    const [polygonLayer, setPolygonLayer] = useState(null);

    const [markerCoordinates, setMarkerCoordinates] = useState({ lat: "", lng: "" });
    const [polygonCoordinates, setPolygonCoordinates] = useState(null);

    const [coordinatesErr, setCoordinatesErr] = useState(false)

    const mapRef = useRef(null);
    const featureGroupRef = useRef(null);
    /*
    // Put clearer name for button finish drawing
    const element = document.querySelector('.leaflet-draw-actions-top a[title="Finish drawing"]');
    if (element) {
        element.textContent = "Connect last point";
    } else {
        console.error("Element not found");
    }*/

    {/* Clear Alert message after 5 sec*/
    }
    useEffect(() => {
        if (alertMessage != "") {
            const tid = setTimeout(() => {
                setAlertMessage("")
            }, 5000)
            return () => clearTimeout(tid);
        }
    }, [alertMessage])

    {/* Hide navbar at start*/
    }
    useEffect(() => {
        props.setNavShow(false);
    }, []);

    {/* Refresh to show modifications*/
    }
    useEffect(() => {
        //refresh
    }, [showExit, showSave, presentAreas, coordinatesErr, clickedArea])

    {/* Click on area */
    }
    const handleClick = (e, content, map) => {
        if (content.id === clickedArea) {
            setClickedArea(null)
            setAlertMessage(``)
            setShowSave(false)
            map.setView(center, 8)
        }
        else {
            if (content.id === 1) {
                setAlertMessage(`You selected Municipality Area`)
                map.fitBounds(boundaries);
            }
            else {
                setAlertMessage(`You selected a Georeference`)
                if (content.geoJson.geometry.type === "Polygon") {
                    map.fitBounds(calculateBounds(content.geoJson.geometry.coordinates[0]));
                }
                else {
                    map.setView([content.geoJson.geometry.coordinates[1], content.geoJson.geometry.coordinates[0]], 14)
                }
            }
            setClickedArea(content.id)
            setShowSave(true)
        }

    };

    {/* Handle creation/edit/delete of a area/point */
    }
    const onCreated = (e) => {

        const { layer } = e;
        if (layer instanceof L.Polygon) {
            const latlngs = layer.getLatLngs()
            if (isPolygonInCityBounds(latlngs)) {
                setShowManually(false)
                setAlertMessage("You selected a new custom area");
                const geoJson = layer.toGeoJSON();
                setPolygonLayer(layer)
                setPolygonCoordinates(latlngs)
                setDrawnObject(geoJson);
                setShowMuniAreas(false)
                setShowExit(true);
                setShowSave(true);
            }
            else {
                setAlertMessage("The Polygon has points out of city bounds");
                if (mapRef && featureGroupRef) {
                    mapRef.current.removeLayer(layer)
                    featureGroupRef.current.removeLayer(layer)
                }
            }
        } else if (layer instanceof L.Marker) {
            const markerPosition = layer.getLatLng();
            if (isPointInCityBounds(markerPosition.lat, markerPosition.lng)) {
                setShowManually(true)
                setAlertMessage("You selected a new custom point");
                setMarkerLayer(layer);
                setMarkerCoordinates({ lat: markerPosition.lat, lng: markerPosition.lng });
                const geoJson = layer.toGeoJSON();
                setDrawnObject(geoJson);
                setShowMuniAreas(false)
                setShowExit(true);
                setShowSave(true);
            }
            else {
                setAlertMessage("The point is out of city bounds");
                if (mapRef && featureGroupRef) {
                    mapRef.current.removeLayer(layer)
                    featureGroupRef.current.removeLayer(layer)
                }
            }
        }
    };

    const onEdited = (e) => {
        const layers = e.layers;
        layers.eachLayer((layer) => {
            const geoJson = layer.toGeoJSON();

            if (layer instanceof L.Polygon) {
                const latlngs = layer.getLatLngs()
                if (isPolygonInCityBounds(latlngs)) {
                    setDrawnObject(geoJson);
                    setShowManually(false)
                    setAlertMessage("You edited the custom area");
                    setShowExit(true);
                    setShowSave(true);
                    setPolygonLayer(layer)
                    setPolygonCoordinates(latlngs)
                }
                else {
                    setAlertMessage("Point out of city bounds");
                    if (polygonLayer) {
                        polygonLayer.setLatLngs(polygonCoordinates);
                    }
                }
            } else if (layer instanceof L.Marker) {
                const markerPosition = layer.getLatLng();
                if (isPointInCityBounds(markerPosition.lat, markerPosition.lng)) {
                    setDrawnObject(geoJson);
                    setShowManually(true)
                    setMarkerLayer(layer);
                    setMarkerCoordinates({ lat: markerPosition.lat, lng: markerPosition.lng });
                    setShowExit(true);
                    setShowSave(true);
                } else {
                    setAlertMessage("Point out of city bounds");
                    if (markerLayer) {
                        console.log(markerCoordinates)
                        markerLayer.setLatLng([markerCoordinates.lat, markerCoordinates.lng]);
                    }
                }
            }
        });
    };

    const onDeleted = (e) => {
        setShowManually(false)
        setDrawnObject(null);
        setShowExit(true);
        setShowSave(false);
        setShowMuniAreas(true);
        setAlertMessage("");
        setMarkerLayer(null)
        setMarkerCoordinates({ lat: "", lng: "" })

    };

    const onDrawStart = () => {
        setCoordinatesErr(false)
        setShowSave(false)
        setShowExit(false);
        setPresentAreas(null);
        setShowMuniAreas(false);
        setAlertMessage("Click the map to set area points or set your point");
    };

    const onDrawStop = () => {
        setCoordinatesErr(false)
        if (markerLayer === null) {
            setShowMuniAreas(true)
            setShowExit(true)
            setAlertMessage("")
        }
    };

    const onEditStart = () => {
        setAlertMessage("Edit your area or move the point as needed.");
        setShowExit(false);
        setShowSave(false);
    };

    const onEditStop = () => {
        setShowExit(true);
        setShowSave(true);
    };

    const createLayerToUpdate = async (areaId) => {
        try {
            const updateArea = await API.getAreaById(areaId)
            let newLayer;

            if (updateArea.geometry.type === "Point") {
                // Crea un nuovo marker
                const [lng, lat] = updateArea.geometry.coordinates;
                newLayer = L.marker([lat, lng], {
                    icon: L.icon({
                        iconUrl: markerpin, // Percorso verso l'icona personalizzata
                        iconSize: [32, 32],
                        iconAnchor: [16, 32],
                    }),
                });
                setAlertMessage("You can update the marker coordinates")
            } else if (updateArea.geometry.type === "Polygon") {
                // Crea un nuovo poligono
                newLayer = L.polygon(updateArea.geometry.coordinates[0].map(coord => [coord[1], coord[0]]), {
                    color: "blue",
                    weight: 2,
                    fillColor: "#3388ff",
                    fillOpacity: 0.5,
                });
                setAlertMessage("You can update polygon coordinates")
            }
            else {
                return
            }

            // Aggiungi il layer alla mappa
            if (featureGroupRef.current && mapRef.current && !drawnObject) {
                const map = mapRef.current
                featureGroupRef.current.addLayer(newLayer);
                setCoordinatesErr(false);

                // Centra la mappa sul nuovo layer
                if (updateArea.geometry.type === "Point") {
                    map.panTo(updateArea.geometry.coordinates);
                } else if (updateArea.geometry.type === "Polygon") {
                    const bounds = newLayer.getBounds();
                    map.fitBounds(bounds);
                }
                // Salva il GeoJSON del layer creato
                setDrawnObject(newLayer.toGeoJSON());
            }
        } catch (err) {
            setAlertMessage("No area provided for this document, create new one or exit");
        }
    };

    const updateMarkerPosition = (lat, lng) => {
        if (markerLayer) {
            // Aggiorna lo stato per riflettere le nuove coordinate
            setMarkerCoordinates({ lat, lng });
            if (isPointInCityBounds(lat, lng)) {
                // Aggiorna la posizione del marker esistente
                markerLayer.setLatLng([lat, lng]);
                setShowSave(true)
                setAlertMessage("You modified your custom point")
                setCoordinatesErr(false)
                const geoJson = markerLayer.toGeoJSON()
                setDrawnObject(geoJson)
                // Centra la mappa sul nuovo marker
                if (mapRef.current) {
                    mapRef.current.setView([lat, lng], mapRef.current.getZoom());
                }
            }
            else {
                setShowSave(false)
                setAlertMessage("Coordinates out of city bound")
                setCoordinatesErr(true)
            }

        }
    };

    {/* Get all areas to display them, the first (presentAreas[0]) should be the municipality one */
    }
    const handleMunicipalAreas = async () => {
        try {
            if (!presentAreas) {
                const allAreas = await API.getAllAreas();
                console.log(allAreas)
                setPresentAreas(allAreas)
                setAlertMessage("Select existing area")
                setShowManually(false)
                setCoordinatesErr(false)
            } else {
                setPresentAreas(null)
                setAlertMessage(null)
                setClickedArea(null)
                setShowSave(false)
            }

        } catch (err) {
            setAlertCustomMessage([err.message, 'error'])
            //console.log(err)
        }
    }

    {/* Check if point is in city bounds */
    }
    const isPolygonInCityBounds = (latlngs) => {
        let flag = true
        for (let coord of latlngs[0]) {
            if (!isPointInCityBounds(coord.lat, coord.lng)) {
                flag = false
            }
        }
        return flag
    };

    const isPointInCityBounds = (lat, lng) => {

        const polygons = props.municipalGeoJson.geometry.coordinates;
        const point = turf.point([lng, lat])
        let flag = false
        polygons.forEach((polygon, polyIndex) => {
            polygon.forEach((ring) => {
                const p = turf.polygon([ring])
                if (turf.booleanPointInPolygon(point, p)) {
                    flag = true
                }
            })
        });
        return flag;
    };

    {/* Save the area selected */
    }
    const handleSave = async () => {
        try {
            let area_id
            //If he drows a new area
            if (drawnObject) {
                area_id = await API.addArea(drawnObject)
                setDrawnObject(null)
            }
            //if he clicked an existing one
            else if (clickedArea) {
                area_id = clickedArea
            }

            // if update area is not null then update, else set new area id for the form
            props.updateAreaId.docId ? await API.updateDocumentArea(props.updateAreaId.docId, area_id) : props.setnewAreaId(area_id)
            props.setUpdateAreaId({ areaId: "done", docId: "done" })
            navigate(-1);
        } catch (err) {
            setAlertCustomMessage(["We encountered some errors, check your connection and retry", 'error'])
            //console.log(err)
        }
    }

    return (
        <div className={isDarkMode ? "dark" : "light"}>
            <Alert message={alertCustomMessage[0]} type={alertCustomMessage[1]}
                clearMessage={() => setAlertCustomMessage(['', ''])}></Alert>
            <MapContainer
                whenCreated={(map) => {
                    mapRef.current = map;
                }}
                center={center}
                zoom={5} ref={mapRef}
                zoomControl={false}
                style={{
                    height: "100vh",
                    width: "100vw"
                }}
                maxBounds={boundaries}
                minZoom={8}
                whenReady={() => { if (props.updateAreaId.docId && !drawnObject) createLayerToUpdate(props.updateAreaId.areaId) }}
            >
                {mapRef.current && !drawnObject && showMuniAreas && <HomeButton handleMunicipalAreas={handleMunicipalAreas} />}
                {props.municipalGeoJson && <GeoJSON data={props.municipalGeoJson} pathOptions={{ color: `${isDarkMode ? "#CCCCCC" : "grey"}`, weight: 2, dashArray: "5, 5" }} />}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    className={isDarkMode ? "custom-tile-layer" : ""}
                />
                <ZoomControl position="topright" />
                <FeatureGroup ref={featureGroupRef}>
                    <EditControl
                        key={drawnObject}
                        position="topright"
                        onCreated={onCreated}
                        onEdited={onEdited}
                        onDeleted={onDeleted}
                        onDrawStart={onDrawStart}
                        onEditStart={onEditStart}
                        onEditStop={onEditStop}
                        onDrawStop={onDrawStop}
                        draw={{
                            rectangle: false,
                            circle: false,
                            circlemarker: false,
                            marker: drawnObject == null,
                            polyline: false,
                            polygon: drawnObject == null
                        }}
                        maxBounds={boundaries}
                        minZoom={10} />
                </FeatureGroup>

                {/* Center Map in drown object*/}
                {
                    drawnObject && drawnObject.geometry.type === "Point" &&
                    <CenterMap latlng={[drawnObject.geometry.coordinates[1], drawnObject.geometry.coordinates[0]]}></CenterMap>
                }
                {
                    drawnObject && drawnObject.geometry.type === "Polygon" &&
                    <CenterMap latlng={calculateCentroid(drawnObject.geometry.coordinates[0])} ></CenterMap>
                }

                {/* Visualize All present Areas*/}
                {
                    presentAreas && <MarkerClusterGroup
                    showCoverageOnHover={false}  // Disabilita il poligono di copertura al passaggio del mouse
                    maxClusterRadius={50}       // Riduce il raggio massimo dei cluster
                    spiderfyOnMaxZoom={true}    // Espande i marker alla massima distanza di zoom
                    disableClusteringAtZoom={13} // Disabilita il clustering a zoom elevati
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
                        <Markers key={index} area={area} center={center} handleClick={handleClick} clickedArea={clickedArea}></Markers>
                    )}
                    </MarkerClusterGroup>
                }
            </MapContainer>

            {/* Modal exit confirm */}
            {showModal &&
                <div className="fixed z-[2000] inset-0 flex items-center justify-center">
                    <div
                        className="flex flex-col justify-items-center align-items-center bg-box_white_color dark:bg-box_color backdrop-blur-2xl drop-shadow-xl rounded-xl text-black_text dark:text-white_text font-sans p-6">
                        <div className="text-2xl mb-2 font-bold">Are you really sure to exit?</div>
                        <div className="text-l font-bold">Your changes will be discarded</div>
                        <div className="flex justify-center space-x-2 mt-10">
                            <button
                                onClick={() => setShowModal(false)}
                                className="bg-[#FFFFFFcc] dark:bg-customGray hover:bg-[#FFFFFFff] dark:hover:bg-[#938888] transition text-black w-40 h-16 opacity-60 px-4 py-2 rounded-xl text-xl"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    setDrawnObject(null),
                                        props.setUpdateAreaId({ areaId: null, docId: null }),
                                        navigate(-1)
                                }}
                                className="bg-primary_color_light dark:bg-customBlue hover:bg-blue-300 dark:hover:bg-[#317199] transition text-black_text dark:text-white_text w-40 h-16 px-4 py-2 rounded-xl text-xl"
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
                    textAlign: "center"
                }}
                    className={`${(coordinatesErr) && showManually && 'border-red-500 border-1'} max-md:text-xs`}
                >
                    {alertMessage}
                </div>
            )}

            <div
                className={`absolute flex flex-row bottom-5 w-100 ${showManually ? "justify-between" : "justify-end"} z-[1000] max-md:flex-col max-md:block`}>

                {/* Editable coordinates */}
                {showManually &&
                    <div
                        style={{
                            gap: "10px",
                            display: "flex",
                            marginLeft: "10px",
                        }}
                        className="max-md:mb-4 max-md:w-1/2 max-md:flex-col"
                    >
                        <div className="flex flex-col">
                            <label
                                className="text-black_text dark:text-white_text mb-1 text-lg text-left max-md:text-sm">Longitude</label>
                            <input
                                id="lon"
                                type="number"
                                step="0.00001"
                                value={markerCoordinates.lng}
                                onChange={(e) => updateMarkerPosition(markerCoordinates.lat, e.target.value)}
                                className={`px-2 text-l py-1 text-black_text dark:text-white_text placeholder:text-placeholder_color bg-[#ffffffdd] dark:bg-[#1e1e1edd] rounded-[40px] ${coordinatesErr && showManually ? "border-red-500 border-2" : ""} max-md:w-full max-md:h-5`}
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className="text-black_text dark:text-white_text mb-1 text-lg text-left max-md:text-sm">Latitude</label>
                            <input
                                id="lat"
                                type="number"
                                step="0.00001"
                                value={markerCoordinates.lat}
                                onChange={(e) => updateMarkerPosition(e.target.value, markerCoordinates.lng)}
                                className={`px-2 text-l py-1 text-black_text dark:text-white_text placeholder:text-placeholder_color bg-[#ffffffdd] dark:bg-[#1e1e1edd] rounded-[40px] ${coordinatesErr && showManually ? "border-red-500 border-2" : ""} max-md:w-full max-md:h-5`}
                            />
                        </div>
                    </div>
                }
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
                                setShowModal(true);
                            }}
                            type="button"
                            className="w-36 h-14 bg-[#D9D9D9] bg-opacity-80 shadow text-xl font-normal rounded-md text-black_text hover:bg-[#938888] max-md:w-1/2 max-md:h-10"
                        >
                            Exit
                        </button>
                    )}
                    {showSave && (
                        <button
                            onClick={() => handleSave()}
                            type="button"
                            className="w-36 h-14 bg-customBlue text-white_text bg-opacity-100 shadow text-xl rounded-md font-normal hover:bg-[#317199] max-md:w-1/2 max-md:h-10"
                        >
                            Save
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

function Markers({ area, center, handleClick, clickedArea }) {
    const map = useMap()
    const [areaDoc, setAreaDoc] = useState([])
    const geometry = area.geoJson.geometry;
    const [isZoomLevelLow, setIsZoomLevelLow] = useState(false);
    const { isDarkMode } = useTheme();
    const [groupedDocs, setGroupedDocs] = useState([])
    const [overArea, setOverArea] = useState(null)

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
                    // Counts number of document for each type
                    acc[item.type]++;
                    return acc;
                }, {})
                setGroupedDocs(Object.entries(groupedByType))
            } catch (err) {
                setAreaDoc([])
            }
        }
        takeDocumentsArea()
    }, [])

    useEffect(() => {
        const handleZoom = () => {
            if (map.getZoom() <= 13) {
                setIsZoomLevelLow(true); // low zoom level
            } else {
                setIsZoomLevelLow(false); // high zoom level
            }
        };

        map.on('zoomend', handleZoom);
        handleZoom();

        return () => {
            map.off('zoomend', handleZoom);
        };
    }, [map]);

    return (
        geometry.type === 'Polygon' || geometry.type === "MultiPolygon" ? (
            areaDoc && (
                <>
                    <Marker
                        position={area.id === 1 ? center : calculateCentroid(geometry.coordinates[0])}
                        icon={area.id === 1 ? MunicipalArea : GenericPolygon}
                        eventHandlers={{
                            click: (e) => {
                                handleClick(e, area, map)
                            },
                            mouseover: (e) => { setOverArea(area.id) },
                            mouseout: (e) => { setOverArea(null) },
                        }}
                    >
                        {groupedDocs &&
                        <Tooltip permanent>
                            {/* if the zoom level is low shows only the number of documents */}
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
                        </Tooltip>
                        }   
                    </Marker>

                    {(clickedArea === area.id || overArea == area.id) && (
                        area.id != 1 ?
                            <Polygon
                                positions={geometry.coordinates[0].map(coord => [coord[1], coord[0]])}
                                pathOptions={{ color: `${area.id == 1 ? "red" : "#a020f0"}` }}
                            />
                            :
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
                        position={[geometry.coordinates[1], geometry.coordinates[0]]}
                        icon={GenericPoints}
                        eventHandlers={{
                            click: (e) => {
                                handleClick(e, area, map)
                            },
                            mouseover: (e) => { setOverArea(area.id) },
                            mouseout: (e) => { setOverArea(null) },
                        }}
                    >
                        <Tooltip permanent>
                            {/* if the zoom level is low shows only the number of documents */}
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
                        </Tooltip>
                    </Marker>
                </>
            )
        )
    );
}


export { GeoreferenceMap }