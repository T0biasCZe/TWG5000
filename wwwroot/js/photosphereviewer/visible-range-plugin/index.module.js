/*!
 * Photo Sphere Viewer / Visible Range Plugin 5.13.3
 * @copyright 2015-2025 Damien "Mistic" Sorel
 * @licence MIT (https://opensource.org/licenses/MIT)
 */

// src/VisibleRangePlugin.ts
import { AbstractConfigurablePlugin, events, utils } from "@photo-sphere-viewer/core";
import { MathUtils } from "three";
var EPS = 1e-6;
var getConfig = utils.getConfigParser({
  verticalRange: null,
  horizontalRange: null,
  usePanoData: false
});
var VisibleRangePlugin = class extends AbstractConfigurablePlugin {
  constructor(viewer, config) {
    super(viewer, config);
  }
  /**
   * @internal
   */
  init() {
    super.init();
    this.autorotate = this.viewer.getPlugin("autorotate");
    this.viewer.addEventListener(events.PanoramaLoadedEvent.type, this);
    this.viewer.addEventListener(events.PositionUpdatedEvent.type, this);
    this.viewer.addEventListener(events.ZoomUpdatedEvent.type, this);
    this.viewer.addEventListener(events.BeforeAnimateEvent.type, this);
    this.viewer.addEventListener(events.BeforeRotateEvent.type, this);
    this.setVerticalRange(this.config.verticalRange);
    this.setHorizontalRange(this.config.horizontalRange);
  }
  /**
   * @internal
   */
  destroy() {
    this.viewer.removeEventListener(events.PanoramaLoadedEvent.type, this);
    this.viewer.removeEventListener(events.PositionUpdatedEvent.type, this);
    this.viewer.removeEventListener(events.ZoomUpdatedEvent.type, this);
    this.viewer.removeEventListener(events.BeforeAnimateEvent.type, this);
    this.viewer.removeEventListener(events.BeforeRotateEvent.type, this);
    super.destroy();
  }
  /**
   * @internal
   */
  handleEvent(e) {
    switch (e.type) {
      case events.PanoramaLoadedEvent.type:
        if (this.config.usePanoData) {
          this.setRangesFromPanoData();
        } else {
          this.__moveToRange();
        }
        break;
      case events.BeforeRotateEvent.type:
      case events.BeforeAnimateEvent.type: {
        const e2 = e;
        const { rangedPosition, sidesReached } = this.__applyRanges(e2.position, e2.zoomLevel);
        if (e2.position || Object.keys(sidesReached).length) {
          e2.position = rangedPosition;
        }
        break;
      }
      case events.PositionUpdatedEvent.type: {
        const currentPosition = e.position;
        const { sidesReached, rangedPosition } = this.__applyRanges(currentPosition);
        if ((sidesReached.left || sidesReached.right) && this.autorotate?.isEnabled()) {
          this.__reverseAutorotate(sidesReached.left, sidesReached.right);
        } else if (Math.abs(currentPosition.yaw - rangedPosition.yaw) > EPS || Math.abs(currentPosition.pitch - rangedPosition.pitch) > EPS) {
          this.viewer.dynamics.position.setValue(rangedPosition);
        }
        break;
      }
      case events.ZoomUpdatedEvent.type: {
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
      utils.logWarn("vertical range must have exactly two elements");
      range = null;
    }
    if (range) {
      this.config.verticalRange = range.map((angle) => utils.parseAngle(angle, true));
      if (this.config.verticalRange[0] > this.config.verticalRange[1]) {
        utils.logWarn("vertical range values must be ordered");
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
      utils.logWarn("horizontal range must have exactly two elements");
      range = null;
    }
    if (range) {
      this.config.horizontalRange = range.map((angle) => utils.parseAngle(angle));
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
      const range = utils.clone(this.config.horizontalRange);
      const rangeFov = range[0] > range[1] ? range[1] + (2 * Math.PI - range[0]) : range[1] - range[0];
      if (rangeFov <= MathUtils.degToRad(hFov)) {
        range[0] = utils.parseAngle(range[0] + rangeFov / 2);
        range[1] = range[0];
      } else {
        const offset = MathUtils.degToRad(hFov) / 2;
        range[0] = utils.parseAngle(range[0] + offset);
        range[1] = utils.parseAngle(range[1] - offset);
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
      const range = utils.clone(this.config.verticalRange);
      const rangeFov = range[1] - range[0];
      if (rangeFov <= MathUtils.degToRad(vFov)) {
        range[0] = utils.parseAngle(range[0] + rangeFov / 2, true);
        range[1] = range[0];
      } else {
        const offset = MathUtils.degToRad(vFov) / 2;
        range[0] = utils.parseAngle(range[0] + offset, true);
        range[1] = utils.parseAngle(range[1] - offset, true);
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
export {
  VisibleRangePlugin
};
//# sourceMappingURL=index.module.js.map