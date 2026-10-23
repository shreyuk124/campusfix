import app from './app.js';
import { connectDB } from './config/db.js';

const PORT = process.env.PORT || 5000;

// Connect to MongoDB using environment URI
connectDB();

const server = app.listen(PORT, () => {
  console.log('----------------------------------------------------');
  console.log(` CampusFix API Server running on port ${PORT}`);
  console.log(` Health Check: http://localhost:${PORT}/api/v1/health`);
  console.log('----------------------------------------------------');
});

export default server;
