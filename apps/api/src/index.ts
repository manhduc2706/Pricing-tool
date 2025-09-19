import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { environment } from './configs/environment';
import { connectDB } from './configs/database.config';
import { errorHandler } from './middleware/errorHandler';
import apiRoutes from './routes';
import { syncDbFilesToMinio } from './scripts/sync-files-to-minio';

const app = express();
const PORT = environment.server.port;

// Initialize services

// Connect to MongoDB and run seeding if needed
async function initializeApp() {
  try {
    await syncDbFilesToMinio()
    await connectDB();
  } catch (error) {
    console.error('❌ Error during app initialization:', error);
    // Continue with app startup even if seeding fails
  }
}

// Initialize the app
initializeApp();

// Middleware
app.use(helmet());
app.use(cors({
  origin: environment.cors.origin.split(','),
  methods: environment.cors.methods,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api', apiRoutes);
app.use("/images", express.static("src/images"));

// Legacy health check (redirect to new endpoint)
app.get('/health', (_req, res) => {
  res.redirect('/api/health');
});

// Error handling
app.use(errorHandler);
console.log(environment)
app.listen(PORT, environment.server.host, () => {
  console.log(`Pricing Tool API server running at http://${environment.server.host}:${PORT}`);
  console.log(`Environment: ${environment.name}`);
  console.log(`API Version: ${environment.api.version}`);
  console.log(`Base Path: ${environment.api.basePath}`);
});
