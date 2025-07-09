import { PanoData, PanoDataProvider, AbstractPlugin, Viewer, TypedEvent } from '@photo-sphere-viewer/core';

type Resolution = {
    id: string;
    label: string;
    panorama: any;
    panoData?: PanoData | PanoDataProvider;
};
type ResolutionPluginConfig = {
    /**
     * list of available resolutions
     */
    resolutions: Resolution[];
    /**
     * the default resolution if no panorama is configured on the viewer
     */
    defaultResolution?: string;
    /**
     * show the resolution id as a badge on the settings button
     * @default true
     */
    showBadge?: boolean;
};

/**
 *  Adds a setting to choose between multiple resolutions of the panorama.
 */
declare class ResolutionPlugin extends AbstractPlugin<ResolutionPluginEvents> {
    static readonly id = "resolution";
    static readonly VERSION: string;
    readonly config: ResolutionPluginConfig;
    private resolutions;
    private resolutionsById;
    private readonly state;
    private settings;
    constructor(viewer: Viewer, config: ResolutionPluginConfig);
    /**
     * Changes the available resolutions
     * @param resolutions
     * @param defaultResolution - if not provided, the current panorama is kept
     * @throws {@link PSVError} if the configuration is invalid
     */
    setResolutions(resolutions: Resolution[], defaultResolution?: string): void;
    /**
     * Changes the current resolution
     * @throws {@link PSVError} if the resolution does not exist
     */
    setResolution(id: string): Promise<unknown>;
    private __setResolutionIfExists;
    /**
     * Returns the current resolution
     */
    getResolution(): string;
    /**
     * Updates current resolution on panorama load
     */
    private __refreshResolution;
}

/**
 * @event Triggered when the resolution is changed
 */
declare class ResolutionChangedEvent extends TypedEvent<ResolutionPlugin> {
    readonly resolutionId: string;
    static readonly type = "resolution-changed";
    type: 'resolution-changed';
}
type ResolutionPluginEvents = ResolutionChangedEvent;

type events_ResolutionChangedEvent = ResolutionChangedEvent;
declare const events_ResolutionChangedEvent: typeof ResolutionChangedEvent;
type events_ResolutionPluginEvents = ResolutionPluginEvents;
declare namespace events {
  export { events_ResolutionChangedEvent as ResolutionChangedEvent, type events_ResolutionPluginEvents as ResolutionPluginEvents };
}

export { type Resolution, ResolutionPlugin, type ResolutionPluginConfig, events };
