"use client";
import { Canvas } from "@react-three/fiber";
import SceneContainer from "./Scene";

const CanvasContainer = () => {

    return (
        <div className="basis-1/2">
            <Canvas>
                <SceneContainer />
            </Canvas>
        </div>
    )
}

export default CanvasContainer;