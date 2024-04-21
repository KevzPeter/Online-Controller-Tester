import PS5Controller from "../../public/Ps5-controller";
import XboxController from "../../public/Xbox-controller";

const RenderController = (props: { controllerType: string; scaleFactor: any; }) => {
    if (props.controllerType === 'xbox') {
        return (
            <XboxController scaleFactor={props.scaleFactor} />
        )
    }
    else if (props.controllerType === 'dualsense') {
        return (
            // <PS5Controller scaleFactor={props.scaleFactor} />
            <XboxController scaleFactor={props.scaleFactor} />
        )
    }
    else return null;
}

export default RenderController;