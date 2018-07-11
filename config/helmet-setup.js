
let helmetSetup = {
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "https://fonts.googleapis.com", "https://stackpath.bootstrapcdn.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            imgSrc: ["'self'", "https://via.placeholder.com", "*"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://code.jquery.com", "https://stackpath.bootstrapcdn.com", "https://unpkg.com"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: true,
        }
    },
    hidePoweredBy: { setTo: "me" },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" }
};

module.exports = helmetSetup;