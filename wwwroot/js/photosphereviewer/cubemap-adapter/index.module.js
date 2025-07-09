/*!
 * Photo Sphere Viewer / Cubemap Adapter 5.13.3
 * @copyright 2015-2025 Damien "Mistic" Sorel
 * @licence MIT (https://opensource.org/licenses/MIT)
 */

// src/CubemapAdapter.ts
import { AbstractAdapter, CONSTANTS, PSVError as PSVError2, SYSTEM, utils } from "@photo-sphere-viewer/core";
import { BoxGeometry, MathUtils, Mesh, MeshBasicMaterial, Vector2, Vector3 } from "three";

// src/utils.ts
import { PSVError } from "@photo-sphere-viewer/core";
var CUBE_ARRAY = [0, 2, 4, 5, 3, 1];
var CUBE_HASHMAP = ["left", "right", "top", "bottom", "back", "front"];
function isCubemap(cubemap) {
  return cubemap && typeof cubemap === "object" && CUBE_HASHMAP.every((side) => side in cubemap);
}
function cleanCubemapArray(panorama) {
  const cleanPanorama = [];
  if (panorama.length !== 6) {
    throw new PSVError("A cubemap array must contain exactly 6 images.");
  }
  for (let i = 0; i < 6; i++) {
    cleanPanorama[i] = panorama[CUBE_ARRAY[i]];
  }
  return cleanPanorama;
}
function cleanCubemap(cubemap) {
  const cleanPanorama = [];
  if (!isCubemap(cubemap)) {
    throw new PSVError("A cubemap object must contain exactly left, front, right, back, top, bottom images.");
  }
  CUBE_HASHMAP.forEach((side, i) => {
    cleanPanorama[i] = cubemap[side];
  });
  return cleanPanorama;
}

// src/CubemapAdapter.ts
var getConfig = utils.getConfigParser({
  blur: false
});
var EPS = 1e-6;
var ORIGIN = new Vector3();
var CubemapAdapter = class extends AbstractAdapter {
  constructor(viewer, config) {
    super(viewer);
    this.config = getConfig(config);
  }
  supportsTransition() {
    return true;
  }
  supportsPreload() {
    return true;
  }
  /**
   * {@link https://github.com/bhautikj/vrProjector/blob/master/vrProjector/CubemapProjection.py#L130}
   */
  textureCoordsToSphericalCoords(point, data) {
    if (utils.isNil(point.textureX) || utils.isNil(point.textureY) || utils.isNil(point.textureFace)) {
      throw new PSVError2(`Texture position is missing 'textureX', 'textureY' or 'textureFace'`);
    }
    const u = 2 * (point.textureX / data.faceSize - 0.5);
    const v = 2 * (point.textureY / data.faceSize - 0.5);
    function yawPitch(x, y, z) {
      const dv = Math.sqrt(x * x + y * y + z * z);
      return [Math.atan2(y / dv, x / dv), -Math.asin(z / dv)];
    }
    let yaw;
    let pitch;
    switch (point.textureFace) {
      case "front":
        [yaw, pitch] = yawPitch(1, u, v);
        break;
      case "right":
        [yaw, pitch] = yawPitch(-u, 1, v);
        break;
      case "left":
        [yaw, pitch] = yawPitch(u, -1, v);
        break;
      case "back":
        [yaw, pitch] = yawPitch(-1, -u, v);
        break;
      case "bottom":
        [yaw, pitch] = data.flipTopBottom ? yawPitch(-v, u, 1) : yawPitch(v, -u, 1);
        break;
      case "top":
        [yaw, pitch] = data.flipTopBottom ? yawPitch(v, u, -1) : yawPitch(-v, -u, -1);
        break;
    }
    return { yaw, pitch };
  }
  sphericalCoordsToTextureCoords(position, data) {
    const raycaster = this.viewer.renderer.raycaster;
    const mesh = this.viewer.renderer.mesh;
    raycaster.set(ORIGIN, this.viewer.dataHelper.sphericalCoordsToVector3(position));
    const point = raycaster.intersectObject(mesh)[0].point.divideScalar(CONSTANTS.SPHERE_RADIUS);
    function mapUV(x, a1, a2) {
      return Math.round(MathUtils.mapLinear(x, a1, a2, 0, data.faceSize));
    }
    let textureFace;
    let textureX;
    let textureY;
    if (1 - Math.abs(point.z) < EPS) {
      if (point.z > 0) {
        textureFace = "front";
        textureX = mapUV(point.x, 1, -1);
        textureY = mapUV(point.y, 1, -1);
      } else {
        textureFace = "back";
        textureX = mapUV(point.x, -1, 1);
        textureY = mapUV(point.y, 1, -1);
      }
    } else if (1 - Math.abs(point.x) < EPS) {
      if (point.x > 0) {
        textureFace = "left";
        textureX = mapUV(point.z, -1, 1);
        textureY = mapUV(point.y, 1, -1);
      } else {
        textureFace = "right";
        textureX = mapUV(point.z, 1, -1);
        textureY = mapUV(point.y, 1, -1);
      }
    } else {
      if (point.y > 0) {
        textureFace = "top";
        textureX = mapUV(point.x, -1, 1);
        textureY = mapUV(point.z, 1, -1);
      } else {
        textureFace = "bottom";
        textureX = mapUV(point.x, -1, 1);
        textureY = mapUV(point.z, -1, 1);
      }
      if (data.flipTopBottom) {
        textureX = data.faceSize - textureX;
        textureY = data.faceSize - textureY;
      }
    }
    return { textureFace, textureX, textureY };
  }
  async loadTexture(panorama, loader = true) {
    if (this.viewer.config.fisheye) {
      utils.logWarn("fisheye effect with cubemap texture can generate distorsion");
    }
    let cleanPanorama;
    if (Array.isArray(panorama) || isCubemap(panorama)) {
      cleanPanorama = {
        type: "separate",
        paths: panorama
      };
    } else {
      cleanPanorama = panorama;
    }
    let result;
    switch (cleanPanorama.type) {
      case "separate":
        result = await this.loadTexturesSeparate(cleanPanorama, loader);
        break;
      case "stripe":
        result = await this.loadTexturesStripe(cleanPanorama, loader);
        break;
      case "net":
        result = await this.loadTexturesNet(cleanPanorama, loader);
        break;
      default:
        throw new PSVError2("Invalid cubemap panorama, are you using the right adapter?");
    }
    return {
      panorama,
      texture: result.textures,
      cacheKey: result.cacheKey,
      panoData: {
        isCubemap: true,
        flipTopBottom: result.flipTopBottom,
        faceSize: result.textures[0].image.width
      }
    };
  }
  async loadTexturesSeparate(panorama, loader) {
    let paths;
    if (Array.isArray(panorama.paths)) {
      paths = cleanCubemapArray(panorama.paths);
    } else {
      paths = cleanCubemap(panorama.paths);
    }
    const cacheKey = paths[0];
    const promises = [];
    const progress = [0, 0, 0, 0, 0, 0];
    for (let i = 0; i < 6; i++) {
      if (!paths[i]) {
        progress[i] = 100;
        promises.push(Promise.resolve(null));
      } else {
        promises.push(
          this.viewer.textureLoader.loadImage(
            paths[i],
            loader ? (p) => {
              progress[i] = p;
              this.viewer.textureLoader.dispatchProgress(utils.sum(progress) / 6);
            } : null,
            cacheKey
          ).then((img) => this.createCubemapTexture(img))
        );
      }
    }
    return {
      textures: await Promise.all(promises),
      cacheKey,
      flipTopBottom: panorama.flipTopBottom ?? false
    };
  }
  createCubemapTexture(img) {
    if (img.width !== img.height) {
      utils.logWarn("Invalid cubemap image, the width should equal the height");
    }
    if (this.config.blur || img.width > SYSTEM.maxTextureWidth) {
      const ratio = Math.min(1, SYSTEM.maxCanvasWidth / img.width);
      const buffer = new OffscreenCanvas(Math.floor(img.width * ratio), Math.floor(img.height * ratio));
      const ctx = buffer.getContext("2d");
      if (this.config.blur) {
        ctx.filter = `blur(${buffer.width / 512}px)`;
      }
      ctx.drawImage(img, 0, 0, buffer.width, buffer.height);
      return utils.createTexture(buffer);
    }
    return utils.createTexture(img);
  }
  async loadTexturesStripe(panorama, loader) {
    if (!panorama.order) {
      panorama.order = ["left", "front", "right", "back", "top", "bottom"];
    }
    const cacheKey = panorama.path;
    const img = await this.viewer.textureLoader.loadImage(
      panorama.path,
      loader ? (p) => this.viewer.textureLoader.dispatchProgress(p) : null,
      cacheKey
    );
    if (img.width !== img.height * 6) {
      utils.logWarn("Invalid cubemap image, the width should be six times the height");
    }
    const ratio = Math.min(1, SYSTEM.maxCanvasWidth / img.height);
    const tileWidth = Math.floor(img.height * ratio);
    const textures = {};
    for (let i = 0; i < 6; i++) {
      const buffer = new OffscreenCanvas(tileWidth, tileWidth);
      const ctx = buffer.getContext("2d");
      if (this.config.blur) {
        ctx.filter = `blur(${buffer.width / 512}px)`;
      }
      ctx.drawImage(
        img,
        img.height * i,
        0,
        img.height,
        img.height,
        0,
        0,
        tileWidth,
        tileWidth
      );
      textures[panorama.order[i]] = utils.createTexture(buffer);
    }
    return {
      textures: cleanCubemap(textures),
      cacheKey,
      flipTopBottom: panorama.flipTopBottom ?? false
    };
  }
  async loadTexturesNet(panorama, loader) {
    const cacheKey = panorama.path;
    const img = await this.viewer.textureLoader.loadImage(
      panorama.path,
      loader ? (p) => this.viewer.textureLoader.dispatchProgress(p) : null,
      cacheKey
    );
    if (img.width / 4 !== img.height / 3) {
      utils.logWarn("Invalid cubemap image, the width should be 4/3rd of the height");
    }
    const ratio = Math.min(1, SYSTEM.maxCanvasWidth / (img.width / 4));
    const tileWidth = Math.floor(img.width / 4 * ratio);
    const pts = [
      [0, 1 / 3],
      // left
      [1 / 2, 1 / 3],
      // right
      [1 / 4, 0],
      // top
      [1 / 4, 2 / 3],
      // bottom
      [3 / 4, 1 / 3],
      // back
      [1 / 4, 1 / 3]
      // front
    ];
    const textures = [];
    for (let i = 0; i < 6; i++) {
      const buffer = new OffscreenCanvas(tileWidth, tileWidth);
      const ctx = buffer.getContext("2d");
      if (this.config.blur) {
        ctx.filter = `blur(${buffer.width / 512}px)`;
      }
      ctx.drawImage(
        img,
        img.width * pts[i][0],
        img.height * pts[i][1],
        img.width / 4,
        img.height / 3,
        0,
        0,
        tileWidth,
        tileWidth
      );
      textures[i] = utils.createTexture(buffer);
    }
    return {
      textures,
      cacheKey,
      flipTopBottom: true
    };
  }
  createMesh() {
    const cubeSize = CONSTANTS.SPHERE_RADIUS * 2;
    const geometry = new BoxGeometry(cubeSize, cubeSize, cubeSize).scale(1, 1, -1);
    const materials = [];
    for (let i = 0; i < 6; i++) {
      const material = new MeshBasicMaterial({ depthTest: false, depthWrite: false });
      materials.push(material);
    }
    return new Mesh(geometry, materials);
  }
  setTexture(mesh, { texture, panoData }) {
    mesh.material.forEach((material, i) => {
      if (texture[i]) {
        if (panoData.flipTopBottom && (i === 2 || i === 3)) {
          texture[i].center = new Vector2(0.5, 0.5);
          texture[i].rotation = Math.PI;
        }
        material.map = texture[i];
      } else {
        material.opacity = 0;
        material.transparent = true;
      }
    });
  }
  setTextureOpacity(mesh, opacity) {
    mesh.material.forEach((material) => {
      if (material.map) {
        material.opacity = opacity;
        material.transparent = opacity < 1;
      }
    });
  }
  disposeTexture({ texture }) {
    texture.forEach((t) => t.dispose());
  }
  disposeMesh(mesh) {
    mesh.geometry.dispose();
    mesh.material.forEach((m) => m.dispose());
  }
};
CubemapAdapter.id = "cubemap";
CubemapAdapter.VERSION = "5.13.3";
CubemapAdapter.supportsDownload = false;
export {
  CubemapAdapter
};
//# sourceMappingURL=index.module.js.map