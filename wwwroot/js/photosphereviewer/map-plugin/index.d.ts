import { Point, AbstractComponent, Tooltip, Viewer, AbstractConfigurablePlugin, utils, TypedEvent } from '@photo-sphere-viewer/core';

type MapHotspotStyle = {
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
     * @default 'rgba(255, 255, 255, 0.6)'
     */
    hoverBorderColor?: string;
    /**
     * Stacking position of the hotpost, defaults to declaration order
     * @default null
     */
    zIndex?: number;
};
type MapHotspot = (Point | {
    yaw: number | string;
    distance: number;
}) & MapHotspotStyle & {
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
type MapPluginConfig = {
    /**
     * URL of the map
     */
    imageUrl?: string;
    /**
     * The position of the panorama on the map
     */
    center?: Point;
    /**
     * Rotation to apply to the image
     * @default 0
     */
    rotation?: string | number;
    /**
     * @default 'round'
     */
    shape?: 'round' | 'square';
    /**
     * Size of the map
     * @default '200px'
     */
    size?: string;
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
     * SVG or image URL drawn on top of the map (must be square)
     */
    overlayImage?: string;
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
     * Color of the cone of the compass
     * @default '#1E78E6'
     */
    coneColor?: string;
    /**
     * Size of the cone of the compass
     * @default 40
     */
    coneSize?: number;
    /**
     * Default style of hotspots
     */
    spotStyle?: MapHotspotStyle;
    /**
     * Make the map static and rotate the pin instead
     * @default false
     */
    static?: boolean;
    /**
     * Default zoom level
     * @default 100
     */
    defaultZoom?: number;
    /**
     * Minimum zoom level
     * @default 20
     */
    minZoom?: number;
    /**
     * Maximum zoom level
     * @default 200
     */
    maxZoom?: number;
    /**
     * Points of interest on the map
     */
    hotspots?: MapHotspot[];
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
        /** @default true */
        north?: boolean;
    };
};
type ParsedMapPluginConfig = Omit<MapPluginConfig, 'position' | 'rotation'> & {
    position: [string, string];
    rotation: number;
};
type UpdatableMapPluginConfig = Omit<MapPluginConfig, 'imageUrl' | 'visibleOnLoad' | 'defaultZoom' | 'buttons'>;

type ImageSource = HTMLImageElement | HTMLCanvasElement;

declare class MapComponent extends AbstractComponent {
    private plugin;
    protected readonly state: {
        visible: boolean;
        maximized: boolean;
        collapsed: boolean;
        galleryWasVisible: boolean;
        imgScale: number;
        zoom: number;
        offset: Point;
        mouseX: number;
        mouseY: number;
        mousedown: boolean;
        pinchDist: number;
        pinchAngle: number;
        hotspotPos: Record<string, Point & {
            s: number;
        }>;
        hotspotId: string;
        hotspotTooltip: Tooltip;
        markers: MapHotspot[];
        forceRender: boolean;
        needsUpdate: boolean;
        renderLoop: ReturnType<typeof requestAnimationFrame>;
        images: Record<string, {
            loading: boolean;
            value: ImageSource;
        }>;
    };
    private gallery?;
    private readonly canvas;
    private readonly overlay;
    private readonly resetButton;
    private readonly maximizeButton;
    private readonly closeButton;
    private readonly compassButton;
    private readonly zoomToolbar;
    get config(): ParsedMapPluginConfig;
    get maximized(): boolean;
    get collapsed(): boolean;
    constructor(viewer: Viewer, plugin: MapPlugin);
    init(): void;
    destroy(): void;
    handleEvent(e: Event): void;
    applyConfig(): void;
    isVisible(): boolean;
    show(): void;
    hide(): void;
    /**
     * Flag for render
     */
    update(clear?: boolean): void;
    /**
     * Load a new map image
     */
    reload(url: string): void;
    /**
     * Clears the offset and zoom level
     */
    reset(): void;
    /**
     * Clears the offset
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
     * Changes the zoom level
     */
    setZoom(value: number): void;
    /**
     * Updates the markers
     */
    setMarkers(markers: MapHotspot[]): void;
    /**
     * Changes the highlighted hotspot
     */
    setActiveHotspot(hotspotId: string): void;
    private render;
    /**
     * Applies mouse movement to the map
     */
    private __move;
    /**
     * Finds the hotspot under the mouse
     */
    private __findHotspot;
    /**
     * Updates current hotspot on mouse move and displays tooltip
     */
    private __handleHotspots;
    /**
     * Dispatch event when a hotspot is clicked
     */
    private __clickHotspot;
    private __resetHotspot;
    /**
     * Loads an image and returns the result **synchronously**.
     * If the image is not already loaded it returns `null` and schedules a new render when the image is ready.
     */
    private __loadImage;
    private __onKeyPress;
    private __setCursor;
    private __onToggleGallery;
}

/**
 * Adds a minimap on the viewer
 */
declare class MapPlugin extends AbstractConfigurablePlugin<MapPluginConfig, ParsedMapPluginConfig, UpdatableMapPluginConfig, MapPluginEvents> {
    static readonly id = "map";
    static readonly VERSION: string;
    static readonly configParser: utils.ConfigParser<MapPluginConfig, ParsedMapPluginConfig>;
    static readonly readonlyOptions: Array<keyof MapPluginConfig>;
    private markers?;
    readonly component: MapComponent;
    constructor(viewer: Viewer, config: MapPluginConfig);
    setOptions(options: Partial<UpdatableMapPluginConfig>): void;
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
     * Changes the image of the map
     * @param rotation Also change the image rotation
     * @param center Also change the position on the map
     */
    setImage(url: string, center?: Point, rotation?: string | number): void;
    /**
     * Changes the position on the map
     */
    setCenter(center: Point): void;
    /**
     * Changes the hotspots on the map
     */
    setHotspots(hotspots: MapHotspot[] | null, render?: boolean): void;
    /**
     * Removes all hotspots
     */
    clearHotspots(): void;
    /**
     * Changes the highlighted hotspot
     */
    setActiveHotspot(hotspotId: string | null): void;
    private __markersToHotspots;
}

/**
 * @event Triggered when the user clicks on a hotspot
 */
declare class SelectHotspot extends TypedEvent<MapPlugin> {
    readonly hotspotId: string;
    static readonly type = "select-hotspot";
    type: 'select-hotspot';
}
/**
 * @event Triggered when the size of the map changes
 */
declare class ViewChanged extends TypedEvent<MapPlugin> {
    readonly view: 'closed' | 'normal' | 'maximized';
    static readonly type = "view-changed";
    type: 'view-changed';
}
type MapPluginEvents = SelectHotspot | ViewChanged;

type events_MapPluginEvents = MapPluginEvents;
type events_SelectHotspot = SelectHotspot;
declare const events_SelectHotspot: typeof SelectHotspot;
type events_ViewChanged = ViewChanged;
declare const events_ViewChanged: typeof ViewChanged;
declare namespace events {
  export { type events_MapPluginEvents as MapPluginEvents, events_SelectHotspot as SelectHotspot, events_ViewChanged as ViewChanged };
}

export { type MapHotspot, type MapHotspotStyle, MapPlugin, type MapPluginConfig, type ParsedMapPluginConfig, type UpdatableMapPluginConfig, events };
