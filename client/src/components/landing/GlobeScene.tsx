/**
 * ============================================================
 * © 2025 Botfizz
 * Designed and Developed by: Hanzala Zaheer & Waleed Shams
 * ============================================================
 *
 * Page-long 3D backdrop written in raw WebGL, with no 3D library:
 * a sphere of particles carrying animated message arcs. It moves
 * through keyframes as the page scrolls.
 */

import { useEffect, useRef } from "react";

const VERTEX_DOTS = `
attribute vec3 aPos;
attribute vec4 aMeta; // size, brightness, depthFade, seed
uniform mat3 uRot;
uniform vec4 uView;   // offsetX, offsetY, scale, aspect
uniform float uTime, uDpr, uGlow;
varying float vAlpha;
varying float vWarm;

void main() {
  vec3 p = uRot * aPos * uView.z;
  float w = 3.6 - p.z;
  gl_Position = vec4((p.x * 2.9 / w + uView.x) / uView.w, p.y * 2.9 / w + uView.y, 0.0, 1.0);
  gl_PointSize = aMeta.x * uDpr * 3.4 / w;
  float facing = (uRot * normalize(aPos)).z;
  float depth = mix(1.0, mix(0.1, 1.0, smoothstep(-0.55, 0.45, facing)), aMeta.z);
  float twinkle = 0.78 + 0.22 * sin(uTime * 1.7 + aMeta.w * 40.0);
  float rim = 1.0 + aMeta.z * pow(1.0 - abs(facing), 4.0) * 0.35;
  vAlpha = aMeta.y * depth * twinkle * rim * uGlow;
  vWarm = step(0.985, fract(aMeta.w * 17.0));
}`;

const FRAGMENT_DOTS = `
precision mediump float;
varying float vAlpha;
varying float vWarm;

void main() {
  float d = length(gl_PointCoord - 0.5);
  float disc = smoothstep(0.5, 0.18, d);
  vec3 color = mix(vec3(0.15, 0.85, 0.47), vec3(1.0, 0.77, 0.42), vWarm);
  gl_FragColor = vec4(color, disc * vAlpha);
}`;

const VERTEX_ARCS = `
attribute vec3 aFrom;
attribute vec3 aTo;
attribute vec2 aArc; // position along arc, seed
uniform mat3 uRot;
uniform vec4 uView;
uniform float uTime, uDpr, uGlow;
varying float vAlpha;
varying float vHead;

void main() {
  float t = aArc.x;
  vec3 pos = normalize(mix(aFrom, aTo, t)) * (1.0 + sin(t * 3.14159) * 0.2);
  vec3 p = uRot * pos * uView.z;
  float w = 3.6 - p.z;
  gl_Position = vec4((p.x * 2.9 / w + uView.x) / uView.w, p.y * 2.9 / w + uView.y, 0.0, 1.0);

  float head = fract(uTime * (0.1 + aArc.y * 0.1) + aArc.y * 7.0) * 1.5 - 0.25;
  float behind = head - t;
  float trail = behind > 0.0 ? pow(max(0.0, 1.0 - behind / 0.3), 2.5) : 0.0;
  float tip = smoothstep(0.03, 0.0, abs(behind));
  float facing = smoothstep(-0.5, 0.2, normalize(uRot * pos).z);

  vHead = tip;
  vAlpha = (0.07 + trail * 0.9 + tip) * mix(0.15, 1.0, facing) * uGlow;
  gl_PointSize = (1.6 + tip * 6.0) * uDpr * 3.4 / w;
}`;

const FRAGMENT_ARCS = `
precision mediump float;
varying float vAlpha;
varying float vHead;

void main() {
  float d = length(gl_PointCoord - 0.5);
  float disc = smoothstep(0.5, 0.1, d);
  vec3 color = mix(vec3(0.45, 1.0, 0.7), vec3(1.0, 0.82, 0.5), vHead);
  gl_FragColor = vec4(color, disc * vAlpha);
}`;

const PARTICLES = 34000;
const ORBIT_PARTICLES = 900;
const DUST_PARTICLES = 700;
const ARC_COUNT = 26;
const ARC_STEPS = 70;

/** Seeded generator, so the scene looks the same on every visit. */
function createRandom(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Layered sines give the sphere soft landmass-like clusters. */
function landmass(x: number, y: number, z: number) {
  return (
    Math.sin(3.2 * x + 1.3) * Math.cos(2.9 * y - 0.4) +
    Math.sin(3.8 * z + 2.1 + y) * 0.75 +
    Math.sin(4.4 * (x - z) + 0.5) * 0.35 +
    Math.sin(7.3 * (y + x)) * 0.12
  );
}

function buildDots() {
  const random = createRandom(47);
  const data: number[] = [];
  const hubs: number[][] = [];
  const golden = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < PARTICLES; i++) {
    const y = 1 - (i / (PARTICLES - 1)) * 2;
    const radius = Math.sqrt(1 - y * y);
    const x = Math.cos(golden * i) * radius;
    const z = Math.sin(golden * i) * radius;
    const land = landmass(x, y, z);
    const isLand = land > 0;
    if (!isLand && random() > 0.3) continue;
    data.push(x, y, z, isLand ? 3.4 : 1.7, isLand ? 0.95 : 0.13, 1, random());
    if (land > 0.5 && random() < 0.02) hubs.push([x, y, z]);
  }

  for (const [radius, tiltX, tiltZ] of [
    [1.48, 1.2, 0.3],
    [1.72, 1.45, -0.5],
  ]) {
    for (let i = 0; i < ORBIT_PARTICLES / 2; i++) {
      const angle = random() * Math.PI * 2;
      const px = Math.cos(angle) * radius;
      const pz = Math.sin(angle) * radius;
      const y1 = -pz * Math.sin(tiltX);
      const z1 = pz * Math.cos(tiltX);
      data.push(
        px * Math.cos(tiltZ) - y1 * Math.sin(tiltZ),
        px * Math.sin(tiltZ) + y1 * Math.cos(tiltZ),
        z1,
        1.5,
        0.34,
        0.7,
        random(),
      );
    }
  }

  for (let i = 0; i < DUST_PARTICLES; i++) {
    const theta = random() * Math.PI * 2;
    const phi = Math.acos(2 * random() - 1);
    const r = 2 + random() * 2.2;
    data.push(
      r * Math.sin(phi) * Math.cos(theta),
      r * Math.cos(phi),
      r * Math.sin(phi) * Math.sin(theta) * 0.4,
      1.4,
      0.3,
      0,
      random(),
    );
  }

  return { dots: new Float32Array(data), hubs, random };
}

function buildArcs(hubs: number[][], random: () => number) {
  const data: number[] = [];
  for (let arc = 0; arc < ARC_COUNT; arc++) {
    const from = hubs[Math.floor(random() * hubs.length)];
    let to = hubs[Math.floor(random() * hubs.length)];
    while (Math.hypot(from[0] - to[0], from[1] - to[1], from[2] - to[2]) < 0.8) {
      to = hubs[Math.floor(random() * hubs.length)];
    }
    const seed = random();
    for (let step = 0; step < ARC_STEPS; step++) {
      data.push(...from, ...to, step / (ARC_STEPS - 1), seed);
    }
  }
  return new Float32Array(data);
}

function compile(gl: WebGLRenderingContext, vertex: string, fragment: string) {
  const program = gl.createProgram()!;
  for (const [type, source] of [
    [gl.VERTEX_SHADER, vertex],
    [gl.FRAGMENT_SHADER, fragment],
  ] as const) {
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    gl.attachShader(program, shader);
  }
  gl.linkProgram(program);
  return program;
}

function bindAttributes(
  gl: WebGLRenderingContext,
  program: WebGLProgram,
  buffer: WebGLBuffer,
  layout: Array<[name: string, size: number]>,
) {
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  const stride = layout.reduce((sum, [, size]) => sum + size, 0) * 4;
  let offset = 0;
  for (const [name, size] of layout) {
    const location = gl.getAttribLocation(program, name);
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, size, gl.FLOAT, false, stride, offset);
    offset += size * 4;
  }
}

function rotation(yaw: number, pitch: number) {
  const [cy, sy, cx, sx] = [Math.cos(yaw), Math.sin(yaw), Math.cos(pitch), Math.sin(pitch)];
  return new Float32Array([cy, sx * sy, -cx * sy, 0, cx, sx, sy, -sx * cy, cx * cy]);
}

// Where the globe sits as the page scrolls: progress, x, y, scale, glow.
const DESKTOP_PATH = [
  [0, 0.58, 0, 0.74, 1],
  [0.1, 0.62, 0, 0.74, 0.16],
  [0.8, 0, 0, 0.84, 0.16],
  [1, 0, -1.28, 1.6, 1],
];
const MOBILE_PATH = [
  [0, 0, 0.4, 0.42, 1],
  [0.1, 0, 0, 0.5, 0.2],
  [0.85, 0, 0, 0.5, 0.15],
  [1, 0, -0.85, 0.62, 0.9],
];

function sample(path: number[][], progress: number) {
  for (let i = 1; i < path.length; i++) {
    if (progress <= path[i][0]) {
      const [a, b] = [path[i - 1], path[i]];
      const raw = (progress - a[0]) / (b[0] - a[0]);
      const t = raw * raw * (3 - 2 * raw);
      return a.map((value, index) => value + (b[index] - value) * t);
    }
  }
  return path[path.length - 1];
}

export default function GlobeScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const gl = canvas.getContext("webgl", { antialias: false, alpha: true });
    if (!gl) return;

    const { dots, hubs, random } = buildDots();
    const arcs = buildArcs(hubs, random);
    const dotProgram = compile(gl, VERTEX_DOTS, FRAGMENT_DOTS);
    const arcProgram = compile(gl, VERTEX_ARCS, FRAGMENT_ARCS);

    const upload = (data: Float32Array) => {
      const buffer = gl.createBuffer()!;
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      return buffer;
    };
    const dotBuffer = upload(dots);
    const arcBuffer = upload(arcs);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.clearColor(0, 0, 0, 0);

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let aspect = 1;
    let mobile = false;

    const resize = () => {
      canvas.width = Math.round(window.innerWidth * dpr);
      canvas.height = Math.round(window.innerHeight * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      aspect = window.innerWidth / window.innerHeight;
      mobile = window.innerWidth < 820;
    };
    resize();

    const pointer = { x: 0, y: 0 };
    const onPointerMove = (event: PointerEvent) => {
      pointer.x = event.clientX / window.innerWidth - 0.5;
      pointer.y = event.clientY / window.innerHeight - 0.5;
    };

    const current = { x: 0, y: 0, scale: 1, glow: 1, yaw: 0, pitch: 0.28 };
    let initialised = false;

    const draw = (time: number) => {
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollable > 0 ? Math.min(window.scrollY / scrollable, 1) : 0;
      const [, x, y, scale, glow] = sample(mobile ? MOBILE_PATH : DESKTOP_PATH, progress);

      const ease = initialised ? 0.07 : 1;
      initialised = true;
      current.x += (x - current.x) * ease;
      current.y += (y - current.y) * ease;
      current.scale += (scale - current.scale) * ease;
      current.glow += (glow - current.glow) * ease;
      const targetYaw = time * 0.00009 + progress * 5 + pointer.x * 0.6;
      current.yaw += (targetYaw - current.yaw) * (ease === 1 ? 1 : 0.05);
      current.pitch += (0.28 + pointer.y * 0.35 - current.pitch) * 0.05;

      const rot = rotation(current.yaw, current.pitch);
      const view = [current.x * aspect, current.y, current.scale, aspect];
      const seconds = time / 1000;

      gl.clear(gl.COLOR_BUFFER_BIT);

      const setUniforms = (program: WebGLProgram) => {
        gl.useProgram(program);
        gl.uniformMatrix3fv(gl.getUniformLocation(program, "uRot"), false, rot);
        gl.uniform4fv(gl.getUniformLocation(program, "uView"), view);
        gl.uniform1f(gl.getUniformLocation(program, "uTime"), seconds);
        gl.uniform1f(gl.getUniformLocation(program, "uDpr"), dpr);
        gl.uniform1f(gl.getUniformLocation(program, "uGlow"), current.glow);
      };

      setUniforms(dotProgram);
      bindAttributes(gl, dotProgram, dotBuffer, [["aPos", 3], ["aMeta", 4]]);
      gl.drawArrays(gl.POINTS, 0, dots.length / 7);

      setUniforms(arcProgram);
      bindAttributes(gl, arcProgram, arcBuffer, [["aFrom", 3], ["aTo", 3], ["aArc", 2]]);
      gl.drawArrays(gl.POINTS, 0, arcs.length / 8);
    };

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let frame = 0;

    const loop = (time: number) => {
      draw(time);
      frame = requestAnimationFrame(loop);
    };

    const onVisibility = () => {
      cancelAnimationFrame(frame);
      if (!document.hidden && !reducedMotion) frame = requestAnimationFrame(loop);
    };
    const redrawStill = () => draw(0);

    window.addEventListener("resize", resize);
    if (reducedMotion) {
      redrawStill();
      window.addEventListener("resize", redrawStill);
      window.addEventListener("scroll", redrawStill, { passive: true });
    } else {
      window.addEventListener("pointermove", onPointerMove, { passive: true });
      document.addEventListener("visibilitychange", onVisibility);
      frame = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("resize", redrawStill);
      window.removeEventListener("scroll", redrawStill);
      window.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("visibilitychange", onVisibility);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return <canvas ref={canvasRef} className="bf-globe" aria-hidden="true" />;
}
