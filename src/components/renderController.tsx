import PS5Controller from "./dualsenseController";
import XboxController from "./xboxController";

type RenderControllerProps = {
    controllerType: string;
    acceptCrossModelInput?: boolean;
};

const RenderController = (props: RenderControllerProps) => {
    if (props.controllerType === 'xbox') {
        return (
            <XboxController acceptDualSenseInput={props.acceptCrossModelInput} />
        )
    }
    else if (props.controllerType === 'dualsense') {
        return (
            <PS5Controller acceptXboxInput={props.acceptCrossModelInput} />
        )
    }
    else return null;
}

export default RenderController;
