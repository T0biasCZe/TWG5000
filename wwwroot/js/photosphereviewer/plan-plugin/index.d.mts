import { CssSize, AbstractComponent, Viewer, Position, AbstractConfigurablePlugin, utils, TypedEvent } from '@photo-sphere-viewer/core';
import { Layer, Map, Marker } from 'leaflet';

/**
  * Definition of GPS coordinates (longitude, latitude, optional altitude)
  */
type GpsPosition = [number, number, number?];
type PlanHotspotStyle = {
    /**
     * Size of the hotspot
     * @default 15
     */
    size?: number;
    /**
     * SVG or image URL used for hotspot
     */
    image?: string;
    /**
     * Color of the hotspot when no image is provided
     * @default 'white'
     */
    color?: string;
    /**
     * Size of the border
     * @default 0
     */
    borderSize?: number;
    /**
     * Color of the border
     * @default null
     */
    borderColor?: string;
    /**
     * Size on mouse hover
     * @default null
     */
    hoverSize?: number;
    /**
     * SVG or image URL on mouse hover
     * @default null
     */
    hoverImage?: string;
    /**
     * Color on mouse hover
     * @default null
     */
    hoverColor?: string;
    /**
     * Size of the border on mouse hover
     * @default 4
     */
    hoverBorderSize?: number;
    /**
     * Color of the border on mouse hover
     * @default 'rgba(255, 255, 255, 0.8)'
     */
    hoverBorderColor?: string;
};
type PlanHotspot = PlanHotspotStyle & {
    /**
     * GPS coordinates of the marker
     */
    coordinates: GpsPosition;
    /**
     * Unique identifier for the {@link SelectHotspot} event
     */
    id?: string;
    /**
     * Tooltip visible on the map
     */
    tooltip?: string | {
        content: string;
        className?: string;
    };
};
type PlanLayer = {
    urlTemplate?: string;
    layer?: Layer;
    name?: string;
    attribution?: string;
};
type PlanPluginConfig = {
    /**
     * GPS position of the current panorama
     */
    coordinates?: GpsPosition;
    /**
     * Rotation offset to apply to the central pin
     * @default 0
     */
    bearing?: string | number;
    /**
     * Size of the map
     * @default '300px * 200px'
     */
    size?: CssSize;
    /**
     * Position of the map
     * @default 'bottom left'
     */
    position?: string | [string, string];
    /**
     * Displays the map when loading the first panorama
     * @default true
     */
    visibleOnLoad?: boolean;
    /**
     * SVG or image URL used for the central pin (must be square)
     */
    pinImage?: string;
    /**
     * Size of the central pin
     * @default 35
     */
    pinSize?: number;
    /**
     * Default style of hotspots
     */
    spotStyle?: PlanHotspotStyle;
    /**
     * Default zoom level
     * @default 15
     */
    defaultZoom?: number;
    /**
     * Define the available layers
     * @default OpenStreetMap
     */
    layers?: PlanLayer[];
    /**
     * Let you configure Leaflet from scratch
     */
    configureLeaflet?: (map: Map) => void;
    /**
     * Points of interest on the map
     */
    hotspots?: PlanHotspot[];
    /**
     * Always minimize the map when an hotspot/marker is clicked
     */
    minimizeOnHotspotClick?: boolean;
    /**
     * Configuration of map buttons
     */
    buttons?: {
        /** @default true */
        maximize?: boolean;
        /** @default true */
        close?: boolean;
        /** @default true */
        reset?: boolean;
    };
};
type ParsedPlanPluginConfig = Omit<PlanPluginConfig, 'position' | 'bearing'> & {
    position: [string, string];
    bearing: number;
};
type UpdatablePlanPluginConfig = Omit<PlanPluginConfig, 'visibleOnLoad' | 'defaultZoom' | 'layers' | 'configureLeaflet' | 'buttons'>;

declare class PlanComponent extends AbstractComponent {
    private plugin;
    protected readonly state: {
        visible: boolean;
        maximized: boolean;
        collapsed: boolean;
        galleryWasVisible: boolean;
        layers: Record<string, Layer>;
        pinMarker: Marker;
        hotspots: Record<string, {
            hotspot: PlanHotspot;
            marker: Marker;
            isMarker: boolean;
        }>;
        hotspotId: string;
        forceRender: boolean;
        needsUpdate: boolean;
        renderLoop: ReturnType<typeof requestAnimationFrame>;
    };
    private gallery?;
    readonly map: Map;
    private readonly resetButton;
    private readonly closeButton;
    private readonly maximizeButton;
    private readonly layersButton;
    get config(): ParsedPlanPluginConfig;
    get maximized(): boolean;
    get collapsed(): boolean;
    constructor(viewer: Viewer, plugin: PlanPlugin);
    init(): void;
    destroy(): void;
    handleEvent(e: Event): void;
    /**
     * Applies default configuration
     */
    private __configureLeaflet;
    applyConfig(): void;
    /**
     * Force re-creation of the central pin
     */
    updatePin(): void;
    /**
     * Force re-creation of hotspots
     */
    updateSpots(): void;
    isVisible(): boolean;
    show(): void;
    hide(): void;
    /**
     * Rotates the central pin
     */
    updateBearing(position?: Position): void;
    /**
     * Changes the base layer
     */
    setLayer(name: string): void;
    /**
     * Resets the map position and zoom level
     */
    reset(): void;
    /**
     * Moves the position pin and resets the map position
     */
    recenter(): void;
    /**
     * Switch collapsed mode
     */
    toggleCollapse(): void;
    /**
     * Switch maximized mode
     */
    toggleMaximized(dispatchMinimizeEvent?: boolean): void;
    /**
     * Changes the zoom level
     */
    zoom(d: number): void;
    /**
     * Updates the markers
     */
    setMarkers(markers: PlanHotspot[]): void;
    /**
     * Changes the highlighted hotspot
     */
    setActiveHotspot(hotspotId: string): void;
    /**
     * Changes the hotspots
     */
    setHotspots(hotspots: PlanHotspot[]): void;
    private __setHotspots;
    /**
     * Updates the style of a map marker
     */
    private __applyStyle;
    /**
     * Dispatch event when a hotspot is clicked
     */
    private __clickHotspot;
    private __onToggleGallery;
    private __onKeyPress;
}

/**
 * Adds a map on the viewer
 */
declare class PlanPlugin extends AbstractConfigurablePlugin<PlanPluginConfig, ParsedPlanPluginConfig, UpdatablePlanPluginConfig, PlanPluginEvents> {
    static readonly id = "plan";
    static readonly VERSION: string;
    static readonly configParser: utils.ConfigParser<PlanPluginConfig, PlanPluginConfig>;
    static readonly readonlyOptions: Array<keyof PlanPluginConfig>;
    private markers?;
    readonly component: PlanComponent;
    constructor(viewer: Viewer, config: PlanPluginConfig);
    setOptions(options: Partial<PlanPluginConfig>): void;
    /**
     * Hides the map
     */
    hide(): void;
    /**
     * Shows the map
     */
    show(): void;
    /**
     * Changes the current zoom level
     */
    setZoom(level: number): void;
    /**
     * Closes the map
     */
    close(): void;
    /**
     * Open the map
     */
    open(): void;
    /**
     * Minimizes the map
     */
    minimize(): void;
    /**
     * Maximizes the map
     */
    maximize(): void;
    /**
     * Changes the position on the map
     */
    setCoordinates(coordinates: GpsPosition): void;
    /**
     * Changes the hotspots on the map
     */
    setHotspots(hotspots: PlanHotspot[] | null): void;
    /**
     * Removes all hotspots
     */
    clearHotspots(): void;
    /**
     * Changes the highlighted hotspot
     */
    setActiveHotspot(hotspotId: string | null): void;
    /**
     * Returns the Leaflet instance
     */
    getLeaflet(): Map;
    private __markersToHotspots;
}

/**
 * @event Triggered when the user clicks on a hotspot
 */
declare class SelectHotspot extends TypedEvent<PlanPlugin> {
    readonly hotspotId: string;
    static readonly type = "select-hotspot";
    type: 'select-hotspot';
}
/**
 * @event Triggered when the size of the map changes
 */
declare class ViewChanged extends TypedEvent<PlanPlugin> {
    readonly view: 'closed' | 'normal' | 'maximized';
    static readonly type = "view-changed";
    type: 'view-changed';
}
type PlanPluginEvents = SelectHotspot | ViewChanged;

type events_PlanPluginEvents = PlanPluginEvents;
type events_SelectHotspot = SelectHotspot;
declare const events_SelectHotspot: typeof SelectHotspot;
type events_ViewChanged = ViewChanged;
declare const events_ViewChanged: typeof ViewChanged;
declare namespace events {
  export { type events_PlanPluginEvents as PlanPluginEvents, events_SelectHotspot as SelectHotspot, events_ViewChanged as ViewChanged };
}

export { type GpsPosition, type ParsedPlanPluginConfig, type PlanHotspot, type PlanHotspotStyle, type PlanLayer, PlanPlugin, type PlanPluginConfig, type UpdatablePlanPluginConfig, events };
