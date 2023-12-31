const Users = require("../models/userModel");

// user status update route
module.exports.statusUpdate = async (req,res) => {
    const { status, id } = req.params;
    try {
        const updatedUser = await Users.findOneAndUpdate({ _id: id }, { status });
        if (!updatedUser) {
            return res.status(404).json({ message: "User not found", success: false });
        }
        res.status(200).json({
            success: true,
            message: `User status updated to ${status}`
        })
    }
    catch (error) {
        res.status(422).json({
            success: false,
            message: 'Failed to update user status',
            error: error.message
        });
    }
}

module.exports.getDonors = async (req,res) => {
    try {
        const donors = await Users.find({ userType: 'donor' },
            {
                _id: 1,
                name: 1,
                email: 1,
                status: 1,
                registerDate: 1
            }
        );
        res.status(200).json({
            message: 'Donors list fetched succesfully',
            success: true,
            donors
        });
    }
    catch (error) {
        res.status(422).json({
            message: 'Failed to fetch donors list',
            success: false,
            error: error.message
        });
    }
}

module.exports.getPatients = async (req,res) => {
    try {
        const patients = await Users.find({ userType: 'patient' },
            {
                _id: 1,
                name: 1,
                email: 1,
                status: 1,
                registerDate: 1
            }
        );
        res.status(200).json({
            message: 'Patients list fetched succesfully',
            success: true,
            patients
        });
    }
    catch (error) {
        res.status(422).json({
            message: 'Failed to fetch patients list',
            success: false,
            error: error.message
        });
    }
}