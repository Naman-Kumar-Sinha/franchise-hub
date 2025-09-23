const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Enable CORS for all routes
app.use(cors());

// Load the Swagger document
const swaggerDocument = YAML.load(path.join(__dirname, 'swagger.yaml'));

// Custom CSS for professional styling
const customCss = `
  .swagger-ui .topbar { display: none; }
  .swagger-ui .info { margin: 50px 0; }
  .swagger-ui .info .title { color: #1976d2; font-size: 36px; }
  .swagger-ui .scheme-container { background: #fafafa; padding: 15px; border-radius: 4px; }
  .swagger-ui .btn.authorize { background-color: #1976d2; border-color: #1976d2; }
  .swagger-ui .btn.authorize:hover { background-color: #1565c0; border-color: #1565c0; }
  .swagger-ui .opblock.opblock-post { border-color: #4caf50; }
  .swagger-ui .opblock.opblock-get { border-color: #2196f3; }
  .swagger-ui .opblock.opblock-put { border-color: #ff9800; }
  .swagger-ui .opblock.opblock-delete { border-color: #f44336; }
  .swagger-ui .opblock.opblock-patch { border-color: #9c27b0; }
`;

const swaggerOptions = {
  customCss,
  customSiteTitle: 'FranchiseHub API Documentation',
  customfavIcon: '/favicon.ico',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: 'list',
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    tryItOutEnabled: true
  }
};

// Serve Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerOptions));

// Serve raw swagger.yaml
app.get('/swagger.yaml', (req, res) => {
  res.sendFile(path.join(__dirname, 'swagger.yaml'));
});

// Serve raw swagger.json
app.get('/swagger.json', (req, res) => {
  res.json(swaggerDocument);
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'FranchiseHub API Documentation Server'
  });
});

// Root redirect to API docs
app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error serving documentation:', err);
  res.status(500).json({ 
    error: 'Internal Server Error', 
    message: 'Failed to serve API documentation' 
  });
});

// Start the server
app.listen(PORT, () => {
  console.log('🚀 FranchiseHub API Documentation Server started');
  console.log(`📚 Documentation available at: http://localhost:${PORT}/api-docs`);
  console.log(`📄 Swagger YAML: http://localhost:${PORT}/swagger.yaml`);
  console.log(`📄 Swagger JSON: http://localhost:${PORT}/swagger.json`);
  console.log(`💚 Health Check: http://localhost:${PORT}/health`);
  console.log('');
  console.log('🔧 Development Tips:');
  console.log('  - Edit swagger.yaml and refresh browser to see changes');
  console.log('  - Use Ctrl+C to stop the server');
  console.log('  - Run "npm run dev" for auto-reload during development');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('📚 Documentation server shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('\n📚 Documentation server shutting down gracefully...');
  process.exit(0);
});
