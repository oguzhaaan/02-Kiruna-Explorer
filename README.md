# Kiruna Explorer

Here's the Table of Contents with all the APIs listed:

---

## Table of Contents

- [Kiruna Explorer](#kiruna-explorer)
  - [Table of Contents](#table-of-contents)
    - [1. Introduction](#1-introduction)
    - [2. Technologies Used](#2-technologies-used)
    - [3. Database Structure](#3-database-structure)
    - [4. API Documentation](#4-api-documentation)
      - [**Add Document**](#add-document)
      - [**Get All Documents**](#get-all-documents)
      - [**Get Document by Id:**](#get-document-by-id)
      - [**Get Documents by Id area :**](#get-documents-by-id-area-)
      - [**Link Document**:](#link-document)
      - [**Add links to a document**](#add-links-to-a-document)
      - [**Get Linked Documents**](#get-linked-documents)
      - [Delete links](#delete-links)
      - [**Get all areas**](#get-all-areas)
      - [**Add Area**:](#add-area)
      - [**Edit area id**:](#edit-area-id)
      - [**Add Attachments**:](#add-attachments)
      - [**Delete Attachments**](#delete-attachments)
    - [5. Users Credentials](#5-users-credentials)
    - [6. Dockerization](#6-dockerization)
  - [LICENSE](#license)



### 1. Introduction

### 2. Technologies Used

- **Frontend**: React.js
- **Backend**: Express.js
- **Database**: sqlite

### 3. Database Structure

- **users Table**

  - `id` (Integer) - (Primary Key)
  - `role` (String) - limited to "urban_planner" and "resident" values.
  - `username` (String)
  - `password` (String)
  - `salt` (String)
  - `avatar_url` (String)

- **document Table**

  - `id` (Integer) - (Primary Key)
  - `title` (String)
  - `stakeholders` (String)
  - `date` (String) - Issuance date
  - `type` (String) - limited to "design", "informative", "prescriptive", "technical", "agreement", "conflict", "consultation", and "material effects"

  - `language` (String)
  - `description` (String)
  - `scale` (String)
  - `pages` (number)
  - `planNumber` (number)
  - `areaId` (String) - (Foreign Key)

- **area Table**

  - `id` (Integer) - (Primary Key)
  - `geoJson` (String/JSON) - Coordinate(s)

- **document_link Table**
  - `id` (Integer) - (Primary Key)
  - `doc1Id` (Integer) - (Foreign Key)
  - `doc2Id` (Integer) - (Foreign Key)
  - `date` (String)
  - `connection` (String) - limited to "direct_consequence", "collateral_consequence", "prevision", and "update" values.

### 4. API Documentation

#### **Add Document**

**POST** `api/documents`

  Description : Adds a new document

  Request body :

  - body with all fields:
    ```
    {
      "title": "string",
      "scale": "plan",
      "date": "2022-01-01",
      "language": "string",
      "type": "design",
      "pages": 1,
      "description": "string",
      "links":
        [
          {
            "selectedDocId" : 1,
            "date" : "2022-01-01",
            "connectionType" : "direct_consequence"
          }
        ],
      "areaId": 1,
      "stakeholders": [
        "lkab",
        "municipality"
      ],
      "planNumber": 2
    }
    ```

  - body without nullable fields
    ```
    {
      "title": "string",
      "scale": "plan",
      "date": "string",
      "type": "design",
      "description": "string",
      "stakeholders": [
        "string",
        "string"
      ],
      "planNumber": 2,
    }
    ``` 
Response: 
- `201 Created`;
- `400 Bad Request` (a field has invalid value)
- `400 Not Found` (area not found)
- `500 Internal Server Error`

Response body: 
  ```
  {
    "lastId": 1,
    "message": "Document added successfully"
  }
  ```

If not already present area, first he has to create one

#### **Get All Documents**
 **GET** `api/documents`

  Description : Get all documents

  Request body : none

  Response : 
  - `200 OK`
  - `500 Internal Server Error`
  

  Response body:
  ```
    [
      {
        "id": 1,
        "title": "title",
        "stakeholders": [
          "municipality",
          "architecture firms"
        ],
        "date": "2004-02-01",
        "type": "conflict",
        "language": "ar",
        "description": "hello",
        "areaId": 1,
        "scale": "concept",
        "pages": 102940,
        "planNumber": ""
      },
      {
        "id": 2,
        "title": "title",
        "stakeholders": [
          "municipality",
          "architecture firms"
        ],
        "date": "2004-02-01",
        "type": "conflict",
        "language": "ar",
        "description": "hello",
        "areaId": 1,
        "scale": "concept",
        "pages": 102940,
        "planNumber": ""
      }
    ]
  ```

#### **Get Document by Id:**

**GET** `api/documents/:DocId`

  Description : Retrieve information of a docuemnt given its `<DocId>`

  Reuest parameters: Document Id

  Response : 
  - `200 OK`
  - `500 Internal Server Error`
  - `400 Bad Request` (Document id not valid number)

  Response body:
  ```
  {
    "id": 1,
    "title": "string",
    "stakeholders": [
      "municipality"
    ],
    "date": "string",
    "type": "design",
    "language": null,
    "description": "string",
    "areaId": null,
    "scale": "plan",
    "pages": null,
    "planNumber": 2
  }
  ```
#### **Get Documents by Id area :**

**GET** `api/documents/area/:areaId`

  Description : Retrieve all documents belonging toa certain area given its `<areaId>`

  Reuest parameters: Area Id

  Response : 
  - `200 OK`
  - `500 Internal Server Error`
  - `400 Bad Request` (Area id not valid number)
  - `404 Not Found` (Area not found)
  - `404 Not Found` (No documents found for this area)

  Response body:
  ```
  {
    "id": 1,
    "title": "string",
    "stakeholders": [
      "municipality"
    ],
    "date": "string",
    "type": "design",
    "language": null,
    "description": "string",
    "areaId": 1,
    "scale": "plan",
    "pages": null,
    "planNumber": 2
}
```


#### **Link Document**:

**POST** `api/documents/link`

Description : Link two documents

Request Body:

```
{
  "doc1Id": 1,
  "doc2Id": 2,
  "connection": "update",
  "date": "2023-01-01"
}
```

Response :
- `200 OK`
- `500 Internal Server Error`
- `400 Bad Request` (FIelds not valid)
- `402 Bad Request` (Invalid connection type)
- `403 Bad Request` (Link already exists)
- `404 Not Found` (Document not found)

Response body: None

#### **Add links to a document**

**POST** `api/documents/links`

Description : Add links to a document, receiving an array of links

Request Body:

```
[
  {
    "originalDocId" : 1,
    "selectedDocId" : 2,
    "connectionType" : "direct_consequence",
    "date" : "2023-01-01"
  },
  {
    "originalDocId" : 3,
    "selectedDocId" : 4,
    "connectionType" : "prevision",
    "date" : "2023-01-02"
  }
]
```

Response :
- `200 OK`
- `500 Internal Server Error`
- `400 Bad Request` (Array is empty)
- `402 Bad Request` (Invalid connection type)
- `404 Not Found` (Document not found)

#### **Get Linked Documents**

**GET** `api/documents/:DocId/links`

Description : Get all linked documents to a ceratin document with its <DocId>

Requqest parameters: Document Id

Response :
- `200 OK`
- `500 Internal Server Error`
- `400 Bad Request` (Document id not valid number)

Response body: 
```
[
  {
    "id": 1,
    "title": "string",
    "trype": "design",
    "connection": "update"
  },
  {
    "id": 2,
    "title": "string",
    "trype": "design",
    "connection": "update"
  }
]
```


#### Delete links

**DELETE** `api/documents/:DocId/links`

Description : Delete all links associated to a document with its <DocId>

Requqest parameters: Document Id

Response :
- `200 OK`
- `500 Internal Server Error`

Response body: None

#### **Get all areas**

**GET** `api/areas`

Description : Retrieve all areas

Response :
- `200 OK`
- `500 Internal Server Error`
- `404 Not Found` (Area not found)

Response body: 
```
[
  {
    "id": 1,
    "geojson" : {
      ...
    }
  },
  {
    "id": 2,
    "geojson" : {
      ..-
    }
  }
]
```

#### **Add Area**:

**POST** `api/areas`

Description : Adds a new area drawn  by the user or representing a single point on the map

Request Body:

```
{
  "geojson" : {
    ...
  }
}
```

Response :
- `201 Created`
- `500 Internal Server Error`
- `400 Bad Request` (FIelds not valid)
- `404 Not Found` (Document not found)

Response body: None

#### **Edit area id**:

**PUT** `api/documents/:DocId/area`

Description : Modify the area id assinged to a document, deletes the previous one if not assigned to a document anymore

Requqest parameters: Document Id

Request Body:

```
{
  "areaID" : 1
}
```

Response :
- `200 OK`
- `500 Internal Server Error`
- `400 Bad Request` (Document id  not valid)
- `404 Not Found` (Area not found)

Response body: None

#### **Add Attachments**:

**POST** `api/documents/:DocId/uploads`

Description : Add resources to a certain docuemnt identified by its <DocId>

Requqest parameters: Document Id

Request Body:

```
[
  {
    "name" : "name",
    "type" : "original",
    "path" : "path/to/file"
  },
  {
    "name" : "name2",
    "type" : "Attachment",
    "path" : "path/to/file2"
  }
]
```

Response :
- `200 OK`
- `500 Internal Server Error`
- `400 Bad Request` (Document id  not valid)
- `404 Not Found` (Document not found)

Response body: None

#### **Delete Attachments**

**DELETE** `api/documents/:DocId/uploads`

Description : Delete all attachments associated to a document with its <DocId>

Requqest parameters: Document Id

Response :
- `200 OK`
- `404 Not Found`
- `500 Internal Server Error`

Response body: None

#### **Delete Attachments**

**DELETE** `api/documents/:DocId/uploads/:FilePath`

Description : Delete a specific file stored in a certain path, associated to a document with its <DocId>

Requqest parameters: Document Id, File Path

Response :
- `200 OK`
- `404 Not Found`
- `500 Internal Server Error`

Response body: None



### 5. Users Credentials

| username | Password | Role          |
| -------- | -------- | ------------- |
| Romeo    | 1111     | urban planner |
| Juliet   | 2222     | resident      |

### 6. Dockerization

The application is dockerized and can be run using the following command inside the root folder of the project `02-kiruna-explorer/`:

```bash
$docker compose build
$docker compose up
```

**note**: You need to have Docker Desktop installed and opened in background

## LICENSE

[![CC BY-NC 4.0][cc-by-nc-shield]][cc-by-nc]

[cc-by-nc]: https://creativecommons.org/licenses/by-nc/4.0/
[cc-by-nc-shield]: https://img.shields.io/badge/License-CC%20BY--NC%204.0-lightgrey.svg
