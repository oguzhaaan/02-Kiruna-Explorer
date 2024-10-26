# 02-Kiruna-Explorer

## Table of Contents

1. [Introduction](#introduction)
2. [Technologies Used](#technologies-used)
3. [Database Structure](#database-structure)
4. [API Documentation](#api-documentation)

### 1. Introduction

### 2. Technologies Used

- **Frontend**: React.js
- **Backend**: Express.js
- **Database**: sqlite

### 3. Database Structure

- **users Table**

  - `id` (Integer)
  - `role` (String)

- **document Table**

  - `id` (Integer)
  - `title` (String)
  - `description` (String)

- **area Table**

  - `id` (Integer)
  - `geoJson` (String/JSON)
  - `docId` (Integer)

- **document_link Table**
  - `id` (Integer)
  - `doc1Id` (Integer)
  - `doc2Id` (Integer)
  - `date` (String)
  - `connection` (String)

### 4. API Documentation
