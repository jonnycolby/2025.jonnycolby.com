//
//  rev. 2024.06.14
//  Gets the system's local IP address on the LAN.
//
const { networkInterfaces } = require("os");
//

const get_local_ip = () => {
    const nets = networkInterfaces();
    const results = Object.create(null); // Or just '{}', an empty object

    console.log("MARK: get_local_ip()...");

    var local_ip = null;
    try {
        for (const name of Object.keys(nets)) {
            for (const net of nets[name]) {
                // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
                if (net.family === "IPv4" && !net.internal) {
                    if (!results[name]) {
                        results[name] = [];
                    }
                    results[name].push(net.address);
                }
            }
        }
        if (results && results["en0"] && results["en0"][0]) local_ip = results["en0"][0];
    } catch (err) {
        console.warn("NOTE: Could not find local IP -- you probably aren't connected to a network.  That's fine, we chillin :)", err);
    }

    return local_ip;
};

//

// export default get_local_ip;
module.exports = get_local_ip;

//
