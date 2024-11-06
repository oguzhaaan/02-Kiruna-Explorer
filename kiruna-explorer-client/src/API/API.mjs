const SERVER_URL = "http://localhost:3000";

const logIn = async (credentials) => {
  const response = await fetch(SERVER_URL + "/api/sessions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(credentials),
  });
  if (response.ok) {
    const user = await response.json();
    return user;
  } else {
    const errDetails = await response.text();
    throw errDetails;
  }
};

const getUserInfo = async () => {
  const response = await fetch(SERVER_URL + "/api/sessions/current", {
    credentials: "include",
  });
  const user = await response.json();
  if (response.ok) {
    return user;
  } else {
    throw user; // an object with the error coming from the server
  }
};

const logOut = async () => {
  const response = await fetch(SERVER_URL + "/api/sessions/current", {
    method: "DELETE",
    credentials: "include",
  });
  if (response.ok) return null;
};

const addDocument = async (documentData) => {
  try {
    const response = await fetch(`${SERVER_URL}/api/documents`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: documentData.title,
        stakeholders: documentData.stakeholder,
        scale: documentData.scale,
        planNumber: documentData.planNumber,
        date: documentData.date,
        type: documentData.type,
        language: documentData.language,
        pages: documentData.pageNumber,
        description: documentData.description,
        areaId: documentData.areaId
      }),
      credentials: 'include'
    });

    if (!response.ok) {
      const errMessage = await response.json();
      throw new Error(`${errMessage.message || 'Error while creating the document.'}`);
    }

    const result = await response.json();
    return result; 
    
  } catch (error) {
    console.error("Error in addDocument function:", error.message);
    throw new Error(`${error.message || 'Error while creating the document.'}`);
  }
};

const getDocumentById = async (docid) => {
  try {
    const response = await fetch(`${SERVER_URL}/api/documents/${docid}`, {
      credentials: 'include'
    });

    if (!response.ok) {
      const errMessage = await response.json();
      throw new Error(`${errMessage.message || 'Error while creating the document.'}`);
    }

    const result = await response.json();
    return result; 
    
  } catch (error) {
    console.error("Error in getDocumentById function:", error.message);
    throw new Error(`${error.message || 'Error while creating the document.'}`);
  }
};

const getDocumentsFromArea = async (areaId) => {
  try {
    const response = await fetch(`${SERVER_URL}/api/documents/area/${areaId}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      const errMessage = await response.json();
      throw new Error(`${errMessage.message || 'Error while getting document from area.'}`);
    }

    const result = await response.json();
    return result; 
    
  } catch (error) {
    console.error("Error in get document from area function:", error.message);
    throw new Error(`${error.message || 'Error while getting document from area.'}`);
  }
};

const getAllAreas = async () => {
  try {
    const response = await fetch(`${SERVER_URL}/api/areas`, {
      credentials: 'include',
    });

    if (!response.ok) {
      const errMessage = await response.json();
      throw new Error(`${errMessage.message || 'Error while getting areas.'}`);
    }
    
    const result = await response.json();
    const geoJson = JSON.parse(result);
    return geoJson; 
    
  } catch (error) {
    console.error("Error in get all areas function:", error.message);
    throw new Error(`${error.message || 'Error while getting areas.'}`);
  }
};

const addArea = async (geoJson) => {
  console.log("Sending GeoJSON:", JSON.stringify(geoJson, null, 2));  // Controllo per verificare cosa viene inviato

  try {
    const response = await fetch(`${SERVER_URL}/api/areas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ geoJson: JSON.stringify(geoJson) }),
      credentials: 'include'
    });

    if (!response.ok) {
      const errMessage = await response.json();
      throw new Error(`${errMessage.message || 'Error while creating the document.'}`);
    }

    const result = await response.json();
    return result; 
    
  } catch (error) {
    console.error("Error in addDocument function:", error.message);
    throw new Error(`${error.message || 'Error while creating the document.'}`);
  }
};

const API = {
  logIn,
  getUserInfo,
  logOut,
  addDocument,
  getDocumentById,
  getDocumentsFromArea,
  getAllAreas,
  addArea,
};

export default API;
