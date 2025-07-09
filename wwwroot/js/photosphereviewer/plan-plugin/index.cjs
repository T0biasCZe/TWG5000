/*!
 * Photo Sphere Viewer / Plan Plugin 5.13.3
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
  PlanPlugin: () => PlanPlugin,
  events: () => events_exports
});
module.exports = __toCommonJS(index_exports);
var import_core6 = require("@photo-sphere-viewer/core");

// src/events.ts
var events_exports = {};
__export(events_exports, {
  SelectHotspot: () => SelectHotspot,
  ViewChanged: () => ViewChanged
});
var import_core = require("@photo-sphere-viewer/core");
var _SelectHotspot = class _SelectHotspot extends import_core.TypedEvent {
  /** @internal */
  constructor(hotspotId) {
    super(_SelectHotspot.type);
    this.hotspotId = hotspotId;
  }
};
_SelectHotspot.type = "select-hotspot";
var SelectHotspot = _SelectHotspot;
var _ViewChanged = class _ViewChanged extends import_core.TypedEvent {
  /** @internal */
  constructor(view) {
    super(_ViewChanged.type);
    this.view = view;
  }
};
_ViewChanged.type = "view-changed";
var ViewChanged = _ViewChanged;

// src/PlanPlugin.ts
var import_core5 = require("@photo-sphere-viewer/core");

// src/components/PlanComponent.ts
var import_core4 = require("@photo-sphere-viewer/core");
var import_leaflet2 = require("leaflet");
var import_three = require("three");

// src/constants.ts
var OSM_LABEL = "OpenStreetMap";
var OSM_URL = "https://tile.openstreetmap.org/{z}/{x}/{y}.png";
var OSM_ATTRIBUTION = '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>';
var MARKER_DATA_KEY = "plan";
var HOTSPOT_GENERATED_ID = "__generated__";
var HOTSPOT_MARKER_ID = "__marker__";

// src/utils.ts
var import_leaflet = require("leaflet");
function gpsToLeaflet(gps) {
  return { lng: gps[0], lat: gps[1], alt: gps[2] };
}
function createLeafletIcon(src, size, className) {
  return new import_leaflet.DivIcon({
    html: src && !src.includes("<svg") ? `<img src="${src}" style="width: 100%; height: 100%">` : src,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    className
  });
}
function getStyle(defaultStyle, style, isHover) {
  return {
    image: isHover ? style.hoverImage ?? style.image ?? defaultStyle.hoverImage ?? defaultStyle.image : style.image ?? defaultStyle.image,
    size: isHover ? style.hoverSize ?? style.size ?? defaultStyle.hoverSize ?? defaultStyle.size : style.size ?? defaultStyle.size,
    color: isHover ? style.hoverColor ?? style.color ?? defaultStyle.hoverColor ?? defaultStyle.color : style.color ?? defaultStyle.color,
    borderColor: isHover ? style.hoverBorderColor ?? style.borderColor ?? defaultStyle.hoverBorderColor ?? defaultStyle.borderColor : style.borderColor ?? defaultStyle.borderColor ?? "transparent",
    borderSize: isHover ? style.hoverBorderSize ?? defaultStyle.hoverBorderSize : style.borderSize ?? defaultStyle.borderSize
  };
}

// src/components/PlanCloseButton.ts
var import_core3 = require("@photo-sphere-viewer/core");

// src/icons/map.svg
var map_default = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="currentColor"><path d="M26.629,3.472c1.493,1.397,2.433,3.378,2.433,5.58c0,0.691-0.093,1.379-0.276,2.045c-0.076,0.273-0.166,0.541-0.271,0.8   l-0.201,0.458l-6.902,12.759l-7.11-13.235c-0.106-0.267-0.191-0.521-0.263-0.783c-0.184-0.663-0.277-1.351-0.277-2.044   c0-2.167,0.909-4.122,2.362-5.515l-4.956-3.195V5.05h-1V0.239L0,5.419V32l10.168-6.339V20.51h1v5.153l9.744,6.074v-4.897h1v4.812   L32,25.597V0L26.629,3.472z M11.168,17.732h-1v-3.564h1V17.732z M11.168,11.391h-1V7.827h1V11.391z"/><circle cx="21.412" cy="8.987" r="2.664"/><path d="M21.412,2.401c-3.667,0-6.65,2.983-6.65,6.65c0,0.603,0.081,1.202,0.241,1.778c0.062,0.227,0.137,0.449,0.222,0.665   l0.209,0.475l5.979,11.043l6.182-11.504c0.085-0.21,0.163-0.442,0.228-0.678c0.16-0.579,0.241-1.177,0.241-1.779   C28.062,5.385,25.079,2.401,21.412,2.401z M21.412,12.651c-2.021,0-3.664-1.644-3.664-3.664s1.644-3.664,3.664-3.664   s3.664,1.644,3.664,3.664S23.433,12.651,21.412,12.651z"/><!-- Created by Icons By Alfredo from the Noun Project --></svg>\n';

// src/components/AbstractPlanButton.ts
var import_core2 = require("@photo-sphere-viewer/core");
var INVERT_POSITIONS = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left"
};
function getButtonPosition(mapPosition, direction) {
  switch (direction) {
    case 1 /* DIAGONAL */:
      return [INVERT_POSITIONS[mapPosition[0]], INVERT_POSITIONS[mapPosition[1]]];
    case 2 /* HORIZONTAL */:
      return [mapPosition[0], INVERT_POSITIONS[mapPosition[1]]];
    case 3 /* VERTICAL */:
      return [INVERT_POSITIONS[mapPosition[0]], mapPosition[1]];
    default:
      return mapPosition;
  }
}
var AbstractPlanButton = class extends import_core2.AbstractComponent {
  constructor(plan, position) {
    super(plan, {});
    this.plan = plan;
    this.position = position;
  }
  applyConfig() {
    this.container.className = `psv-plan__button psv-plan__button--${getButtonPosition(this.plan.config.position, this.position).join("-")}`;
    this.update();
  }
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  update() {
  }
};

// src/components/PlanCloseButton.ts
var PlanCloseButton = class extends AbstractPlanButton {
  constructor(plan) {
    super(plan, 0 /* DEFAULT */);
    this.container.addEventListener("click", (e) => {
      plan.toggleCollapse();
      e.stopPropagation();
    });
  }
  applyConfig() {
    super.applyConfig();
    this.container.classList.add("psv-plan__button-close");
  }
  update() {
    this.container.innerHTML = this.plan.collapsed ? map_default : import_core3.CONSTANTS.ICONS.close;
    this.container.title = this.plan.collapsed ? this.viewer.config.lang["map"] : this.viewer.config.lang.close;
  }
};

// src/icons/layers.svg
var layers_default = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="20 20 60 60" fill="currentColor"><path d="M21.94,40.2,49.22,51.84a2,2,0,0,0,1.57,0L78.06,40.2a2,2,0,0,0,0-3.68L50.78,24.89a2,2,0,0,0-1.57,0L21.94,36.52a2,2,0,0,0,0,3.68Z"/><path d="M76.49,59.8,50,71.1,23.51,59.8a2,2,0,0,0-1.57,3.68L49.22,75.11a2,2,0,0,0,1.57,0L78.06,63.48a2,2,0,0,0-1.57-3.68Z"/><path d="M76.49,48.16,50,59.46,23.51,48.16a2,2,0,0,0-1.57,3.68L49.22,63.48a2,2,0,0,0,1.57,0L78.06,51.84a2,2,0,0,0-1.57-3.68Z"/><!-- Created by Prithvi from the Noun Project --></svg>\n';

// src/components/PlanLayersButton.ts
var PlanLayersButton = class extends AbstractPlanButton {
  constructor(plan) {
    super(plan, 3 /* VERTICAL */);
    this.container.innerHTML = layers_default;
    this.select = document.createElement("select");
    this.select.className = "psv-plan__layers-select";
    const placeholder = document.createElement("option");
    placeholder.disabled = true;
    this.select.appendChild(placeholder);
    this.select.addEventListener("change", () => {
      plan.setLayer(this.select.value);
      this.__setSelected();
    });
    this.container.appendChild(this.select);
    this.hide();
  }
  update() {
    const title = this.viewer.config.lang["mapLayers"];
    this.container.title = title;
    this.select.setAttribute("aria-label", title);
    this.select.querySelector("option").innerText = title;
  }
  setLayers(layers) {
    this.show();
    layers.forEach((title) => {
      const option = document.createElement("option");
      option.value = title;
      option.innerText = title;
      this.select.appendChild(option);
    });
    this.select.value = layers[0];
    this.__setSelected();
  }
  __setSelected() {
    this.select.querySelector("[selected]")?.removeAttribute("selected");
    this.select.querySelector(`[value="${this.select.value}"]`).setAttribute("selected", "selected");
  }
};

// src/icons/maximize.svg
var maximize_default = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M18 0h-6v2h6v6h2V0zM2 18v-6H0v8h8v-2z"/><!-- Created by Stepan Voevodin from the Noun Project --></svg>\n';

// src/icons/minimize.svg
var minimize_default = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M14 6V0h-2v8h8V6zM0 12v2h6v6h2v-8H6z"/><!-- Created by Stepan Voevodin from the Noun Project --></svg>\n';

// src/components/PlanMaximizeButton.ts
var ROTATION = {
  "bottom-left": 0,
  "bottom-right": -90,
  "top-right": 180,
  "top-left": 90
};
var PlanMaximizeButton = class extends AbstractPlanButton {
  constructor(plan) {
    super(plan, 1 /* DIAGONAL */);
    this.container.addEventListener("click", (e) => {
      plan.toggleMaximized();
      e.stopPropagation();
    });
  }
  update() {
    this.container.innerHTML = this.plan.maximized ? minimize_default : maximize_default;
    this.container.querySelector("svg").style.transform = `rotate3d(0, 0, 1, ${ROTATION[this.plan.config.position.join("-")]}deg)`;
    this.container.title = this.plan.maximized ? this.viewer.config.lang["mapMinimize"] : this.viewer.config.lang["mapMaximize"];
  }
};

// src/icons/reset.svg
var reset_default = '<svg viewBox="170 100 360 360" xmlns="http://www.w3.org/2000/svg"><g fill="currentColor"><path d="M518.6 269h-18.5a150.8 150.8 0 0 0-138-137.9v-20.9c0-5.8-4.7-10.6-10.5-10.6h-3.2c-5.8 0-10.6 4.8-10.6 10.6v21A150.8 150.8 0 0 0 200 269h-18.5c-5.9 0-10.6 4.7-10.6 10.6v3.2c0 5.8 4.7 10.5 10.6 10.5h18.5c6 73.4 64.6 132 138 138v18.5c0 5.8 4.7 10.6 10.5 10.6h3.2c5.8 0 10.6-4.8 10.6-10.6v-18.6c73.3-5.9 132-64.5 137.9-137.9h18.5c5.9 0 10.6-4.7 10.6-10.5v-3.2c0-5.9-4.7-10.6-10.6-10.6zM362.2 414.4v-9.8c0-5.9-4.8-10.6-10.6-10.6h-3.2c-5.8 0-10.6 4.7-10.6 10.6v9.8a134 134 0 0 1-121-121h9.8c5.9 0 10.6-4.8 10.6-10.6v-3.2c0-5.9-4.7-10.6-10.6-10.6h-9.8a134 134 0 0 1 121-121v7.5c0 5.8 4.8 10.5 10.6 10.5h3.2c5.8 0 10.6-4.7 10.6-10.5V148a134 134 0 0 1 121 121h-9.8c-5.9 0-10.6 4.7-10.6 10.6v3.2c0 5.8 4.7 10.5 10.6 10.5h9.8a134 134 0 0 1-121 121z"/><path d="M355.4 222a6 6 0 0 0-10.7 0L291 320a8.3 8.3 0 0 0 9.7 12l39.2-11.7c6.6-2 13.6-2 20.2 0l39.2 11.7a8.3 8.3 0 0 0 9.7-12z"/></g><!-- Created by muhammad benani from Noun Project --></svg>\n';

// src/components/PlanResetButton.ts
var PlanResetButton = class extends AbstractPlanButton {
  constructor(plan) {
    super(plan, 2 /* HORIZONTAL */);
    this.container.innerHTML = reset_default;
    this.container.querySelector("svg").style.width = "80%";
    this.container.addEventListener("click", (e) => {
      plan.reset();
      e.stopPropagation();
    });
  }
  update() {
    this.container.title = this.viewer.config.lang["mapReset"];
  }
};

// src/components/PlanComponent.ts
var PlanComponent = class extends import_core4.AbstractComponent {
  constructor(viewer, plugin) {
    super(viewer, {
      className: `psv-plan ${import_core4.CONSTANTS.CAPTURE_EVENTS_CLASS}`
    });
    this.plugin = plugin;
    this.state = {
      visible: false,
      maximized: false,
      collapsed: false,
      galleryWasVisible: false,
      layers: {},
      pinMarker: null,
      hotspots: {},
      hotspotId: null,
      forceRender: false,
      needsUpdate: false,
      renderLoop: null
    };
    viewer.addEventListener(import_core4.events.KeypressEvent.type, this);
    viewer.addEventListener(import_core4.events.ConfigChangedEvent.type, this);
    const mapContainer = document.createElement("div");
    mapContainer.className = "psv-plan__container";
    this.map = new import_leaflet2.Map(mapContainer, {
      attributionControl: false,
      zoomControl: false
    });
    new import_leaflet2.Control.Attribution({ prefix: false }).addTo(this.map);
    this.container.appendChild(mapContainer);
    this.container.addEventListener("transitionstart", this);
    this.container.addEventListener("transitionend", this);
    this.layersButton = new PlanLayersButton(this);
    if (this.config.buttons.reset) {
      this.resetButton = new PlanResetButton(this);
    }
    if (this.config.buttons.maximize) {
      this.maximizeButton = new PlanMaximizeButton(this);
    }
    if (this.config.buttons.close) {
      this.closeButton = new PlanCloseButton(this);
    }
    const renderLoop = () => {
      if (this.isVisible() && (this.state.needsUpdate || this.state.forceRender)) {
        this.map?.invalidateSize();
        this.state.needsUpdate = false;
      }
      this.state.renderLoop = requestAnimationFrame(renderLoop);
    };
    renderLoop();
    this.applyConfig();
    this.hide();
    if (!this.config.visibleOnLoad) {
      this.toggleCollapse();
    }
    if (this.config.configureLeaflet) {
      this.config.configureLeaflet(this.map);
    } else {
      this.__configureLeaflet();
    }
    this.map.fitWorld();
    if (this.config.coordinates) {
      this.recenter();
    }
  }
  get config() {
    return this.plugin.config;
  }
  get maximized() {
    return this.state.maximized;
  }
  get collapsed() {
    return this.state.collapsed;
  }
  init() {
    this.gallery = this.viewer.getPlugin("gallery");
    this.gallery?.addEventListener("show-gallery", this);
    this.gallery?.addEventListener("hide-gallery", this);
  }
  destroy() {
    cancelAnimationFrame(this.state.renderLoop);
    this.viewer.removeEventListener(import_core4.events.KeypressEvent.type, this);
    this.viewer.removeEventListener(import_core4.events.ConfigChangedEvent.type, this);
    this.gallery?.removeEventListener("show-gallery", this);
    this.gallery?.removeEventListener("hide-gallery", this);
    super.destroy();
  }
  handleEvent(e) {
    if (import_core4.utils.getMatchingTarget(e, `.${import_core4.CONSTANTS.CAPTURE_EVENTS_CLASS}:not(.psv-plan)`)) {
      return;
    }
    switch (e.type) {
      case import_core4.events.KeypressEvent.type:
        if (this.state.maximized) {
          this.__onKeyPress(e.key);
          e.preventDefault();
        }
        break;
      case import_core4.events.ConfigChangedEvent.type:
        if (e.containsOptions("lang")) {
          this.resetButton?.update();
          this.closeButton?.update();
          this.layersButton?.update();
          this.maximizeButton?.update();
        }
        break;
      case "transitionstart":
        this.state.forceRender = true;
        break;
      case "transitionend":
        this.state.forceRender = false;
        break;
      case "hide-gallery":
        this.__onToggleGallery(false);
        break;
      case "show-gallery":
        if (!e.fullscreen) {
          this.__onToggleGallery(true);
        }
        break;
    }
  }
  /**
   * Applies default configuration
   */
  __configureLeaflet() {
    this.state.layers = this.config.layers.reduce((acc, layer, i) => {
      if (!layer.name) {
        layer.name = `Layer ${i + 1}`;
      }
      if (layer.urlTemplate) {
        acc[layer.name] = new import_leaflet2.TileLayer(layer.urlTemplate, { attribution: layer.attribution });
      } else if (layer.layer) {
        if (layer.attribution) {
          layer.layer.options.attribution = layer.attribution;
        }
        acc[layer.name] = layer.layer;
      } else {
        import_core4.utils.logWarn(`Layer #${i} is missing "urlTemplate" or "layer" property.`);
      }
      return acc;
    }, {});
    if (!Object.values(this.state.layers).length) {
      import_core4.utils.logWarn(`No layer configured, fallback to OSM.`);
      this.state.layers[OSM_LABEL] = new import_leaflet2.TileLayer(OSM_URL, { attribution: OSM_ATTRIBUTION });
    }
    const layersNames = Object.keys(this.state.layers);
    this.setLayer(layersNames[0]);
    if (layersNames.length > 1) {
      this.layersButton.setLayers(layersNames);
    }
  }
  applyConfig() {
    this.container.classList.remove(
      "psv-plan--top-right",
      "psv-plan--top-left",
      "psv-plan--bottom-right",
      "psv-plan--bottom-left"
    );
    this.container.classList.add(`psv-plan--${this.config.position.join("-")}`);
    this.container.style.width = this.config.size.width;
    this.container.style.height = this.config.size.height;
    this.layersButton.applyConfig();
    this.resetButton?.applyConfig();
    this.closeButton?.applyConfig();
    this.maximizeButton?.applyConfig();
    this.state.needsUpdate = true;
  }
  /**
   * Force re-creation of the central pin
   */
  updatePin() {
    if (this.state.pinMarker) {
      this.state.pinMarker.remove();
      this.state.pinMarker = null;
    }
    this.recenter();
  }
  /**
   * Force re-creation of hotspots
   */
  updateSpots() {
    this.setHotspots(Object.values(this.state.hotspots).filter(({ isMarker }) => !isMarker).map(({ hotspot }) => hotspot));
    this.setMarkers(Object.values(this.state.hotspots).filter(({ isMarker }) => isMarker).map(({ hotspot }) => hotspot));
  }
  isVisible() {
    return this.state.visible && !this.state.collapsed;
  }
  show() {
    super.show();
    this.state.needsUpdate = true;
  }
  hide() {
    super.hide();
    this.state.forceRender = false;
  }
  /**
   * Rotates the central pin
   */
  updateBearing(position = this.viewer.getPosition()) {
    if (this.state.pinMarker) {
      const elt = this.state.pinMarker.getElement().firstElementChild;
      elt.style.rotate = import_three.MathUtils.radToDeg(position.yaw + this.config.bearing) + "deg";
    }
  }
  /**
   * Changes the base layer
   */
  setLayer(name) {
    Object.values(this.state.layers).forEach((layer) => {
      if (this.map.hasLayer(layer)) {
        this.map.removeLayer(layer);
      }
    });
    this.map.addLayer(this.state.layers[name]);
  }
  /**
   * Resets the map position and zoom level
   */
  reset() {
    this.map?.setView(gpsToLeaflet(this.config.coordinates), this.config.defaultZoom);
  }
  /**
   * Moves the position pin and resets the map position
   */
  recenter() {
    const pos = gpsToLeaflet(this.config.coordinates);
    if (!this.state.pinMarker) {
      const icon = createLeafletIcon(this.config.pinImage, this.config.pinSize, "psv-plan__pin");
      this.state.pinMarker = new import_leaflet2.Marker(pos, {
        icon,
        alt: ""
      }).addTo(this.map);
      this.updateBearing();
    } else {
      this.state.pinMarker.setLatLng(pos);
    }
    if (this.map.getZoom() < 10) {
      this.reset();
    } else {
      this.map.setView(pos);
    }
  }
  /**
   * Switch collapsed mode
   */
  toggleCollapse() {
    if (this.state.maximized) {
      this.toggleMaximized(false);
    }
    this.state.collapsed = !this.state.collapsed;
    import_core4.utils.toggleClass(this.container, "psv-plan--collapsed", this.state.collapsed);
    if (!this.state.collapsed) {
      this.reset();
      this.plugin.dispatchEvent(new ViewChanged("normal"));
    } else {
      this.plugin.dispatchEvent(new ViewChanged("closed"));
    }
    this.closeButton?.update();
  }
  /**
   * Switch maximized mode
   */
  toggleMaximized(dispatchMinimizeEvent = true) {
    if (this.state.collapsed) {
      return;
    }
    this.state.maximized = !this.state.maximized;
    import_core4.utils.toggleClass(this.container, "psv-plan--maximized", this.state.maximized);
    if (this.state.maximized) {
      this.state.galleryWasVisible = this.gallery?.isVisible();
      this.gallery?.hide();
      this.map.getContainer().focus();
      this.plugin.dispatchEvent(new ViewChanged("maximized"));
    } else {
      this.map.getContainer().blur();
      if (this.state.galleryWasVisible) {
        this.gallery.show();
      }
      if (dispatchMinimizeEvent) {
        this.plugin.dispatchEvent(new ViewChanged("normal"));
      }
    }
    this.maximizeButton?.update();
  }
  /**
   * Changes the zoom level
   */
  zoom(d) {
    this.map.setZoom(d);
  }
  /**
   * Updates the markers
   */
  setMarkers(markers) {
    this.__setHotspots(markers, true);
  }
  /**
   * Changes the highlighted hotspot
   */
  setActiveHotspot(hotspotId) {
    if (this.state.hotspotId) {
      this.__applyStyle(this.state.hotspotId, false);
    }
    if (hotspotId) {
      this.__applyStyle(hotspotId, true);
    }
    this.state.hotspotId = hotspotId;
  }
  /**
   * Changes the hotspots
   */
  setHotspots(hotspots) {
    this.__setHotspots(hotspots, false);
  }
  __setHotspots(hotspots, isMarkers) {
    Object.entries(this.state.hotspots).filter(([, { isMarker }]) => isMarker === isMarkers).forEach(([id, { marker }]) => {
      marker.off();
      marker.remove();
      delete this.state.hotspots[id];
    });
    hotspots.forEach((hotspot) => {
      const style = getStyle(this.config.spotStyle, hotspot, false);
      const icon = createLeafletIcon(style.image || "", style.size, "psv-plan__spot");
      const marker = new import_leaflet2.Marker(gpsToLeaflet(hotspot.coordinates), {
        icon,
        alt: ""
      }).addTo(this.map);
      if (hotspot.tooltip) {
        if (typeof hotspot.tooltip === "string") {
          hotspot.tooltip = { content: hotspot.tooltip };
        }
        marker.bindTooltip(hotspot.tooltip.content, {
          className: hotspot.tooltip.className,
          direction: "top",
          offset: [0, -style.size / 2]
        });
      }
      marker.on("click", () => this.__clickHotspot(hotspot.id));
      marker.on("mouseover", () => this.setActiveHotspot(hotspot.id));
      marker.on("mouseout", () => this.setActiveHotspot(null));
      this.state.hotspots[hotspot.id] = {
        hotspot,
        marker,
        isMarker: isMarkers
      };
      this.__applyStyle(hotspot.id, false);
    });
  }
  /**
   * Updates the style of a map marker
   */
  __applyStyle(hotspotId, hover) {
    const hotspot = this.state.hotspots[hotspotId]?.hotspot;
    const element = this.state.hotspots[hotspotId]?.marker.getElement();
    if (!hotspot) {
      return;
    }
    const style = getStyle(this.config.spotStyle, hotspot, hover);
    element.style.width = style.size + "px";
    element.style.height = style.size + "px";
    element.style.marginTop = -style.size / 2 + "px";
    element.style.marginLeft = -style.size / 2 + "px";
    if (!style.image) {
      element.style.backgroundColor = style.color;
      element.style.outlineStyle = "solid";
      element.style.outlineColor = style.borderColor;
      element.style.outlineWidth = style.borderSize + "px";
    } else {
      element.firstElementChild.src = style.image;
    }
  }
  /**
   * Dispatch event when a hotspot is clicked
   */
  __clickHotspot(hotspotId) {
    this.plugin.dispatchEvent(new SelectHotspot(hotspotId));
    if (hotspotId.startsWith(HOTSPOT_MARKER_ID)) {
      const markerId = hotspotId.substring(HOTSPOT_MARKER_ID.length);
      this.viewer.getPlugin("markers").gotoMarker(markerId);
    }
    if (this.maximized && this.config.minimizeOnHotspotClick) {
      this.toggleMaximized();
    }
  }
  __onToggleGallery(visible) {
    if (!visible) {
      this.container.style.marginBottom = "";
    } else {
      this.container.style.marginBottom = this.viewer.container.querySelector(".psv-gallery").offsetHeight + 10 + "px";
    }
  }
  __onKeyPress(key) {
    if (key === import_core4.CONSTANTS.KEY_CODES.Escape) {
      this.toggleMaximized();
      return;
    }
  }
};

// src/icons/pin.svg
var pin_default = '<svg viewBox="0 0 700 700" xmlns="http://www.w3.org/2000/svg">\n    <circle cx="350" cy="350" r="160" fill="white"/>\n    <circle cx="350" cy="350" r="120" fill="#1E78E6"/>\n    <path fill="rgba(255,255,255,0.8)" d="M222,222 L103,103 A353,353,0,0,1,597,103 L478,222 A180,180,0,0,0,222,222"/>\n</svg>\n';

// src/PlanPlugin.ts
var getConfig = import_core5.utils.getConfigParser(
  {
    coordinates: null,
    bearing: 0,
    size: { width: "300px", height: "200px" },
    position: ["bottom", "left"],
    visibleOnLoad: true,
    pinImage: pin_default,
    pinSize: 35,
    spotStyle: {
      size: 15,
      image: null,
      color: "white",
      borderSize: 0,
      borderColor: null,
      hoverSize: null,
      hoverImage: null,
      hoverColor: null,
      hoverBorderSize: 4,
      hoverBorderColor: "rgba(255, 255, 255, 0.8)"
    },
    defaultZoom: 15,
    layers: [{
      urlTemplate: OSM_URL,
      attribution: OSM_ATTRIBUTION,
      name: OSM_LABEL
    }],
    configureLeaflet: null,
    hotspots: [],
    minimizeOnHotspotClick: true,
    buttons: {
      maximize: true,
      close: true,
      reset: true
    }
  },
  {
    spotStyle: (spotStyle, { defValue }) => ({ ...defValue, ...spotStyle }),
    position: (position, { defValue }) => {
      return import_core5.utils.cleanCssPosition(position, { allowCenter: false, cssOrder: true }) || defValue;
    },
    bearing: (bearing) => import_core5.utils.parseAngle(bearing),
    buttons: (buttons, { defValue }) => ({ ...defValue, ...buttons })
  }
);
var PlanPlugin = class extends import_core5.AbstractConfigurablePlugin {
  constructor(viewer, config) {
    super(viewer, config);
    this.component = new PlanComponent(this.viewer, this);
  }
  /**
   * @internal
   */
  init() {
    super.init();
    import_core5.utils.checkStylesheet(this.viewer.container, "plan-plugin");
    this.component.init();
    this.markers = this.viewer.getPlugin("markers");
    this.viewer.addEventListener(import_core5.events.PositionUpdatedEvent.type, this);
    this.viewer.addEventListener(import_core5.events.ReadyEvent.type, this, { once: true });
    this.markers?.addEventListener("set-markers", this);
    this.setHotspots(this.config.hotspots);
  }
  /**
   * @internal
   */
  destroy() {
    this.viewer.removeEventListener(import_core5.events.PositionUpdatedEvent.type, this);
    this.viewer.removeEventListener(import_core5.events.ReadyEvent.type, this);
    this.markers?.removeEventListener("set-markers", this);
    this.component.destroy();
    super.destroy();
  }
  /**
   * @internal
   */
  handleEvent(e) {
    switch (e.type) {
      case import_core5.events.ReadyEvent.type:
        this.component.show();
        break;
      case import_core5.events.PositionUpdatedEvent.type:
        this.component.updateBearing(e.position);
        break;
      case "set-markers":
        this.component.setMarkers(this.__markersToHotspots(e.markers));
        break;
      default:
        break;
    }
  }
  setOptions(options) {
    super.setOptions(options);
    if (options.coordinates) {
      this.component.recenter();
    }
    if (!import_core5.utils.isNil(options.bearing)) {
      this.component.updateBearing();
    }
    if (options.pinImage || options.pinSize) {
      this.component.updatePin();
    }
    if (options.spotStyle) {
      this.component.updateSpots();
    }
    if (options.hotspots !== void 0) {
      this.setHotspots(options.hotspots);
    }
    this.component.applyConfig();
  }
  /**
   * Hides the map
   */
  hide() {
    this.component.hide();
  }
  /**
   * Shows the map
   */
  show() {
    this.component.show();
  }
  /**
   * Changes the current zoom level
   */
  setZoom(level) {
    this.component.zoom(level);
  }
  /**
   * Closes the map
   */
  close() {
    if (!this.component.collapsed) {
      this.component.toggleCollapse();
    }
  }
  /**
   * Open the map
   */
  open() {
    if (this.component.collapsed) {
      this.component.toggleCollapse();
    }
  }
  /**
   * Minimizes the map
   */
  minimize() {
    if (this.component.maximized) {
      this.component.toggleMaximized();
    }
  }
  /**
   * Maximizes the map
   */
  maximize() {
    if (!this.component.maximized) {
      this.component.toggleMaximized();
    }
  }
  /**
   * Changes the position on the map
   */
  setCoordinates(coordinates) {
    this.config.coordinates = coordinates;
    this.component.recenter();
  }
  /**
   * Changes the hotspots on the map
   */
  setHotspots(hotspots) {
    const ids = [];
    let i = 1;
    hotspots?.forEach((hotspot) => {
      if (!hotspot.id) {
        hotspot.id = HOTSPOT_GENERATED_ID + i++;
      } else if (ids.includes(hotspot.id)) {
        import_core5.utils.logWarn(`Duplicated hotspot id "${hotspot.id}`);
      } else {
        ids.push(hotspot.id);
      }
    });
    this.config.hotspots = hotspots || [];
    this.component.setHotspots(this.config.hotspots);
  }
  /**
   * Removes all hotspots
   */
  clearHotspots() {
    this.setHotspots(null);
  }
  /**
   * Changes the highlighted hotspot
   */
  setActiveHotspot(hotspotId) {
    this.component.setActiveHotspot(hotspotId);
  }
  /**
   * Returns the Leaflet instance
   */
  getLeaflet() {
    return this.component.map;
  }
  __markersToHotspots(markers) {
    return markers.filter((marker) => marker.data?.[MARKER_DATA_KEY]).map((marker) => {
      const hotspot = {
        ...marker.data[MARKER_DATA_KEY],
        id: HOTSPOT_MARKER_ID + marker.id,
        tooltip: marker.config.tooltip
      };
      if (!hotspot.coordinates) {
        import_core5.utils.logWarn(`Marker #${marker.id} "plan" data is missing GPS coordinates`);
        return null;
      }
      return hotspot;
    }).filter((h) => h);
  }
};
PlanPlugin.id = "plan";
PlanPlugin.VERSION = "5.13.3";
PlanPlugin.configParser = getConfig;
PlanPlugin.readonlyOptions = [
  "visibleOnLoad",
  "defaultZoom",
  "layers",
  "configureLeaflet",
  "buttons"
];

// src/index.ts
import_core6.DEFAULTS.lang["map"] = "Map";
import_core6.DEFAULTS.lang["mapMaximize"] = "Maximize";
import_core6.DEFAULTS.lang["mapMinimize"] = "Minimize";
import_core6.DEFAULTS.lang["mapReset"] = "Reset";
import_core6.DEFAULTS.lang["mapLayers"] = "Base layer";
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  PlanPlugin,
  events
});
//# sourceMappingURL=index.cjs.map