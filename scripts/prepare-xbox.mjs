// Reproduce the rig with npm run model:xbox. Source geometry/textures stay intact.
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { Matrix4, Matrix3, Vector3 } from "three";

const sourceUrl = new URL("../public/xbox_elite_controller/", import.meta.url);
const sourceJson = readFileSync(new URL("scene.gltf", sourceUrl));
const sourceBin = readFileSync(new URL("scene.bin", sourceUrl));
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");
if (hash(sourceJson) !== "2c548b31ff24f8b6a645d91e87070732ebc440250a90e2d39498d2962ed907af" ||
    hash(sourceBin) !== "af58fa7082878012216941e246ad2b83e64f845bd3e2d8dd4f4fa4c3ebfe33aa") {
    throw new Error("Xbox source changed. Reinspect components before updating the rig map.");
}
const source = JSON.parse(sourceJson);
const transform = new Matrix4().makeScale(.21, .21, .21)
    .multiply(new Matrix4().makeRotationX(Math.atan2(.4146612, .909976)));
function accessor(index) {
    const a = source.accessors[index], view = source.bufferViews[a.bufferView];
    const size = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 }[a.type];
    const bytes = { 5126: 4, 5125: 4, 5123: 2 }[a.componentType];
    const read = { 5126: "readFloatLE", 5125: "readUInt32LE", 5123: "readUInt16LE" }[a.componentType];
    if (!size || !bytes || a.sparse) throw new Error("Unsupported source accessor");
    return Array.from({ length: a.count }, (_, i) => Array.from({ length: size }, (_, j) =>
        sourceBin[read]((view.byteOffset ?? 0) + (a.byteOffset ?? 0) + i * (view.byteStride ?? size * bytes) + j * bytes)));
}
function bounds(points) {
    const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
    for (const p of points) p.forEach((v, i) => { min[i] = Math.min(min[i], v); max[i] = Math.max(max[i], v); });
    return { min, max, center: min.map((v, i) => (v + max[i]) / 2) };
}
// Landmarks measured after removing the source's presentation tilt and scaling.
// Component numbering is deliberately not used: UV seams can change its order.
const landmarks = {
    0: [["dpad", -.4223, -.3823, .3143]],
    1: [["leftStick", -.8274, .1706, .4454]],
    2: [["x", .6451, .1549, .3311], ["y", .8731, .3812, .3107], ["a", .8775, -.0743, .3116], ["b", 1.1114, .1528, .2514]],
    3: [["view", -.2405, .1566, .3445], ["profile", -.0046, -.0283, .3414], ["menu", .2329, .1566, .3446]],
    4: [["guide", 0, .4757, .2678]],
    5: [["shell", 0, -.6851, .1544]],
    6: [["shell", -.339, -.7209, .1394]],
    7: [["shell", -.6089, -.1201, -.2072], ["shell", -.6072, -.1468, -.2026],
        ["shell", .6063, -.1201, -.2072], ["shell", .6058, -.1465, -.2014]],
    8: [["lt", -.9062, .6036, -.2651], ["lb", -.7833, .6539, .0908],
        ["shell", 0, .6961, .1158], ["sync", -.2377, .762, .1401],
        ["shell", 0, .6954, .047], ["shell", 0, .686, .047],
        ["rb", .7833, .6513, .0909], ["rt", .9062, .601, -.2644]],
    9: [["paddleLeftLower", -.4864, -.6644, -.1216], ["paddleLeftUpper", -.4435, -.3805, -.1489],
        ["paddleRightUpper", .4399, -.3805, -.1489], ["paddleRightLower", .4828, -.6644, -.1216]],
    10: [["x", .6446, .1547, .3204], ["y", .8754, .3815, .3004],
        ["a", .8783, -.0755, .3023], ["b", 1.1158, .1543, .2427]],
    11: [["x", .6421, .1574, .3404]],
    12: [["y", .8794, .3831, .3234]],
    13: [["b", 1.1204, .1608, .2784]],
    14: [["a", .8794, -.0723, .322]],
    // These are stationary stick socket rings, not the moving thumbstick shafts.
    15: [["shell", -.8272, .1697, .3639], ["shell", .4158, -.3462, .3335]],
    16: [["rightStick", .4158, -.3433, .4187]],
    17: [["shell", -1.0513, -.3607, -.0665], ["shell", -1.0487, -.358, -.2676],
        ["shell", 0, -.0624, .2205], ["shell", 0, -.0399, -.1877],
        ["shell", 1.0487, -.358, -.2675], ["shell", 1.0513, -.3607, -.0665]],
};
const parts = new Map();
let sourceTriangles = 0, componentCount = 0;
function visit(index, parent = new Matrix4()) {
    const node = source.nodes[index];
    const world = parent.clone().multiply(node.matrix ? new Matrix4().fromArray(node.matrix) : new Matrix4());
    if (node.mesh !== undefined) {
        const matrix = transform.clone().multiply(world);
        const normalMatrix = new Matrix3().getNormalMatrix(matrix);
        for (const primitive of source.meshes[node.mesh].primitives) {
            const attrs = Object.fromEntries(Object.entries(primitive.attributes).map(([name, i]) => [name, accessor(i)]));
            attrs.POSITION = attrs.POSITION.map((p) => new Vector3(...p).applyMatrix4(matrix).toArray());
            attrs.NORMAL = attrs.NORMAL.map((p) => new Vector3(...p).applyNormalMatrix(normalMatrix).toArray());
            if (attrs.TANGENT) attrs.TANGENT = attrs.TANGENT.map((p) =>
                [...new Vector3(...p).transformDirection(matrix).toArray(), p[3]]);
            const indices = accessor(primitive.indices).flat();
            const faces = Array.from({ length: indices.length / 3 }, (_, i) => indices.slice(i * 3, i * 3 + 3));
            sourceTriangles += faces.length;
            const roots = faces.map((_, i) => i), vertices = new Map();
            const find = (i) => roots[i] === i ? i : (roots[i] = find(roots[i]));
            faces.forEach((face, i) => face.forEach((v) => {
                const key = attrs.POSITION[v].map((p) => p.toFixed(5)).join(",");
                if (vertices.has(key)) roots[find(i)] = find(vertices.get(key));
                else vertices.set(key, i);
            }));
            const components = new Map();
            faces.forEach((face, i) => {
                const root = find(i);
                if (!components.has(root)) components.set(root, []);
                components.get(root).push(face);
            });
            for (const faces of components.values()) {
                componentCount++;
                const { center } = bounds(faces.flatMap((face) => face.map((v) => attrs.POSITION[v])));
                const closest = landmarks[node.mesh].map(([name, ...point]) => ({
                    name, distance: Math.hypot(...center.map((v, i) => v - point[i])),
                })).sort((a, b) => a.distance - b.distance)[0];
                if (closest.distance > .001) throw new Error(`Unrecognized mesh ${node.mesh} at ${center}`);
                if (!parts.has(closest.name)) parts.set(closest.name, []);
                parts.get(closest.name).push({ attrs, faces, material: primitive.material });
            }
        }
    }
    for (const child of node.children ?? []) visit(child, world);
}
for (const node of source.scenes[source.scene ?? 0].nodes) visit(node);
if (componentCount !== 45) throw new Error(`Expected 45 source components, got ${componentCount}`);

const output = {
    asset: { ...source.asset, generator: "prepare-xbox.mjs", extras: { ...source.asset.extras,
        modifications: "Separated controls; normalized pose/scale; added animation pivots and D-pad sectors.",
        sourceGltfSHA256: hash(sourceJson), sourceBinSHA256: hash(sourceBin) } },
    scene: 0, scenes: [{ nodes: [] }], nodes: [], meshes: [], accessors: [], bufferViews: [], buffers: [],
    materials: structuredClone(source.materials), textures: source.textures, samplers: source.samplers,
    images: source.images.map((image) => ({ ...image, uri: `xbox_elite_controller/${image.uri}` })),
    extensionsUsed: source.extensionsUsed,
};
const chunks = [];
let offset = 0, exportedTriangles = 0;
function attribute(data, size, indices = false) {
    const array = indices ? new Uint32Array(data) : new Float32Array(data);
    const bytes = Buffer.from(array.buffer);
    const padded = Buffer.alloc(Math.ceil(bytes.length / 4) * 4);
    bytes.copy(padded);
    output.bufferViews.push({ buffer: 0, byteOffset: offset, byteLength: bytes.length });
    chunks.push(padded);
    offset += padded.length;
    const a = { bufferView: output.bufferViews.length - 1, componentType: indices ? 5125 : 5126,
        count: array.length / size, type: { 1: "SCALAR", 2: "VEC2", 3: "VEC3", 4: "VEC4" }[size] };
    if (!indices && size === 3) {
        const points = Array.from({ length: a.count }, (_, i) => Array.from(array.slice(i * 3, i * 3 + 3)));
        const { min, max } = bounds(points); a.min = min; a.max = max;
    }
    output.accessors.push(a);
    return output.accessors.length - 1;
}
for (const [name, pieces] of parts) {
    const { center } = bounds(pieces.flatMap(({ attrs, faces }) => faces.flatMap((face) => face.map((v) => attrs.POSITION[v]))));
    const pivot = name.endsWith("Stick") ? [center[0], center[1], name === "leftStick" ? .345 : .32]
        : ["lt", "rt"].includes(name) ? [center[0], .41, -.03] : center;
    // Center the assembled controller vertically in the same camera frame as PS5.
    const groupIndex = output.nodes.length;
    output.nodes.push({ name, translation: [pivot[0], pivot[1] + .23, pivot[2]], children: [] });
    output.scenes[0].nodes.push(groupIndex);
    for (const [pieceIndex, piece] of pieces.entries()) {
        const sectors = new Map();
        for (const face of piece.faces) {
            let sector = "surface";
            if (name === "dpad") {
                const [x, y] = [0, 1].map((i) => face.reduce((sum, v) => sum + piece.attrs.POSITION[v][i], 0) / 3 - pivot[i]);
                sector = Math.abs(x) > Math.abs(y) ? (x > 0 ? "right" : "left") : (y > 0 ? "up" : "down");
            }
            if (!sectors.has(sector)) sectors.set(sector, []);
            sectors.get(sector).push(face);
        }
        for (const [sector, faces] of sectors) {
            const used = [...new Set(faces.flat())], remap = new Map(used.map((v, i) => [v, i]));
            const attributes = {};
            for (const [semantic, values] of Object.entries(piece.attrs)) {
                const data = used.flatMap((v) => values[v].map((p, i) => semantic === "POSITION" ? p - pivot[i] : p));
                attributes[semantic] = attribute(data, values[0].length);
            }
            const indices = attribute(faces.flat().map((v) => remap.get(v)), 1, true);
            const meshName = name === "dpad" ? `dpad_${sector}` : `${name}_${pieceIndex}`;
            output.meshes.push({ name: meshName, primitives: [{ attributes, indices, material: piece.material }] });
            output.nodes[groupIndex].children.push(output.nodes.length);
            output.nodes.push({ name: meshName, mesh: output.meshes.length - 1 });
            exportedTriangles += faces.length;
        }
    }
}
if (sourceTriangles !== exportedTriangles) throw new Error("Rigging lost or duplicated triangles");
output.buffers.push({ byteLength: offset, uri: "xbox-elite-animated.bin" });
writeFileSync(new URL("../public/xbox-elite-animated.bin", import.meta.url), Buffer.concat(chunks));
writeFileSync(new URL("../public/xbox-elite-animated.gltf", import.meta.url), JSON.stringify(output));
console.log(`Xbox rig: ${componentCount} source components, ${parts.size} groups, ${exportedTriangles} triangles, ${(offset / 1024 / 1024).toFixed(2)} MiB geometry. Original textures referenced unchanged.`);
