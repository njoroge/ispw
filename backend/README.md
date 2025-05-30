# Backend Setup

This directory contains the Node.js/Express.js backend for the MERN ISP MVP.

## Prerequisites
- Node.js
- npm
- MongoDB (local or cloud instance)

## Setup
1. Navigate to this `backend` directory.
2. Run `npm install` to install dependencies.
3. Ensure your MongoDB instance is running and accessible.
4. Configure your MongoDB connection string (e.g., in `server.js` or a dedicated config file like `config/db.js`). Example for local MongoDB: `mongodb://localhost:27017/isp_mvp`
5. You can start the server using `npm start` (add a script to package.json: `"start": "node server.js"`) or `nodemon server.js` for development.

## Key Files
- `server.js`: Main server file.
- `package.json`: Project metadata and dependencies.
- `.gitignore`: Specifies intentionally untracked files that Git should ignore.

Mongoose is installed for MongoDB object modeling.
