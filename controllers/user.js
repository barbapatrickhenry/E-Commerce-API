const bcrypt = require("bcrypt");
const User = require("../models/User");
const auth = require("../auth");

module.exports.registerUser = (req, res) => {

	if (!req.body.email.includes("@")){
	    
	    return res.status(400).send({ error: "Email invalid" });

	}

	else if (req.body.mobileNo.length !== 11){
	    
	    return res.status(400).send({ error: "Mobile number invalid" });

	}
	
	else if (req.body.password.length < 8) {
	    
	    return res.status(400).send({ error: "Password must be atleast 8 characters" });
	
	} else {

		let newUser = new User({
			firstName : req.body.firstName,
			lastName : req.body.lastName,
			email : req.body.email,
			mobileNo : req.body.mobileNo,
			password : bcrypt.hashSync(req.body.password, 10)
		});

		return newUser.save()
				.then((user) => res.status(201).send({ message: "Registered Successfully" }))
				.catch(err => {
					console.error("Error in saving: ", err)
					return res.status(500).send({ error: "Error in save"})
				});
	}
}; 

module.exports.loginUser = (req,res) => {

	if(req.body.email.includes("@")){

		return User.findOne({ email: req.body.email }).then(result => {

		if(result == null) {

			return res.status(404).send({ error: "No Email Found" });

		} else {

			const isPasswordCorrect = bcrypt.compareSync(req.body.password, result.password);

			if(isPasswordCorrect) {

				return res.status(200).send({ access : auth.createAccessToken(result) });

			} else {


				return res.status(401).send({ message: "Email and password do not match" });

			}
		}
	})
	.catch(err => {

					console.error("Error in find: ", err)
					return res.status(500).send({ error: "Error in find"});

				});
	} else {


		return res.status(400).send({error: "Invalid Email"});

	}	
};

module.exports.getProfile = (req, res) => {

	const userId = req.user.id;

	return User.findById(userId)
		        .then(user => {

		            if (!user) {

		                return res.status(404).send({ error: 'User not found' });

		            }

		            user.password = undefined;

		            return res.status(200).send({ user });

		        })
		        .catch(err => {

		        	console.error("Error in fetching user profile", err);

		        	return res.status(500).send({ error: 'Failed to fetch user profile' });

		        });
};

module.exports.setAsAdmin = (req, res) => {

  const userId  = req.params.userId;

  User.findById(userId)
    .then(userToUpdate => {

      if (!userToUpdate) {
        return res.status(404).json({ message: 'User not found' });
      }

      userToUpdate.isAdmin = true;
      return userToUpdate.save();

    })
    .then(() => {

      return res.status(200).json({ message: 'User updated as admin successfully' });

    })
    .catch(error => {

      console.error(error);
      return res.status(500).json({ message: 'Internal server error' });

    });
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
