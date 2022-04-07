import {
    roundDecimal,
} from './util';

describe('Test roundDecimal', () => {
    it('Correctly rounds', () => {
        expect(roundDecimal(1.000001, 4)).toStrictEqual(1);
        expect(roundDecimal(1.000001, 7)).toStrictEqual(1.000001);
        expect(roundDecimal(1.000001, 6)).toStrictEqual(1.000001);
        expect(roundDecimal(1.0005, 3)).toStrictEqual(1.001);
    });
});
