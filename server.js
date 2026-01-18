const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 10000;

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => res.send('Alix API working!'));

app.listen(PORT, () => console.log(`Server on port ${PORT}`));
