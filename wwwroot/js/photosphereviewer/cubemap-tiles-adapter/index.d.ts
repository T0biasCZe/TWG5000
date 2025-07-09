import { AbstractAdapter, Viewer, PanoramaPosition, Position, TextureData } from '@photo-sphere-viewer/core';
import { Texture, Group } from 'three';
import { CubemapPanorama, Cubemap, CubemapData, CubemapAdapterConfig } from '@photo-sphere-viewer/cubemap-adapter';

/**
 * Configuration of a tiled cubemap
 */
type CubemapTilesPanorama = {
    /**
     * low resolution panorama loaded before tiles
     */
    baseUrl?: CubemapPanorama;
    /**
     * size of a face in pixels
     */
    faceSize: number;
    /**
     * number of tiles on a side of a face
     */
    nbTiles: number;
    /**
     * function to build a tile url
     */
    tileUrl: (face: keyof Cubemap, col: number, row: number) => string | null;
    /**
     * Set to true if the top and bottom faces are not correctly oriented
     * @default false
     */
    flipTopBottom?: boolean;
};
type CubemapTileLevel = {
    /**
     * Lower and upper zoom levels (0-100)
     */
    zoomRange: [number, number];
    /**
     * size of a face in pixels
     */
    faceSize: number;
    /**
     * number of tiles on a side of a face
     */
    nbTiles: number;
};
/**
 * Configuration of a tiled cubemap with multiple tiles configurations
 */
type CubemapMultiTilesPanorama = {
    /**
     * low resolution panorama loaded before tiles
     */
    baseUrl?: CubemapPanorama;
    /**
     * Configuration of tiles by zoom level
     */
    levels: CubemapTileLevel[];
    /**
     * function to build a tile url
     */
    tileUrl: (face: keyof Cubemap, col: number, row: number, level: number) => string | null;
    /**
     * Set to true if the top and bottom faces are not correctly oriented
     * @default false
     */
    flipTopBottom?: boolean;
};
type CubemapTilesAdapterConfig = CubemapAdapterConfig & {
    /**
     * shows a warning sign on tiles that cannot be loaded
     * @default true
     */
    showErrorTile?: boolean;
    /**
     * applies a blur effect to the low resolution panorama
     * @default true
     */
    baseBlur?: boolean;
    /**
     * applies antialiasing to high resolutions tiles
     * @default true
     */
    antialias?: boolean;
};
type CubemapTilesPanoData = CubemapData & {
    baseData: CubemapData;
};

type CubemapTilesTextureData = TextureData<Texture[], CubemapTilesPanorama | CubemapMultiTilesPanorama, CubemapTilesPanoData>;
/**
 * Adapter for tiled cubemaps
 */
declare class CubemapTilesAdapter extends AbstractAdapter<CubemapTilesPanorama | CubemapMultiTilesPanorama, CubemapTilesPanoData, Texture[], Group> {
    static readonly id = "cubemap-tiles";
    static readonly VERSION: string;
    static readonly supportsDownload = false;
    private readonly config;
    private readonly state;
    private readonly queue;
    constructor(viewer: Viewer, config: CubemapTilesAdapterConfig);
    init(): void;
    destroy(): void;
    supportsTransition(panorama: CubemapTilesPanorama | CubemapMultiTilesPanorama): boolean;
    supportsPreload(panorama: CubemapTilesPanorama | CubemapMultiTilesPanorama): boolean;
    textureCoordsToSphericalCoords(point: PanoramaPosition, data: CubemapTilesPanoData): Position;
    sphericalCoordsToTextureCoords(position: Position, data: CubemapTilesPanoData): PanoramaPosition;
    loadTexture(panorama: CubemapTilesPanorama | CubemapMultiTilesPanorama, loader?: boolean): Promise<CubemapTilesTextureData>;
    createMesh(): Group;
    /**
     * Applies the base texture and starts the loading of tiles
     */
    setTexture(group: Group, textureData: CubemapTilesTextureData, transition: boolean): void;
    setTextureOpacity(group: Group, opacity: number): void;
    disposeTexture({ texture }: CubemapTilesTextureData): void;
    disposeMesh(group: Group): void;
    /**
     * Compute visible tiles and load them
     */
    private __refresh;
    /**
     * Loads tiles and change existing tiles priority
     */
    private __loadTiles;
    /**
     * Loads and draw a tile
     */
    private __loadTile;
    /**
     * Applies a new texture to the faces
     */
    private __swapMaterial;
    private __switchMesh;
    /**
     * Clears loading queue, dispose all materials
     */
    private __cleanup;
}

export { type CubemapMultiTilesPanorama, type CubemapTileLevel, CubemapTilesAdapter, type CubemapTilesAdapterConfig, type CubemapTilesPanoData, type CubemapTilesPanorama };
