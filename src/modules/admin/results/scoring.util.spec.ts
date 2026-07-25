import { calculateItemPoints } from './scoring.util';

describe('calculateItemPoints', () => {
  it('gives 50 base points for an exact placement with no risk taken (F=J)', () => {
    expect(
      calculateItemPoints({
        expectedPosition: 3,
        guessedPosition: 3,
        realPosition: 3,
        teamCount: 20,
      }),
    ).toBe(50);
  });

  it('gives 25 base points for an off-by-one placement', () => {
    expect(
      calculateItemPoints({
        expectedPosition: 3,
        guessedPosition: 3,
        realPosition: 4,
        teamCount: 20,
      }),
    ).toBe(25);
  });

  it('gives 0 points for a placement off by two or more', () => {
    expect(
      calculateItemPoints({
        expectedPosition: 3,
        guessedPosition: 3,
        realPosition: 6,
        teamCount: 20,
      }),
    ).toBe(0);
  });

  it('applies the max risk coefficient (M=5) when the guess is N-1 away from F', () => {
    // N=20, F=1, J=20 -> A=19=N-1 -> M=1+4*19/19=5; exact placement -> C=50 -> P=250
    expect(
      calculateItemPoints({
        expectedPosition: 1,
        guessedPosition: 20,
        realPosition: 20,
        teamCount: 20,
      }),
    ).toBe(250);
  });

  it('supports a fractional expectedPosition from averaged tied odds', () => {
    // N=20, F=3.5, J=3 -> A=0.5 -> M=1+4*0.5/19≈1.105; exact placement -> C=50 -> P≈55.26 -> rounds to 55
    expect(
      calculateItemPoints({
        expectedPosition: 3.5,
        guessedPosition: 3,
        realPosition: 3,
        teamCount: 20,
      }),
    ).toBe(55);
  });
});
