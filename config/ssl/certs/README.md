# Create SSL certificates

_These instructions have been tested on macOS, but might need to be adjusted for other operating systems._

**Reference:** [https://gist.github.com/cecilemuller/9492b848eb8fe46d462abeb26656c4f8](https://gist.github.com/cecilemuller/9492b848eb8fe46d462abeb26656c4f8).

**NOTE:** The `_localhost.conf` and `_localhost.ext` are configuration files that will be used by the following commands to generate certificate files in the same folder. They contain generic default values, but can be customized if you
wish.

<br />

## Generate Certificate Authority:

```
openssl req -x509 -nodes -new -sha256 -days 365 -newkey rsa:2048 -keyout local_CA.key -out local_CA.pem -subj "/C=US/CN=LOCAL_NODE_DEV_SERVER__JC"
```

```
openssl x509 -outform pem -in local_CA.pem -out local_CA.crt
```

<br />

## Trust the CA in keychain:

```
sudo security add-trusted-cert -d -r trustRoot -k "/Library/Keychains/System.keychain" local_CA.pem
```

<br />

## Create the signing request for dev sites:

```
openssl req -new -nodes -newkey rsa:2048 -keyout local_server.key -out local_server.csr -config _localhost.conf
```

<br />

## Create self-signed certificate:

```
openssl x509 -req -sha256 -days 365 -in local_server.csr -CA local_CA.pem -CAkey local_CA.key -CAcreateserial -extfile _localhost.ext -out local_server.crt
```

<br />

## Create .pfx file for local handshakes:

```
openssl pkcs12 -export -out local_server.pfx -inkey local_server.key -in local_server.crt
```

<br />
<br />
<br />
