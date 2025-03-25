# www.jonnycolby.com (2025)

<br />
<p align="center">
    <img width="840" alt="Screenshot 2025-03-17 at 10 47 17 PM" src="https://github.com/user-attachments/assets/67fe850b-1d49-4120-844d-334177fcd4b9" />
</p>

### A face card.

This is generative art made with **React**, **Three.js**, **P5.js**, a little bit of **GSAP**, and **custom code**. It's built on **JavaScript**, **WebGL**, and `<canvas />`. It can be used on just about any modern device with a browser, no
matter the OS.

Each "pixel" in this interactive composition is generated on the fly. You'll never see the same scene twice.

We generate glitter, cover pixel art in it, and suspend it in space.

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

The base graphics were drawn by hand, painting pixels one-by-one.

Each time the page loads, we import the pixel array from each image and calculate the four vertex positions for each "existing" pixel if they were a given size.

Using trigonometry, we rotate the vertices of each square along two axes about the square's center. In order to create a seamless pattern (in 2D), we calculate new vertex positions along the ray from center to original vertex, aligning with
the 2-dimensional corner's position.

<p align="center">
    <img height="840" alt="Screenshot 2025-03-17 at 10 44 14 PM" src="https://github.com/user-attachments/assets/2f9c1086-e7a7-4230-a913-3180b8a70c53" />
</p>

Looking at the spade through an **orthographic camera** directly in front of it, we see a seamless 2-dimensional pattern. However, in 3D space, each "pixel" is slightly tilted in a random direction.

Knowing the **normals** and **bounds** of each plane allows us to use **WebGL** to reflect light from a `PointLight` against the surfaces.

<br />

### With the unique tilt of each square, **we achieve a "glitter" effect**.

Move your cursor or your finger around the screen to move the position of the light.

<br />
<br />

## More interactivity

What if we suspend the spade in real space and rotate according to the device's orientation?

On mobile devices with touch and motion, users can tap the screen to activate **orientation mode**.

<br />
<br />

## We utilize the GPU to accelerate the graphics.

<br />

Previously, I tried to build the glitter effect with P2D in P5.js. This proved to be expensive and slow. I restrategized and rewrote the application in Three.js for the sake of GPU acceleration.

<br />
<br />
<br />
<br />
<br />
<br />
<br />
<br />
