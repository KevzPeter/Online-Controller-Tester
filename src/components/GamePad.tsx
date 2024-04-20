"use client";

import { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { Progress } from "@/components/ui/progress"
import { convertAnalogToSlider } from "@/lib/inputMapper";
import { Badge } from "./ui/badge";
import { buttonMapper } from "@/lib/buttonMapper";

const GamePad = () => {
    const [controllerName, setControllerName] = useState("No controller detected");
    const [controllerType, setControllerType] = useState("");
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
                if (controller.id.toLowerCase().startsWith("xbox")) {
                    setControllerType("xbox")
                }
                else if (controller.id.toLowerCase().startsWith("dualsense")) {
                    setControllerType("dualsense")
                }
                else {
                    setControllerType("");
                }
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
                setTouchpad(controller.buttons[17]?.pressed); // xbox controllers do not have this button
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
                <Badge className={"text-lg " + (xPressed ? "bg-green-800" : "bg-slate-800")}>{controllerType ? buttonMapper(0, controllerType) : "1"}</Badge>
                <Badge className={"text-lg " + (circlePressed ? "bg-green-800" : "bg-slate-800")}>{controllerType ? buttonMapper(1, controllerType) : "2"}</Badge>
                <Badge className={"text-lg " + (squarePressed ? "bg-green-800" : "bg-slate-800")}>{controllerType ? buttonMapper(2, controllerType) : "3"}</Badge>
                <Badge className={"text-lg " + (trianglePressed ? "bg-green-800" : "bg-slate-800")}>{controllerType ? buttonMapper(3, controllerType) : "4"}</Badge>
            </div>
            <div className="flex gap-x-4">
                <Badge className={"text-lg " + (up ? "bg-green-800" : "bg-slate-800")}>🔼</Badge>
                <Badge className={"text-lg " + (down ? "bg-green-800" : "bg-slate-800")}>🔽</Badge>
                <Badge className={"text-lg " + (left ? "bg-green-800" : "bg-slate-800")}>◀️</Badge>
                <Badge className={"text-lg " + (right ? "bg-green-800" : "bg-slate-800")}>▶️</Badge>
            </div>
            <div className="flex gap-x-4">
                <Badge className={"text-lg " + (l1 ? "bg-green-800" : "bg-slate-800")}>L1</Badge>
                <Badge className={"text-lg " + (r1 ? "bg-green-800" : "bg-slate-800")}>R1</Badge>
                <Badge className={"text-lg " + (l2 ? "bg-green-800" : "bg-slate-800")}>L2</Badge>
                <Badge className={"text-lg " + (r2 ? "bg-green-800" : "bg-slate-800")}>R2</Badge>
                <Badge className={"text-lg " + (l3 ? "bg-green-800" : "bg-slate-800")}>L3</Badge>
                <Badge className={"text-lg " + (r3 ? "bg-green-800" : "bg-slate-800")}>R3</Badge>
            </div>
            <div className="flex gap-x-4">
                <Badge className={"text-md " + (create ? "bg-green-800" : "bg-slate-800")}>Create</Badge>
                <Badge className={"text-md " + (options ? "bg-green-800" : "bg-slate-800")}>Options</Badge>
                <Badge className={"text-md " + (touchpad ? "bg-green-800" : "bg-slate-800")}>Touchpad</Badge>
                <Badge className={"text-md " + (power ? "bg-green-800" : "bg-slate-800")}>PS Button</Badge>
            </div>
            <span className="mt-4"><Badge className="bg-slate-700">Tip</Badge> Use Right Analog to move camera.</span>
            <span className="mt-2"><Badge className="bg-slate-700">Tip</Badge> Use L2/R2 to zoom.</span>
        </div>
    )
}

export default GamePad;