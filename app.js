const express = require('express');
const app = express();
const PORT = 3000;

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', './views');

// Serve static files from multiple directories
app.use(express.static('public'));
app.use(express.static('.')); // Serve from root directory for JS files

// Parse form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Routes
app.get('/', (req, res) => {
    res.render('pages/index', { 
        title: 'StoryWeaver - Your Writing Companion',
        characters: [],
        stories: []
    });
});

// Character Manager Route
app.get('/characters', (req, res) => {
    res.render('pages/characters', {
        title: 'Character Manager - StoryWeaver'
    });
});

// Writer Route
app.get('/writer', (req, res) => {
    const prompt = req.query.prompt || '';
    res.render('pages/writer', {
        title: 'Writer - StoryWeaver',
        prompt: prompt
    });
});





// Serve JS files explicitly
app.get('/js/:file', (req, res) => {
    res.sendFile(__dirname + '/js/' + req.params.file);
});

app.listen(PORT, () => {
    console.log(`🚀 StoryWeaver running at http://localhost:${PORT}`);
});