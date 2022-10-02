const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
dotenv.config({ path: path.resolve(__dirname, '../config.env') });
const { spawn } = require('child_process');
const Joinmodel = require('../models/Joinmodel');
const UserVerification = require('../models/UserVerification');
const { google } = require('googleapis');

module.exports = {
    Delete_unverified_records: async () => {
        try {
            const result = await Joinmodel.find({ verified: false });
            if (result.length <= 0) {
                return "No Records Found To Delete ❌";
            }
            result.forEach(async (data) => {
                await UserVerification.deleteOne({ userId: data._id })
            })
            const delete_result = await Joinmodel.deleteMany({ verified: false });
            return `${delete_result.deletedCount} Record Deleted SuccessFully ✅`;
        } catch (error) {
            return error;
        }
    },
    create_backup: async () => {
        try {
            const backup_path = path.join(__dirname, '../backup', `${process.env.DATABASENAME}.gzip`);
            const child = spawn('mongodump', [
                `--db=${process.env.DATABASENAME}`,
                `--archive=${backup_path}`,
                '--gzip'
            ]);
            child.on('error', (error) => {
                console.log(error);
                return false;
            })

            const result = await new Promise((resolve, reject) => {
                child.on('exit', resolve(`Backup Is SuccessFull ✅ at ${Date().toString()}`))
            });
            return result;
        } catch (error) {
            return error;
        }
    },
    uploadBackup: async () => {
        try {
            // create connection between oauth2client
            const oauth2Client = new google.auth.OAuth2(
                process.env.CLIENTID,
                process.env.CLIENTSECRET,
                process.env.REDIRECTURL,
            );

            // set the credentials for oauth2Client
            oauth2Client.setCredentials({ refresh_token: process.env.DRIVEREFRESH_TOKEN });

            const drive = google.drive({
                version: 'v3',
                auth: oauth2Client,
            })

            const file_path = path.join(__dirname, '../backup', 'prohackacademy.gzip');

            const response = await drive.files.create({
                requestBody: {
                    name: 'prohackacademy.gzip',
                    mimeType: 'application/gzip',
                    parents: ['1W4kYR2Rx0QtsPzyeeVKL9ggoDEp0jpRS'],
                },
                media: {
                    mimeType: 'application/gzip',
                    body: fs.createReadStream(file_path),
                }
            })
            return response.data;
        } catch (error) {
            return error;
        }
    },
}