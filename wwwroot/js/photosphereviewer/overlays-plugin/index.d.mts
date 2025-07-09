import { AdapterConstructor, AbstractConfigurablePlugin, utils, Viewer, TypedEvent } from '@photo-sphere-viewer/core';
import { CubemapPanorama } from '@photo-sphere-viewer/cubemap-adapter';

type BaseOverlayConfig = {
    id?: string;
    /**
     * @default 1
     */
    opacity?: number;
    /**
     * @default 0
     */
    zIndex?: number;
};
/**
 * Overlay applied on a sphere, complete or partial
 */
type SphereOverlayConfig = BaseOverlayConfig & {
    path: string;
};
/**
 * Overlay applied on a whole cube (6 images)
 */
type CubeOverlayConfig = BaseOverlayConfig & {
    path: CubemapPanorama;
};
type OverlayConfig = SphereOverlayConfig | CubeOverlayConfig;
type OverlaysPluginConfig = {
    /**
     * Initial overlays
     */
    overlays?: OverlayConfig[];
    /**
     * Automatically remove all overlays when the panorama changes
     * @default true
     */
    autoclear?: boolean;
    /**
     * Applies the global "sphereCorrection" to each overlay
     * @default true
     */
    inheritSphereCorrection?: boolean;
    /**
     * Used to display cubemap overlays on equirectangular panoramas
     */
    cubemapAdapter?: AdapterConstructor;
};
type UpdatableOverlaysPluginConfig = Omit<OverlaysPluginConfig, 'overlays' | 'cubemapAdapter' | 'inheritSphereCorrection'>;

/**
 * Adds various overlays over the panorama
 */
declare class OverlaysPlugin extends AbstractConfigurablePlugin<OverlaysPluginConfig, OverlaysPluginConfig, UpdatableOverlaysPluginConfig, OverlaysPluginEvents> {
    static readonly id = "overlays";
    static readonly VERSION: string;
    static configParser: utils.ConfigParser<OverlaysPluginConfig, OverlaysPluginConfig>;
    static readonlyOptions: Array<keyof OverlaysPluginConfig>;
    private readonly state;
    private cubemapAdapter;
    private equirectangularAdapter;
    constructor(viewer: Viewer, config?: OverlaysPluginConfig);
    addEventListener<T extends OverlaysPluginEvents['type'], E extends OverlayClickEvent & {
        type: T;
    }>(type: T, callback: EventListenerObject | ((e: E) => void), options?: AddEventListenerOptions | boolean): void;
    /**
     * Adds a new overlay
     */
    addOverlay(config: OverlayConfig): void;
    /**
     * Removes an overlay
     */
    removeOverlay(id: string): void;
    /**
     * Remove all overlays
     */
    clearOverlays(): void;
    /**
     * Add a spherical overlay
     */
    private __addSphereImageOverlay;
    /**
     * Add a cubemap overlay
     */
    private __addCubeImageOverlay;
    private __applySphereCorrection;
    private __getEquirectangularAdapter;
    private __getCubemapAdapter;
}

/**
 * @deprecated
 */
declare class OverlayClickEvent extends TypedEvent<OverlaysPlugin> {
    readonly overlayId: string;
    static readonly type = "overlay-click";
    type: 'overlay-click';
}
/**
 * @deprecated
 */
type OverlaysPluginEvents = OverlayClickEvent;

type events_OverlayClickEvent = OverlayClickEvent;
declare const events_OverlayClickEvent: typeof OverlayClickEvent;
type events_OverlaysPluginEvents = OverlaysPluginEvents;
declare namespace events {
  export { events_OverlayClickEvent as OverlayClickEvent, type events_OverlaysPluginEvents as OverlaysPluginEvents };
}

export { type BaseOverlayConfig, type CubeOverlayConfig, type OverlayConfig, OverlaysPlugin, type OverlaysPluginConfig, type SphereOverlayConfig, type UpdatableOverlaysPluginConfig, events };
