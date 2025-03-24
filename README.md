# 2025.jonnycolby.com

## tl;dr

This is a generative art project and statement piece. You can find the fun code here: [src/app/home/UI/Graphics_three/index.js](src/app/home/UI/Graphics_three/index.js)

<br />

---

This is the code for the interactive, pixelated, sparkling spade on [jonnycolby.com](https://2025.jonnycolby.com).

<img width="1486" alt="Screenshot 2025-03-17 at 10 47 17 PM" src="https://github.com/user-attachments/assets/67fe850b-1d49-4120-844d-334177fcd4b9" />

## This is cool because

<img width="888" alt="Screenshot 2025-03-17 at 10 44 14 PM" src="https://github.com/user-attachments/assets/2f9c1086-e7a7-4230-a913-3180b8a70c53" />

Every unique user gets a randomized 3D model on the fly.

On page load, we take a very small image full of pixels and draw each pixel to the scene, mapping the vertex of each corner of the pixel to 3D space.

Then, we rotate each pixels' x and y axes. When you do that, you get gaps between "pixels". So we proceed to extend the pixels vertices along its plane's orientation in order to build a seamless texture when looking from the front with an
orthographic camera.

We then place a PointLight in the scene, placed at either the camera's position or reacting to the pointer's position.

That reacts to a custom material in the space of the spade, giving the glitter effect.

---

This has been optimized.

Originally, I used P5.js to draw the pixels. Then I gave the pixels orientation and 3D space. I was recreating the 3D vertices, normals, etc. on every frame. This was inefficient. I switched the logic to configure to THREE.js so that I
could create a 3D geometry buffer and reuse it on every frame instead of reconstructing it on every frame.

Seems to work alright.

<br />

# Setting up the project

You'll need to clone the repository and run a few commands:

## Install packages

```
yarn
```

<br />

## Create SSL certificates

You can create SSL certificates by following the instructions here: [config/ssl/certs/README.md](config/ssl/certs/README.md).

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
<br />
<br />
<br />
<br />
