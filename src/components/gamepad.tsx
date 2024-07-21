"use client";

import { useState, useEffect } from "react";
import { Progress } from "@/components/ui/progress"
import { convertAnalogToSlider } from "@/lib/inputMapper";
import { Badge } from "./ui/badge";
import ControllerAlert from "./controllerAlert";
import DPad from "../../public/assets/Buttons Outline/Black/SVG/D-Pad.svg";
import DPadUp from "../../public/assets/Buttons Outline/Black/SVG/D-Pad Up.svg";
import DPadDown from "../../public/assets/Buttons Outline/Black/SVG/D-Pad Down.svg";
import DPadLeft from "../../public/assets/Buttons Outline/Black/SVG/D-Pad Left.svg";
import DPadRight from "../../public/assets/Buttons Outline/Black/SVG/D-Pad Right.svg";
import Square from "../../public/assets/Buttons Outline/Black/SVG/Square.svg";
import Circle from "../../public/assets/Buttons Outline/Black/SVG/Circle.svg";
import Triangle from "../../public/assets/Buttons Outline/Black/SVG/Triangle.svg";
import Cross from "../../public/assets/Buttons Outline/Black/SVG/Cross.svg";
import L1 from "../../public/assets/Buttons Outline/Black/SVG/L1.svg";
import R1 from "../../public/assets/Buttons Outline/Black/SVG/R1.svg";
import L2 from "../../public/assets/Buttons Outline/Black/SVG/L2.svg";
import R2 from "../../public/assets/Buttons Outline/Black/SVG/R2.svg";
import L3 from "../../public/assets/Buttons Outline/Black/SVG/Left Stick Click.svg";
import R3 from "../../public/assets/Buttons Outline/Black/SVG/Right Stick Click.svg";
import Create from "../../public/assets/Buttons Outline/Black/SVG/Create.svg";
import Options from "../../public/assets/Buttons Outline/Black/SVG/Options.svg";
import TouchPad from "../../public/assets/Buttons Outline/Black/SVG/Touch Pad Press.svg";
import Home from "../../public/assets/Buttons Outline/Black/SVG/Home.svg";

const GamePad = () => {

    const [controllerName, setControllerName] = useState("");
    const [controllerType, setControllerType] = useState("dualsense");
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
            else {
                setControllerName("");
            }
        }, 50);

    }, [])


    return (
        <div className="basis-1/2 container flex flex-col mx-auto gap-y-4 text-slate-900 dark:text-slate-50">
            <ControllerAlert controllerName={controllerName} />
            <span>Left Analog X: {x1}</span>
            <Progress value={convertAnalogToSlider(x1)} />
            <span>Left Analog Y: {y1}</span>
            <Progress value={convertAnalogToSlider(y1)} />
            <span>Right Analog X: {x2}</span>
            <Progress value={convertAnalogToSlider(x2)} />
            <span>Right Analog Y: {y2}</span>
            <Progress value={convertAnalogToSlider(y2)} />
            <div className="flex items-center gap-x-4">
                {up && <DPadUp height={128} width={128} fill={"#0070f3"} />}
                {down && <DPadDown height={128} width={128} fill={"#0070f3"} />}
                {left && <DPadLeft height={128} width={128} fill={"#0070f3"} />}
                {right && <DPadRight height={128} width={128} fill={"#0070f3"} />}
                {(!up && !down && !left && !right) && <DPad height={128} width={128} fill="grey" />}
                <Cross height={xPressed ? 60 : 64} width={64} fill={xPressed ? "#0070f3" : "grey"} />
                <Circle height={circlePressed ? 60 : 64} width={64} fill={circlePressed ? "#0070f3" : "grey"} />
                <Square height={squarePressed ? 60 : 64} width={64} fill={squarePressed ? "#0070f3" : "grey"} />
                <Triangle height={trianglePressed ? 60 : 64} width={64} fill={trianglePressed ? "#0070f3" : "grey"} />
            </div>
            <div className="flex gap-x-4">
                <L1 height={l1 ? 60 : 64} width={64} fill={l1 ? "#0070f3" : "grey"} />
                <R1 height={r1 ? 60 : 64} width={64} fill={r1 ? "#0070f3" : "grey"} />
                <L2 height={l2 ? 60 : 64} width={64} fill={l2 ? "#0070f3" : "grey"} />
                <R2 height={r2 ? 60 : 64} width={64} fill={r2 ? "#0070f3" : "grey"} />
                <L3 height={l3 ? 60 : 64} width={64} fill={l3 ? "#0070f3" : "grey"} />
                <R3 height={r3 ? 60 : 64} width={64} fill={r3 ? "#0070f3" : "grey"} />
            </div>
            <div className="flex gap-x-4">
                <Create height={create ? 60 : 64} width={64} fill={create ? "#0070f3" : "grey"} />
                <Options height={options ? 60 : 64} width={64} fill={options ? "#0070f3" : "grey"} />
                <TouchPad height={touchpad ? 60 : 64} width={64} fill={touchpad ? "#0070f3" : "grey"} />
                <Home height={power ? 60 : 64} width={64} fill={power ? "#0070f3" : "grey"} />
            </div>
            <span className="mt-4"><Badge className="bg-slate-200 dark:bg-slate-700">Tip</Badge> Use Right Analog to move camera.</span>
            <span className="mt-2"><Badge className="bg-slate-200 dark:bg-slate-700">Tip</Badge> Use L2/R2 to zoom.</span>
        </div>
    )
}

export default GamePad;