import { generateKey } from "../utility";

test("utility.generateKey doesn't generate the same key (250 tries)", () => {
    const keys = [];
    while (keys.length < 250) {
        const next = generateKey();
        expect(keys.includes(next)).toBeFalsy();
        keys.push(next);
    }
});
