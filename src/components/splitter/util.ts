import { RefObject } from 'react';

/**
 * Generates a list of equal sizes that add up to 100.
 *
 * @param count Number of sizes to generate
 */
const equalSizes = (count: number): number[] => {
    const unit = 100 / count;
    const lastUnit = 100 - unit * (count - 1);
    const sizes = new Array<number>(count - 1).fill(unit);
    sizes.push(lastUnit);
    return sizes;
};

/**
 * Sum elements of the array.
 *
 * @param arr Array to sum
 * @param index Sum up to this index (excluding).
 * @returns Sum of elements up to index, or sum of all if index is -1.
 */
const sumArray = (arr: number[], index = -1): number => {
    let subArr = arr;
    if (index > -1) {
        subArr = arr.slice(0, index);
    }
    return subArr.reduce((acc, val) => acc + val, 0);
};

/**
 * Checks if all values in the sizes array add up to 100.
 *
 * @param sizes Array of sizes.
 * @returns The given array if valid, empty array otherwise.
 */
const validateSizes = (sizes: number[]): number[] => {
    if (sumArray(sizes) === 100) {
        return sizes;
    }
    return [];
};

/**
 * Convert the distance to percent relative to the given ref.
 *
 * @param distancePX Distance in pixels.
 * @param ref Ref to the element to calculate against.
 * @param horizontalSplit True if splitting horizontally.
 * @returns Value in percent.
 */
const distanceInPercent = (
    distancePX: number,
    ref: RefObject<HTMLDivElement>,
    horizontalSplit: boolean,
): number => {
    if (ref.current) {
        const gridBox = ref.current.getBoundingClientRect();
        let gridSize = gridBox.width;
        if (horizontalSplit) {
            gridSize = gridBox.height;
        }
        return (distancePX / gridSize) * 100;
    }
    return 0;
};

/**
 * Convert the distance to PX relative to the given ref.
 *
 * @param distancePercent Distance in percent relative to ref.
 * @param ref Ref to the element to calculate against.
 * @param horizontalSplit True if splitting horizontally.
 * @returns Value in PX.
 */
const distanceInPX = (
    distancePercent: number,
    ref: RefObject<HTMLDivElement>,
    horizontalSplit: boolean,
): number => {
    if (ref.current) {
        const gridBox = ref.current.getBoundingClientRect();
        let gridSize = gridBox.width;
        if (horizontalSplit) {
            gridSize = gridBox.height;
        }
        return gridSize * (distancePercent / 100);
    }
    return 0;
};

/**
 * Rounds a number to the specified number of decimal places.
 *
 * @param num Number to round.
 * @param places Number of decimal places to round to.
 * @return Rounded number.
 */
const roundDecimal = (num: number, places: number): number => {
    if (places === 0) {
        return Math.round(num);
    }
    const base = 10 ** places;
    return Math.round((num + Number.EPSILON) * base) / base;
};

export {
    equalSizes,
    sumArray,
    validateSizes,
    distanceInPercent,
    distanceInPX,
    roundDecimal,
};
