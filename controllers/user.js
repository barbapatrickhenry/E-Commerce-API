const bcrypt = require("bcrypt");
const User = require("../models/User");
const auth = require("../auth");

module.exports.registerUser = async (req, res) => {
    const { firstName, lastName, email, mobileNo, password } = req.body;

    if (!email.includes("@")) {
        return res.status(400).send({ error: "Email invalid" });
    }

    if (mobileNo.length !== 11) {
        return res.status(400).send({ error: "Mobile number invalid" });
    }

    if (password.length < 8) {
        return res.status(400).send({ error: "Password must be at least 8 characters" });
    }

    const newUser = new User({
        firstName,
        lastName,
        email,
        mobileNo,
        password: bcrypt.hashSync(password, 10),
    });

    try {
        await newUser.save();
        return res.status(201).send({ message: "Registered Successfully" });
    } catch (err) {
        console.error("Error in saving: ", err);
        return res.status(500).send({ error: "Error in save" });
    }
};

module.exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email.includes("@")) {
        return res.status(400).send({ error: "Invalid Email" });
    }

    try {
        const result = await User.findOne({ email });

        if (!result) {
            return res.status(404).send({ error: "No Email Found" });
        }

        const isPasswordCorrect = bcrypt.compareSync(password, result.password);

        if (isPasswordCorrect) {
            return res.status(200).send({ access: auth.createAccessToken(result) });
        } else {
            return res.status(401).send({ message: "Email and password do not match" });
        }
    } catch (err) {
        console.error("Error in find: ", err);
        return res.status(500).send({ error: "Error in find" });
    }
};

module.exports.getProfile = async (req, res) => {
    const userId = req.user.id;

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).send({ error: 'User not found' });
        }

        user.password = undefined; // Remove password before sending response
        return res.status(200).send({ user });
    } catch (err) {
        console.error("Error in fetching user profile", err);
        return res.status(500).send({ error: 'Failed to fetch user profile' });
    }
};

module.exports.setAsAdmin = async (req, res) => {
    const userId = req.params.userId;

    try {
        const userToUpdate = await User.findById(userId);

        if (!userToUpdate) {
            return res.status(404).json({ message: 'User not found' });
        }

        userToUpdate.isAdmin = true;
        await userToUpdate.save();

        return res.status(200).json({ message: 'User updated as admin successfully' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports.updatePassword = async (req, res) => {
    try {
        const { newPassword } = req.body;
        const { id, email } = req.user; // Extracting user ID and email from the authorization header

        // Hashing the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Updating the user's password in the database
        await User.findByIdAndUpdate(id, { password: hashedPassword });

        // Sending the update password notification
        //await sendUpdatePasswordNotification(email);

        // Sending a success response
        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
