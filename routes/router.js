const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const {PythonShell} = require('python-shell');
router.use(bodyParser.json({limit: '10mb'}));

router.get('/', (req, res) =>{
    const url = req.originalUrl.replace('/', '');
    const jsFile = 'michopa_or_yukipoyo.js'
    res.render('michopa_or_yukipoyo',{myUrl: url, jsFile: jsFile});
});

router.post('/', function(req, res, next){
    const pyshell = new PythonShell('face_recog/face.py');

    pyshell.send(req.body.image);
    pyshell.on('message', function(message){
        res.send(message);
    });
});

module.exports = router;
