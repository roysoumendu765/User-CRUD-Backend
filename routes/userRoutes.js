const express = require("express");
const router = express.Router();
const {createUser, updateUser, deleteUser, getUser, getAllUsers, loginUser, registerUser} = require('../controllers/userControllers');
const {authGuard} = require('../middleware/userMiddleware');

router.get('/getUser/:email', authGuard, getUser);
router.get('/getAllUsers', authGuard, getAllUsers);
router.post('/create', authGuard, createUser);
router.put('/update/:userId', authGuard, updateUser);
router.delete('/delete', authGuard, deleteUser);
router.post('/register', registerUser);
router.post('/login', loginUser);

module.exports = router;