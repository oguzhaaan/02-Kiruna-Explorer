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
        stakeholder: documentData.stakeholder,
        scale: documentData.scale,
        planNumber: documentData.planNumber,
        date: documentData.date,
        type: documentData.type,
        language: documentData.language,
        pages: documentData.pageNumber,
        description: documentData.description,
      }),
      credentials: 'include'
    });

    if (!response.ok) {
      const errMessage = await response.json();
      throw new Error(`Error ${response.status}: ${errMessage.message || 'Error while creating the document.'}`);
    }

    const result = await response.json();
    return result; 
    
  } catch (error) {
    console.error("Error in addDocument function:", error.message);
    throw new Error("Unable to add the document. Please check your connection and try again.");
  }
};

const getDocumentById = async (docid) => {
  try {
    const response = await fetch(`${SERVER_URL}/api/documents/${docid}`, {
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

const getAllDocuments = async () => {
  try {
    const response = await fetch(`${SERVER_URL}/api/documents`, {
      credentials: 'include'
    });

    if (!response.ok) {
      const errMessage = await response.json();
      throw new Error(`Error ${response.status}: ${errMessage.message || 'Error while creating the document.'}`);
    }

    const result = await response.json();
    return result;
    
  } catch (error) {
    console.error("Error in getAllDocuments function:", error.message);
    throw new Error("Unable to get the documents. Please check your connection and try again.");
  }
};


const addLink = async (link) => {
  try {
    const response = await fetch(`${SERVER_URL}/api/documents/links`, {
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



const API = {
  logIn,
  getUserInfo,
  logOut,
  addDocument,
  getDocumentById,
  addLink,
  getDocuemntLinks,
  getAllDocuments
};

export default API;
