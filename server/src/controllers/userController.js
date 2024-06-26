const Users = require('../models/userModel');
const bcrypt = require('bcryptjs');

// register route
module.exports.register = async (req, res) => {
    // object destructuring
    const { name, email, password, cpassword, userType, bloodGroup, city } = req.body;

    // basic validation
    if (!name || !email || !password || !cpassword || !userType || !bloodGroup) {
        return res.status(400).json({
            message: "Every field must be filled", success: false
        });
    }
    else if (!city) {
        return res.status(400).json({
            message: "Security Question is required", success: false
        });
    }
    else if (password !== cpassword) {
        return res.status(400).json({
            message: "password and confirm password must be same", success: false
        });
    }

    try {
        // Find a user by email if exists throw error
        const duplicateUser = await Users.findOne({ email });
        if (duplicateUser) {
            return res.status(409).json({
                message: 'A user already exists with same email',
                error: duplicateUser,
                success: false
            });
        }

        const user = new Users({ name, email, password, cpassword, userType, city, bloodGroup, status: 'pending' });
        const registerdUser = await user.save();

        res.status(201).json({
            message: 'User registered',
            data: registerdUser,
            success: true
        });
    }
    catch (err) {
        if (err.name === "MongoError" || err.name === "MongoServerError") {
            // MongoDB-related error
            console.log("MongoDB Error:", err.message);
            res.status(500).json({
                message: 'Error occured while registering',
                success: false,
                error: err.message
            });
        } else {
            // Other types of errors
            console.log("Generic Error:", err);
            res.status(500).json({
                message: 'unknown error',
                success: false,
                error: err
            });
        }
    }
}

// login route
module.exports.login = async (req, res) => {
    // object destructuring
    const { email, password } = req.body;

    // validation
    if (!email || !password ) {
        return res.status(400).json({
            message: "email and password are required", success: false
        });
    }

    try {
        const user = await Users.findOne({ email });
        if (user) {
            // comparing user password with hashed password
            // returns true if both hash values are matched
            const hashOk = await bcrypt.compare(password, user.password);

            if (!hashOk) {
                return res.status(401).json({
                    message: "Invalid Credentials.", success: false
                });
            }

            const token = await user.generateJsonWebToken();
            
            // const twelveHours = 12 * 60 * 60 * 1000; // Convert 12 hours to milliseconds
            // const expirationDate = new Date(Date.now() + twelveHours);
            
            const oneHour = 3 * 60 * 60 * 1000; // Convert 12 hours to milliseconds
            res.cookie('bloodToken', token, {
                // expires: expirationDate,
                maxAge: oneHour,
                httpOnly: true
            });

            res.status(200).json({
                message: "Login success",
                user,
                token,
                success: true
            });
        }
        else {
            return res.status(401).json({
                message: "Invalid Credentials.", success: false
            });
        }

    }
    catch (err) {
        res.status(500).json({
            message: 'unknown error',
            success: false,
            error: err.message
        });
    }
}

// authnetication route
module.exports.auth = (req,res) => {
    res.status(200).json({
        message: "user logged in",
        user: req.user,
        success: true
    });
}

// logout route
module.exports.logout = async (req,res) => {
    try {
        // console.log('logging out from all devices');
        const userId = req.params.id;
        const user = await Users.findOneAndUpdate({ _id: userId }, {
            tokens: []
        })
        res.clearCookie('bloodToken', { path: '/' });
        res.status(200).json({
            message: 'user logged out', success: true
        });
    }
    catch (err) {
        // console.log(err);
        res.status(500).json({
            message: 'Logout failed!!',
            success: false,
            error: err.message
        });
    }
}

// uuser update route
module.exports.updateuser = async (req,res) => {
    const { _id, name, email, phone } = req.body;
    try {
        const updatedUser = await Users.findOneAndUpdate({ _id }, { name, email, phone }, {new: true});
        return res.status(200).json({
            message: 'profile updated',
            updatedUser,
            success: true
        });

    } catch (error) {
        return res.status(500).json({
            message: 'Failed to update',
            success: false,
            error: error.message
        });
    }
}

// change password route
module.exports.changePassword = async (req,res) => {
    const { _id, oldPassword, newPassword } = req.body;
    try {

        const existingUser = await Users.findOne({ _id });
        const hashOk = await bcrypt.compare(oldPassword, existingUser.password);
        if (!hashOk) {
            return res.status(401).json({
                message: 'Existiting password is wrong.',
                success: false,
            }); 
        }
        const password = await bcrypt.hash(newPassword, 12);
        const updatedUser = await Users.findOneAndUpdate({ _id }, { password, cpassword: password });
        return res.status(200).json({
            message: 'password changed successfully',
            success: true
        });

    } catch (error) {
        return res.status(500).json({
            message: 'password change failed',
            success: false,
            error: error.message
        });
    }
}

// reset password route
module.exports.resetPassword = async (req, res) => {
    const { email, _id, password } = req.body;
    const action = req.params.action;
    let message = 'unknown action';
    let success = false;
    let validUser = {};

    try {

        switch (action) {
            case 'email':
                validUser = await Users.findOne({ email }, { _id: 1, email: 1, city: 1 });
                if (validUser) {
                    message = 'email verified'
                    success = true
                } else {
                    return res.status(401).json({
                        message: 'invalid user',
                        success: false
                    });
                }
                break;
            case 'password':
                const hashedPassword = await bcrypt.hash(password, 12);
                await Users.findOneAndUpdate({ _id }, { password: hashedPassword, cpassword: hashedPassword }, { new: true });
                message = 'password changed'
                success = true;
                break;
            default:
                break;
        }

        return res.status(200).json({
            message,
            validUser,
            success: true
        });

    } catch (error) {
        return res.status(500).json({
            message: 'reset password failed',
            success: false,
            error: error.message
        });
    }
}

module.exports.findUser = async (req,res) => {
    const id = req.query.id || '';
    try {
        
        let result = {};

        if (id) {
            result = await Users.findOne({ _id: id });
        }
        else {
            result = await Users.find();
        }
        res.status(200).json({
            success: true,
            message: 'fetched user details',
            user: result
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to query users',
            error: error.message
        });
    }
}

