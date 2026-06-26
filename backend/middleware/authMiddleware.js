const jwt = require('jsonwebtoken');

module.exports = async function (req, res, next) {
    const token = req.header('x-auth-token');

    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;

        // Apply trial check only for company admin and employee roles
        if (decoded.role === "company_admin" || decoded.role === "employee") {
            const isTrialRoute = req.originalUrl.includes("/api/saas/my-trial");
            if (!isTrialRoute) {
                const Company = require("../models/Company");
                if (decoded.company_id) {
                    const company = await Company.findById(decoded.company_id);
                    if (company) {
                        if (!company.is_active) {
                            return res.status(403).json({
                                success: false,
                                code: "COMPANY_SUSPENDED",
                                msg: "Your company account has been suspended."
                            });
                        }
                        if (company.is_trial) {
                            const now = new Date();
                            if (company.trial_end && new Date(company.trial_end) < now) {
                                return res.status(403).json({
                                    success: false,
                                    code: "TRIAL_EXPIRED",
                                    msg: "Your trial period has expired. Please contact support to upgrade."
                                });
                            }
                        }
                    }
                }
            }
        }

        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};
