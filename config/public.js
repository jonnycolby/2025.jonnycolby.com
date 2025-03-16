//
//  Public server config
//
//    This file allows us to toggle settings and specify variables that will be sent to the browser and used in the React app.
//    Use /private.js to specify variables that shouldn't leave the server.
//

const PUBLIC_config = {
    head: {
        title: "jonathan colby",
        description: "creative technologist && full-stack web engineer",
    },
    ga_id: process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID || false, // "G-F3HPVD5QE4", // 2025.jonnycolby.com
};

//
//
module.exports = PUBLIC_config;
//
//
