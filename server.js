const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to set proper content types
app.use((req, res, next) => {
  if (req.path.endsWith('.js')) {
    res.type('application/javascript');
  } else if (req.path.endsWith('.css')) {
    res.type('text/css');
  } else if (req.path.endsWith('.html')) {
    res.type('text/html');
  }
  next();
});

// Serve static files from current directory
app.use(express.static(__dirname, {
  extensions: ['html', 'css', 'js'],
  index: 'index.html'
}));

// Catch all routes and serve index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT} to view the app`);
});