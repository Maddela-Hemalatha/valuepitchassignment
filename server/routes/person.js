const express = require('express');
const multer = require('multer');
const router = express.Router();

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, './uploads/');
    },
    filename: function(req, file, cb) {
        cb(null, Math.floor(new Date().getTime()/1000) + file.originalname)
    }
});

const fileFilter = function (req, file, cb) {
    if(file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
        cb(null, true);
    } else {
        cb(new Error('file type should be jpeg or jpg or png'), false)
    }
}

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
});

const validate = require('../utils/validate');
const person = require('../services/person');

router.get('/country_wise_count', validate, person.count);
router.get('/', validate, person.getList);
router.get('/:email', validate, person.getPerson);

router.post('/create', validate, upload.single('avatar'), person.create);

router.put('/edit/:email', validate, upload.single('avatar'), person.edit);

module.exports = router;