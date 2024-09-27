
# CodeGen Project

This project consists of a client-side React application built with Vite and a server-side Node.js application.

## Client

The client is a React application set up with Vite, Tailwind CSS, and ESLint.

### Available Scripts

In the client directory, you can run:

- `npm run dev`: Starts the development server
- `npm run build`: Builds the app for production
- `npm run lint`: Runs ESLint to check for code issues
- `npm run preview`: Locally preview the production build

## Server

The server is a Node.js application using Express and MongoDB.

### Available Scripts

In the server directory, you can run:

- `npm start`: Starts the server
- `npm run dev`: Starts the server with nodemon for development

## Getting Started

1. Clone the repository
2. Install dependencies in both client and server directories:
   cd codegen/client && npm install
   cd ../server && npm install
3. Start the development server for the client:
   cd ../client && npm run dev
4. Start the server:
    cd ../server && npm start

## Configuration

- Client: 
  - Check `vite.config.js`, `tailwind.config.js`, `postcss.config.js`, and `eslint.config.js` for configuration details.
  - Create a `.env` file in the client directory with the following variables:
    ```
    VITE_API_URL=http://localhost:<your_desired_PORT_for_server>/api    
    ```
- Server: 
    - Create a `.env` file in the server directory with the following variables:
    ```
    PORT=<your_desired_PORT_for_server>
    MONGODB_URI=<your_mongodb_connection_string>
    JWT_SECRET=<your_jwt_secret>
    CLIENT_URL=http://localhost:5173
    API_KEY = <your_api_key>
    ```

## Learn More

To learn more about the technologies used in this project, check out the following resources:

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://reactjs.org/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
