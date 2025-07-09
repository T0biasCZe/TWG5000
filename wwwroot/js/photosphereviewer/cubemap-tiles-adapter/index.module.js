/*!
 * Photo Sphere Viewer / Cubemap Tiles Adapter 5.13.3
 * @copyright 2015-2025 Damien "Mistic" Sorel
 * @licence MIT (https://opensource.org/licenses/MIT)
 */

// src/CubemapTilesAdapter.ts
import { AbstractAdapter, CONSTANTS, PSVError as PSVError3, events, utils as utils2 } from "@photo-sphere-viewer/core";
import { CubemapAdapter } from "@photo-sphere-viewer/cubemap-adapter";
import { BoxGeometry, Group, Mesh, MeshBasicMaterial as MeshBasicMaterial2, Vector3 } from "three";

// ../shared/Queue.ts
var Task = class {
  constructor(id, priority, fn) {
    this.id = id;
    this.priority = priority;
    this.fn = fn;
    this.status = 1 /* PENDING */;
  }
  start() {
    this.status = 2 /* RUNNING */;
    return this.fn(this).then(
      () => {
        this.status = 4 /* DONE */;
      },
      () => {
        this.status = 5 /* ERROR */;
      }
    );
  }
  cancel() {
    this.status = 3 /* CANCELLED */;
  }
  isCancelled() {
    return this.status === 3 /* CANCELLED */;
  }
};
var Queue = class {
  constructor(concurency = 8) {
    this.concurency = concurency;
    this.runningTasks = {};
    this.tasks = {};
  }
  enqueue(task) {
    this.tasks[task.id] = task;
  }
  clear() {
    Object.values(this.tasks).forEach((task) => task.cancel());
    this.tasks = {};
    this.runningTasks = {};
  }
  setPriority(taskId, priority) {
    const task = this.tasks[taskId];
    if (task) {
      task.priority = priority;
      if (task.status === 0 /* DISABLED */) {
        task.status = 1 /* PENDING */;
      }
    }
  }
  disableAllTasks() {
    Object.values(this.tasks).forEach((task) => {
      task.status = 0 /* DISABLED */;
    });
  }
  start() {
    if (Object.keys(this.runningTasks).length >= this.concurency) {
      return;
    }
    const nextTask = Object.values(this.tasks).filter((task) => task.status === 1 /* PENDING */).sort((a, b) => b.priority - a.priority).pop();
    if (nextTask) {
      this.runningTasks[nextTask.id] = true;
      nextTask.start().then(() => {
        if (!nextTask.isCancelled()) {
          delete this.tasks[nextTask.id];
          delete this.runningTasks[nextTask.id];
          this.start();
        }
      });
      this.start();
    }
  }
};

// ../shared/tiles-utils.ts
import { PSVError, utils } from "@photo-sphere-viewer/core";
import { LineSegments, MeshBasicMaterial, WireframeGeometry } from "three";
function checkTilesLevels(levels) {
  let previous = 0;
  levels.forEach((level, i) => {
    if (!level.zoomRange || level.zoomRange.length !== 2) {
      throw new PSVError(`Tiles level ${i} is missing "zoomRange" property`);
    }
    if (level.zoomRange[0] >= level.zoomRange[1] || level.zoomRange[0] !== previous || i === 0 && level.zoomRange[0] !== 0 || i === levels.length - 1 && level.zoomRange[1] !== 100) {
      throw new PSVError(`Tiles levels' "zoomRange" are not orderer or are not covering the whole 0-100 range`);
    }
    previous = level.zoomRange[1];
  });
}
function getTileIndexByZoomLevel(levels, zoomLevel) {
  return levels.findIndex((level) => {
    return zoomLevel >= level.zoomRange[0] && zoomLevel <= level.zoomRange[1];
  });
}
function buildErrorMaterial() {
  const canvas = new OffscreenCanvas(512, 512);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#333";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.font = `${canvas.width / 5}px serif`;
  ctx.fillStyle = "#a22";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("\u26A0", canvas.width / 2, canvas.height / 2);
  return new MeshBasicMaterial({ map: utils.createTexture(canvas) });
}
function createWireFrame(geometry) {
  const wireframe = new WireframeGeometry(geometry);
  const line = new LineSegments(wireframe);
  line.material.depthTest = false;
  line.material.depthWrite = false;
  line.material.opacity = 0.25;
  line.material.transparent = true;
  return line;
}
var DEBUG_COLORS = ["dodgerblue", "limegreen", "indianred"];
function buildDebugTexture(image, level, id) {
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = DEBUG_COLORS[level % DEBUG_COLORS.length];
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.globalCompositeOperation = "multiply";
  ctx.drawImage(image, 0, 0);
  const fontSize = image.width / 7;
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = "white";
  ctx.font = `${fontSize}px monospace`;
  ctx.textAlign = "center";
  id.split("\n").forEach((id2, i) => {
    ctx.fillText(id2, image.width / 2, image.height / 2 + fontSize * (0.3 + i));
  });
  return canvas;
}

// src/utils.ts
import { PSVError as PSVError2 } from "@photo-sphere-viewer/core";
import { MathUtils } from "three";
function isMultiTiles(panorama) {
  return !!panorama.levels;
}
function computeTileConfig(tile, level, data) {
  return {
    ...tile,
    level,
    tileSize: tile.faceSize / tile.nbTiles,
    facesByTile: data.CUBE_SEGMENTS / tile.nbTiles
  };
}
function getTileConfig(panorama, zoomLevel, data) {
  let tile;
  let level;
  if (!isMultiTiles(panorama)) {
    level = 0;
    tile = {
      ...panorama,
      zoomRange: [0, 100]
    };
  } else {
    level = getTileIndexByZoomLevel(panorama.levels, zoomLevel);
    tile = panorama.levels[level];
  }
  return computeTileConfig(tile, level, data);
}
function getTileConfigByIndex(panorama, level, data) {
  if (!isMultiTiles(panorama) || !panorama.levels[level]) {
    return null;
  } else {
    return computeTileConfig(panorama.levels[level], level, data);
  }
}
function checkPanoramaConfig(panorama, data) {
  if (typeof panorama !== "object" || !panorama.tileUrl) {
    throw new PSVError2("Invalid panorama configuration, are you using the right adapter?");
  }
  if (isMultiTiles(panorama)) {
    panorama.levels.forEach((level) => checkTile(level, data));
    checkTilesLevels(panorama.levels);
  } else {
    checkTile(panorama, data);
  }
}
function checkTile(tile, data) {
  if (!tile.faceSize || !tile.nbTiles) {
    throw new PSVError2("Invalid panorama configuration, are you using the right adapter?");
  }
  if (tile.nbTiles > data.CUBE_SEGMENTS) {
    throw new PSVError2(`Panorama nbTiles must not be greater than ${data.CUBE_SEGMENTS}.`);
  }
  if (!MathUtils.isPowerOfTwo(tile.nbTiles)) {
    throw new PSVError2("Panorama nbTiles must be power of 2.");
  }
}
function isTopOrBottom(face) {
  return face === 2 || face === 3;
}
function getCacheKey(panorama, firstTile) {
  for (let i = 0; i < firstTile.nbTiles; i++) {
    const url = panorama.tileUrl("front", i, firstTile.nbTiles / 2, firstTile.level);
    if (url) {
      return url;
    }
  }
  return panorama.tileUrl.toString();
}

// src/CubemapTilesAdapter.ts
var CUBE_SEGMENTS = 16;
var NB_VERTICES_BY_FACE = 6;
var NB_VERTICES_BY_PLANE = NB_VERTICES_BY_FACE * CUBE_SEGMENTS * CUBE_SEGMENTS;
var NB_VERTICES = 6 * NB_VERTICES_BY_PLANE;
var NB_GROUPS_BY_FACE = CUBE_SEGMENTS * CUBE_SEGMENTS;
var ATTR_UV = "uv";
var ATTR_POSITION = "position";
var CUBE_HASHMAP = ["left", "right", "top", "bottom", "back", "front"];
var ERROR_LEVEL = -1;
function tileId(tile) {
  return `${tile.face}:${tile.col}x${tile.row}/${tile.config.level}`;
}
function prettyTileId(tile) {
  return `${tileId(tile)}
${CUBE_HASHMAP[tile.face]}`;
}
function meshes(group) {
  return group.children;
}
var getConfig = utils2.getConfigParser({
  showErrorTile: true,
  baseBlur: true,
  antialias: true,
  blur: false,
  debug: false
});
var vertexPosition = new Vector3();
var CubemapTilesAdapter = class extends AbstractAdapter {
  constructor(viewer, config) {
    super(viewer);
    this.state = {
      tileConfig: null,
      tiles: {},
      faces: {},
      geom: null,
      materials: [],
      errorMaterial: null,
      inTransition: false
    };
    this.queue = new Queue();
    this.config = getConfig(config);
    if (!CubemapAdapter) {
      throw new PSVError3("CubemapTilesAdapter requires CubemapAdapter");
    }
    this.adapter = new CubemapAdapter(this.viewer, {
      blur: this.config.baseBlur
    });
    if (this.viewer.config.requestHeaders) {
      utils2.logWarn(
        'CubemapTilesAdapter fallbacks to file loader because "requestHeaders" where provided. Consider removing "requestHeaders" if you experience performances issues.'
      );
    }
  }
  init() {
    super.init();
    this.viewer.addEventListener(events.TransitionDoneEvent.type, this);
    this.viewer.addEventListener(events.PositionUpdatedEvent.type, this);
    this.viewer.addEventListener(events.ZoomUpdatedEvent.type, this);
  }
  destroy() {
    this.viewer.removeEventListener(events.TransitionDoneEvent.type, this);
    this.viewer.removeEventListener(events.PositionUpdatedEvent.type, this);
    this.viewer.removeEventListener(events.ZoomUpdatedEvent.type, this);
    this.__cleanup();
    this.state.errorMaterial?.map?.dispose();
    this.state.errorMaterial?.dispose();
    this.adapter.destroy();
    delete this.adapter;
    delete this.state.geom;
    delete this.state.errorMaterial;
    super.destroy();
  }
  /**
   * @internal
   */
  handleEvent(e) {
    switch (e.type) {
      case events.PositionUpdatedEvent.type:
      case events.ZoomUpdatedEvent.type:
        this.__refresh();
        break;
      case events.TransitionDoneEvent.type:
        this.state.inTransition = false;
        if (e.completed) {
          this.__switchMesh(this.viewer.renderer.mesh);
        }
        break;
    }
  }
  supportsTransition(panorama) {
    return !!panorama.baseUrl;
  }
  supportsPreload(panorama) {
    return !!panorama.baseUrl;
  }
  textureCoordsToSphericalCoords(point, data) {
    return this.adapter.textureCoordsToSphericalCoords(point, data);
  }
  sphericalCoordsToTextureCoords(position, data) {
    return this.adapter.sphericalCoordsToTextureCoords(position, data);
  }
  async loadTexture(panorama, loader = true) {
    checkPanoramaConfig(panorama, { CUBE_SEGMENTS });
    const firstTile = getTileConfig(panorama, 0, { CUBE_SEGMENTS });
    const panoData = {
      isCubemap: true,
      flipTopBottom: panorama.flipTopBottom ?? false,
      faceSize: firstTile.faceSize
    };
    if (panorama.baseUrl) {
      const textureData = await this.adapter.loadTexture(panorama.baseUrl, loader);
      return {
        panorama,
        panoData: {
          ...panoData,
          baseData: textureData.panoData
        },
        cacheKey: textureData.cacheKey,
        texture: textureData.texture
      };
    } else {
      return {
        panorama,
        panoData: {
          ...panoData,
          baseData: null
        },
        cacheKey: getCacheKey(panorama, firstTile),
        texture: null
      };
    }
  }
  createMesh() {
    const baseMesh = this.adapter.createMesh();
    const cubeSize = CONSTANTS.SPHERE_RADIUS * 2;
    const geometry = new BoxGeometry(cubeSize, cubeSize, cubeSize, CUBE_SEGMENTS, CUBE_SEGMENTS, CUBE_SEGMENTS).scale(1, 1, -1).toNonIndexed();
    geometry.clearGroups();
    for (let i = 0, k = 0; i < NB_VERTICES; i += NB_VERTICES_BY_FACE) {
      geometry.addGroup(i, NB_VERTICES_BY_FACE, k++);
    }
    const materials = [];
    const material = new MeshBasicMaterial2({
      opacity: 0,
      transparent: true,
      depthTest: false,
      depthWrite: false
    });
    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < NB_GROUPS_BY_FACE; j++) {
        materials.push(material);
      }
    }
    const tilesMesh = new Mesh(geometry, materials);
    tilesMesh.renderOrder = 1;
    const group = new Group();
    group.add(baseMesh);
    group.add(tilesMesh);
    return group;
  }
  /**
   * Applies the base texture and starts the loading of tiles
   */
  setTexture(group, textureData, transition) {
    const [baseMesh] = meshes(group);
    if (textureData.texture) {
      this.adapter.setTexture(baseMesh, {
        panorama: textureData.panorama.baseUrl,
        texture: textureData.texture,
        panoData: textureData.panoData.baseData
      });
    } else {
      baseMesh.visible = false;
    }
    if (transition) {
      this.state.inTransition = true;
    } else {
      this.__switchMesh(group);
    }
  }
  setTextureOpacity(group, opacity) {
    const [baseMesh] = meshes(group);
    this.adapter.setTextureOpacity(baseMesh, opacity);
  }
  disposeTexture({ texture }) {
    texture.forEach((t) => t.dispose());
  }
  disposeMesh(group) {
    const [baseMesh, tilesMesh] = meshes(group);
    baseMesh.geometry.dispose();
    baseMesh.material.forEach((m) => m.dispose());
    tilesMesh.geometry.dispose();
    tilesMesh.material.forEach((m) => m.dispose());
  }
  /**
   * Compute visible tiles and load them
   */
  __refresh() {
    if (!this.state.geom || this.state.inTransition) {
      return;
    }
    const panorama = this.viewer.state.textureData.panorama;
    const panoData = this.viewer.state.textureData.panoData;
    const zoomLevel = this.viewer.getZoomLevel();
    const tileConfig = getTileConfig(panorama, zoomLevel, { CUBE_SEGMENTS });
    const verticesPosition = this.state.geom.getAttribute(ATTR_POSITION);
    const tilesToLoad = {};
    for (let i = 0; i < NB_VERTICES; i += 1) {
      vertexPosition.fromBufferAttribute(verticesPosition, i);
      vertexPosition.applyEuler(this.viewer.renderer.sphereCorrection);
      if (this.viewer.renderer.isObjectVisible(vertexPosition)) {
        const face = Math.floor(i / NB_VERTICES_BY_PLANE);
        const segmentIndex = Math.floor((i - face * NB_VERTICES_BY_PLANE) / 6);
        const segmentRow = Math.floor(segmentIndex / CUBE_SEGMENTS);
        const segmentCol = segmentIndex - segmentRow * CUBE_SEGMENTS;
        let config = tileConfig;
        while (config) {
          let row = Math.floor(segmentRow / config.facesByTile);
          let col = Math.floor(segmentCol / config.facesByTile);
          const angle = vertexPosition.angleTo(this.viewer.state.direction);
          const tile = {
            face,
            row,
            col,
            angle,
            config,
            url: null
          };
          if (panoData.flipTopBottom && isTopOrBottom(face)) {
            col = config.nbTiles - col - 1;
            row = config.nbTiles - row - 1;
          }
          const id = tileId(tile);
          if (tilesToLoad[id]) {
            tilesToLoad[id].angle = Math.min(tilesToLoad[id].angle, angle);
            break;
          } else {
            tile.url = panorama.tileUrl(CUBE_HASHMAP[face], col, row, config.level);
            if (tile.url) {
              tilesToLoad[id] = tile;
              break;
            } else {
              config = getTileConfigByIndex(panorama, config.level - 1, { CUBE_SEGMENTS });
            }
          }
        }
      }
    }
    this.state.tileConfig = tileConfig;
    this.__loadTiles(Object.values(tilesToLoad));
  }
  /**
   * Loads tiles and change existing tiles priority
   */
  __loadTiles(tiles) {
    this.queue.disableAllTasks();
    tiles.forEach((tile) => {
      const id = tileId(tile);
      if (this.state.tiles[id]) {
        this.queue.setPriority(id, tile.angle);
      } else {
        this.state.tiles[id] = true;
        this.queue.enqueue(new Task(id, tile.angle, (task) => this.__loadTile(tile, task)));
      }
    });
    this.queue.start();
  }
  /**
   * Loads and draw a tile
   */
  __loadTile(tile, task) {
    return this.viewer.textureLoader.loadImage(tile.url, null, this.viewer.state.textureData.cacheKey).then((image) => {
      if (!task.isCancelled()) {
        if (this.config.debug) {
          image = buildDebugTexture(image, tile.config.level, prettyTileId(tile));
        }
        const mipmaps = this.config.antialias && tile.config.level > 0;
        const material = new MeshBasicMaterial2({ map: utils2.createTexture(image, mipmaps) });
        this.__swapMaterial(tile, material, false);
        this.viewer.needsUpdate();
      }
    }).catch((err) => {
      if (!utils2.isAbortError(err) && !task.isCancelled() && this.config.showErrorTile) {
        if (!this.state.errorMaterial) {
          this.state.errorMaterial = buildErrorMaterial();
        }
        this.__swapMaterial(tile, this.state.errorMaterial, true);
        this.viewer.needsUpdate();
      }
    });
  }
  /**
   * Applies a new texture to the faces
   */
  __swapMaterial(tile, material, isError) {
    const panoData = this.viewer.state.textureData.panoData;
    const uvs = this.state.geom.getAttribute(ATTR_UV);
    for (let c = 0; c < tile.config.facesByTile; c++) {
      for (let r = 0; r < tile.config.facesByTile; r++) {
        const faceCol = tile.col * tile.config.facesByTile + c;
        const faceRow = tile.row * tile.config.facesByTile + r;
        const firstVertex = tile.face * NB_VERTICES_BY_PLANE + 6 * (CUBE_SEGMENTS * faceRow + faceCol);
        if (isError && this.state.faces[firstVertex] > ERROR_LEVEL) {
          continue;
        }
        if (this.state.faces[firstVertex] > tile.config.level) {
          continue;
        }
        this.state.faces[firstVertex] = isError ? ERROR_LEVEL : tile.config.level;
        const matIndex = this.state.geom.groups.find((g) => g.start === firstVertex).materialIndex;
        this.state.materials[matIndex] = material;
        let top = 1 - r / tile.config.facesByTile;
        let bottom = 1 - (r + 1) / tile.config.facesByTile;
        let left = c / tile.config.facesByTile;
        let right = (c + 1) / tile.config.facesByTile;
        if (panoData.flipTopBottom && isTopOrBottom(tile.face)) {
          top = 1 - top;
          bottom = 1 - bottom;
          left = 1 - left;
          right = 1 - right;
        }
        uvs.setXY(firstVertex, left, top);
        uvs.setXY(firstVertex + 1, left, bottom);
        uvs.setXY(firstVertex + 2, right, top);
        uvs.setXY(firstVertex + 3, left, bottom);
        uvs.setXY(firstVertex + 4, right, bottom);
        uvs.setXY(firstVertex + 5, right, top);
      }
    }
    uvs.needsUpdate = true;
  }
  __switchMesh(group) {
    const [, tilesMesh] = meshes(group);
    this.__cleanup();
    this.state.materials = tilesMesh.material;
    this.state.geom = tilesMesh.geometry;
    if (this.config.debug) {
      const wireframe = createWireFrame(this.state.geom);
      this.viewer.renderer.addObject(wireframe);
      this.viewer.renderer.setSphereCorrection(this.viewer.config.sphereCorrection, wireframe);
    }
    setTimeout(() => this.__refresh());
  }
  /**
   * Clears loading queue, dispose all materials
   */
  __cleanup() {
    this.queue.clear();
    this.state.tiles = {};
    this.state.faces = {};
    this.state.materials = [];
    this.state.inTransition = false;
  }
};
CubemapTilesAdapter.id = "cubemap-tiles";
CubemapTilesAdapter.VERSION = "5.13.3";
CubemapTilesAdapter.supportsDownload = false;
export {
  CubemapTilesAdapter
};
//# sourceMappingURL=index.module.js.map