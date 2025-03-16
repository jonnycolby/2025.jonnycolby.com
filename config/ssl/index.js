//
//  Retrieves the SSL certificates for local development
//
const FS = require("fs");
const Path = require("path");

//

//
//  get_ssl_certs():
//    Returns either FALSE (if the certs haven't been generated), or { key, cert, ca_cert } if the certs exist.
//    To generate local SSL certificates, see /server/ssl/certs/_Notes.
//
const get_ssl_certs = () => {
    //
    const cert_pathnames = {
        key: Path.resolve(__dirname, "./certs/local_server.key"),
        cert: Path.resolve(__dirname, "./certs/local_server.crt"),
        ca_cert: Path.resolve(__dirname, "./certs/local_CA.crt"),
    };
    //
    const certs_exist = {
        key: FS.existsSync(cert_pathnames.key),
        cert: FS.existsSync(cert_pathnames.cert),
        ca_cert: FS.existsSync(cert_pathnames.ca_cert),
    };
    //
    if (!certs_exist.key || !certs_exist.cert || !certs_exist.ca_cert) return false;
    // else, continue:

    const https_certs = {
        key: FS.readFileSync(cert_pathnames.key),
        cert: FS.readFileSync(cert_pathnames.cert),
        ca_cert: FS.readFileSync(cert_pathnames.ca_cert),
        //
        _paths: { ...cert_pathnames },
    };

    return https_certs;
};

//

module.exports = get_ssl_certs;

//
//  REFERENCE:
//
// //  This allows us to make HTTPS connections to other local servers when using self-signed certs:
// HTTPS.globalAgent.options.ca = [https_certs.ca_cert];
// // https.globalAgent.options.checkServerIdentity = () => undefined; // NOTE: This is a big security risk
// // const https_agent = new HTTPS.Agent({ ca: FS.readFileSync("./_certs/local_CA.crt") });
