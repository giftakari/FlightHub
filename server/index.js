const express = require('express');
const fs = require('fs');
const path = require('path');
const morgan = require('morgan')
const cors = require('cors')

const app = express();
const port = 3000;



app.use(cors());


// Logging middleware setup
app.use(morgan('dev'));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Internal Server Error');
});


app.post('/api/data', (req, res) => {
    const jsonFilePath = path.join(__dirname, 'flight-response.json');

    fs.readFile(jsonFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading the JSON file:', err);
            res.status(500).json({ error: 'Internal Server Error' });
            return;
        }

        try {
            //const jsonData = JSON.parse(data);
            res.json(data);
        } catch (parseErr) {
            console.error('Error parsing JSON data:', parseErr);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});
