// tests/sample.test.js - contains sanity checks to see if jest works

describe('Sample Test 1', () => {
    it('True should be the same as true', () => {
        expect(true).toBe(true)
    })
})

describe('Sample Test 2', () => {
    it('Addition works', () => {
        expect(1 + 2).toBe(3)
    })
})