const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/authMiddleware');
const { isSuperadmin } = require('../middlewares/roleMiddleware');
const ctrl = require('../controllers/adminController');

router.use(authMiddleware, isSuperadmin);

router.get('/', ctrl.getUsers);

router.delete('/:id', ctrl.deleteUser);

router.get('/:id/activities', ctrl.getUserActivities);

module.exports = router;
