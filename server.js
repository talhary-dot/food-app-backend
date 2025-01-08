const express = require('express');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const customerRoutes = require('./routes/customerRoutes');
const orderRoutes = require('./routes/orderRoutes');
const restaurantRoutes = require('./routes/restaurantRoutes');
const menuRoutes = require('./routes/menuRoutes');
const favouriteRoutes = require('./routes/favouriteRoutes');
const sequelize = require('./config/db')
const path = require('path')
dotenv.config();
const app = express();

app.use(express.json());
// app.use('/front', express.static('./frontend'));
// Routes
app.get('/',(req,res)=>{
       res.sendFile(path.join(__dirname,"frontend",'index.html'))
})
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/customer', customerRoutes);
app.use('/api/v1/order', orderRoutes);
app.use('/api/v1/restaurant', restaurantRoutes);
app.use('/api/v1/menu', menuRoutes);
app.use('/api/v1/favourite', favouriteRoutes);

const PORT = process.env.PORT || 5000;
const start = async () => {
    try {
        console.log('Checking Db Connection...')
        // await sequelize.authenticate();
        
        const startServer = (port) => {
            return new Promise((resolve, reject) => {
                const server = app.listen(port)
                    .on('listening', () => {
                        console.log(`Server running on http://localhost:${port}`);
                        resolve(server);
                    })
                    .on('error', (err) => {
                        if (err.code === 'EADDRINUSE') {
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
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}
start()