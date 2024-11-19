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
    const errDetails = await response.json();
    throw new Error(errDetails.message);
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
        areaId: documentData.areaId,
        links: documentData.links
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
    
    const geoJsonresult = result.map((r)=>{
      r.geoJson = JSON.parse(r.geoJson)
      return r
    }); 
    return geoJsonresult
    
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

const getAllDocuments = async () => {
  try {
    const response = await fetch(`${SERVER_URL}/api/documents`, {
      credentials: 'include'
    });

    if (!response.ok) {
      const errMessage = await response.json();
      throw new Error(`${errMessage.message || 'Error while creating the document.'}`);
      throw new Error(`Error ${response.status}: ${errMessage.message || 'Error while creating the document.'}`);
    }

    const result = await response.json();
    console.log(result)
    return result;
    
  } catch (error) {
    console.error("Error in getAllDocuments function:", error.message);
    throw new Error("Unable to get the documents. Please check your connection and try again.");
  }
};

const getFilteredDocuments = async (filters) => {
  try {
    // Build query parameters dynamically from the `filters` object
    const queryParams = new URLSearchParams();

    // Iterate through the filters object
    for (const key in filters) {
      const value = filters[key];
      if (value !== undefined && value !== null && value !== "" && value.length > 0) {
        if (Array.isArray(value)) {
          // Convert arrays to comma-separated strings for stakeholders
          queryParams.append(key, value.map(item => item.value.toLowerCase().replace(/\s+/g, '_')).join(","));
        } else {
          queryParams.append(key, value);
        }
      }
    }

    // Make the fetch call
    const response = await fetch(`${SERVER_URL}/api/documents/filter?${queryParams.toString()}`, {
      method: 'GET',
      credentials: 'include', // Include cookies for authentication
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Check if the response is OK
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.error || 'Failed to fetch documents');
    }

    // Parse and return the response JSON
    const data = await response.json();
    console.log(data)
    return data;
  } catch (error) {
    console.error('Error fetching filtered documents:', error);
    throw new Error(error.message || 'Failed to fetch documents');
  }
};


const addLink = async (link) => {
  try {
    const response = await fetch(`${SERVER_URL}/api/documents/link`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        doc1Id: link.originalDocId,
        doc2Id: link.selectedDocId,
        connection: link.connectionType,
        date: link.date,
      }),
      credentials: 'include'
    });

    if (!response.ok) {
      const errMessage = await response.json();
      throw new Error(`Error ${response.status}: ${errMessage.message || 'Error while creating the connection.'}`);
    }

    const result = await response.json();
    return result; 
    
  } catch (error) {
    console.error("Error in addConnection function:", error.message);
    throw new Error("Unable to add the connection. Please check your connection and try again.");
  }
};

const addLinks = async (links) => {

  try {
    const response = await fetch(`${SERVER_URL}/api/documents/links`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        links: links
      }),
      credentials: 'include'
    });

    if (!response.ok) {
      const errMessage = await response.json();
      throw new Error(`Error ${response.status}: ${errMessage.message || 'Error while creating the connection.'}`);
    }

    const result = await response.json();
    return result; 
    
  } catch (error) {
    console.error("Error in addConnection function:", error.message);
    throw new Error("Unable to add the connection. Please check your connection and try again.");
  }
};

const getDocuemntLinks = async (docid) => {
  try {
    const response = await fetch(`${SERVER_URL}/api/documents/${docid}/links`, {
      credentials: 'include'
    });

    if (!response.ok) {
      const errMessage = await response.json();
      throw new Error(`Error ${response.status}: ${errMessage.message || 'Error while creating the document.'}`);
    }

    const result = await response.json();
    return result; 
    
  } catch (error) {
    console.error("Error in getDocumentById function:", error.message);
    throw new Error("Unable to get the document. Please check your connection and try again.");
  }
};


const deleteAll = async (id) => {

  try {
    const response = await fetch(`${SERVER_URL}/api/documents/${id}/links`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id
      }),
      credentials: 'include'
    });

    if (!response.ok) {
      const errMessage = await response.json();
      throw new Error(`Error ${response.status}: ${errMessage.message || 'Error while deleting the connections.'}`);
    }

    const result = await response.json();
    return result; 
    
  } catch (error) {
    console.error("Error in delete function:", error.message);
    throw new Error("Unable to delete the connections. Please check your connection and try again.");
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
  addLink,
  getDocuemntLinks,
  getAllDocuments,
  getFilteredDocuments,
  addLinks,
  deleteAll
};

export default API;
