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
  - `type` (String) - limited to "design", "informative", "prescriptive", and "technical".
  - `language` (String)
  - `description` (String)
  - `scale` (String)
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
