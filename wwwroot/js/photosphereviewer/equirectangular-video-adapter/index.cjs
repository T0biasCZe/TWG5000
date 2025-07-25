/*!
 * Photo Sphere Viewer / Equirectangular Video Adapter 5.13.3
 * @copyright 2015-2025 Damien "Mistic" Sorel
 * @licence MIT (https://opensource.org/licenses/MIT)
 */
"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var index_exports = {};
__export(index_exports, {
  EquirectangularVideoAdapter: () => EquirectangularVideoAdapter
});
module.exports = __toCommonJS(index_exports);

// src/EquirectangularVideoAdapter.ts
var import_core2 = require("@photo-sphere-viewer/core");

// ../shared/AbstractVideoAdapter.ts
var import_core = require("@photo-sphere-viewer/core");
var import_three = require("three");

// ../shared/video-utils.ts
function createVideo({
  src,
  withCredentials,
  muted,
  autoplay
}) {
  const video = document.createElement("video");
  video.crossOrigin = withCredentials ? "use-credentials" : "anonymous";
  video.loop = true;
  video.playsInline = true;
  video.autoplay = autoplay;
  video.muted = muted;
  video.preload = "metadata";
  if (src instanceof MediaStream) {
    video.srcObject = src;
  } else {
    video.src = src;
  }
  return video;
}

// ../shared/AbstractVideoAdapter.ts
var AbstractVideoAdapter = class extends import_core.AbstractAdapter {
  constructor(viewer) {
    super(viewer);
  }
  init() {
    super.init();
    this.viewer.needsContinuousUpdate(true);
  }
  destroy() {
    this.__removeVideo();
    super.destroy();
  }
  supportsPreload() {
    return false;
  }
  supportsTransition() {
    return false;
  }
  async loadTexture(panorama) {
    if (typeof panorama !== "object" || !panorama.source) {
      return Promise.reject(new import_core.PSVError("Invalid panorama configuration, are you using the right adapter?"));
    }
    if (!this.viewer.getPlugin("video")) {
      return Promise.reject(new import_core.PSVError("Video adapters require VideoPlugin to be loaded too."));
    }
    const video = panorama.source instanceof HTMLVideoElement ? panorama.source : createVideo({
      src: panorama.source,
      withCredentials: this.viewer.config.withCredentials(panorama.source),
      muted: true,
      autoplay: false
    });
    await this.__videoLoadPromise(video);
    const texture = new import_three.VideoTexture(video);
    return { panorama, texture };
  }
  switchVideo(texture) {
    let currentTime;
    let duration;
    let paused = !this.config.autoplay;
    let muted = this.config.muted;
    let volume = 1;
    if (this.video) {
      ({ currentTime, duration, paused, muted, volume } = this.video);
    }
    this.__removeVideo();
    this.video = texture.image;
    if (this.video.duration === duration) {
      this.video.currentTime = currentTime;
    }
    this.video.muted = muted;
    this.video.volume = volume;
    if (!paused) {
      this.video.play();
    }
  }
  setTextureOpacity(mesh, opacity) {
    mesh.material.opacity = opacity;
    mesh.material.transparent = opacity < 1;
  }
  disposeTexture({ texture }) {
    texture.dispose();
  }
  disposeMesh(mesh) {
    mesh.geometry.dispose();
    mesh.material.dispose();
  }
  __removeVideo() {
    if (this.video) {
      this.video.pause();
      this.video.remove();
      delete this.video;
    }
  }
  __videoLoadPromise(video) {
    return new Promise((resolve, reject) => {
      const onLoaded = () => {
        if (this.video && video.duration === this.video.duration) {
          video.currentTime = this.video.currentTime;
        }
        resolve();
        video.removeEventListener("loadedmetadata", onLoaded);
      };
      const onError = (err) => {
        reject(err);
        video.removeEventListener("error", onError);
      };
      video.addEventListener("loadedmetadata", onLoaded);
      video.addEventListener("error", onError);
    });
  }
};
AbstractVideoAdapter.supportsDownload = false;

// src/EquirectangularVideoAdapter.ts
var getConfig = import_core2.utils.getConfigParser({
  resolution: 64,
  autoplay: false,
  muted: false
});
var EquirectangularVideoAdapter = class extends AbstractVideoAdapter {
  constructor(viewer, config) {
    super(viewer);
    this.config = getConfig(config);
    this.adapter = new import_core2.EquirectangularAdapter(this.viewer, {
      resolution: this.config.resolution
    });
  }
  destroy() {
    this.adapter.destroy();
    delete this.adapter;
    super.destroy();
  }
  textureCoordsToSphericalCoords(point, data) {
    return this.adapter.textureCoordsToSphericalCoords(point, data);
  }
  sphericalCoordsToTextureCoords(position, data) {
    return this.adapter.sphericalCoordsToTextureCoords(position, data);
  }
  async loadTexture(panorama, _, newPanoData) {
    const { texture } = await super.loadTexture(panorama);
    const video = texture.image;
    if (panorama.data) {
      newPanoData = panorama.data;
    }
    if (typeof newPanoData === "function") {
      newPanoData = newPanoData(video);
    }
    const panoData = import_core2.utils.mergePanoData(video.videoWidth, video.videoHeight, newPanoData);
    return { panorama, texture, panoData };
  }
  createMesh(panoData) {
    return this.adapter.createMesh(panoData);
  }
  setTexture(mesh, { texture }) {
    mesh.material.map = texture;
    this.switchVideo(texture);
  }
};
EquirectangularVideoAdapter.id = "equirectangular-video";
EquirectangularVideoAdapter.VERSION = "5.13.3";
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  EquirectangularVideoAdapter
});
//# sourceMappingURL=index.cjs.map