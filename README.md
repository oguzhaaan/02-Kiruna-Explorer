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
  - `role` (String) - limited to "urban_planner", "resident", and "visitor" values.

- **document Table**

  - `id` (Integer) - (Primary Key)
  - `title` (String)
  - `description` (String)
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
