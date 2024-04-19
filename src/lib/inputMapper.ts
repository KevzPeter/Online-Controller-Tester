export const convertAnalogToSlider = (analogValue: number): number => {
    return (analogValue + 1) * 50;
}

export const degreesToRadians = (degrees: number): number => {
    return degrees * (Math.PI / 180);
}

export const roundToOneDecimalPlace = (number: number): number => {
    return Math.round(number * 10) / 10;
}