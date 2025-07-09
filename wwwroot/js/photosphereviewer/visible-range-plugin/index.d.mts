import { AbstractConfigurablePlugin, utils, Viewer } from '@photo-sphere-viewer/core';

type Range = [number, number] | [string, string];
type VisibleRangePluginConfig = {
    /**
     * horizontal range as two angles
     */
    horizontalRange?: Range;
    /**
     * vertical range as two angles
     */
    verticalRange?: Range;
    /**
     * use {@link ViewerConfig panoData} as visible range, you can also manually call {@link VisibleRangePlugin.setRangesFromPanoData}
     * @default false
     */
    usePanoData?: boolean;
};
type UpdatableVisibleRangePluginConfig = Omit<VisibleRangePluginConfig, 'horizontalRange' | 'verticalRange'>;

/**
 * Locks the visible angles
 */
declare class VisibleRangePlugin extends AbstractConfigurablePlugin<VisibleRangePluginConfig, VisibleRangePluginConfig, UpdatableVisibleRangePluginConfig> {
    static readonly id = "visible-range";
    static readonly VERSION: string;
    static readonly configParser: utils.ConfigParser<VisibleRangePluginConfig, VisibleRangePluginConfig>;
    static readonly readonlyOptions: Array<keyof VisibleRangePluginConfig>;
    private autorotate?;
    constructor(viewer: Viewer, config: VisibleRangePluginConfig);
    /**
     * Changes the vertical range
     */
    setVerticalRange(range: Range | null): void;
    /**
     * Changes the horizontal range
     */
    setHorizontalRange(range: Range | null): void;
    /**
     * Changes the ranges according the current panorama cropping data
     */
    setRangesFromPanoData(): void;
    /**
     * Gets the vertical range defined by the viewer's panoData
     */
    private __getPanoVerticalRange;
    /**
     * Gets the horizontal range defined by the viewer's panoData
     */
    private __getPanoHorizontalRange;
    /**
     * Immediately moves the viewer to respect the ranges
     */
    private __moveToRange;
    /**
     * Apply "horizontalRange" and "verticalRange"
     */
    private __applyRanges;
    /**
     * Reverses autorotate direction with smooth transition
     */
    private __reverseAutorotate;
}

export { type Range, type UpdatableVisibleRangePluginConfig, VisibleRangePlugin, type VisibleRangePluginConfig };
