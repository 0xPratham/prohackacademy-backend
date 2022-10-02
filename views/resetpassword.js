module.exports = {
    reset_password : (username, support_email, link) => `<style>
    body,
    table,
    td,
    a {
        -webkit-text-size-adjust: 100%;
        -ms-text-size-adjust: 100%;
    }

    img {
        -ms-interpolation-mode: bicubic;
    }

    img {
        border: 0;
        height: auto;
        line-height: 100%;
        outline: none;
        text-decoration: none;
    }

    table {
        border-collapse: collapse !important;
    }

    body {
        height: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        width: 100% !important;
    }

    a[x-apple-data-detectors] {
        color: inherit !important;
        text-decoration: none !important;
        font-size: inherit !important;
        font-family: inherit !important;
        font-weight: inherit !important;
        line-height: inherit !important;
    }

    div[style*="margin: 16px 0;"] {
        margin: 0 !important;
    }
</style>

<body style="background-color: #181821; margin: 0 !important; padding: 0 !important;">

    <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
            <td bgcolor="#181821" align="center">
                <table border="0" cellpadding="0" cellspacing="0" width="480">
                    <tr>
                        <td align="center" valign="top" style="padding: 40px 10px 40px 10px;">
                            <div style="display: block; font-family: Helvetica, Arial, sans-serif; color: #ffffff; font-size: 18px;"
                                border="0"><img src="https://fix-assist.com/logo.png" style="width: 300px" /></div>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td bgcolor="#181821" align="center" style="padding: 0px 10px 0px 10px;">
                <table border="0" cellpadding="0" cellspacing="0" width="480">
                    <tr>
                        <td bgcolor="#1f1f2b" align="left" valign="top"
                            style="padding: 30px 30px 20px 30px; border-radius: 4px 4px 0px 0px; color: #f9f9f9; font-family: Helvetica, Arial, sans-serif; font-size: 48px; font-weight: 400; line-height: 48px;">
                            <h1 style="text-decoration: underline; font-size: 32px; font-weight: 400; margin: 0;">
                                Password Reset Request</h1>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td bgcolor="#181821" align="center" style="padding: 0px 10px 0px 10px;">
                <table border="0" cellpadding="0" cellspacing="0" width="480">
                    <tr>
                        <td bgcolor="#1f1f2b" align="left">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td colspan="2"
                                        style="color: #f9f9f9; padding-left:30px;padding-right:15px;padding-bottom:10px; font-family: Helvetica, Arial, sans-serif; font-size: 16px; font-weight: 400; line-height: 25px;">
                                        <p style="color: #f9f9f9;">Hi ${username.toString()},<br><br>

                                            We heard that you lost your password!<br><br>
                                             Don't worry, use the link below to reset it.<br><br>
                                            <b style="color: #83d8ae;">This link expires in 20 minutes</b><br><br>
                                            If you have any questions, send us an email ${support_email}.</p>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    <tr>
                        <td bgcolor="#181821" align="center">
                            <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                <tr>
                                    <td bgcolor="#1f1f2b" align="center"
                                        style="padding: 30px 30px 30px 30px; border-top:1px solid #212121;">
                                        <table border="0" cellspacing="0" cellpadding="0">
                                            <tr>
                                                <td align="left" style="border-radius: 3px;" bgcolor="#181821">
                                                    <a href="${link}" target="_blank" rel="noopener noreferrer"
                                                        style="font-size: 20px; font-family: Helvetica, Arial, sans-serif; color: #ffffff; text-decoration: none; color: #ffffff; text-decoration: none; padding: 11px 22px; border-radius: 2px; border: 1px solid #83d8ae; display: inline-block;">Reset Password</a>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </td>
        </tr>
        <tr>
            <td bgcolor="#181821" align="center" style="padding: 0px 10px 0px 10px;">
                <table border="0" cellpadding="0" cellspacing="0" width="480">
                    <tr>
                        <td bgcolor="#181821" align="left"
                            style="padding: 30px 30px 30px 30px; color: #f9f9f9; font-family: Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 400; line-height: 18px;">
                            <p style="margin: 0;">Kind Regards, <a href="https://fix-assist.com" target="_blank"
                                    rel="noopener noreferrer" style="color: #f9f9f9; font-weight: 700;">Fix Assist Tech
                                    Solutions<a></p>
                        </td>
                    </tr>
            </td>
        </tr>
    </table>

</body>`}