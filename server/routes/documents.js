const router = require('express').Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  uploadDocument,
  listDocuments,
  getDocument,
} = require('../controllers/documentController');

router.use(auth);
router.post('/', upload.single('file'), uploadDocument);
router.get('/', listDocuments);
router.get('/:id', getDocument);

module.exports = router;
