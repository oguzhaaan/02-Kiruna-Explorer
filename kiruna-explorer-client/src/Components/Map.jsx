import React, { useRef, useState, useEffect } from "react";
import { MapContainer, TileLayer, Polygon, Popup, Marker, ZoomControl, useMap, Tooltip } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import { FeatureGroup } from "react-leaflet";
import { polygon, booleanPointInPolygon } from '@turf/turf';
import "./map.css"
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";
import L, { geoJSON } from "leaflet";
import { useNavigate } from "react-router-dom";
import API from "../API/API.mjs";
import { useTheme } from "../contexts/ThemeContext.jsx";
import markerpin from "../assets/marker-pin.svg"
import polygonpin from "../assets/polygon-pin.svg"
import municipalarea from "../assets/municipal-area.svg"
import { getIcon } from "./Utilities/DocumentIcons.jsx";

function CenterMap({ lat, lng }) {
    const map = useMap();
    map.panTo([lat, lng]);
    return null;
}

function CenterMapPolygon({ bounds }) {
    const map = useMap();
    map.fitBounds(bounds);
    return null;
}

const HomeButton = ({ handleMunicipalAreas }) => {
    return (
        <div title="Municipal Area" className="custom-home-button" onClick={() => {
            handleMunicipalAreas()
        }}>
            <CenterMap lat={67.8524} lng={20.2438}></CenterMap>
            <i className="bi bi-house-door-fill text-[#464646]"></i>
        </div>
    );
};

function GeoreferenceMap(props) {
    const { isDarkMode } = useTheme();
    const navigate = useNavigate()

    const latitude = 67.8558;
    const longitude = 20.2253;

    const [drawnObject, setDrawnObject] = useState(null);
    const [showSave, setShowSave] = useState(false);
    const [showExit, setShowExit] = useState(true);
    const [showModal, setShowModal] = useState(false)
    const [showMuniAreas, setShowMuniAreas] = useState(true)
    const [presentAreas, setPresentAreas] = useState(null);
    const [clickedArea, setClickedArea] = useState(null);
    const [alertMessage, setAlertMessage] = useState("");
    const [showManually, setShowManually] = useState(false)
    const [markerLayer, setMarkerLayer] = useState(null);
    const [markerCoordinates, setMarkerCoordinates] = useState({ lat: "", lng: "" });
    const [coordinatesErr, setCoordinatesErr] = useState(false)

    const mapRef = useRef(null);
    const featureGroupRef = useRef(null);
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
    }, [showExit, showSave, presentAreas, coordinatesErr])

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

    {/* Check if point is in city bounds */
    }
    const isPointInCityBounds = (lat, lng) => {
        const point = [lng, lat];
        return booleanPointInPolygon(point, BoundsConnected);
    };

    {/* Click on area */
    }
    const handleClick = (e, content) => {
        if (content === clickedArea) {
            setClickedArea(null)
            setAlertMessage(``)
            setShowSave(false)
        }
        else {
            if (content === 1) {
                setAlertMessage(`You selected Municipality Area`)
            }
            else {
                setAlertMessage(`You selected Area N.${content}`)
            }
            setClickedArea(content)
            setShowSave(true)
        }

    };

    {/* Handle creation/edit/delete of a area/point */
    }
    const onCreated = (e) => {

        const { layer } = e;
        if (layer instanceof L.Polygon) {
            setShowManually(false)
            setAlertMessage("You selected a new custom area");
        } else if (layer instanceof L.Marker) {
            setShowManually(true)
            const markerPosition = layer.getLatLng();
            setAlertMessage("You selected a new custom point");
            setMarkerLayer(layer);
            setMarkerCoordinates({ lat: markerPosition.lat, lng: markerPosition.lng });
        }

        const geoJson = layer.toGeoJSON();
        setDrawnObject(geoJson);
        setShowMuniAreas(false)
        setShowExit(true);
        setShowSave(true);
    };

    const onEdited = (e) => {
        const layers = e.layers;
        layers.eachLayer((layer) => {
            const geoJson = layer.toGeoJSON();
            setDrawnObject(geoJson);
            if (layer instanceof L.Polygon) {
                setShowManually(false)
                setAlertMessage("You edited the custom area");
            } else if (layer instanceof L.Marker) {
                setShowManually(true)
                const markerPosition = layer.getLatLng();
                setAlertMessage("You edited the point position");
                setMarkerLayer(layer);
                setMarkerCoordinates({ lat: markerPosition.lat, lng: markerPosition.lng });
            } else {
                console.warn("Tipo di layer non supportato.");
            }
        });
        setShowExit(true);
        setShowSave(true);
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
                const allAreas = await API.getAllAreas()
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
            console.log(err)
        }
    }

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
            } else {
                const geoJson = {
                    type: "Feature",
                    properties: {},
                    geometry: {
                        type: "Point",
                        coordinates: [lng, lat]
                    }
                }
                area_id = await API.addArea(geoJson)
            }

            // if update area is not null then update, else set new area id for the form
            props.updateAreaId.docId ? await API.updateDocumentArea(props.updateAreaId.docId, area_id) : props.setnewAreaId(area_id)
            props.setUpdateAreaId({ areaId: null, docId: null })
            navigate(-1);
        } catch (err) {
            console.log(err)
        }
    }

    return (
        <div className={isDarkMode ? "dark" : "light"}>
            <MapContainer
                whenCreated={(map) => (mapRef.current = map)}
                center={[latitude, longitude]}
                zoom={13} ref={mapRef}
                zoomControl={false}
                style={{
                    height: "100vh",
                    width: "100vw"
                }}
                maxBounds={cityBounds}
                minZoom={12}
                whenReady={() => { if (props.updateAreaId.docId && !drawnObject) createLayerToUpdate(props.updateAreaId.areaId) }}
            >
                {mapRef.current && !drawnObject && showMuniAreas && <HomeButton handleMunicipalAreas={handleMunicipalAreas} />}
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
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
                        onDrawStop={onDrawStop}
                        draw={{
                            rectangle: false,
                            circle: false,
                            circlemarker: false,
                            marker: drawnObject == null,
                            polyline: false,
                            polygon: drawnObject == null
                        }}
                        maxBounds={cityBounds}
                        minZoom={12} />
                </FeatureGroup>

                {/* Center Map in drown object*/}
                {
                    drawnObject && drawnObject.geometry.type === "Point" &&
                    <CenterMap lat={drawnObject.geometry.coordinates[1]} lng={drawnObject.geometry.coordinates[0]}></CenterMap>
                }
                {
                    drawnObject && drawnObject.geometry.type === "Polygon" &&
                    <CenterMap lat={calculateCentroid(drawnObject.geometry.coordinates[0])[0]} lng={calculateCentroid(drawnObject.geometry.coordinates[0])[1]}></CenterMap>
                }

                {/* Visualize All present Areas*/}
                {
                    presentAreas && presentAreas.map((area, index) =>
                        <Markers key={index} area={area} handleClick={handleClick} clickedArea={clickedArea}></Markers>
                    )
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
                                className={`px-2 text-l py-1 text-black_text dark:text-white_text placeholder:text-placeholder_color bg-input_color_light dark:bg-input_color_dark rounded-[40px] ${coordinatesErr && showManually ? "border-red-500 border-2" : ""} max-md:w-full max-md:h-5`}
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
                                className={`px-2 text-l py-1 text-black_text dark:text-white_text placeholder:text-placeholder_color bg-input_color_light dark:bg-input_color_dark rounded-[40px] ${coordinatesErr && showManually ? "border-red-500 border-2" : ""} max-md:w-full max-md:h-5`}
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
                            className="w-44 h-14 bg-[#D9D9D9] bg-opacity-60 shadow text-2xl font-normal text-black rounded-full hover:bg-[#938888] max-md:w-1/2 max-md:h-10"
                        >
                            Exit
                        </button>
                    )}
                    {showSave && (
                        <button
                            onClick={() => handleSave()}
                            type="button"
                            className="w-44 h-14 bg-customBlue text-white_text bg-opacity-100 shadow text-2xl font-normal rounded-full hover:bg-[#317199] max-md:w-1/2 max-md:h-10"
                        >
                            Save
                        </button>
                    )}
                </div>
            </div>
        </div>
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

    return [centroidY, centroidX]; // return centroid of a polygon to center the map
}

function Markers({ area, handleClick, clickedArea }) {
    const map = useMap()
    const [areaDoc, setAreaDoc] = useState([])
    const geometry = area.geoJson.geometry;
    const [tooltipVisible, setTooltipVisible] = useState(true);
    const [isZoomLevelLow, setIsZoomLevelLow] = useState(false);
    const { isDarkMode } = useTheme();
    const [groupedDocs, setGroupedDocs] = useState([])

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
        geometry.type === 'Polygon' ? (
            areaDoc && (
                <>
                    <Marker
                        position={calculateCentroid(geometry.coordinates[0])} 
                        icon={area.id === 1 ? MunicipalArea : GenericPolygon} 
                        eventHandlers={{
                            click: (e) => {
                                handleClick(e, area.id),
                                    map.panTo(calculateCentroid(geometry.coordinates[0]))
                            }
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
                    {clickedArea === area.id && (
                        <Polygon
                            positions={geometry.coordinates[0].map(coord => [coord[1], coord[0]])}
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
                        position={[geometry.coordinates[1], geometry.coordinates[0]]} 
                        icon={GenericPoints} 
                        eventHandlers={{
                            click: (e) => {
                                handleClick(e, area.id),
                                    map.panTo([geometry.coordinates[1], geometry.coordinates[0]])
                            }
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