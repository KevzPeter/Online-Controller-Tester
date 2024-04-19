"use client";
import { Canvas } from "@react-three/fiber";
import SceneContainer from "./Scene";

const CanvasContainer = (props: any) => {

    return (
        <div className="container basis-1/2 border-2 rounded-lg border-solid border-slate-800">
            <Canvas>
                <SceneContainer />
            </Canvas>
        </div>
    )
}

export default CanvasContainer;