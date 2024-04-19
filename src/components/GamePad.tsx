"use client";

import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { Progress } from "@/components/ui/progress"
import { convertAnalogToSlider } from "@/lib/inputMapper";
import { Badge } from "./ui/badge";
import CanvasContainer from "./Canvas";

const GamePad = () => {
    const [controllerName, setControllerName] = useState("No controller detected");
    const [x1, setX1] = useState(0);
    const [y1, setY1] = useState(0);
    const [x2, setX2] = useState(0);
    const [y2, setY2] = useState(0);
    const [circlePressed, setCirclePressed] = useState(false);
    const [trianglePressed, setTrianglePressed] = useState(false);
    const [squarePressed, setSquarePressed] = useState(false);
    const [xPressed, setXPressed] = useState(false);
    const [l1, setL1] = useState(false);
    const [r1, setR1] = useState(false);
    const [l2, setL2] = useState(false);
    const [r2, setR2] = useState(false);
    const [create, setCreate] = useState(false);
    const [options, setOptions] = useState(false);
    const [l3, setL3] = useState(false);
    const [r3, setR3] = useState(false);
    const [up, setUp] = useState(false);
    const [down, setDown] = useState(false);
    const [left, setLeft] = useState(false);
    const [right, setRight] = useState(false);
    const [power, setPower] = useState(false);
    const [touchpad, setTouchpad] = useState(false);
    const notify = () => toast("🎮 Connected!", { position: "top-right" });

    useEffect(() => {

        setInterval(() => {
            const controller = navigator.getGamepads()[0];
            if (controller) {
                setControllerName(controller.id);
                setX1(controller.axes[0]);
                setY1(controller.axes[1]);
                setX2(controller.axes[2]);
                setY2(controller.axes[3]);
                setXPressed(controller.buttons[0].pressed);
                setCirclePressed(controller.buttons[1].pressed);
                setSquarePressed(controller.buttons[2].pressed);
                setTrianglePressed(controller.buttons[3].pressed);
                setL1(controller.buttons[4].pressed);
                setR1(controller.buttons[5].pressed);
                setL2(controller.buttons[6].pressed);
                setR2(controller.buttons[7].pressed);
                setCreate(controller.buttons[8].pressed);
                setOptions(controller.buttons[9].pressed);
                setL3(controller.buttons[10].pressed);
                setR3(controller.buttons[11].pressed);
                setUp(controller.buttons[12].pressed);
                setDown(controller.buttons[13].pressed);
                setLeft(controller.buttons[14].pressed);
                setRight(controller.buttons[15].pressed);
                setPower(controller.buttons[16].pressed);
                setTouchpad(controller.buttons[17].pressed);
            }
        }, 50);

    }, [])


    return (
        <div className="basis-1/2 container flex flex-col mx-auto gap-y-4">
            <span>Controller: <span className="font-bold text-gray-400">{controllerName}</span></span>
            <span>Left Analog X: {x1}</span>
            <Progress value={convertAnalogToSlider(x1)} />
            <span>Left Analog Y: {y1}</span>
            <Progress value={convertAnalogToSlider(y1)} />
            <span>Right Analog X: {x2}</span>
            <Progress value={convertAnalogToSlider(x2)} />
            <span>Right Analog Y: {y2}</span>
            <Progress value={convertAnalogToSlider(y2)} />
            <div className="flex gap-x-4">
                <Badge className={xPressed ? "bg-green-800  text-lg" : "bg-slate-800  text-lg"}>╳</Badge>
                <Badge className={circlePressed ? "bg-green-800  text-lg" : "bg-slate-800  text-lg"}>◯</Badge>
                <Badge className={squarePressed ? "bg-green-800  text-lg" : "bg-slate-800  text-lg"}>□</Badge>
                <Badge className={trianglePressed ? "bg-green-800  text-lg" : "bg-slate-800  text-lg"}>△</Badge>
            </div>
            <div className="flex gap-x-4">
                <Badge className={up ? "bg-green-800  text-lg" : "bg-slate-800  text-lg"}>🔼</Badge>
                <Badge className={down ? "bg-green-800  text-lg" : "bg-slate-800  text-lg"}>🔽</Badge>
                <Badge className={left ? "bg-green-800  text-lg" : "bg-slate-800  text-lg"}>◀️</Badge>
                <Badge className={right ? "bg-green-800  text-lg" : "bg-slate-800  text-lg"}>▶️</Badge>
            </div>
            <div className="flex gap-x-4">
                <Badge className={l1 ? "bg-green-800  text-lg" : "bg-slate-800  text-lg text-lg"}>L1</Badge>
                <Badge className={r1 ? "bg-green-800  text-lg" : "bg-slate-800  text-lg"}>R1</Badge>
                <Badge className={l2 ? "bg-green-800  text-lg" : "bg-slate-800  text-lg"}>L2</Badge>
                <Badge className={r2 ? "bg-green-800  text-lg" : "bg-slate-800  text-lg"}>R2</Badge>
                <Badge className={l3 ? "bg-green-800  text-lg" : "bg-slate-800  text-lg"}>L3</Badge>
                <Badge className={r3 ? "bg-green-800  text-lg" : "bg-slate-800  text-lg"}>R3</Badge>
            </div>
            <div className="flex gap-x-4">
                <Badge className={create ? "bg-green-800 text-md" : "bg-slate-800 text-md"}>Create</Badge>
                <Badge className={options ? "bg-green-800 text-md" : "bg-slate-800 text-md"}>Options</Badge>
                <Badge className={touchpad ? "bg-green-800 text-md" : "bg-slate-800 text-md"}>Touchpad</Badge>
                <Badge className={power ? "bg-green-800 text-md" : "bg-slate-800 text-md"}>PS Button</Badge>
            </div>
            <span className="mt-4"><Badge className="bg-slate-700">Tip</Badge> Use Right Analog to move camera.</span>
            <span className="mt-2"><Badge className="bg-slate-700">Tip</Badge> Use L2/R2 to zoom.</span>
        </div>
    )
}

export default GamePad;