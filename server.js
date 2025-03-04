const express = require("express");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");
const customerRoutes = require("./routes/customerRoutes");
const orderRoutes = require("./routes/orderRoutes");
const restaurantRoutes = require("./routes/restaurantRoutes");
const menuRoutes = require("./routes/menuRoutes");
const favouriteRoutes = require("./routes/favouriteRoutes");
const dishesRoutes = require("./routes/dishesRoute");
const sequelize = require("./config/db");
const path = require("path");
const { verifyOrder } = require("./middleware/verify-order");
dotenv.config();
const app = express();

// Increase the payload size limit to 10MB
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// Serve static files from the menuItemPictures folder
app.use("/pictures", express.static(path.join(__dirname)));

// Routes
app.get("/verify-order", verifyOrder);
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "frontend", "index.html"));
});
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/customer", customerRoutes);
app.use("/api/v1/order", orderRoutes);
app.use("/api/v1/restaurant", restaurantRoutes);
app.use("/api/v1/menu", menuRoutes);
app.use("/api/v1/favourite", favouriteRoutes);
app.use("/api/v1/dishes", dishesRoutes);

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    console.log("Checking Db Connection...");
    // await sequelize.authenticate();

    const startServer = (port) => {
      return new Promise((resolve, reject) => {
        const server = app
          .listen(port)
          .on("listening", () => {
            console.log(`Server running on http://localhost:${port}`);
            resolve(server);
          })
          .on("error", (err) => {
            if (err.code === "EADDRINUSE") {
              console.log(`Port ${port} is busy, trying ${port + 1}`);
              server.close();
              resolve(startServer(port + 1));
            } else {
              reject(err);
            }
          });
      });
    };

    await startServer(PORT);
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};
start();
