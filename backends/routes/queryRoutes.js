const express = require('express');
const router = express.Router();
const { createQuery, getQueries, getMyQueries, getAnalytics, answerQuery, updateStatus, commentQuery } = require('../controllers/queryController');
const { protect, admin } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.route('/')
    .post(protect, upload.single('attachment'), createQuery)
    .get(protect, admin, getQueries);

router.get('/myqueries', protect, getMyQueries);
router.get('/analytics', protect, admin, getAnalytics);
router.put('/:id/answer', protect, admin, answerQuery);
router.put('/:id/status', protect, admin, updateStatus);
router.post('/:id/comment', protect, commentQuery);

module.exports = router;
