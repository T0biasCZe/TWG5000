import { AbstractAdapter, Viewer, PanoramaPosition, Position, TextureData } from '@photo-sphere-viewer/core';
import { Texture, Mesh, BoxGeometry, MeshBasicMaterial } from 'three';

type CubemapFaces = 'left' | 'front' | 'right' | 'back' | 'top' | 'bottom';
/**
 * Object defining a cubemap as separated files
 */
type Cubemap = Record<CubemapFaces, string>;
/**
 * Object defining a cubemap as separated files
 * images order is : left, front, right, back, top, bottom
 */
type CubemapArray = string[];
/**
 * Object defining a cubemap as separated files
 */
type CubemapSeparate = {
    type: 'separate';
    paths: Cubemap | CubemapArray;
    /**
     * Set to true if the top and bottom faces are not correctly oriented
     * @default false
     */
    flipTopBottom?: boolean;
};
/**
 * Object defining a cubemap as a single stripe file
 */
type CubemapStripe = {
    type: 'stripe';
    path: string;
    /**
     * Set to true if the top and bottom faces are not correctly oriented
     * @default false
     */
    flipTopBottom?: boolean;
    /**
     * Order of the faces in the file
     * @default 'left, front, right, back, top, bottom'
     */
    order?: CubemapFaces[];
};
/**
 * Object defining a cubemap as a single net file (cross arrangement)
 */
type CubemapNet = {
    type: 'net';
    path: string;
};
/**
 * Configuration of a cubemap
 */
type CubemapPanorama = Cubemap | CubemapArray | CubemapSeparate | CubemapStripe | CubemapNet;
/**
 * Size information of a cubemap panorama
 */
type CubemapData = {
    isCubemap: true;
    flipTopBottom: boolean;
    faceSize: number;
};
type CubemapAdapterConfig = {};

type CubemapMesh = Mesh<BoxGeometry, MeshBasicMaterial[]>;
type CubemapTextureData = TextureData<Texture[], CubemapPanorama, CubemapData>;
/**
 * Adapter for cubemaps
 */
declare class CubemapAdapter extends AbstractAdapter<CubemapPanorama, CubemapData, Texture[], CubemapMesh> {
    static readonly id = "cubemap";
    static readonly VERSION: string;
    static readonly supportsDownload = false;
    private readonly config;
    constructor(viewer: Viewer, config: CubemapAdapterConfig);
    supportsTransition(): boolean;
    supportsPreload(): boolean;
    /**
     * {@link https://github.com/bhautikj/vrProjector/blob/master/vrProjector/CubemapProjection.py#L130}
     */
    textureCoordsToSphericalCoords(point: PanoramaPosition, data: CubemapData): Position;
    sphericalCoordsToTextureCoords(position: Position, data: CubemapData): PanoramaPosition;
    loadTexture(panorama: CubemapPanorama, loader?: boolean): Promise<CubemapTextureData>;
    private loadTexturesSeparate;
    private createCubemapTexture;
    private loadTexturesStripe;
    private loadTexturesNet;
    createMesh(): CubemapMesh;
    setTexture(mesh: CubemapMesh, { texture, panoData }: CubemapTextureData): void;
    setTextureOpacity(mesh: CubemapMesh, opacity: number): void;
    disposeTexture({ texture }: CubemapTextureData): void;
    disposeMesh(mesh: CubemapMesh): void;
}

export { type Cubemap, CubemapAdapter, type CubemapAdapterConfig, type CubemapArray, type CubemapData, type CubemapFaces, type CubemapNet, type CubemapPanorama, type CubemapSeparate, type CubemapStripe };
