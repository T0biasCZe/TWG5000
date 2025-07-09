/*!
 * Photo Sphere Viewer / Resolution Plugin 5.13.3
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
  ResolutionPlugin: () => ResolutionPlugin,
  events: () => events_exports
});
module.exports = __toCommonJS(index_exports);
var import_core3 = require("@photo-sphere-viewer/core");

// src/events.ts
var events_exports = {};
__export(events_exports, {
  ResolutionChangedEvent: () => ResolutionChangedEvent
});
var import_core = require("@photo-sphere-viewer/core");
var _ResolutionChangedEvent = class _ResolutionChangedEvent extends import_core.TypedEvent {
  /** @internal */
  constructor(resolutionId) {
    super(_ResolutionChangedEvent.type);
    this.resolutionId = resolutionId;
  }
};
_ResolutionChangedEvent.type = "resolution-changed";
var ResolutionChangedEvent = _ResolutionChangedEvent;

// src/ResolutionPlugin.ts
var import_core2 = require("@photo-sphere-viewer/core");
var getConfig = import_core2.utils.getConfigParser({
  resolutions: null,
  defaultResolution: null,
  showBadge: true
});
var _ResolutionPlugin = class _ResolutionPlugin extends import_core2.AbstractPlugin {
  constructor(viewer, config) {
    super(viewer);
    this.resolutions = [];
    this.resolutionsById = {};
    this.state = {
      resolution: null
    };
    this.config = getConfig(config);
    if (this.config.defaultResolution && this.viewer.config.panorama) {
      import_core2.utils.logWarn(
        "ResolutionPlugin, a defaultResolution was provided but a panorama is already configured on the viewer, the defaultResolution will be ignored."
      );
    }
  }
  /**
   * @internal
   */
  init() {
    super.init();
    this.settings = this.viewer.getPlugin("settings");
    if (!this.settings) {
      throw new import_core2.PSVError("Resolution plugin requires the Settings plugin");
    }
    this.settings.addSetting({
      id: _ResolutionPlugin.id,
      type: "options",
      label: _ResolutionPlugin.id,
      current: () => this.state.resolution,
      options: () => this.resolutions,
      apply: (resolution) => this.__setResolutionIfExists(resolution),
      badge: !this.config.showBadge ? null : () => this.state.resolution
    });
    this.viewer.addEventListener(import_core2.events.PanoramaLoadedEvent.type, this);
    if (this.config.resolutions) {
      this.setResolutions(
        this.config.resolutions,
        this.viewer.config.panorama ? null : this.config.defaultResolution
      );
      delete this.config.resolutions;
      delete this.config.defaultResolution;
    }
  }
  /**
   * @internal
   */
  destroy() {
    this.viewer.removeEventListener(import_core2.events.PanoramaLoadedEvent.type, this);
    this.settings.removeSetting(_ResolutionPlugin.id);
    super.destroy();
  }
  /**
   * @internal
   */
  handleEvent(e) {
    if (e instanceof import_core2.events.PanoramaLoadedEvent) {
      this.__refreshResolution();
    }
  }
  /**
   * Changes the available resolutions
   * @param resolutions
   * @param defaultResolution - if not provided, the current panorama is kept
   * @throws {@link PSVError} if the configuration is invalid
   */
  setResolutions(resolutions, defaultResolution) {
    this.resolutions = resolutions;
    this.resolutionsById = {};
    resolutions.forEach((resolution) => {
      if (!resolution.id) {
        throw new import_core2.PSVError("Missing resolution id");
      }
      if (!resolution.label) {
        throw new import_core2.PSVError("Missing resolution label");
      }
      if (!resolution.panorama) {
        throw new import_core2.PSVError("Missing resolution panorama");
      }
      this.resolutionsById[resolution.id] = resolution;
    });
    if (!defaultResolution) {
      if (this.viewer.config.panorama) {
        const resolution = this.resolutions.find((r) => import_core2.utils.deepEqual(this.viewer.config.panorama, r.panorama));
        if (!resolution) {
          defaultResolution = resolutions[0].id;
        }
      } else {
        defaultResolution = resolutions[0].id;
      }
    }
    if (defaultResolution) {
      this.setResolution(defaultResolution);
    }
    this.__refreshResolution();
  }
  /**
   * Changes the current resolution
   * @throws {@link PSVError} if the resolution does not exist
   */
  setResolution(id) {
    if (!this.resolutionsById[id]) {
      throw new import_core2.PSVError(`Resolution "${id}" unknown`);
    }
    return this.__setResolutionIfExists(id);
  }
  __setResolutionIfExists(id) {
    if (this.resolutionsById[id]) {
      return this.viewer.setPanorama(this.resolutionsById[id].panorama, {
        transition: false,
        showLoader: false,
        panoData: this.resolutionsById[id].panoData
      });
    } else {
      return Promise.resolve();
    }
  }
  /**
   * Returns the current resolution
   */
  getResolution() {
    return this.state.resolution;
  }
  /**
   * Updates current resolution on panorama load
   */
  __refreshResolution() {
    const resolution = this.resolutions.find((r) => import_core2.utils.deepEqual(this.viewer.config.panorama, r.panorama));
    if (this.state.resolution !== resolution?.id) {
      this.state.resolution = resolution?.id;
      this.settings?.updateButton();
      this.dispatchEvent(new ResolutionChangedEvent(this.state.resolution));
    }
  }
};
_ResolutionPlugin.id = "resolution";
_ResolutionPlugin.VERSION = "5.13.3";
var ResolutionPlugin = _ResolutionPlugin;

// src/index.ts
import_core3.DEFAULTS.lang[ResolutionPlugin.id] = "Quality";
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ResolutionPlugin,
  events
});
//# sourceMappingURL=index.cjs.map