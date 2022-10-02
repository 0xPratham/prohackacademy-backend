const Joinmodel = require('../models/Joinmodel');

module.exports = {
    checkApproved: async (userId) => {
        try {
            if (!userId) {
                return ("No userId found");
            }
            const data = await Joinmodel.findById({ _id: userId })
            if (!data.approved) {
                return ("Not Approved");
            }
            return ("Approved");
        } catch (error) {
            console.log(error);
            return error;
        }
    },
}