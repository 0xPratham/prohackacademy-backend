const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const express = require('express');
const app = express();
const port = process.env.PORT;
const mongodb_connect = require('./db/database_conn');
const helmet = require("helmet");
const cors = require('cors');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const schedule = require('node-schedule');
const { Delete_unverified_records, create_backup, uploadBackup } = require('./helpers/schedule_job');
const fs = require('fs');

// creating middleware for json
app.use(express.json());

// connect to mongodb server
mongodb_connect();

// adding helmet to add extra security layer
app.use(helmet());

// using cors
app.use(cors({
    origin: process.env.ORIGIN_URL,
    credentials: true
}));

// adding cookieparser
app.use(cookieParser());

// adding rate limit
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (per 15 minutes)
    message: {
        Errors: "Don't Try To Dos The Server Noob You Are Banned for Some Time"
    },
})

app.use(apiLimiter);

// Available Routes
app.use('/api/login', require('./routes/login'));
app.use('/api/join', require('./routes/join'));
app.use('/api/verify', require('./routes/verify'));
app.use('/api/resetpasswordlink', require('./routes/resetpasswordlink'));
app.use('/api/resetpassword', require('./routes/resetpassword'));
app.use('/api/fetchchallenges', require('./routes/fetchchallenges'));
app.use('/api/fetchscore', require('./routes/fetchscore'));
app.use('/api/solve', require('./routes/solve'));
app.use('/api/check_approved', require('./routes/check_approved'));
app.use('/api/user_progress', require('./routes/user_progress'));
app.use('/api/feedback', require('./routes/feedback'));
app.use('/api/add_challenges', require('./routes/add_challenges'));
app.use('/api/fetch_user', require('./routes/fetch_user'));
app.use('/api/check_auth', require('./routes/check_auth'));
app.use('/api/logout', require('./routes/logout'));
app.get('/api/status', async (req, res) => {
    return res.status(200).send({
        status: 200,
        message: "Fix Assist API Is Active :)",
        port: process.pid
    });
})

// handle not found error
app.all('*', (req, res, next) => {
    res.status(404).send({
        error: "Not Found"
    });
});

// handle syntax error
app.use((err, req, res, next) => {
    res.status(500).json({
        Errors: "Something Wents Wrong :("
    });
});

// Listen the app
app.listen(port, () => {
    console.log(`🚀 Fix Assist API is listening on ${port}`);
});

// adding cronjob for backup database and delete unverified email records
// cronjob for every day at 2am -> 0 2 * * *
// cronjob for every 15sec -> */15 * * * * *
schedule.scheduleJob('0 2 * * *', async () => {
    try {
        const res = await Delete_unverified_records();
        console.log(res);
        const backup_res = await create_backup();
        console.log(backup_res);
        await new Promise(resolve => setTimeout(resolve, 5000));
        fs.exists('./backup/prohackacademy.gzip', async function fileExists(exists) {
            if (!exists) {
                console.log("Backup File Not Exist");
                return false;
            }
            const upload_res = await uploadBackup();
            if(Object.keys(upload_res).length > 0){
                console.log("File Upload On Drive SuccessFully ✅");
            }
        });
    } catch (error) {
        console.log(error);
    }
});
