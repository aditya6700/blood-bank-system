const mongoose = require('mongoose');
const RequestHistory = require("../models/requestHistoryModel");
const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const typeList = ["donate", "request"];

module.exports.donorRequest = async (req, res) => {
    const { bloodGroup, quantity, userId, disease, appointmentSlot } = req.body;
    const type = req.params.type;

    const userType = 'donor', status = 'pending';

    // some validations
    if (!typeList.includes(type)) {
        return res.status(400).json({
            success: false,
            message: `Invalid request = ${type}`
        });
    }
    else if (!bloodGroups.includes(bloodGroup)) {
        return res.status(400).json({
            success: false,
            message: `Invalid blood group ${bloodGroup}`
        });
    }

    try {

        const donorHistRec = new RequestHistory({ bloodGroup, quantity, type, disease, status, user: userId, userType, appointmentSlot });
        const donorRequestHistRec = await donorHistRec.save();
        await donorRequestHistRec.populate({
            path: 'user',
            select: 'name', 
        });
        res.status(201).json({
            success: true,
            message: 'Requested created successfully',
            result: donorRequestHistRec._id 
        });
    }
    catch (error) {
        let message = ''
        if (type === 'donate') {
            message = 'Failed to make blood donation'
        }
        else if (type === 'request') {
            message = 'Failed to make a blood request'
        }
        res.status(500).json({
            success: false,
            message,
            error: error.message
        });
    }
}

module.exports.patientRequest = async (req, res) => {
    const { bloodGroup, quantity, userId, disease, appointmentSlot } = req.body;

    const type = 'request', userType = 'patient', status = 'pending';

    // some validations
    if (!bloodGroups.includes(bloodGroup)) {
        return res.status(400).json({
            success: false,
            message: `Invalid blood group ${bloodGroup}`
        });
    }

    try {

        const patientHistRec = new RequestHistory({ bloodGroup, quantity, disease, type, status, user: userId, userType, appointmentSlot });
        const patientRequestHistRec = await patientHistRec.save();
        await patientRequestHistRec.populate({
            path: 'user',
            select: 'name', 
        });
        res.status(201).json({
            success: true,
            message: 'Requested created successfully',
            result: patientRequestHistRec._id
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            message: 'Failed to make a blood request',
            error: error.message
        });
    }
}

module.exports.getRequestsHistory = async (req, res) => {
    const userId = req.params.id;

    try {
        let tempRequestsList = await RequestHistory.find({ type: 'request', user: userId }).populate({
            path: 'user',
            select: 'name', 
        });
        
        const requestsList = tempRequestsList.map((request) => ({
            _id: request._id,
            name: request.user.name,
            disease: request.disease,
            bloodGroup: request.bloodGroup,
            quantity: request.quantity,
            appointmentSlot: request.appointmentSlot,
            status: request.status
        }));
  
        res.status(200).json({
            message: 'Requests list fetched succesfully',
            success: true,
            requestsList
        });
    }
    catch (error) {
        res.status(500).json({
            message: 'Failed to fetch requests list',
            success: false,
            error: error.message
        });
    }
}

module.exports.getDonationsHistory = async (req,res) => {
    const userId = req.params.id;
    
    try {
        const donationsList = await RequestHistory.find({ type: 'donate', user: userId }).populate({
            path: 'user',
            select: 'name',
        });
        
        const fomattedDonationsList = donationsList.map((donation) => ({
            _id: donation._id,
            name: donation.user.name,
            bloodGroup: donation.bloodGroup,
            quantity: donation.quantity,
            status: donation.status,
            disease: donation.disease,
            appointmentSlot: donation.appointmentSlot
        }));
  
        res.status(200).json({
            message: 'Donations list fetched succesfully',
            success: true,
            donationsList: fomattedDonationsList
        });
    }
    catch (error) {
        res.status(500).json({
            message: 'Failed to fetch donations list',
            success: false,
            error: error.message
        });
    }
}

module.exports.dashboardStats = async (req, res) => {
    const { userType, user, bloodGroup } = req.query;
    const userList = ['donor', 'patient'];

    if (!userList.includes(userType)) {
        return res.status(400).json({
            success: false,
            message: `Invalid user ${userType}`
        });
    }

    try {
        if (userType === 'donor') {
            const donorReqPend = await RequestHistory.find({
                userType: 'donor', user,
                type: "donate", status: "pending"
            }).countDocuments();
            const donorReqAcc = await RequestHistory.find({
                userType: 'donor', user,
                type: "donate", status: "accepted"
            }).countDocuments();
            const donorReqRej = await RequestHistory.find({
                userType: 'donor', user,
                type: "donate", status: "rejected"
            }).countDocuments();

            const livesSaved = await RequestHistory.distinct('user', {
                    type: "request",
                    status: "accepted",
                    userType: 'patient',
                    bloodGroup
                }
            );

            return res.status(200).json({
                success: true,
                userStats: { donorReqAcc, donorReqPend, donorReqRej, livesSaved: livesSaved.length }
            });

        }
        else if (userType === 'patient') {
            const patientReqAccept = await RequestHistory.aggregate([
                {
                    $match: {
                        type: "request",
                        status: "accepted",
                        userType: 'patient',
                        user: new mongoose.Types.ObjectId(user)
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalQuantity: { $sum: '$quantity' }
                    }
                }
            ]);

            const patientPendingReq = await RequestHistory.find({
                userType: 'patient', user,
                type: "request", status: "pending"
            }).countDocuments();

            const names = await RequestHistory.find({ bloodGroup, status: "accepted", type:"donate" },
                { sort: { timestamp: -1 }, limit: 5 }).populate({
                    path: 'user',
                    select: 'name',
                });
            const recentTransfusers = names.map(item => item.user.name);

            return res.status(200).json({
                success: true,
                userStats: { accepted: patientReqAccept[0]?.totalQuantity || 0, pending: patientPendingReq, recentTransfusers }
            });
        }
        
        
    } catch (error) {
        console.log(error)
        res.status(500).json({
            success: false,
            message: 'Failed to get misc stats',
            error: error.message
        });
    }
}

module.exports.getSlots = async (req, res) => {
    const type = req.query.type || '';

    if (type === '' || !['donate', 'request'].includes(type)) {
        return res.status(404).json({
            success: false,
            message: `invalid type for fetching slots: ${type}`
        });
    }
    try {
        const currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);
        const threeDaysLater = new Date(currentDate);
        threeDaysLater.setDate(currentDate.getDate() + 3);

        let bookedSlots = await RequestHistory.find({ type, status: 'pending', appointmentSlot: { $gte: currentDate, $lt: threeDaysLater } }, { appointmentSlot: 1 });
        return res.status(200).json({
            success: true,
            bookedSlots,
            message: "successfully fetched available slots"
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: `Failed to get slots for ${type}`,
            error: error.message
        });
    }
}