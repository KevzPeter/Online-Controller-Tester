// Run with Node 24: npm run model:dualsense. The original STL is never modified.
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { BufferGeometry, Float32BufferAttribute } from "three";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";

const source = readFileSync(new URL("../public/PS5 DualSense Controller.stl", import.meta.url));
const sha256 = createHash("sha256").update(source).digest("hex");
if (sha256 !== "cd19a3868d256701b419fe15ce140d6fb1cf806e990b47aa2f3a587e09b1df87") {
    throw new Error("The source STL changed. Reinspect its parts before updating the extraction map.");
}
const count = source.readUInt32LE(80);
const triangles = Array.from({ length: count }, (_, face) =>
    Array.from({ length: 9 }, (_, coordinate) => source.readFloatLE(84 + face * 50 + 12 + coordinate * 4)));
const parent = triangles.map((_, i) => i);
const find = (i) => parent[i] === i ? i : (parent[i] = find(parent[i]));
const vertices = new Map();
triangles.forEach((triangle, face) => {
    for (let i = 0; i < 9; i += 3) {
        const key = triangle.slice(i, i + 3).map((v) => v.toFixed(5)).join(",");
        if (vertices.has(key)) parent[find(face)] = find(vertices.get(key));
        else vertices.set(key, face);
    }
});
const connected = new Map();
triangles.forEach((triangle, face) => {
    const root = find(face);
    if (!connected.has(root)) connected.set(root, []);
    connected.get(root).push(triangle);
});
if (connected.size !== 21) throw new Error(`Expected 21 components; found ${connected.size}`);

// Measured centers in the source's coordinates (X right, Y shoulders, Z front).
const landmarks = [
    ["shell", 0, -.023, .577], ["touchpad", 0, .682, 1.040],
    ["l2", -.972, .843, .467], ["r2", .972, .843, .467],
    ["l1", -.972, .857, .827], ["r1", .972, .857, .827],
    ["leftStick", -.511, .013, 1.192], ["rightStick", .511, .013, 1.192],
    ["ps", .018, .037, .972], ["ps", -.068, .004, .958], ["ps", .061, -.008, .953],
    ["mute", 0, -.162, .831],
    ["down", -.990, .297, 1.080], ["left", -1.142, .447, 1.082],
    ["up", -.991, .600, 1.095], ["right", -.838, .448, 1.094],
    ["square", .759, .447, 1.103], ["cross", .991, .215, 1.080],
    ["triangle", .991, .678, 1.101], ["circle", 1.223, .447, 1.071],
];
const bounds = (faces) => {
    const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
    for (const face of faces) face.forEach((v, i) => {
        min[i % 3] = Math.min(min[i % 3], v);
        max[i % 3] = Math.max(max[i % 3], v);
    });
    return { min, max, center: min.map((v, i) => (v + max[i]) / 2) };
};
const parts = new Map();
for (const faces of connected.values()) {
    const { center } = bounds(faces);
    const nearest = landmarks.map(([name, ...point]) => ({
        name, distance: Math.hypot(...center.map((v, i) => v - point[i])),
    })).sort((a, b) => a.distance - b.distance)[0];
    if (nearest.distance > .004) throw new Error(`Unrecognized component at ${center}`);
    parts.set(nearest.name, [...(parts.get(nearest.name) ?? []), ...faces]);
}

// Create/Options caps share topology with the shell. Cut along their recessed
// inner rims, keeping every source triangle exactly once (no overlay duplicates).
const rim = [[.704127,.765962],[.709862,.740336],[.730876,.726939],
    [.755269,.732351],[.769444,.754609],[.782539,.816705],
    [.776866,.842292],[.755783,.855715],[.731407,.850315],[.717223,.828059]]
    .map(([x, y]) => [.743 + (x - .743) * 1.035, .794 + (y - .794) * 1.035]);
function inside(x, y, polygon = rim) {
    let result = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const [xi, yi] = polygon[i], [xj, yj] = polygon[j];
        if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) result = !result;
    }
    return result;
}
parts.set("create", []);
parts.set("options", []);
parts.set("shell", parts.get("shell").filter((face) => {
    const x = (face[0] + face[3] + face[6]) / 3;
    const y = (face[1] + face[4] + face[7]) / 3;
    const z = (face[2] + face[5] + face[8]) / 3;
    if (z > 1.06 && inside(Math.abs(x), y)) {
        parts.get(x < 0 ? "create" : "options").push(face);
        return false;
    }
    return true;
}));
for (const name of ["create", "options"]) {
    if (parts.get(name).length < 40) throw new Error(`Incomplete ${name} cap extraction`);
}

// The eight front buttons also have thin cosmetic covers welded to the shell.
// Transfer those covers to the matching inner control, or its highlight would
// remain hidden behind the stationary shell. Their XY footprints are convex.
function convexHull(points) {
    const sorted = [...new Map(points.map((p) => [p.join(","), p])).values()]
        .sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const cross = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
    const half = (values) => {
        const hull = [];
        for (const p of values) {
            while (hull.length > 1 && cross(hull.at(-2), hull.at(-1), p) <= 0) hull.pop();
            hull.push(p);
        }
        return hull.slice(0, -1);
    };
    return [...half(sorted), ...half([...sorted].reverse())];
}
for (const name of ["up", "down", "left", "right", "cross", "circle", "square", "triangle"]) {
    const faces = parts.get(name);
    const { min, center } = bounds(faces);
    const points = faces.flatMap((face) => [0, 3, 6].map((i) => [face[i], face[i + 1]]));
    const footprint = convexHull(points).map(([x, y]) =>
        [center[0] + (x - center[0]) * 1.025, center[1] + (y - center[1]) * 1.025]);
    const cover = [];
    parts.set("shell", parts.get("shell").filter((face) => {
        const [x, y, z] = [0, 1, 2].map((i) => (face[i] + face[i + 3] + face[i + 6]) / 3);
        if (z > min[2] - .002 && inside(x, y, footprint)) {
            cover.push(face);
            return false;
        }
        return true;
    }));
    if (cover.length < 2) throw new Error(`Missing cosmetic cover for ${name}`);
    parts.set(name, [...faces, ...cover]);
}

const gltf = {
    asset: { version: "2.0", generator: "prepare-dualsense.mjs", extras: { source: "PS5 DualSense Controller.stl", sha256 } },
    scene: 0, scenes: [{ nodes: [] }], nodes: [], meshes: [], accessors: [], bufferViews: [], buffers: [],
    materials: [
        { name: "Shell", pbrMetallicRoughness: { baseColorFactor: [.83,.85,.89,1], metallicFactor: 0, roughnessFactor: .65 } },
        { name: "Controls", pbrMetallicRoughness: { baseColorFactor: [.035,.045,.065,1], metallicFactor: 0, roughnessFactor: .7 } },
        { name: "FaceButtons", pbrMetallicRoughness: { baseColorFactor: [.48,.53,.62,1], metallicFactor: 0, roughnessFactor: .4 } },
    ],
};
const chunks = [];
let offset = 0;
function attribute(array, type, componentType, limits = {}) {
    const bytes = Buffer.from(array.buffer, array.byteOffset, array.byteLength);
    const padded = Buffer.alloc(Math.ceil(bytes.length / 4) * 4);
    bytes.copy(padded);
    gltf.bufferViews.push({ buffer: 0, byteOffset: offset, byteLength: bytes.length });
    offset += padded.length;
    chunks.push(padded);
    gltf.accessors.push({ bufferView: gltf.bufferViews.length - 1, componentType,
        count: array.length / (type === "VEC3" ? 3 : 1), type, ...limits });
    return gltf.accessors.length - 1;
}
for (const [name, faces] of parts) {
    const { center } = bounds(faces);
    const pivot = name.endsWith("Stick") ? [center[0], center[1], 1.096]
        : ["l2", "r2"].includes(name) ? [center[0], .68, .65] : center;
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new Float32BufferAttribute(faces.flat().map((v, i) => v - pivot[i % 3]), 3));
    const indexed = mergeVertices(geometry, .00001);
    indexed.computeVertexNormals();
    indexed.computeBoundingBox();
    const position = attribute(indexed.attributes.position.array, "VEC3", 5126, {
        min: indexed.boundingBox.min.toArray(), max: indexed.boundingBox.max.toArray(),
    });
    const normal = attribute(indexed.attributes.normal.array, "VEC3", 5126);
    const indices = attribute(new Uint32Array(indexed.index.array), "SCALAR", 5125);
    const material = name === "shell" ? 0 : ["cross","circle","square","triangle","touchpad"].includes(name) ? 2 : 1;
    gltf.meshes.push({ name, primitives: [{ attributes: { POSITION: position, NORMAL: normal }, indices, material }] });
    gltf.scenes[0].nodes.push(gltf.nodes.length);
    gltf.nodes.push({ name, mesh: gltf.meshes.length - 1, translation: pivot, extras: { triangles: faces.length } });
    geometry.dispose();
    indexed.dispose();
}
gltf.buffers.push({ byteLength: offset });
const json = Buffer.from(JSON.stringify(gltf));
const paddedJson = Buffer.alloc(Math.ceil(json.length / 4) * 4, 0x20);
json.copy(paddedJson);
const header = Buffer.alloc(20);
header.writeUInt32LE(0x46546c67, 0);
header.writeUInt32LE(2, 4);
header.writeUInt32LE(28 + paddedJson.length + offset, 8);
header.writeUInt32LE(paddedJson.length, 12);
header.writeUInt32LE(0x4e4f534a, 16);
const binaryHeader = Buffer.alloc(8);
binaryHeader.writeUInt32LE(offset, 0);
binaryHeader.writeUInt32LE(0x004e4942, 4);
writeFileSync(new URL("../public/dualsense-animated.glb", import.meta.url),
    Buffer.concat([header, paddedJson, binaryHeader, ...chunks]));
console.log(`Generated ${parts.size} named parts, ${count} triangles, ${Math.round((28 + paddedJson.length + offset) / 1024)} KiB`);
console.log(Object.fromEntries([...parts].map(([name, faces]) => [name, faces.length])));
