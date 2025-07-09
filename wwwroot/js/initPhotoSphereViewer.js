export async function initPhotoSphere(containerSelector, panoramaUrl) {
    // Use dynamic import with a relative path
    const { Viewer } = await import('/js/photosphereviewer/core/index.module.js');

    new Viewer({
        container: document.querySelector(containerSelector),
        panorama: panoramaUrl,
        backgroundColor: '#888',
    });
}