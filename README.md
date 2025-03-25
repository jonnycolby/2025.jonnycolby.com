# www.jonnycolby.com (2025)

<br />
<p align="center">
    <img width="840" alt="Screenshot 2025-03-17 at 10 47 17 PM" src="https://github.com/user-attachments/assets/67fe850b-1d49-4120-844d-334177fcd4b9" />
</p>

### A face card.

This is generative art made with **React**, **Three.js**, **P5.js**, a little bit of **GSAP**, and **custom code**. It's built on **JavaScript**, **WebGL**, and `<canvas />`. It can be used on just about any modern device with a browser, no
matter the OS.

Each pixel reacts differently to the light, generating a "glitter" effect.

The pixels in the inerative composition are generated on the fly. You'll never see the same object twice.

<br />
<br />
<br />

# Running the project locally

You'll need to clone the repository and run a few commands:

<br />

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

<br />

Follow the instructions here: [config/ssl/certs/README.md](config/ssl/certs/README.md)

<br />

## Run the project

```
yarn dev
```

<br />

**Open [https://localhost:4897](https://localhost:4897) in a browser.**

<br />
<br />
<br />

# Behind the scenes

The fun code is mainly here: [src/app/home/UI/Graphics_three/index.js](src/app/home/UI/Graphics_three/index.js)

<br />

Every unique user gets a randomized 3D model on the fly.

The base graphics were drawn by hand, painting pixels one-by-one.

Each time the page loads, we import the pixel array from each image and calculate the four vertex positions for each white pixel at a given size in 3D space in order to draw them to the scene.

Using trigonometry, we rotate the vertices of each square along the x and y axes about the square's center. When you do that, you get gaps between "pixels". So we calculate new vertex positions, extending the pixel's vertices along its
plane's orientation in order to build a seamless texture in 2D.

<br />

<p align="center">
    <img height="840" alt="Screenshot 2025-03-17 at 10 44 14 PM" src="https://github.com/user-attachments/assets/2f9c1086-e7a7-4230-a913-3180b8a70c53" />
</p>

Looking at the spade through an **orthographic camera** directly in front of it, we see a seamless **2-dimensional** pattern. However, in **3D space**, each "pixel" is slightly tilted in a random direction.

<br />

## With the unique tilt of each square, **we achieve a "glitter" effect**.

Knowing the **normals** and **bounds** of each plane allows us to use **WebGL** to reflect light from a `PointLight` against the surfaces.

That reacts to a custom material in the space of the spade, giving the glitter effect.

<br />

## Interactivity

Move your cursor or your finger around the screen to move the position of the light.

<br />

## More interactivity

What if we suspend the spade in real space and rotate according to the device's orientation?

On mobile devices with touch and motion, users can tap the screen to activate **orientation mode**.

<p align="center">
    <img height="840" alt="spade-rotation-euler-01b-trimmed - 12fps, HD" src="https://github.com/user-attachments/assets/c01cca0b-86c1-43c9-a6b6-a9f189e4023b" />
</p>

<br />

## Oh no! Gimbal lock!

We solve this using a [Quaternion](https://en.wikipedia.org/wiki/Quaternion) instead of [Euler angles](https://en.wikipedia.org/wiki/Euler_angles).

<p align="center">
    <img height="840" alt="spade-rotation-quaternion-02b-trimmed - 12fps, HD" src="https://github.com/user-attachments/assets/a344bd4a-fcc6-4544-9042-bf90e4e8f4b0" />
</p>

<br />
<br />

## We utilize the GPU to accelerate the graphics.

Previously, I tried to build the glitter effect with P2D in P5.js. This proved to be expensive and slow. I restrategized and rewrote the application in Three.js for the sake of GPU acceleration.

With Three.js, we only calculate the vertices once, and then we save them to a **BufferGeometry** in order to be reused. We construct the geometry with **vertices**, **indices**, and **normals**.

<br />
<br />

## This is all done in React.

Want cool react components?

I'm available for hire.

[hello@jonnycolby.com](mailto:hello@jonnycolby.com)

<br />
<br />
<br />
<br />
<br />
<br />
<br />
<br />
