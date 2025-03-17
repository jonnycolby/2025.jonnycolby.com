"use client";
//
import React from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import Stats from "stats.js";
//
import get_spade_pixels from "@/methods/get_pixels/spade";
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
            // ...
        };

        Z.vars = {
            _mounted: false,
            cursor_pos: { x: 0, y: 0 },
            light_distance: 200,
            light_pos: { x: 0, y: 0, z: 0 },
            orientation_offset: null,
            shape_size_max: null,
            quaternion: {
                device: new THREE.Quaternion(),
                device_inverse: new THREE.Quaternion(),
                initial: null, // new THREE.Quaternion(),
            },
            light_mode: "auto", // "auto" || "cursor" || "device"
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
                cube_01: null,
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
        //
        Z.init();
    }
    componentWillUnmount() {
        const Z = this;
        window.removeEventListener("pointermove", Z.on_pointer_move);
        window.removeEventListener("resize", Z.on_resize);
        window.removeEventListener("deviceorientation", Z.on_device_orientation, true);
    }

    //

    init = async () => {
        const Z = this;
        const MEM = Z.mem;

        PX_SIZE = 2; // default
        if (window.innerWidth < 512) PX_SIZE = 2;
        else if (window.innerWidth < 1440) PX_SIZE = 3;
        else PX_SIZE = 4;

        //

        const spade_px_values = await get_spade_pixels();
        // ->
        const spade_geometry = make_spade_geometry(spade_px_values);
        // const spade_bbox = new THREE.Box3().setFromObject(spade_geometry); // NOTE: must set from an Object3D, like a mesh
        // const spade_size = spade_bbox.getSize(new THREE.Vector3());
        // console.log("spade_size", spade_size);

        //
        //

        Z.vars.dom_bbox = Z.dom.Renderer.getBoundingClientRect();
        const dom_bbox = Z.vars.dom_bbox;

        Z.vars.light_distance = Math.max(dom_bbox.width, dom_bbox.height) * LIGHT_DISTANCE_RATIO;

        MEM.scene = new THREE.Scene();
        // MEM.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
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

        // MEM.objects.cube_01 = {};
        // const cube_01 = MEM.objects.cube_01;
        // cube_01.geometry = new THREE.BoxGeometry(100, 100, 100);
        // // cube_01.material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        // cube_01.material = new THREE.MeshPhongMaterial({ color: 0xffffff });
        // cube_01.mesh = new THREE.Mesh(cube_01.geometry, cube_01.material);
        // MEM.scene.add(cube_01.mesh);

        //

        MEM.objects.scene_group = new THREE.Group();
        MEM.scene.add(MEM.objects.scene_group);

        // MEM.objects.background_plane = {};
        // const bg_plane = MEM.objects.background_plane;
        // bg_plane.geometry = new THREE.PlaneGeometry(dom_bbox.width, dom_bbox.height);
        // // Matte, near-black material:
        // bg_plane.material = new THREE.MeshPhongMaterial({
        //     color: 0xff0000, // 0x080809, // Near-black matte color
        //     emissive: 0x141415, // Near-black matte color
        //     roughness: 0.9, // High roughness for matte effect
        //     metalness: 0.0, // Non-metallic
        // });
        // bg_plane.mesh = new THREE.Mesh(bg_plane.geometry, bg_plane.material);
        // bg_plane.mesh.position.set(0, 0, -100);
        // MEM.scene.add(bg_plane.mesh);

        // // TESTING
        // const demo_sphere = {};
        // demo_sphere.geometry = new THREE.SphereGeometry(32);
        // demo_sphere.material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
        // demo_sphere.mesh = new THREE.Mesh(demo_sphere.geometry, demo_sphere.material);
        // demo_sphere.mesh.position.set(0, 0, 100);
        // // MEM.scene.add(demo_sphere.mesh);
        // MEM.objects.scene_group.add(demo_sphere.mesh);

        //
        // TESTING
        const demo_point = {};
        demo_point.group = new THREE.Group();
        // demo_point.mesh = demo_point.group;
        demo_point.material = new THREE.MeshBasicMaterial({ color: 0xffffff });
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
        // MEM.scene.add(demo_point.group);
        MEM.objects.scene_group.add(demo_point.group);
        //

        //

        const window_center_offset = {
            x: dom_bbox.width * -0.5 + Math.floor(dom_bbox.width * 0.5), //
            y: dom_bbox.height * 0.5 - Math.floor(dom_bbox.height * 0.5),
        };
        console.log("window_center_offset:", window_center_offset);

        // const spade_material = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        // Glossy material:
        const spade_material = new THREE.MeshPhongMaterial({
            color: 0x000000, // Black glossy color
            // color: 0x080809, // Gloss
            // color: 0x880000, // TESTING
            emissive: 0x080809,
            // specular: 0xbbbbbb, // White specular highlights
            specular: 0xffffff,
            roughness: 0.5, // 0.05 // Low roughness for gloss
            metalness: 0.5, // 1.0, // High metalness for reflectivity
        });
        // // Clear, glossy material:
        // const spade_material = new THREE.MeshPhysicalMaterial({
        //     color: 0xffffff,
        //     transmission: 1.0,
        //     opacity: 1.0,
        //     metalness: 0.5,
        //     roughness: 0.5,
        //     ior: 1.5,
        //     thickness: 0.01,
        //     specularIntensity: 1.0,
        //     specularColor: 0xffffff,
        //     transparent: true,
        //     // clearcoat: 1.0,
        //     // cloarcoatRoughness: 0.0,
        // });
        const shape_mesh = new THREE.Mesh(spade_geometry, spade_material);

        const shape_width = spade_px_values[0].length * PX_SIZE;
        const shape_height = spade_px_values.length * PX_SIZE;
        const shape_size_max = Math.max(shape_width, shape_height);
        Z.vars.shape_size_max = shape_size_max;

        const window_size = { width: dom_bbox.width, height: dom_bbox.height };
        const window_size_half = { width: Math.floor(window_size.width * 0.5), height: Math.floor(window_size.height * 0.5) };

        console.log("window_size:", window_size);

        const offset_px = [
            Math.floor(shape_width * -0.5),
            Math.floor(shape_height * 0.5), // positive because .scene is naturally inverted
            // Math.floor(shape_size_max),
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
        // shape_mesh.rotation.x = Math.PI * -0.25;
        // MEM.scene.add(shape_mesh);
        MEM.objects.scene_group.add(shape_mesh);

        //
        //

        MEM.lights.TEST_ambient = new THREE.AmbientLight(0xffffff, 0.5);
        MEM.scene.add(MEM.lights.TEST_ambient);

        // MEM.lights.TEST_point = new THREE.PointLight(
        //     0xffffff, // color
        //     0.5, // intensity
        //     0, // distance
        //     0.01, // decay -> should be 2 with a normal PerspectiveCamera for physically-accurate results // TODO: refine this value
        // );
        // MEM.lights.TEST_point.position.set(0, 0, 500);
        // MEM.scene.add(MEM.lights.TEST_point);

        MEM.lights.ambient = new THREE.AmbientLight(0x080809, 1.0); // soft white light
        // MEM.lights.ambient = new THREE.AmbientLight(0xffffff, 0.5); // soft white light
        MEM.scene.add(MEM.lights.ambient);

        // MEM.lights.directional_light_01 = new THREE.DirectionalLight(0xffffff, 1);
        // MEM.lights.directional_light_01.position.set(0, 1, 1);
        // MEM.scene.add(MEM.lights.directional_light_01);

        // create a point light:
        MEM.lights.cursor = new THREE.PointLight(
            0xf3f2f3, // color
            1.0, // intensity
            0, // distance
            0.01, // decay -> should be 2 with a normal PerspectiveCamera for physically-accurate results // TODO: refine this value
        );
        // MEM.lights.castShadow = true;
        Z.vars.light_pos = { x: 0, y: 0, z: Z.vars.light_distance };
        MEM.lights.cursor.position.set(Z.vars.light_pos.x, Z.vars.light_pos.y * -1.0, Z.vars.light_pos.z);
        // MEM.lights.cursor.position.set(0, 0, Z.vars.shape_size_max * 1.0);
        MEM.scene.add(MEM.lights.cursor);

        // MEM.lights.cursor = new THREE.DirectionalLight(
        //     0xffffff, // color
        //     0.5, // intensity
        //     // 0, // distance
        //     // 0.01, // decay -> should be 2 with a normal PerspectiveCamera for physically-accurate results // TODO: refine this value
        // );
        // MEM.lights.cursor.position.set(0, 0, Z.vars.light_distance);
        // MEM.scene.add(MEM.lights.cursor);

        //
        //
        if (IS_DEV) {
            Z.mem.stats = new Stats();
            Z.mem.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
            document.body.appendChild(Z.mem.stats.dom);
        }
        //
        //
        MEM.renderer.setAnimationLoop(Z.animate);
        //
        return true;
    };

    animate = () => {
        const Z = this;
        const MEM = Z.mem;
        if (Z.mem.stats) Z.mem.stats.begin();
        //
        if (ENABLE_ORBIT_CONTROLS) MEM.orbit_controls.update();
        //
        // MEM.lights.cursor.position.set(
        //     Z.vars.cursor_pos.x, //
        //     Z.vars.cursor_pos.y * -1.0,
        //     Z.vars.light_distance,
        // );
        //
        if (Z.vars.light_mode === "auto") {
            var light_angle = (performance.now() * 0.001 * Math.PI * 2.0) / 3.14; // 3.14 seconds for a full rotation
            MEM.lights.cursor.position.set(
                Math.sin(light_angle) * Z.vars.light_distance, // TODO: switch light_distance to 2x spade size
                Math.cos(light_angle) * Z.vars.light_distance, // TODO: switch light_distance to 2x spade size
                Z.vars.light_distance,
            );
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
        }
        //
        // MEM.objects.cube_01.mesh.rotation.x += 0.01;
        // MEM.objects.cube_01.mesh.rotation.y += 0.01;
        //
        Z.mem.renderer.render(MEM.scene, MEM.camera);
        if (Z.mem.stats) Z.mem.stats.end();
    };

    //

    on_resize = () => {
        const Z = this;
        Z.vars.dom_bbox = Z.dom.Renderer.getBoundingClientRect();
        const dom_bbox = Z.vars.dom_bbox;
        // Z.vars.light_distance = Math.max(dom_bbox.width, dom_bbox.height) * LIGHT_DISTANCE_RATIO;
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
        // window.addEventListener("deviceorientation", Z.on_device_orientation, true);
        if (typeof DeviceOrientationEvent.requestPermission === "function") {
            // iOS 13+ and other browsers that require permission
            DeviceOrientationEvent.requestPermission()
                .then((permissionState) => {
                    if (permissionState === "granted") {
                        window.addEventListener("deviceorientation", Z.on_device_orientation);
                        // +
                        Z.vars.light_mode = "device";
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
        // // NOTE: this works, but the plane is always parallel to the floor
        // Z.mem.scene.rotation.x = deg_to_rad(e.beta * -1.0);
        // Z.mem.scene.rotation.y = deg_to_rad(e.gamma * -1.0);
        // Z.mem.scene.rotation.z = deg_to_rad(e.alpha * -1.0);
        //
        //

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

        // ...

        // var beta = e.beta;
        // var gamma = e.gamma;
        // var alpha = e.alpha;
        // if (screen.orientation === 180) {
        //     // Device upside down
        //     beta = -beta;
        //     gamma = -gamma;
        // }
        // //
        // if (Z.vars.orientation_offset_x === undefined) {
        //     Z.vars.orientation_offset_x = e.beta;
        // }
        // //
        // // MEM.objects.scene_group.rotation.x = deg_to_rad(e.beta * -0.5 + Z.vars.orientation_offset_x);
        // MEM.objects.scene_group.rotation.x = deg_to_rad(e.beta * -1.0);
        // MEM.objects.scene_group.rotation.y = deg_to_rad(e.gamma * -1.0);
        // MEM.objects.scene_group.rotation.z = deg_to_rad(e.alpha * -1.0);
    };

    //
    //

    render() {
        const Z = this;

        return <div className={`${styles.Graphics_three}`} ref={(el) => (Z.dom.Renderer = el)}></div>;
    }
}

//
//

const deg_to_rad = (deg) => {
    return (deg * Math.PI) / 180;
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
    // var shifted_verts = [
    //     [v1[0] - PX_SIZE * 0.5 - x, v1[1] - PX_SIZE * 0.5, v1[2]],
    //     [v2[0] - PX_SIZE * 0.5 - x, v2[1] - PX_SIZE * 0.5, v2[2]],
    //     [v3[0] - PX_SIZE * 0.5 - x, v3[1] - PX_SIZE * 0.5, v3[2]],
    //     [v4[0] - PX_SIZE * 0.5 - x, v4[1] - PX_SIZE * 0.5, v4[2]],
    // ];

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
        // rotated_verts.push([x_new, y_new, z_new]);
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
        // rotated_verts_2.push([x_new, y_new, z_new]);
        rotated_verts_2.push([x_extended, y_extended, z_entended]);
    });

    // // // MARK: extend each vert so that x and y remain the same as they were, z is adjusted to make the square a parallelogram
    // const extended_verts = [];
    // rotated_verts_2.forEach((vert, vert_index) => {
    //     const x = vert[0];
    //     const y = vert[1];
    //     const z = vert[2];
    //     // ->
    //     const x_new = shifted_verts[vert_index][0];
    //     const y_new = shifted_verts[vert_index][1];
    //     //
    //     y_axis_slope =
    //     const z_new =
    //     // ->
    //     extended_verts.push([x_new, y_new, z_new]);
    // });

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
    const spade_indices = []; // -> [ [v1, v2, v3], ... ]0=

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
                // // TESTING:
                // // if LEFT edge, max the square half of the PX_SIZE
                // if (px_y > 0 && px_values[px_y][px_x - 1] < 0.5) {
                //     v0[0] += PX_SIZE * 0.25;
                //     v0[1] += PX_SIZE * 0.25;
                //     v1[0] -= PX_SIZE * 0.25;
                //     v1[1] += PX_SIZE * 0.25;
                //     v2[0] -= PX_SIZE * 0.25;
                //     v2[1] -= PX_SIZE * 0.25;
                //     v3[0] += PX_SIZE * 0.25;
                //     v3[1] -= PX_SIZE * 0.25;
                // }
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

    //
    //  MARK: 3D
    //
    //     // ->
    //     // MARK: 3D volume: back faces
    //
    //     const back_squares = [];
    //     for (var px_y = 0; px_y < px_values.length; px_y++) {
    //         back_squares.push([]);
    //         for (var px_x = 0; px_x < px_values[px_y].length; px_x++) {
    //             back_squares[px_y].push(null);
    //             const px_val = px_values[px_y][px_x];
    //             if (px_val >= 0.5) {
    //                 const x = px_x * PX_SIZE;
    //                 const y = px_y * PX_SIZE * -1.0; // y-axis is inverted
    //                 const z = SHAPE_THICKNESS_px * -0.5;
    //                 // ->
    //                 // MARK: build square from [0, 0, 0]
    //                 const v0 = [x, y, z];
    //                 const v1 = [x + PX_SIZE, y, z];
    //                 const v2 = [x + PX_SIZE, y + PX_SIZE, z];
    //                 const v3 = [x, y + PX_SIZE, z];
    //                 // ->
    //                 const random_rotation = {
    //                     x: (Math.random() * 2 - 1) * ROTATE_MAX_ANGLE,
    //                     y: (Math.random() * 2 - 1) * ROTATE_MAX_ANGLE,
    //                 };
    //                 const rotated_square = rotate_square_verts([v0, v1, v2, v3], random_rotation);
    //                 const rotated_square_flipped = [rotated_square[3], rotated_square[2], rotated_square[1], rotated_square[0]];
    //                 back_squares[px_y][px_x] = [...rotated_square_flipped];
    //                 // ->
    //                 // add_square([v0, v1, v2, v3]);
    //                 add_square([...rotated_square_flipped]);
    //             }
    //         }
    //     }
    //
    //     // ->
    //     // MARK: 3D volume: edges
    //
    //     for (var px_y = 0; px_y < px_values.length; px_y++) {
    //         for (var px_x = 0; px_x < px_values[px_y].length; px_x++) {
    //             const px_val = px_values[px_y][px_x];
    //             if (px_val >= 0.5) {
    //                 const square_edges = [];
    //                 if (px_y > 0 && px_values[px_y + 1][px_x] < 0.5) square_edges.push("bottom");
    //                 if (px_y > 0 && px_values[px_y - 1][px_x] < 0.5) square_edges.push("top");
    //                 if (px_y > 0 && px_values[px_y][px_x - 1] < 0.5) square_edges.push("left");
    //                 if (px_y > 0 && px_values[px_y][px_x + 1] < 0.5) square_edges.push("right");
    //                 //
    //                 // MARK: BOTTOM edge
    //                 if (square_edges.includes("bottom")) {
    //                     const front_square = front_squares[px_y][px_x];
    //                     const back_square = back_squares[px_y][px_x];
    //                     //
    //                     // // NOTE: this works to manually place the edge rectangle, but we need to get these vertices from the existing shapes' vertices in order to connect the tilted verts
    //                     // const x = px_x * PX_SIZE;
    //                     // const y = px_y * PX_SIZE * -1.0; // y-axis is inverted
    //                     // const z = SHAPE_THICKNESS_px * 0.5;
    //                     // // ->
    //                     // const v0 = [x, y, z - SHAPE_THICKNESS_px];
    //                     // const v1 = [x + PX_SIZE, y, z - SHAPE_THICKNESS_px];
    //                     // const v2 = [x + PX_SIZE, y, z];
    //                     // const v3 = [x, y, z];
    //                     //
    //                     const v0 = back_square[3];
    //                     const v1 = back_square[2];
    //                     const v2 = front_square[1];
    //                     const v3 = front_square[0];
    //                     //
    //                     add_square([v0, v1, v2, v3]);
    //                 }
    //                 //
    //                 // MARK: TOP edge
    //                 if (square_edges.includes("top")) {
    //                     const front_square = front_squares[px_y][px_x];
    //                     const back_square = back_squares[px_y][px_x];
    //                     const v0 = back_square[1];
    //                     const v1 = back_square[0];
    //                     const v2 = front_square[3];
    //                     const v3 = front_square[2];
    //                     add_square([v0, v1, v2, v3]);
    //                 }
    //                 //
    //                 // MARK: LEFT edge
    //                 if (square_edges.includes("left")) {
    //                     const front_square = front_squares[px_y][px_x];
    //                     const back_square = back_squares[px_y][px_x];
    //                     const v0 = front_square[3];
    //                     const v1 = back_square[0];
    //                     const v2 = back_square[3];
    //                     const v3 = front_square[0];
    //                     add_square([v0, v1, v2, v3]);
    //                 }
    //                 //
    //                 // MARK: RIGHT edge
    //                 if (square_edges.includes("right")) {
    //                     const front_square = front_squares[px_y][px_x];
    //                     const back_square = back_squares[px_y][px_x];
    //                     const v0 = front_square[1];
    //                     const v1 = back_square[2];
    //                     const v2 = back_square[1];
    //                     const v3 = front_square[2];
    //                     add_square([v0, v1, v2, v3]);
    //                 }
    //             }
    //         }
    //     }

    // ->

    // console.log("spade_verts:", spade_verts);

    const spade_verts_flat = flatten_array(spade_verts);
    const spade_indices_flat = flatten_array(spade_indices);

    //     const spade_verts_flat = [];
    //     for (var sv_i = 0; sv_i < spade_verts.length; sv_i++) {
    //         spade_verts_flat.push(spade_verts[sv_i][0]);
    //         spade_verts_flat.push(spade_verts[sv_i][1]);
    //         spade_verts_flat.push(spade_verts[sv_i][2]);
    //     }
    //
    //     const spade_indices_flat = [];
    //     for (var si_i = 0; si_i < spade_indices.length; si_i++) {
    //         spade_indices_flat.push(spade_indices[si_i][0]);
    //         spade_indices_flat.push(spade_indices[si_i][1]);
    //         spade_indices_flat.push(spade_indices[si_i][2]);
    //     }

    // ->

    spade_geometry.setIndex([...spade_indices_flat]);
    spade_geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(spade_verts_flat), 3));
    spade_geometry.computeVertexNormals();

    // ->
    return spade_geometry;
};

//
//
export default Graphics_three;
//
//
