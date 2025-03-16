//
//  Dev server
//
const Next = require("next");
const HTTP = require("http");
const HTTPS = require("https");
const { parse: Parse_url } = require("url");
const QRCode = require("qrcode");

const get_local_ip = require("./methods/get_local_ip");
const get_ssl_certs = require("../../config/ssl"); // for local development

const CONFIG_private = require("../../config/private");

const IS_DEV = process.env.NODE_ENV == "development" ? true : false;

//

class Simple_Server {
    constructor(props) {
        const SS = this;
        props = props || {};

        SS.mem = {
            protocol: null,
            https_certs: IS_DEV ? get_ssl_certs() : false,
            local_hostname: {
                local: "localhost",
                network: CONFIG_private.dev.lan_access ? get_local_ip() : null,
            },
            local_port: IS_DEV && CONFIG_private.dev.port ? CONFIG_private.dev.port : CONFIG_private.process.args.PORT || process.env.PORT || 5000,
            next_app: null,
            next_handler: null,
        };

        SS.cache = {
            url_on_network: null,
        };

        //
        SS.init(); // async branch -> calls .start() automatically when ready
    }

    init = async () => {
        const SS = this;
        await SS.prepare_next();
        //
        await SS.start();
        //
        return true;
    };

    prepare_next = async () => {
        const SS = this;
        //
        SS.cache.url_on_network = `https://${SS.mem.local_hostname.network}:${SS.mem.local_port}`;
        process.env.NEXT_PUBLIC_URL_ON_NETWORK = `${SS.cache.url_on_network}`;
        //
        SS.mem.next_app = Next({
            dev: IS_DEV,
            dir: ".",
            hostname: "localhost", // HS.mem.local_hostname.local,
            port: SS.mem.local_port,
        });
        SS.mem.next_handler = SS.mem.next_app.getRequestHandler();
        await SS.mem.next_app.prepare();
        return true;
    };

    start = async () => {
        const SS = this;

        const serve_via_ip = CONFIG_private.dev.lan_access ? "0.0.0.0" : "127.0.0.1";

        if (SS.mem.https_certs && typeof SS.mem.https_certs == "object") {
            SS.mem.protocol = "https";
            HTTPS.createServer(SS.mem.https_certs, SS.handle_request).listen(SS.mem.local_port, serve_via_ip, SS.on_server_listen);
        } else {
            SS.mem.protocol = "http";
            HTTP.createServer(SS.handle_request).listen(SS.mem.local_port, serve_via_ip, SS.on_server_listen);
        }

        return true;
    };

    handle_request = (req, res) => {
        const SS = this;
        const parsed_url = Parse_url(req.url, true);
        console.log("Requesting URL:", parsed_url);
        return SS.mem.next_handler(req, res, parsed_url);
    };

    on_server_listen = (err) => {
        const SS = this;
        if (err) throw err;

        console.log("\n", "Ready.  Started server at:");
        console.log(`  ${SS.mem.protocol}://${SS.mem.local_hostname.local}:${SS.mem.local_port}  (local access)`);
        if (SS.mem.local_hostname.network) console.log(`  ${SS.mem.protocol}://${SS.mem.local_hostname.network}:${SS.mem.local_port}  (network access)`);

        if (CONFIG_private.dev.lan_access) {
            // QRCode.toString(`https://${SS.mem.local_hostname.network}:${SS.mem.local_port}`, { type: "terminal" }, function (err, url) {
            QRCode.toString(SS.cache.url_on_network, { type: "terminal" }, function (err, url) {
                console.log("\n");
                console.log(url);
                console.log("\n");
            });
        }
    };
}

//
//
module.exports = Simple_Server;
//
//
