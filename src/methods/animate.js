/**
 * Animates a value or an object of values over a specified duration using GSAP.
 *
 * @param {Object} options - The configuration object for the animation.
 * @param {number|Object} options.from - The starting value(s). Can be a single number or an object of key-value pairs.
 * @param {number|Object} options.to - The ending value(s). Must match the type of `from`.
 * @param {number} options.duration - The duration of the animation in seconds.
 * @param {string} options.ease - The easing function to use (e.g., "power2.inOut"). Refer to GSAP's easing options.
 * @param {Function} options.on_update - A callback function that is called on each animation frame with the interpolated value(s).
 * @returns {Promise<void>} A promise that resolves when the animation is complete.
 *
 * @example
 * // Animate a single value
 * animate({
 *   from: 0,
 *   to: 100,
 *   duration: 2,
 *   ease: "power2.inOut",
 *   on_update: (value) => {
 *     console.log("Current value:", value);
 *   },
 * }).then(() => {
 *   console.log("Animation complete!");
 * });
 *
 * @example
 * // Animate multiple values in an object
 * animate({
 *   from: { x: 0, y: 0, z: 0 },
 *   to: { x: 100, y: 200, z: 300 },
 *   duration: 3,
 *   ease: "power1.out",
 *   on_update: (values) => {
 *     console.log("Current values:", values.x, values.y, values.z);
 *   },
 * }).then(() => {
 *   console.log("Object animation complete!");
 * });
 */

import GSAP from "gsap";
import map from "./map";

const animate = ({ from, to, duration, ease, on_update }) => {
    return new Promise((resolve) => {
        const anim = { progress: 0.0 };
        GSAP.to(anim, {
            progress: 1.0,
            duration: duration,
            ease: ease,
            onUpdate: () => {
                // Check if the value is a number or an object
                let value = {};
                if (typeof from === "number") {
                    value = map({ from: from, to: to, progress: anim.progress });
                } else {
                    for (var key in from) {
                        value[key] = map({ from: from[key], to: to[key], progress: anim.progress });
                    }
                }
                on_update(value);
            },
            onComplete: resolve,
        });
    });
};

//
//
export default animate;
//
//
