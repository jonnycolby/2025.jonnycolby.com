"use client";
//
import React from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Stats from "stats.js";
import GSAP from "gsap";
//
import get_spade_pixels from "@/methods/get_pixels/spade";
import pause from "@/methods/pause";
//
import styles from "./styles.module.scss";
//
const IS_DEV = process.env.NODE_ENV === "development";
//
//

// MARK: constants
var PX_SIZE = 2; // length of one square
const ROTATE_MAX_ANGLE = Math.PI * 0.25 * 0.5 * 0.1875 * 1.5; // 45 degrees / ...
const LIGHT_DISTANCE_RATIO = 0.5;
const LIGHT_Z_RATIO = 0.75; // squish the z-axis
const SHAPE_THICKNESS_px = PX_SIZE * 2;

const ENABLE_ORBIT_CONTROLS = false;

//
//

class Graphics_three extends React.Component {
    constructor(props) {
        super(props);
        const Z = this;
        Z.parent = props.parent;
        Z.parent.children.Graphics_three = Z;

        Z.state = {
            hint_text: "", // "drag or move the cursor" -> desktop/mouse  || "tap or drag" -> mobile/touch
            hint_visible: false,
        };

        Z.vars = {
            _mounted: false,
            _ready: false,
            cursor_pos: { x: 0, y: 0 },
            light_distance: 200,
            light_pos: { x: 0, y: 0, z: 0 },
            orientation_offset: null,
            shape_size_max: null,
            quaternion: {
                device: new THREE.Quaternion(),
                device_inverse: new THREE.Quaternion(),
                initial: null, // Quaternion
            },
            light_mode: "auto", // "auto" || "cursor" || "device" || "none"
            device_orientation_active: false,
        };

        Z.dom = {
            Renderer: null,
        };

        Z.mem = {
            stats: null,
            renderer: null,
            scene: null,
            camera: null,
            //
            orbit_controls: null,
            //
            lights: {
                ambient: null,
                directional_light_01: null,
            },
            objects: {
                demo_point: null,
            },
        };

        //
    }
    componentDidMount() {
        const Z = this;
        if (Z.vars._mounted) return true;
        Z.vars._mounted = true;
        //
        window.addEventListener("pointermove", Z.on_pointer_move);
        window.addEventListener("pointerout", Z.on_pointer_out);
        window.addEventListener("resize", Z.on_resize);
        window.addEventListener("click", Z.request_device_orientation, { once: true });
        window.addEventListener("mousedown", Z.on_mouse_down); // click and drag.  pointermove works on both mobile and desktop, but click-and-drag only works with a mouth
        //
        Z.init();
    }
    componentWillUnmount() {
        const Z = this;
        window.removeEventListener("pointermove", Z.on_pointer_move);
        window.removeEventListener("resize", Z.on_resize);
        window.removeEventListener("deviceorientation", Z.on_device_orientation, true);
    }
    componentDidUpdate(prev_props) {
        const Z = this;
        if (Z.props.visible && !prev_props.visible) {
            const intro_if_ready = () => {
                if (Z.vars._ready)
                    Z.intro(); // async
                else setTimeout(intro_if_ready, 1000 * 0.1);
            };
            intro_if_ready();
        }
    }
    set_state = (new_state) => new Promise((resolve) => this.setState(new_state, resolve));

    //

    init = async () => {
        const Z = this;
        const MEM = Z.mem;

        let hint_text = "";
        if (typeof DeviceOrientationEvent.requestPermission === "function") hint_text = "tap or drag";
        else hint_text = "drag or move the cursor";
        await Z.set_state({ hint_text: hint_text });

        //

        PX_SIZE = 2; // default
        if (window.innerWidth < 512) PX_SIZE = 2;
        else if (window.innerWidth < 1440) PX_SIZE = 3;
        else PX_SIZE = 4;

        //

        const spade_px_values = await get_spade_pixels();
        // ->
        const spade_geometry = make_spade_geometry(spade_px_values);

        //
        //

        Z.vars.dom_bbox = Z.dom.Renderer.getBoundingClientRect();
        const dom_bbox = Z.vars.dom_bbox;

        Z.vars.light_distance = Math.max(dom_bbox.width, dom_bbox.height) * LIGHT_DISTANCE_RATIO;

        MEM.scene = new THREE.Scene();
        MEM.camera = new THREE.OrthographicCamera(dom_bbox.width * -0.5, dom_bbox.width * 0.5, dom_bbox.height * 0.5, dom_bbox.height * -0.5, 0, 2000);

        MEM.camera.position.z = 1000;

        MEM.renderer = new THREE.WebGLRenderer({ alpha: true });
        MEM.renderer.setPixelRatio(window.devicePixelRatio);
        // MEM.renderer.setPixelRatio(1.0);
        // MEM.renderer.setClearColor(0x000000, 0);
        MEM.renderer.setSize(dom_bbox.width, dom_bbox.height);
        Z.dom.Renderer.appendChild(MEM.renderer.domElement);

        if (ENABLE_ORBIT_CONTROLS) {
            MEM.orbit_controls = new OrbitControls(MEM.camera, MEM.renderer.domElement);
            MEM.orbit_controls.update();
        }

        //

        MEM.objects.scene_group = new THREE.Group();
        MEM.scene.add(MEM.objects.scene_group);

        //
        // OPTIONAL: Orientation point
        //  -> A sense of gravity.  This helps the user feel the direction of the spade's normal.  Without this, the spade can feel like its rotating the opposite way.
        //  -> TODO: let's show this when we have a device orientation, and hide it when we're in light position mode
        MEM.objects.demo_point = {};
        const demo_point = MEM.objects.demo_point;
        demo_point.group = new THREE.Group();
        demo_point.material = new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0.0, transparent: true }); // opacity becomes 1.0 during intro
        demo_point.geometries = {};
        demo_point.geometries.x_axis = new THREE.CylinderGeometry(1, 1, 24, 8); // radiusTop, radiusBottom, height, radialSegments
        demo_point.geometries.y_axis = demo_point.geometries.x_axis.clone();
        demo_point.geometries.z_axis = demo_point.geometries.x_axis.clone();
        demo_point.meshes = {};
        demo_point.meshes.x_axis = new THREE.Mesh(demo_point.geometries.x_axis, demo_point.material);
        demo_point.meshes.x_axis.rotation.set(0, 0, Math.PI * 0.5);
        demo_point.meshes.y_axis = new THREE.Mesh(demo_point.geometries.y_axis, demo_point.material);
        demo_point.meshes.y_axis.rotation.set(0, 0, 0);
        demo_point.meshes.z_axis = new THREE.Mesh(demo_point.geometries.z_axis, demo_point.material);
        demo_point.meshes.z_axis.rotation.set(Math.PI * 0.5, 0, 0);
        demo_point.group.add(demo_point.meshes.x_axis);
        demo_point.group.add(demo_point.meshes.y_axis);
        demo_point.group.add(demo_point.meshes.z_axis);
        demo_point.group.position.set(0, 0, 100);
        MEM.objects.scene_group.add(demo_point.group);
        //

        //

        const window_center_offset = {
            x: dom_bbox.width * -0.5 + Math.floor(dom_bbox.width * 0.5), //
            y: dom_bbox.height * 0.5 - Math.floor(dom_bbox.height * 0.5),
        };

        // Glossy material:
        const spade_material = new THREE.MeshPhongMaterial({
            color: 0x000000, // Black glossy color
            emissive: 0x080809,
            specular: 0xffffff, // white highlights
            roughness: 0.5, // 0.05 -> Low roughness for gloss
            metalness: 0.5, // 1.0, -> High metalness for reflectivity
        });

        const shape_mesh = new THREE.Mesh(spade_geometry, spade_material);

        const shape_width = spade_px_values[0].length * PX_SIZE;
        const shape_height = spade_px_values.length * PX_SIZE;
        const shape_size_max = Math.max(shape_width, shape_height);
        Z.vars.shape_size_max = shape_size_max;

        const offset_px = [
            Math.floor(shape_width * -0.5),
            Math.floor(shape_height * 0.5), // positive because .scene is naturally inverted
        ];

        const offset_px_full = [
            offset_px[0] + window_center_offset.x, //
            offset_px[1] + window_center_offset.y,
            // offset_px[2],
        ];

        // Add the mesh to the scene
        shape_mesh.position.set(
            offset_px_full[0], //
            offset_px_full[1],
            0, // -1.0 * offset_px_full[2],
        );
        MEM.objects.scene_group.add(shape_mesh);

        //
        // MARK: Lights
        //

        // create a point light:
        MEM.lights.cursor = new THREE.PointLight(
            0xf3f2f3, // color
            0.0, // -> 1.0, // intensity
            0, // distance
            0.01, // decay -> should be 2 with a normal PerspectiveCamera for physically-accurate results // TODO: refine this value
        );
        Z.vars.light_pos = { x: 0, y: 0, z: Z.vars.light_distance };
        MEM.lights.cursor.position.set(Z.vars.light_pos.x, Z.vars.light_pos.y * -1.0, Z.vars.light_pos.z);
        MEM.scene.add(MEM.lights.cursor);

        //
        //
        if (IS_DEV) {
            Z.mem.stats = new Stats();
            Z.mem.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
            document.body.appendChild(Z.mem.stats.dom);
        }
        MEM.renderer.setAnimationLoop(Z.animate);
        Z.vars._ready = true;
        return true;
    };

    animate = () => {
        const Z = this;
        const MEM = Z.mem;
        if (Z.mem.stats) Z.mem.stats.begin();
        //
        if (ENABLE_ORBIT_CONTROLS) MEM.orbit_controls.update();
        //
        if (Z.vars.light_mode === "auto") {
            const new_pos = auto_light_position(performance.now(), Z);
            Z.vars.light_pos = new_pos;
            MEM.lights.cursor.position.set(new_pos.x, new_pos.y, new_pos.z);
        } else if (Z.vars.light_mode === "device") {
            MEM.lights.cursor.position.set(
                0, //
                0,
                Z.vars.light_distance,
            );
        } else if (Z.vars.light_mode === "cursor") {
            MEM.lights.cursor.position.set(
                Z.vars.light_pos.x, //
                Z.vars.light_pos.y * -1.0,
                Z.vars.light_pos.z,
            );
        } else if (Z.vars.light_mode === "none") {
            // We let something else control the light
        } else {
            // We let something else control the light
        }
        //
        Z.mem.renderer.render(MEM.scene, MEM.camera);
        if (Z.mem.stats) Z.mem.stats.end();
    };

    //

    intro = async () => {
        const Z = this;
        const MEM = Z.mem;
        //
        await animate({
            from: 0.0,
            to: 1.0,
            duration: 3.6,
            ease: "power2.inOut",
            on_update: (value) => {
                MEM.lights.cursor.intensity = value;
                // MEM.objects.demo_point.material.opacity = value;
            },
        });
        // If we want to animate the "demo_point" in at the beginning, we can use this.  Instead, currently, we are flipping it on when the object rotates and off when it's not rotating
        // await animate({
        //     from: 0.0,
        //     to: 1.0,
        //     duration: 2.0,
        //     ease: "power2.inOut",
        //     on_update: (value) => {
        //         MEM.objects.demo_point.material.opacity = value;
        //     },
        // });
        //
        await Z.set_state({ hint_visible: true }); // animates with CSS
        setTimeout(async () => await Z.set_state({ hint_visible: false }), 1000 * 3.6); // animates with CSS
    };

    //

    on_resize = () => {
        const Z = this;
        // MARK: Resize orthographic camera
        Z.mem.renderer.setSize(window.innerWidth, window.innerHeight);
        Z.mem.camera.left = window.innerWidth * -0.5;
        Z.mem.camera.right = window.innerWidth * 0.5;
        Z.mem.camera.top = window.innerHeight * 0.5;
        Z.mem.camera.bottom = window.innerHeight * -0.5;
        Z.mem.camera.updateProjectionMatrix();
        //
        Z.vars.dom_bbox = Z.dom.Renderer.getBoundingClientRect();
        const dom_bbox = Z.vars.dom_bbox;
        // Z.vars.light_distance = Math.max(dom_bbox.width, dom_bbox.height) * LIGHT_DISTANCE_RATIO; // TODO: fix light_distance functionality
        //
        const x = Z.vars.light_pos.x;
        const y = Z.vars.light_pos.y;
        const r = Math.max(dom_bbox.width, dom_bbox.height) * LIGHT_DISTANCE_RATIO;
        Z.vars.light_pos = {
            x: Z.vars.light_pos.x, //
            y: Z.vars.light_pos.y,
            z: Math.sqrt(r * r - x * x - y * y) * LIGHT_Z_RATIO,
        };
    };

    on_pointer_out = (e) => {
        const Z = this;
        if (Z.vars.light_mode == "cursor") Z.vars.light_mode = "auto";
    };

    on_pointer_move = (e) => {
        const Z = this;
        //
        if (Z.vars.light_mode == "auto") Z.vars.light_mode = "cursor";
        //
        Z.vars.cursor_pos = { x: e.clientX - window.innerWidth * 0.5, y: e.clientY - window.innerHeight * 0.5 };
        // ->
        // Equation of a sphere:
        //   x^2 + y^2 + z^2 = r^2
        // ->
        const x = Z.vars.cursor_pos.x;
        const y = Z.vars.cursor_pos.y;
        const r = Math.max(window.innerWidth, window.innerHeight) * LIGHT_DISTANCE_RATIO;
        // const r = Z.vars.shape_size_max * 1.0;
        if (x * x + y * y > r * r) {
            // outside of sphere
            Z.vars.light_pos = {
                x: x, //
                y: y,
                z: 0,
            };
        } else {
            // inside of sphere
            Z.vars.light_pos = {
                x: x, //
                y: y,
                z: Math.sqrt(r * r - x * x - y * y) * LIGHT_Z_RATIO,
            };
        }
    };

    request_device_orientation = () => {
        const Z = this;
        const MEM = Z.mem;
        if (Z.vars.device_orientation_active) return; // only request once
        Z.vars.device_orientation_active = true;
        //
        if (typeof DeviceOrientationEvent.requestPermission === "function") {
            // iOS 13+ and other browsers that require permission
            DeviceOrientationEvent.requestPermission()
                .then((permissionState) => {
                    if (permissionState === "granted") {
                        window.addEventListener("deviceorientation", Z.on_device_orientation);
                        // +
                        Z.vars.light_mode = "device";
                        MEM.objects.demo_point.material.opacity = 1.0;
                        // TODO:  set initial quaternion
                        //
                    } else {
                        // Handle permission denied
                        console.error("Device orientation permission denied.");
                    }
                })
                .catch(console.error);
        } else {
            // Older browsers that don't require permission
            window.addEventListener("deviceorientation", Z.on_device_orientation);
        }
        // ->
        // Either way:
        Z.parent.orientation_activated_or_cancelled();
    };

    on_device_orientation = (e) => {
        const Z = this;
        const MEM = Z.mem;
        const VARS = Z.vars;
        //
        //  IMPORTANT: We use Quaternion instead of Euler angles to avoid gimbal lock
        //   -> https://en.wikipedia.org/wiki/Gimbal_lock

        const { alpha, beta, gamma } = e; // Rotation around z, x, and y axes in degrees

        // Convert to radians
        const alpha_rad = THREE.MathUtils.degToRad(alpha || 0);
        const beta_rad = THREE.MathUtils.degToRad(beta || 0);
        const gamma_rad = THREE.MathUtils.degToRad(gamma || 0);

        const alpha_rad_inv = -alpha_rad;
        const beta_rad_inv = -beta_rad;
        const gamma_rad_inv = -gamma_rad;

        // Create quaternion from Euler angles (ZYX rotation order matches DeviceOrientation spec)
        const deviceEuler = new THREE.Euler(beta_rad_inv, gamma_rad_inv, alpha_rad_inv, "YXZ"); // NOTE: `alpha_rad_inv` was `-alpha_rad_inv` before -- flipping back to positive seemed to be the correct orientation
        VARS.quaternion.device.setFromEuler(deviceEuler);

        // Inverse to create the "window" effect
        VARS.quaternion.device_inverse.copy(VARS.quaternion.device).invert(); // TODO: are we using the inverse device quaternion?

        // Set initial orientation, if unset
        if (!VARS.quaternion.initial) {
            // VARS.quaternion.initial = VARS.quaternion.device.clone();
            VARS.quaternion.initial = new THREE.Quaternion().copy(VARS.quaternion.device);
        }

        // ->
        // Apply device orientation to the scene relative to the initial orientation
        const relativeQuaternion = VARS.quaternion.device.clone().multiply(VARS.quaternion.initial.clone().invert());
        MEM.objects.scene_group.quaternion.copy(relativeQuaternion);
    };

    on_mouse_down = (e) => {
        const Z = this;
        const MEM = Z.mem;
        if (e.touches && e.touches.length) return;
        Z.vars.light_mode = "none";
        MEM.objects.demo_point.material.opacity = 1.0;
        window.addEventListener("mousemove", Z.on_mouse_drag);
        window.addEventListener("mouseup", Z.on_mouse_up, { once: true });
    };

    on_mouse_drag = (e) => {
        const Z = this;
        const MEM = Z.mem;
        console.log("drag");
        // Drag to rotate the object instead of the light
        const x = e.clientX - window.innerWidth * 0.5;
        const y = e.clientY - window.innerHeight * 0.5;
        const r = Math.max(window.innerWidth, window.innerHeight) * LIGHT_DISTANCE_RATIO;
        // Drag to rotate the object instead of the light.  Rotate the object to face the cursor
        const angle_x = Math.atan(y / r);
        const angle_y = Math.atan(x / r);
        // ->
        MEM.objects.scene_group.rotation.set(angle_x, angle_y, 0);
    };

    on_mouse_up = async (e) => {
        const Z = this;
        const MEM = Z.mem;
        window.removeEventListener("mousemove", Z.on_mouse_drag);
        Z.vars.light_mode = "none"; // control the light ourselves for a moment
        //
        const duration_sec = 0.48;
        // Reset the object's rotation with animate()
        animate({
            from: { x: MEM.objects.scene_group.rotation.x, y: MEM.objects.scene_group.rotation.y, z: MEM.objects.scene_group.rotation.z },
            to: { x: 0, y: 0, z: 0 },
            duration: duration_sec,
            ease: "power2.inOut",
            on_update: (rotation) => {
                MEM.objects.scene_group.rotation.set(rotation.x, rotation.y, rotation.z);
            },
        });
        // Rotate the light back to the auto position
        const new_light_pos = auto_light_position(performance.now() + duration_sec * 1000, Z);
        await animate({
            // from: { x: Z.vars.light_pos.x, y: Z.vars.light_pos.y, z: Z.vars.light_pos.z },
            // from: the current light position
            from: { x: MEM.lights.cursor.position.x, y: MEM.lights.cursor.position.y, z: MEM.lights.cursor.position.z },
            // to: { x: 0, y: 0, z: Z.vars.light_distance }, // straight forward
            to: { x: new_light_pos.x, y: new_light_pos.y, z: new_light_pos.z }, // to: the projected "auto" position
            duration: duration_sec,
            ease: "power2.inOut",
            on_update: (light_pos) => {
                Z.vars.light_pos = light_pos;
                MEM.lights.cursor.position.set(Z.vars.light_pos.x, Z.vars.light_pos.y, Z.vars.light_pos.z);
            },
        });
        Z.vars.light_mode = "auto";
        MEM.objects.demo_point.material.opacity = 0.0;
    };

    //
    //

    render() {
        const Z = this;

        return (
            <div className={`${styles.Graphics_three}`} ref={(el) => (Z.dom.Renderer = el)}>
                <div className={`${styles.hint_text} ${Z.state.hint_visible ? styles._visible : ""}`}>{Z.state.hint_text}</div>
            </div>
        );
    }
}

//
//

const deg_to_rad = (deg) => {
    return (deg * Math.PI) / 180;
};

//

const auto_light_position = (time, Z) => {
    time = time || performance.now();
    var light_angle = (time * 0.001 * Math.PI * 2.0) / 3.14; // 3.14 seconds for a full rotation
    const out = {
        x: Math.sin(light_angle) * Z.vars.light_distance, // TODO: switch light_distance to 2x spade size
        y: Math.cos(light_angle) * Z.vars.light_distance, // TODO: switch light_distance to 2x spade size
        z: Z.vars.light_distance,
    };
    return out;
};

//

// NOTE: the pixels are currently not centered around origin
const rotate_square_verts = (verts, angles) => {
    var [v1, v2, v3, v4] = verts;
    const origin = [
        (v1[0] + v2[0] + v3[0] + v4[0]) * 0.25, //
        (v1[1] + v2[1] + v3[1] + v4[1]) * 0.25,
        (v1[2] + v2[2] + v3[2] + v4[2]) * 0.25,
    ];
    var angle_x = angles.x;
    var angle_y = angles.y;
    //

    // center the square of size PX_SIZE around origin
    var shifted_verts = [
        [v1[0] - origin[0], v1[1] - origin[1], v1[2] - origin[2]],
        [v2[0] - origin[0], v2[1] - origin[1], v2[2] - origin[2]],
        [v3[0] - origin[0], v3[1] - origin[1], v3[2] - origin[2]],
        [v4[0] - origin[0], v4[1] - origin[1], v4[2] - origin[2]],
    ];

    const rotated_verts = [];

    // MARK: rotate around x-axis
    shifted_verts.forEach((vert) => {
        const x = vert[0];
        const y = vert[1];
        const z = vert[2];
        // ->
        const x_new = x;
        const y_new = y * Math.cos(angle_x) - z * Math.sin(angle_x);
        const z_new = y * Math.sin(angle_x) + z * Math.cos(angle_x);
        // ->
        const x_extended = x;
        const y_extended = y;
        const z_entended = (z_new / y_new) * y_extended;
        // ->
        rotated_verts.push([x_extended, y_extended, z_entended]);
    });

    // MARK: rotate around y-axis
    const rotated_verts_2 = [];
    rotated_verts.forEach((vert) => {
        const x = vert[0];
        const y = vert[1];
        const z = vert[2];
        // ->
        const x_new = x * Math.cos(angle_y) - z * Math.sin(angle_y);
        const y_new = y;
        const z_new = x * Math.sin(angle_y) + z * Math.cos(angle_y);
        // ->
        const x_extended = x;
        const y_extended = y;
        const z_entended = (z_new / x_new) * x_extended;
        // ->
        rotated_verts_2.push([x_extended, y_extended, z_entended]);
    });

    const unshifted_verts = rotated_verts_2.map((vert) => {
        return [vert[0] + origin[0], vert[1] + origin[1], vert[2] + origin[2]];
    });

    // ->
    return unshifted_verts;
};

//

const make_spade_geometry = (px_values) => {
    if (!px_values) px_values = get_spade_pixels(); // rows of columns of (0 || 1)
    //

    const spade_geometry = new THREE.BufferGeometry();

    const spade_verts = []; // -> [ [x, y, z], ... ]
    const spade_indices = []; // -> [ [v1, v2, v3], ... ]

    const add_triangle = (points) => {
        var existing_point, existing_point_index;
        var indices = [];
        points.forEach((point) => {
            existing_point = spade_verts.find((v) => v[0] == point[0] && v[1] == point[1] && v[2] == point[2]) || false;
            existing_point_index = existing_point != false ? spade_verts.indexOf(existing_point) : -1;
            existing_point_index = existing_point_index >= 0 ? existing_point_index : false;
            // ->
            //
            // // TODO: figure out how to reuse vertices without messing up the vertex normals
            // ->
            // if (existing_point && existing_point_index >= 0) {
            //     indices.push(existing_point_index);
            // } else {
            //     spade_verts.push([point[0], point[1], point[2]]);
            //     indices.push(spade_verts.length - 1);
            // }
            spade_verts.push([point[0], point[1], point[2]]);
            indices.push(spade_verts.length - 1);
        });
        spade_indices.push(indices);
    };

    const add_square = (points) => {
        add_triangle([points[0], points[1], points[2]]);
        add_triangle([points[2], points[3], points[0]]);
    };

    const flatten_array = (array_2d) => {
        const array_1d = [];
        for (var a2d_i = 0; a2d_i < array_2d.length; a2d_i++) array_1d.push(...array_2d[a2d_i]);
        return array_1d;
    };

    // ->

    const front_squares = [];
    for (var px_y = 0; px_y < px_values.length; px_y++) {
        front_squares.push([]);
        for (var px_x = 0; px_x < px_values[px_y].length; px_x++) {
            front_squares[px_y].push(null);
            const px_val = px_values[px_y][px_x];
            if (px_val >= 0.5) {
                const x = px_x * PX_SIZE;
                const y = px_y * PX_SIZE * -1.0; // y-axis is inverted
                const z = SHAPE_THICKNESS_px * 0.5;
                // ->
                // MARK: build square from [0, 0, 0]
                const v0 = [x, y, z];
                const v1 = [x + PX_SIZE, y, z];
                const v2 = [x + PX_SIZE, y + PX_SIZE, z];
                const v3 = [x, y + PX_SIZE, z];
                //
                // ->
                const random_rotation = {
                    x: (Math.random() * 2 - 1) * ROTATE_MAX_ANGLE,
                    y: (Math.random() * 2 - 1) * ROTATE_MAX_ANGLE,
                };
                const rotated_square = rotate_square_verts([v0, v1, v2, v3], random_rotation);
                front_squares[px_y][px_x] = [...rotated_square];
                // ->
                add_square([...rotated_square]); //TODO: BRING THIS BACK
            }
        }
    }

    const spade_verts_flat = flatten_array(spade_verts);
    const spade_indices_flat = flatten_array(spade_indices);

    // ->

    spade_geometry.setIndex([...spade_indices_flat]);
    spade_geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(spade_verts_flat), 3));
    spade_geometry.computeVertexNormals();

    // ->
    return spade_geometry;
};

//
//

const animate = ({ from, to, duration, ease, on_update }) => {
    return new Promise((resolve) => {
        // const anim = { progress: 0.0, value: from };
        // GSAP.to(anim, {
        //     progress: 1.0,
        //     duration: duration,
        //     ease: ease,
        //     onUpdate: () => {
        //         // object[property_name] = anim.progress * to;
        //         // if (on_update && typeof on_update === "function") on_update(anim.progress);
        //         anim.value = map({ from, to, progress: anim.progress });
        //         on_update(anim.value);
        //     },
        //     onComplete: resolve,
        // });
        //
        // Optionally, animate an object like { x: 0, y: 0, z: 0 }
        const anim = { progress: 0.0 };
        GSAP.to(anim, {
            progress: 1.0,
            duration: duration,
            ease: ease,
            onUpdate: () => {
                // const value = {};
                // for (var key in from) {
                //     value[key] = map({ from: from[key], to: to[key], progress: anim.progress });
                // }
                //
                // Check if the value is a number or an object
                let value = {};
                if (typeof from === "number") {
                    value = map({ from: from, to: to, progress: anim.progress });
                } else {
                    for (var key in from) {
                        value[key] = map({ from: from[key], to: to[key], progress: anim.progress });
                    }
                }
                console.log("value", value);
                //
                on_update(value);
            },
            onComplete: resolve,
        });
    });
};

const map = ({ from, to, progress }) => {
    // return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
    return from + (to - from) * progress;
};

//
//
export default Graphics_three;
//
//
