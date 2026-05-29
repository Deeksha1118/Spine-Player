import { Assets } from "pixi.js";

export async function loadSpineAssets(
    alias,
    jsonPath,
    atlasPath
) {

    Assets.add({
        alias: `${alias}Data`,
        src: jsonPath,
    });

    Assets.add({
        alias: `${alias}Atlas`,
        src: atlasPath,
    });

    await Assets.load([
        `${alias}Data`,
        `${alias}Atlas`,
    ]);
}