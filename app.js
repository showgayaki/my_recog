const express = require('express');
const app = express();
const router = require('./routes/router');

app.use('/', router);
app.use('*/static', express.static('public'));
app.set('view engine', 'ejs');

app.use((req, res) =>{res.sendStatus(404);});
app.listen(process.env.PORT || 8000);
