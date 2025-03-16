# 2025.jonnycolby.com

This is the code for the cool, interactive, pixelated, sparkling spade on [jonnycolby.com](https://2025.jonnycolby.com).

<br />

# Setting up the project

You'll need to clone the repository and run a few commands:

## Install packages

```
yarn
```

<br />

## Create SSL certificates

Next, you'll need to create SSL certificates for local development.

- The app requests device motion/orientation access (if available on the device). This is oly available in secure contexts. If you serve with the default Next.js `dev` command, you'll be serving over `http`. Instead, in order to request
  motion/orientation access, we use a custom server with SSL certificates that we both create and trust (because we created them) to serve locally over `https`.

- These certs only get used locally with `yarn dev`. When we deploy, we'll serve `http` to the server which will guard it with an `https` layer.

- There are several steps. These can also be found in [config/ssl/certs/\_Notes](config/ssl/certs/_Notes).

- Reference: [https://gist.github.com/cecilemuller/9492b848eb8fe46d462abeb26656c4f8](https://gist.github.com/cecilemuller/9492b848eb8fe46d462abeb26656c4f8).

- These instructions have been tested on macOS, but might need to be adjusted for another OS.

### Generate Certificate Authority:

```
openssl req -x509 -nodes -new -sha256 -days 365 -newkey rsa:2048 -keyout local_CA.key -out local_CA.pem -subj "/C=US/CN=LOCAL_NODE_DEV_SERVER__JC"
```

```
openssl x509 -outform pem -in local_CA.pem -out local_CA.crt
```

### Trust the CA in keychain:

```
sudo security add-trusted-cert -d -r trustRoot -k "/Library/Keychains/System.keychain" local_CA.pem
```

### Create the signing request for dev sites:

```
openssl req -new -nodes -newkey rsa:2048 -keyout local_server.key -out local_server.csr -config _localhost.conf
```

### Create self-signed certificate:

```
openssl x509 -req -sha256 -days 365 -in local_server.csr -CA local_CA.pem -CAkey local_CA.key -CAcreateserial -extfile _localhost.ext -out local_server.crt
```

### Create .pfx file for local handshakes:

```
openssl pkcs12 -export -out local_server.pfx -inkey local_server.key -in local_server.crt
```

<br />
<br />

# Running the project

```
yarn dev
```

<br />

Open [https://localhost:4897](https://localhost:4897) in a browser.

<br />
<br />
<br />

# The Project

This is a statement piece.

It doesn't include much info, but it says, "hello".

Move your cursor around or drag with your finger to move the light source.

If on mobile, tap to enable device rotation. Then rotate your device.

<br />

## Background

I had initially created this with P5.js. I was using a WebGL canvas. I was precalculating all the vertex positions in the setup() phase and then drawing them on each draw() call.

I found that doing this was very inefficient. I switched to THREE.js so that I could calculate all the vertex positions, save them to a BufferGeometry, and keep that geometry data in memory without having to reconstruct it during every
single frame.

<br />

## The Math

Every time the page is loaded, the sparkles randomize.

We load a pixel art image (drawn by hand), and then import each pixel one-by-one with a custom script.

For each pixel, we calculate it's location, and then we calculate each vertex's exact position.

We then randomize a 3D angle for each "pixel". And then rotate the plane's vertices accordingly.

But when you do that, you get very slight gaps between "pixels" when looking through an orthographic camera.

So to fix this, we proceed to extend each pixel's vertices so that the x and y positions snap into place. The z positions are randomized, and each point's opposite point reflects the same rotation, like quantum entanglement.

Then, when we add a `PointLight`, each "pixel" reacts differently to the light, giving a "glimmer" effect.

<br />

## The Gist

This creative execution is more than a simple 3D model pasted into a Squarespace site.

We use a lot of math to draw pixels, rotate them, make them seamless, and light them up.

No two people will ever see exactly the same spade. Each one is unique. We could even use the data as a secure authentication token if we'd like... save the image and upload it to prove your identity and log in securely?? MFA loves to hear
it. This is getting to complicated for this simple execution.

Signing off.

j

<br />
<br />
<br />
<br />
<br />
