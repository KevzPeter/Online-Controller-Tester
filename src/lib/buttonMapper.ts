export const buttonMapper = (id: number, controllerType: string): string => {
    if (controllerType === 'xbox') {
        switch (id) {
            case 0:
                return "A"
            case 1:
                return "B"
            case 2:
                return "X"
            case 3:
                return "Y"
        }
    }
    else if (controllerType === 'dualsense') {
        switch (id) {
            case 0:
                return "╳"
            case 1:
                return "◯"
            case 2:
                return "□"
            case 3:
                return "△"
        }
    }
    return "";
}