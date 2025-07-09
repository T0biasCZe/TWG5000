/*!
 * Photo Sphere Viewer / Visible Range Plugin 5.13.3
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
  VisibleRangePlugin: () => VisibleRangePlugin
});
module.exports = __toCommonJS(index_exports);

// src/VisibleRangePlugin.ts
var import_core = require("@photo-sphere-viewer/core");
var import_three = require("three");
var EPS = 1e-6;
var getConfig = import_core.utils.getConfigParser({
  verticalRange: null,
  horizontalRange: null,
  usePanoData: false
});
var VisibleRangePlugin = class extends import_core.AbstractConfigurablePlugin {
  constructor(viewer, config) {
    super(viewer, config);
  }
  /**
   * @internal
   */
  init() {
    super.init();
    this.autorotate = this.viewer.getPlugin("autorotate");
    this.viewer.addEventListener(import_core.events.PanoramaLoadedEvent.type, this);
    this.viewer.addEventListener(import_core.events.PositionUpdatedEvent.type, this);
    this.viewer.addEventListener(import_core.events.ZoomUpdatedEvent.type, this);
    this.viewer.addEventListener(import_core.events.BeforeAnimateEvent.type, this);
    this.viewer.addEventListener(import_core.events.BeforeRotateEvent.type, this);
    this.setVerticalRange(this.config.verticalRange);
    this.setHorizontalRange(this.config.horizontalRange);
  }
  /**
   * @internal
   */
  destroy() {
    this.viewer.removeEventListener(import_core.events.PanoramaLoadedEvent.type, this);
    this.viewer.removeEventListener(import_core.events.PositionUpdatedEvent.type, this);
    this.viewer.removeEventListener(import_core.events.ZoomUpdatedEvent.type, this);
    this.viewer.removeEventListener(import_core.events.BeforeAnimateEvent.type, this);
    this.viewer.removeEventListener(import_core.events.BeforeRotateEvent.type, this);
    super.destroy();
  }
  /**
   * @internal
   */
  handleEvent(e) {
    switch (e.type) {
      case import_core.events.PanoramaLoadedEvent.type:
        if (this.config.usePanoData) {
          this.setRangesFromPanoData();
        } else {
          this.__moveToRange();
        }
        break;
      case import_core.events.BeforeRotateEvent.type:
      case import_core.events.BeforeAnimateEvent.type: {
        const e2 = e;
        const { rangedPosition, sidesReached } = this.__applyRanges(e2.position, e2.zoomLevel);
        if (e2.position || Object.keys(sidesReached).length) {
          e2.position = rangedPosition;
        }
        break;
      }
      case import_core.events.PositionUpdatedEvent.type: {
        const currentPosition = e.position;
        const { sidesReached, rangedPosition } = this.__applyRanges(currentPosition);
        if ((sidesReached.left || sidesReached.right) && this.autorotate?.isEnabled()) {
          this.__reverseAutorotate(sidesReached.left, sidesReached.right);
        } else if (Math.abs(currentPosition.yaw - rangedPosition.yaw) > EPS || Math.abs(currentPosition.pitch - rangedPosition.pitch) > EPS) {
          this.viewer.dynamics.position.setValue(rangedPosition);
        }
        break;
      }
      case import_core.events.ZoomUpdatedEvent.type: {
        const currentPosition = this.viewer.getPosition();
        const { rangedPosition } = this.__applyRanges(currentPosition);
        if (Math.abs(currentPosition.yaw - rangedPosition.yaw) > EPS || Math.abs(currentPosition.pitch - rangedPosition.pitch) > EPS) {
          this.viewer.dynamics.position.setValue(rangedPosition);
        }
        break;
      }
    }
  }
  /**
   * Changes the vertical range
   */
  setVerticalRange(range) {
    if (range && range.length !== 2) {
      import_core.utils.logWarn("vertical range must have exactly two elements");
      range = null;
    }
    if (range) {
      this.config.verticalRange = range.map((angle) => import_core.utils.parseAngle(angle, true));
      if (this.config.verticalRange[0] > this.config.verticalRange[1]) {
        import_core.utils.logWarn("vertical range values must be ordered");
        this.config.verticalRange = [this.config.verticalRange[1], this.config.verticalRange[0]];
      }
      if (this.viewer.state.ready) {
        this.__moveToRange();
      }
    } else {
      this.config.verticalRange = null;
    }
  }
  /**
   * Changes the horizontal range
   */
  setHorizontalRange(range) {
    if (range && range.length !== 2) {
      import_core.utils.logWarn("horizontal range must have exactly two elements");
      range = null;
    }
    if (range) {
      this.config.horizontalRange = range.map((angle) => import_core.utils.parseAngle(angle));
      if (this.viewer.state.ready) {
        this.__moveToRange();
      }
    } else {
      this.config.horizontalRange = null;
    }
  }
  /**
   * Changes the ranges according the current panorama cropping data
   */
  setRangesFromPanoData() {
    const panoData = this.viewer.state.textureData.panoData;
    if (panoData?.isEquirectangular) {
      this.setVerticalRange(this.__getPanoVerticalRange(panoData));
      this.setHorizontalRange(this.__getPanoHorizontalRange(panoData));
    }
  }
  /**
   * Gets the vertical range defined by the viewer's panoData
   */
  __getPanoVerticalRange(p) {
    if (p.croppedHeight === p.fullHeight) {
      return null;
    } else {
      const getAngle = (y) => Math.PI * (1 - y / p.fullHeight) - Math.PI / 2;
      return [getAngle(p.croppedY + p.croppedHeight), getAngle(p.croppedY)];
    }
  }
  /**
   * Gets the horizontal range defined by the viewer's panoData
   */
  __getPanoHorizontalRange(p) {
    if (p.croppedWidth === p.fullWidth) {
      return null;
    } else {
      const getAngle = (x) => 2 * Math.PI * (x / p.fullWidth) - Math.PI;
      return [getAngle(p.croppedX), getAngle(p.croppedX + p.croppedWidth)];
    }
  }
  /**
   * Immediately moves the viewer to respect the ranges
   */
  __moveToRange() {
    this.viewer.rotate(this.viewer.getPosition());
  }
  /**
   * Apply "horizontalRange" and "verticalRange"
   */
  __applyRanges(position = this.viewer.getPosition(), zoomLevel = this.viewer.getZoomLevel()) {
    const rangedPosition = { yaw: position.yaw, pitch: position.pitch };
    const sidesReached = {};
    const vFov = this.viewer.dataHelper.zoomLevelToFov(zoomLevel);
    const hFov = this.viewer.dataHelper.vFovToHFov(vFov);
    if (this.config.horizontalRange) {
      const range = import_core.utils.clone(this.config.horizontalRange);
      const rangeFov = range[0] > range[1] ? range[1] + (2 * Math.PI - range[0]) : range[1] - range[0];
      if (rangeFov <= import_three.MathUtils.degToRad(hFov)) {
        range[0] = import_core.utils.parseAngle(range[0] + rangeFov / 2);
        range[1] = range[0];
      } else {
        const offset = import_three.MathUtils.degToRad(hFov) / 2;
        range[0] = import_core.utils.parseAngle(range[0] + offset);
        range[1] = import_core.utils.parseAngle(range[1] - offset);
      }
      if (range[0] > range[1]) {
        if (position.yaw > range[1] && position.yaw < range[0]) {
          if (position.yaw > range[0] / 2 + range[1] / 2) {
            rangedPosition.yaw = range[0];
            sidesReached.left = true;
          } else {
            rangedPosition.yaw = range[1];
            sidesReached.right = true;
          }
        }
      } else if (position.yaw < range[0]) {
        rangedPosition.yaw = range[0];
        sidesReached.left = true;
      } else if (position.yaw > range[1]) {
        rangedPosition.yaw = range[1];
        sidesReached.right = true;
      }
    }
    if (this.config.verticalRange) {
      const range = import_core.utils.clone(this.config.verticalRange);
      const rangeFov = range[1] - range[0];
      if (rangeFov <= import_three.MathUtils.degToRad(vFov)) {
        range[0] = import_core.utils.parseAngle(range[0] + rangeFov / 2, true);
        range[1] = range[0];
      } else {
        const offset = import_three.MathUtils.degToRad(vFov) / 2;
        range[0] = import_core.utils.parseAngle(range[0] + offset, true);
        range[1] = import_core.utils.parseAngle(range[1] - offset, true);
      }
      if (position.pitch < range[0]) {
        rangedPosition.pitch = range[0];
        sidesReached.bottom = true;
      } else if (position.pitch > range[1]) {
        rangedPosition.pitch = range[1];
        sidesReached.top = true;
      }
    }
    return { rangedPosition, sidesReached };
  }
  /**
   * Reverses autorotate direction with smooth transition
   */
  __reverseAutorotate(left, right) {
    if (left && this.autorotate.config.autorotateSpeed > 0 || right && this.autorotate.config.autorotateSpeed < 0) {
      return;
    }
    this.autorotate.reverse();
  }
};
VisibleRangePlugin.id = "visible-range";
VisibleRangePlugin.VERSION = "5.13.3";
VisibleRangePlugin.configParser = getConfig;
VisibleRangePlugin.readonlyOptions = [
  "horizontalRange",
  "verticalRange"
];
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  VisibleRangePlugin
});
//# sourceMappingURL=index.cjs.map