const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const ruleRoutes = require('./routes/ruleRoutes');
const app = express();
const cors = require('cors');

app.use(cors());

// Middleware
app.use(express.json());

// Routes
app.use('/api/rules', ruleRoutes);

// Connect to MongoDB
const dbURI = process.env.MONGO_URI ;
mongoose.connect(dbURI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('MongoDB connected');
}).catch((err) => {
    console.log('Error connecting to MongoDB:', err);
});
app.get("/",(req,res)=>{
    res.send("hello")
})

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on ports ${PORT}`);
});
