/*!
 * Photo Sphere Viewer / Overlays Plugin 5.13.3
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
  OverlaysPlugin: () => OverlaysPlugin,
  events: () => events_exports
});
module.exports = __toCommonJS(index_exports);

// src/events.ts
var events_exports = {};
__export(events_exports, {
  OverlayClickEvent: () => OverlayClickEvent
});
var import_core = require("@photo-sphere-viewer/core");
var _OverlayClickEvent = class _OverlayClickEvent extends import_core.TypedEvent {
  /** @internal */
  constructor(overlayId) {
    super(_OverlayClickEvent.type);
    this.overlayId = overlayId;
  }
};
_OverlayClickEvent.type = "overlay-click";
var OverlayClickEvent = _OverlayClickEvent;

// src/OverlaysPlugin.ts
var import_core2 = require("@photo-sphere-viewer/core");

// src/constants.ts
var OVERLAY_DATA = "psvOverlay";

// src/OverlaysPlugin.ts
var getConfig = import_core2.utils.getConfigParser({
  overlays: [],
  autoclear: true,
  inheritSphereCorrection: true,
  cubemapAdapter: null
});
var OverlaysPlugin = class extends import_core2.AbstractConfigurablePlugin {
  constructor(viewer, config) {
    super(viewer, config);
    this.state = {
      overlays: {}
    };
  }
  /**
   * @internal
   */
  init() {
    super.init();
    this.viewer.addEventListener(import_core2.events.PanoramaLoadedEvent.type, this, { once: true });
    this.viewer.addEventListener(import_core2.events.PanoramaLoadEvent.type, this);
    this.viewer.addEventListener(import_core2.events.ClickEvent.type, this);
    this.viewer.addEventListener(import_core2.events.ConfigChangedEvent.type, this);
  }
  /**
   * @internal
   */
  destroy() {
    this.clearOverlays();
    this.viewer.removeEventListener(import_core2.events.PanoramaLoadedEvent.type, this);
    this.viewer.removeEventListener(import_core2.events.PanoramaLoadEvent.type, this);
    this.viewer.removeEventListener(import_core2.events.ClickEvent.type, this);
    this.viewer.removeEventListener(import_core2.events.ConfigChangedEvent.type, this);
    delete this.cubemapAdapter;
    delete this.equirectangularAdapter;
    super.destroy();
  }
  addEventListener(type, callback, options) {
    if (type === "overlay-click") {
      import_core2.utils.logWarn(`"overlay-click" event is deprecated and will be removed in next version.`);
    }
    super.addEventListener(type, callback, options);
  }
  /**
   * @internal
   */
  handleEvent(e) {
    if (e instanceof import_core2.events.PanoramaLoadedEvent) {
      this.config.overlays.forEach((overlay) => {
        this.addOverlay(overlay);
      });
      delete this.config.overlays;
    } else if (e instanceof import_core2.events.PanoramaLoadEvent) {
      if (this.config.autoclear) {
        this.clearOverlays();
      }
    } else if (e instanceof import_core2.events.ClickEvent) {
      if (e.data.rightclick) {
        return false;
      }
      const overlay = e.data.objects.map((o) => o.userData[OVERLAY_DATA]).filter((o) => !!o).map((o) => this.state.overlays[o].config).sort((a, b) => b.zIndex - a.zIndex)[0];
      if (overlay) {
        this.dispatchEvent(new OverlayClickEvent(overlay.id));
      }
    } else if (e instanceof import_core2.events.ConfigChangedEvent) {
      if (e.containsOptions("sphereCorrection")) {
        this.__applySphereCorrection();
      }
    }
  }
  /**
   * Adds a new overlay
   */
  addOverlay(config) {
    if (!config.path) {
      throw new import_core2.PSVError(`Missing overlay "path"`);
    }
    const parsedConfig = {
      id: Math.random().toString(36).substring(2),
      opacity: 1,
      zIndex: 0,
      ...config
    };
    if (this.state.overlays[parsedConfig.id]) {
      throw new import_core2.PSVError(`Overlay "${parsedConfig.id} already exists.`);
    }
    if (typeof config.path === "string") {
      this.__addSphereImageOverlay(parsedConfig);
    } else {
      this.__addCubeImageOverlay(parsedConfig);
    }
  }
  /**
   * Removes an overlay
   */
  removeOverlay(id) {
    if (!this.state.overlays[id]) {
      import_core2.utils.logWarn(`Overlay "${id}" not found`);
      return;
    }
    const { mesh } = this.state.overlays[id];
    this.viewer.renderer.removeObject(mesh);
    this.viewer.renderer.cleanScene(mesh);
    this.viewer.needsUpdate();
    delete this.state.overlays[id];
  }
  /**
   * Remove all overlays
   */
  clearOverlays() {
    Object.keys(this.state.overlays).forEach((id) => {
      this.removeOverlay(id);
    });
  }
  /**
   * Add a spherical overlay
   */
  async __addSphereImageOverlay(config) {
    const currentPanoData = this.viewer.state.textureData.panoData;
    const adapter = this.__getEquirectangularAdapter();
    const textureData = await adapter.loadTexture(config.path, false, null, false);
    let panoData;
    if (currentPanoData.isEquirectangular) {
      const r = textureData.panoData.croppedWidth / currentPanoData.croppedWidth;
      panoData = {
        fullWidth: r * currentPanoData.fullWidth,
        fullHeight: r * currentPanoData.fullHeight,
        croppedWidth: r * currentPanoData.croppedWidth,
        croppedHeight: r * currentPanoData.croppedHeight,
        croppedX: r * currentPanoData.croppedX,
        croppedY: r * currentPanoData.croppedY
      };
    } else {
      panoData = textureData.panoData;
    }
    const mesh = adapter.createMesh(panoData);
    mesh.renderOrder = 100 + config.zIndex;
    mesh.userData[OVERLAY_DATA] = config.id;
    adapter.setTexture(mesh, textureData);
    adapter.setTextureOpacity(mesh, config.opacity);
    mesh.material.transparent = true;
    this.__applySphereCorrection(mesh);
    this.state.overlays[config.id] = { config, mesh };
    this.viewer.renderer.addObject(mesh);
    this.viewer.needsUpdate();
  }
  /**
   * Add a cubemap overlay
   */
  async __addCubeImageOverlay(config) {
    const currentPanoData = this.viewer.state.textureData.panoData;
    const adapter = this.__getCubemapAdapter();
    const textureData = await adapter.loadTexture(config.path, false);
    if (!("type" in config.path) && currentPanoData.isCubemap) {
      textureData.panoData.flipTopBottom = currentPanoData.flipTopBottom;
    }
    const mesh = adapter.createMesh();
    mesh.renderOrder = 100 + config.zIndex;
    mesh.userData[OVERLAY_DATA] = config.id;
    adapter.setTexture(mesh, textureData);
    adapter.setTextureOpacity(mesh, config.opacity);
    mesh.material.forEach((m) => m.transparent = true);
    this.__applySphereCorrection(mesh);
    this.state.overlays[config.id] = { config, mesh };
    this.viewer.renderer.addObject(mesh);
    this.viewer.needsUpdate();
  }
  __applySphereCorrection(mesh) {
    if (this.config.inheritSphereCorrection) {
      if (mesh) {
        this.viewer.renderer.setSphereCorrection(this.viewer.config.sphereCorrection, mesh);
      } else {
        Object.values(this.state.overlays).forEach(({ mesh: mesh2 }) => {
          this.viewer.renderer.setSphereCorrection(this.viewer.config.sphereCorrection, mesh2);
        });
      }
    }
  }
  __getEquirectangularAdapter() {
    if (!this.equirectangularAdapter) {
      const id = this.viewer.adapter.constructor.id;
      if (id === "equirectangular") {
        this.equirectangularAdapter = this.viewer.adapter;
      } else if (id === "equirectangular-tiles") {
        this.equirectangularAdapter = this.viewer.adapter.adapter;
      } else {
        this.equirectangularAdapter = new import_core2.EquirectangularAdapter(this.viewer);
      }
    }
    return this.equirectangularAdapter;
  }
  __getCubemapAdapter() {
    if (!this.cubemapAdapter) {
      const id = this.viewer.adapter.constructor.id;
      if (id === "cubemap") {
        this.cubemapAdapter = this.viewer.adapter;
      } else if (id === "cubemap-tiles") {
        this.cubemapAdapter = this.viewer.adapter.adapter;
      } else if (this.config.cubemapAdapter) {
        this.cubemapAdapter = new this.config.cubemapAdapter(this.viewer);
      } else {
        throw new import_core2.PSVError(`Cubemap overlays are only applicable with cubemap adapters`);
      }
    }
    return this.cubemapAdapter;
  }
};
OverlaysPlugin.id = "overlays";
OverlaysPlugin.VERSION = "5.13.3";
OverlaysPlugin.configParser = getConfig;
OverlaysPlugin.readonlyOptions = ["overlays", "cubemapAdapter", "inheritSphereCorrection"];
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  OverlaysPlugin,
  events
});
//# sourceMappingURL=index.cjs.map