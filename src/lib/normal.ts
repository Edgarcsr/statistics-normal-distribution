const SQRT_2 = Math.sqrt(2)
const SQRT_2PI = Math.sqrt(2 * Math.PI)

// Abramowitz & Stegun 7.1.26, max error about 1.5e-7
const erf = (x: number): number => {
  const sign = x < 0 ? -1 : 1
  const t = 1 / (1 + 0.3275911 * Math.abs(x))
  const poly =
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) *
      t +
      0.254829592) *
    t
  return sign * (1 - poly * Math.exp(-x * x))
}

export const pdf = (x: number, mean: number, sd: number): number => {
  const z = (x - mean) / sd
  return Math.exp(-0.5 * z * z) / (sd * SQRT_2PI)
}

export const cdf = (x: number, mean: number, sd: number): number =>
  0.5 * (1 + erf((x - mean) / (sd * SQRT_2)))

export const probabilityBetween = (
  lower: number,
  upper: number,
  mean: number,
  sd: number
): number => cdf(upper, mean, sd) - cdf(lower, mean, sd)
