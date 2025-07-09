import { AbstractAdapter, Viewer, TextureData } from '@photo-sphere-viewer/core';
import { Mesh, BufferGeometry, Material, VideoTexture, BoxGeometry, ShaderMaterial } from 'three';

type AbstractVideoPanorama = {
    source: string | MediaStream | HTMLVideoElement;
};
type AbstractVideoAdapterConfig = {
    /**
     * automatically start the video
     * @default false
     */
    autoplay?: boolean;
    /**
     * initially mute the video
     * @default false
     */
    muted?: boolean;
};
type AbstractVideoMesh = Mesh<BufferGeometry, Material>;
type AbstractVideoTextureData = TextureData<VideoTexture>;
/**
 * Base video adapters class
 */
declare abstract class AbstractVideoAdapter<TPanorama extends AbstractVideoPanorama, TData, TMesh extends AbstractVideoMesh> extends AbstractAdapter<TPanorama, TData, VideoTexture, TMesh> {
    static readonly supportsDownload = false;
    protected abstract readonly config: AbstractVideoAdapterConfig;
    private video;
    constructor(viewer: Viewer);
    init(): void;
    destroy(): void;
    supportsPreload(): boolean;
    supportsTransition(): boolean;
    loadTexture(panorama: AbstractVideoPanorama): Promise<AbstractVideoTextureData>;
    protected switchVideo(texture: VideoTexture): void;
    setTextureOpacity(mesh: TMesh, opacity: number): void;
    disposeTexture({ texture }: AbstractVideoTextureData): void;
    disposeMesh(mesh: AbstractVideoMesh): void;
    private __removeVideo;
    private __videoLoadPromise;
}

/**
 * Configuration of a cubemap video
 */
type CubemapVideoPanorama = AbstractVideoPanorama & {
    /**
     * if the video is an equiangular cubemap (EAC)
     * @default true
     */
    equiangular?: boolean;
};
/**
 * Size information of a cubemap panorama
 */
type CubemapVideoData = {
    isCubemap: true;
    equiangular: boolean;
};
type CubemapVideoAdapterConfig = AbstractVideoAdapterConfig;

type CubemapVideoMesh = Mesh<BoxGeometry, ShaderMaterial>;
type CubemapVideoTextureData = TextureData<VideoTexture, CubemapVideoPanorama, CubemapVideoData>;
/**
 * Adapter for cubemap videos
 */
declare class CubemapVideoAdapter extends AbstractVideoAdapter<CubemapVideoPanorama, CubemapVideoData, CubemapVideoMesh> {
    static readonly id = "cubemap-video";
    static readonly VERSION: string;
    protected readonly config: CubemapVideoAdapterConfig;
    constructor(viewer: Viewer, config: CubemapVideoAdapterConfig);
    loadTexture(panorama: CubemapVideoPanorama): Promise<CubemapVideoTextureData>;
    createMesh(panoData: CubemapVideoData): CubemapVideoMesh;
    setTexture(mesh: CubemapVideoMesh, { texture }: CubemapVideoTextureData): void;
    private __setUVs;
}

export { CubemapVideoAdapter, type CubemapVideoAdapterConfig, type CubemapVideoData, type CubemapVideoPanorama };
