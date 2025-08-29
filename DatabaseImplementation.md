# Implementing a Database for Your Robots App

This guide will walk you through setting up an Express.js backend, connecting it to a MongoDB database, and creating an API endpoint to add new robots from your React application.

## Overview

We will create a separate backend server that will handle database operations. Your React frontend will communicate with this server to save and retrieve data.

**Project Structure:**

We'll create a `server` directory in your project root to house all the backend code.

```
ROBOTS/
├── node_modules/
├── public/
├── src/
├── server/              <-- Our new backend code will live here
│   ├── models/
│   │   └── Robot.js
│   ├── .env
│   ├── package.json
│   └── server.js
├── .gitignore
├── package.json
└── ...
```

---

### Step 1: Set Up the Express.js Server

1.  **Create the server directory:**
    Open your terminal in the project root (`C:\Users\HP\Desktop\LinkedIn Learning\Udemy\ROBOTS`) and run:

    ```bash
    mkdir server
    cd server
    ```

2.  **Initialize a new Node.js project:**
    This creates a `package.json` file for our backend dependencies.

    ```bash
    npm init -y
    ```

3.  **Install Backend Dependencies:**
    Here are the libraries you'll need and the commands to install them.

    - `express`: The web framework for Node.js.
    - `mongoose`: Simplifies interactions with the MongoDB database.
    - `cors`: Allows your React app to make requests to this server.
    - `dotenv`: Manages environment variables (like database secrets).
    - `nodemon`: A development tool that automatically restarts the server on file changes.

    **Installation Commands (run inside the `server` directory):**

    ```bash
    # Install production dependencies
    npm install express mongoose cors dotenv

    # Install development dependency
    npm install --save-dev nodemon
    ```

4.  **Create the main server file:**
    Create a file named `server.js` inside the `server` directory.

5.  **Add a script to run the server:**
    Open `server/package.json` and add a `dev` script to the `scripts` section. This lets you run the server with `npm run dev`.

    ```json
    "scripts": {
      "test": "echo "Error: no test specified" && exit 1",
      "dev": "nodemon server.js"
    },
    ```

6.  **Initial Server and Dependencies Setup:**
    Add the following starter code to `server/server.js`. This sets up your Express application and configures the necessary middleware.

    ```javascript
    // Import dependencies
    const express = require("express");
    const cors = require("cors");

    // Create the Express app
    const app = express();

    // Set up middleware
    // This allows all cross-origin requests (from your React app)
    app.use(cors());
    // This allows the server to accept and parse JSON in request bodies
    app.use(express.json());

    // Define a simple root route for testing
    app.get("/", (req, res) => {
      res.send("Backend server is running!");
    });

    // Define the port and start the server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
    ```

---

### Step 2: Set Up and Connect to MongoDB

1.  **Create a MongoDB Database:**

    - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free account.
    - Create a new cluster.
    - Once the cluster is created, you need to:
      - **Create a Database User:** Under "Database Access", create a new user with a username and password. Remember these credentials.
      - **Whitelist Your IP Address:** Under "Network Access", add your current IP address to allow connections to your database.
    - Click on "Database", then "Connect" for your cluster, select "Drivers", and copy the **Connection String**. Replace `<password>` with the user password you created.

2.  **Configure Environment Variables:**

    - In the `server` directory, create a file named `.env`.
    - Add your MongoDB connection string to this file:

    ```
    MONGO_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@yourcluster.mongodb.net/yourDatabaseName?retryWrites=true&w=majority
    ```

    **Important:** Add `.env` to your main `.gitignore` file in the project root to avoid committing your database credentials.

3.  **Connect the Server to the Database:**
    Now, let's modify `server/server.js` to load the environment variables and connect to MongoDB.

    ```javascript
    // Import dependencies
    require("dotenv").config(); // Loads environment variables from .env file
    const express = require("express");
    const cors = require("cors");
    const mongoose = require("mongoose"); // Import mongoose

    // Create the Express app
    const app = express();

    // Set up middleware
    app.use(cors());
    app.use(express.json());

    // --- Connect to MongoDB ---
    mongoose
      .connect(process.env.MONGO_URI)
      .then(() => console.log("MongoDB connected successfully."))
      .catch((err) => console.error("MongoDB connection error:", err));
    // --------------------------

    // Define a simple root route for testing
    app.get("/", (req, res) => {
      res.send("Backend server is running!");
    });

    // Define the port and start the server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
    ```

---

### Step 3: Create the Database Model

This model defines the structure (schema) for the documents that will be stored in your MongoDB collection.

1.  **Create the model file:**
    Inside the `server` directory, create a new folder `models`, and inside it, a file named `Robot.js`.

2.  **Define the Robot schema:**
    Add the following code to `server/models/Robot.js`. This matches the structure from your `src/components/modal/robots.js` file. MongoDB will automatically generate a unique `_id` for each robot.

    ```javascript
    const mongoose = require("mongoose");

    const RobotSchema = new mongoose.Schema({
      name: {
        type: String,
        required: true,
      },
      username: {
        type: String,
        required: true,
        unique: true,
      },
      email: {
        type: String,
        required: true,
        unique: true,
      },
      image: {
        type: String,
        required: true,
      },
      phone: {
        type: Number,
        required: true,
        unique: true,
      },
      date: {
        type: Date,
        default: Date.now,
      },
    });

    module.exports = mongoose.model("Robot", RobotSchema);
    ```

---

### Step 4: Create the API Endpoint to Add Robots

Now, we'llcreate a `POST` route that listens for requests from your frontend, takes the new robot data, and saves it to the database.

1.  **Import the model and create the route:**
    Add the following code to `server/server.js` before the `app.listen` call.

    ```javascript
    // ... (rest of the server.js code from above)

    // Import the Robot model
    const Robot = require("./models/Robot");

    // API Routes
    // POST: Add a new robot
    app.post("/api/robots", async (req, res) => {
      try {
        const { name, username, email, image } = req.body;

        // Basic validation
        if (!name || !username || !email || !phone || !image) {
          return res.status(400).json({ msg: "Please enter all fields" });
        }

        const newRobot = new Robot({
          name,
          username,
          email,
          phone,
          image,
        });

        const savedRobot = await newRobot.save();
        res.status(201).json(savedRobot); // Respond with the created robot
      } catch (error) {
        // Handle potential errors, like duplicate username/email
        console.error("Error saving robot:", error);
        res.status(500).json({ error: "Server error while saving robot." });
      }
    });

    const PORT = process.env.PORT || 5000;
    // ... (app.listen call)
    ```

2.  **Start your backend server:**
    Navigate back to the `server` directory in your terminal and run:
    ```bash
    npm run dev
    ```
    You should see the messages "MongoDB connected successfully." and "Server is running on port 5000".

---

### Step 5: Update the React Frontend

Finally, let's modify your `Modals.jsx` component to send the form data to your new backend API.

1.  **Modify the 'Add' button's `onClick` handler:**
    In `src/components/modal/Modals.jsx`, find the `onClick` function for the "Add" button and replace the existing logic with an API call using `fetch`.

    ```jsx
    // Inside Modals.jsx

    // ... (inside the return statement)
    <p
      className="bw0 br2 bg-green pa2 white fw1 tc ttu tracked"
      onClick={async () => {
        const newRobot = {
          name: `${user.firstname} ${user.lastname}`.trim(),
          username: user.username,
          email: user.email,
          phone: user.phoneNumber,
          image: generatedImageUrl,
        };

        // Check if all required data is present
        if (
          !newRobot.name ||
          !newRobot.username ||
          !newRobot.email ||
          !newRobot.phone ||
          !newRobot.image
        ) {
          alert("Please fill out all fields and generate an image.");
          return;
        }

        try {
          const response = await fetch("http://localhost:5000/api/robots", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(newRobot),
          });

          if (!response.ok) {
            // Handle server-side errors
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to add robot.");
          }

          const addedRobot = await response.json();

          // Add the new robot (returned from the server) to the frontend state
          props.onAddRobot(addedRobot);

          // Reset form and close modal
          props.setTrigger(false);
          setGeneratedImageUrl("");
          setUser({
            firstname: "",
            lastname: "",
            username: "",
            phoneNumber: "",
            email: "",
          });
          setSelectedOptionKey("");
        } catch (error) {
          console.error("Error adding robot:", error);
          alert(`An error occurred: ${error.message}`);
        }
      }}
    >
      Add
    </p>
    ```

Now, when you fill out the form and click "Add", the component will send the data to your Express server, which will save it in your MongoDB database. The server then responds with the newly created robot data (including its unique `_id`), which you then add to your app's state.

---

### Step 6: Deploying Your Full-Stack Application

Deploying a full-stack application involves two parts: deploying the backend server and deploying the frontend client. We will use **Render** for our Node.js backend and **Netlify** for our React frontend.

**Before you start:** Make sure your project is pushed to a GitHub repository.

#### Part A: Deploying the Backend to Render

1.  **Sign Up:** Create a free account on [Render](https://render.com/).
2.  **Create a New Web Service:**
    - On the Render Dashboard, click **New +** and select **Web Service**.
    - Connect your GitHub account and select your `ROBOTS` repository.
3.  **Configure the Backend Service:**
    - **Name:** Give your service a unique name, like `robo-friends-server`.
    - **Root Directory:** Set this to `server`. This tells Render to run the commands from within your backend folder.
    - **Branch:** `main` (or your default branch).
    - **Runtime:** `Node`.
    - **Build Command:** `npm install`.
    - **Start Command:** `npm start`.
    - **Environment Variables:** Click **Advanced**, then **Add Environment Variable**. You must add your MongoDB connection string here.
        - **Key:** `MONGO_URI`
        - **Value:** Paste the same connection string you used in your local `.env` file.
4.  **Deploy:** Click **Create Web Service**. Render will build and deploy your server.
5.  **Get Your Backend URL:** Once deployment is complete, copy the URL Render provides for your service (e.g., `https://your-service-name.onrender.com`). You will need this for the frontend.

#### Part B: Preparing the Frontend for Deployment

Your frontend code currently makes requests to `http://localhost:5000`. We need to update this to use the live backend URL.

1.  **Create a Frontend `.env` file:**
    - In the **root directory** of your project (at `C:\Users\HP\Desktop\LinkedIn Learning\Udemy\ROBOTS`), create a new file named `.env`.
    - Add the following line, pasting the backend URL you copied from Render.

    ```
    REACT_APP_API_URL=https://your-service-name.onrender.com
    ```
    *Note: For React apps, environment variables must start with `REACT_APP_`.*

2.  **Update Frontend Code:**
    - Go through your frontend files (`src/App.js` and `src/components/modal/Modals.jsx`) and replace all instances of `"http://localhost:5000"` with `process.env.REACT_APP_API_URL`.

    For example, in `App.js`:
    ```javascript
    // Change this:
    fetch("http://localhost:5000/api/robots")
    // To this:
    fetch(`${process.env.REACT_APP_API_URL}/api/robots`)
    ```

#### Part C: Deploying the Frontend to Netlify

1.  **Sign Up:** Create a free account on [Netlify](https://www.netlify.com/).
2.  **Create a New Site:**
    - From your Netlify dashboard, click **Add new site** -> **Import an existing project**.
    - Connect to GitHub and select your `ROBOTS` repository.
3.  **Configure the Frontend Build:**
    - **Branch to deploy:** `main` (or your default branch).
    - **Base directory:** (Leave this blank).
    - **Build command:** `npm run build`.
    - **Publish directory:** `build`.
4.  **Add Environment Variables:**
    - Go to **Site settings** -> **Build & deploy** -> **Environment**.
    - Add the same environment variable you created locally.
        - **Key:** `REACT_APP_API_URL`
        - **Value:** `https://your-service-name.onrender.com` (your live backend URL).
5.  **Deploy:** Click **Deploy site**. Netlify will build and deploy your React application.

#### Part D: Final Backend CORS Configuration

For security, your backend should only accept requests from your live frontend, not from anywhere on the internet.

1.  **Update `server/server.js`:**
    - Modify the `cors` configuration to only allow your Netlify site's URL.

    ```javascript
    // Find this line:
    app.use(cors());

    // And replace it with this, pasting your Netlify site URL:
    const corsOptions = {
      origin: 'https://your-netlify-site-name.netlify.app',
      optionsSuccessStatus: 200
    };
    app.use(cors(corsOptions));
    ```
2.  **Redeploy Backend:**
    - Commit and push this change to GitHub.
    - Go to your service on Render and trigger a new deploy manually from the dashboard.

Your full-stack application is now live!