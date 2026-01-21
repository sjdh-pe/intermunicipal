
let loadingCount = 0;

function getLoader() {
    return document.getElementById("globalLoader");
}

export function showLoading() {
    loadingCount++;
    const loader = getLoader();
    if (loader) loader.show();
}

export function hideLoading() {
    loadingCount = Math.max(0, loadingCount - 1);
    if (loadingCount === 0) {
        const loader = getLoader();
        if (loader) loader.hide();
    }
}
