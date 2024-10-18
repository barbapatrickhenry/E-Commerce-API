const express = require("express");

const userController = require("../controllers/user");
const { verify, verifyAdmin } = require("../auth");

const router = express.Router();

router.post("/", userController.registerUser);

router.post("/login", userController.loginUser);

router.get("/details", verify, userController.getProfile);

router.put('/:userId/set-as-admin', verify, verifyAdmin, userController.setAsAdmin );

router.put('/update-password', verify, userController.updatePassword);

module.exports = router;