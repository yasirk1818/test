const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const keywordRoutes = require('./routes/keywordRoutes');
const adminRoutes = require('./routes/adminRoutes');
const whatsappService = require('./services/whatsappService');
const socketUtils = require('./utils/socket');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/keywords', keywordRoutes);
app.use('/api/admin', adminRoutes);

// DB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

socketUtils.init(server);
