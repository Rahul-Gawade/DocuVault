const router = require('express').Router();
const auth = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const {
  uploadDocument,
  listDocuments,
  getDocument,
  inviteRecipient,
  removeRecipient,
  getDocumentAudit,
  deleteDocument,
} = require('../controllers/documentController');

router.use(auth);

router.post('/', upload.single('file'), uploadDocument);
router.get('/', listDocuments);
router.get('/:id', getDocument);
router.delete('/:id', deleteDocument);

router.post('/:id/recipients', inviteRecipient);
router.delete('/:id/recipients/:recipientId', removeRecipient);
router.get('/:id/audit', getDocumentAudit);

module.exports = router;
