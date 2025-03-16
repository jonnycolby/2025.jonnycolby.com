//
//  Private server config
//
//    This file allows us to toggle settings and specify variables that *should remain within the server*.
//    Use /public.js to specify variables that can be used by the browser app.
//

const PRIVATE_config = {
    // server_type: "serverless",
    dev: {
        port: 4897,
        lan_access: true,
    },
};

//
//
module.exports = PRIVATE_config;
//
//
