# PetHaven Server API

## A modern and secure backend server for the PetHaven pet adoption platform. This server handles pet management, adoption requests, authentication, searching, filtering, and database operations. Built with Node.js, Express.js, MongoDB, and JWT Authentication.

## Features

- Pet Management
    - Add new pets
    - Update pet information
    - Delete pets
    - Get single pet details
    - Get all pets

- Adoption System
    - Create adoption requests
    - View user adoption requests
    - Approve or reject requests
    - Delete adoption requests
    - Track adoption request count

- Search & Filter
    - Search pets by name
    - Filter pets by category/species
    - Combine search and filter together
- Authentication & Security
    - JWT verification
    - Protected private routes
    - Secure API access using Bearer Token
- Database
    - MongoDB integration
    - Organized collections
    - Efficient CRUD operations

<br>
<hr>

## Tools & Technologies

- Node.js
- Express.js
- MongoDB
- jose-cjs
- dotenv
- cors

<br>
<hr>

## Create a .env file in the root directory

### PORT=5000

### MONGODB_URI=your_mongodb_connection_uri

### CLIENT_SIDE_URL=http://localhost:3000

<br>
<hr>

### API Link: https://pet-haven-sever.vercel.app/
