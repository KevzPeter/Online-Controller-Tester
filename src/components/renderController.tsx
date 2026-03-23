import PS5Controller from "../../public/Dualsense";
import XboxController from "../../public/Xbox-controller";

type RenderControllerProps = {
    controllerType: string;
    scaleFactor: number;
};

const RenderController = (props: RenderControllerProps) => {
    if (props.controllerType === 'xbox') {
        return (
            <XboxController scaleFactor={props.scaleFactor} />
        )
    }
    else if (props.controllerType === 'dualsense') {
        return (
            <PS5Controller scaleFactor={props.scaleFactor} />
        )
    }
    else return null;
}

export default RenderController;