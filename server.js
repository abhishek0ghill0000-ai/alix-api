const express = require('express');
const app = express();
const PORT = process.env.PORT || 10000;

app.get('/', (req, res) => res.send('Alix API working!'));

app.listen(PORT, () => console.log(`Server on port ${PORT}`));
