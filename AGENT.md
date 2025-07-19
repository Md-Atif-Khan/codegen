# CodeGen Project - AI Assistant Guide

## Commands
- **Client dev**: `cd client && npm run dev` (Vite dev server)
- **Client build**: `cd client && npm run build`
- **Client lint**: `cd client && npm run lint` (ESLint)
- **Server dev**: `cd server && npm run dev` (nodemon)
- **Server start**: `cd server && npm start`
- **No tests configured** - testing framework needs to be set up

## Architecture
- **Frontend**: React 18 + Vite + Tailwind CSS + React Router
- **Backend**: Node.js + Express + MongoDB (Mongoose)
- **Authentication**: JWT tokens, bcrypt for passwords
- **AI Integration**: Google Generative AI (@google/generative-ai)
- **Code Editor**: Monaco Editor for code editing/viewing

## Code Style
- **ES Modules**: Both client and server use `"type": "module"`
- **React**: Functional components with hooks, JSX files in `src/`
- **Imports**: Use relative imports (`../../components/`) for local files
- **State**: useState, useEffect, localStorage for persistence
- **API**: Axios for client HTTP requests, Express routes in `server/src/routes/`
- **Environment**: .env files for both client (VITE_ prefix) and server
- **File Structure**: Components in `client/src/components/`, pages in `client/src/pages/`
