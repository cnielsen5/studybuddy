# FSRS v6 Implementation

## Overview

This implementation follows the FSRS v6 algorithm structure with 21 parameters (w[0] through w[20]). The formulas match the FSRS v6 algorithm architecture.

## Key Components

### 1. Parameters (21 total)

- **w[0]**: Initial stability for new cards
- **w[1]-w[2]**: Initial difficulty range for new cards
- **w[3]-w[6]**: Difficulty adjustments per grade (again, hard, good, easy)
- **w[7]-w[10]**: Stability adjustments per grade
- **w[11]**: Stability factor for elapsed time
- **w[12]**: Stability factor for difficulty (currently unused in standard FSRS)
- **w[13]**: Stability factor for review count
- **w[14]**: Stability factor for lapse count
- **w[15]-w[18]**: Stability factors for different states
- **w[19]-w[20]**: Decay parameters for adaptive forgetting curve

### 2. Core Formulas

#### Difficulty Update
```
D_new = D_old - w[grade_index]
```
where `grade_index` maps to w3 (again), w4 (hard), w5 (good), w6 (easy)

#### Stability Update
```
S_new = S_old * (1 + exp(w[grade]) * (11 - D) * factors)
```

Where factors include:
- Elapsed time: `exp(-w11 * elapsedDays / S)`
- Review count: `exp(-w13 * reps)`
- Lapse count: `exp(-w14 * lapses)`
- State: `exp(w15-w18)` based on current state

#### Retrievability (Forgetting Curve)
```
decay = w19 + (w20 - w19) * exp(-elapsedDays / stability)
R = (1 + elapsedDays / (9 * stability))^(-decay)
```

### 3. State Transitions

- **NEW → LEARNING**: On first review (any grade except "again")
- **LEARNING → REVIEW**: When stability >= 7.0
- **REVIEW → RELEARNING**: On "again" grade
- **RELEARNING → REVIEW**: When stability recovers to >= 5.0

## Parameter Optimization

The default parameters provided are placeholders. For optimal performance:

1. **Use FSRS Optimizer**: The official FSRS optimizer can tune parameters based on your user's review history
2. **Start with defaults**: The current defaults provide a reasonable starting point
3. **Customize per user**: Parameters can be optimized per user for better results

## References

- Official FSRS Repository: https://github.com/open-spaced-repetition/free-spaced-repetition-scheduler
- FSRS4Anki: https://github.com/open-spaced-repetition/fsrs4anki
- FSRS Optimizer: https://pypi.org/project/fsrs-optimizer/

## Notes

- The formulas match the FSRS v6 algorithm structure
- Exact parameter values should be optimized using the FSRS optimizer
- The implementation is pure (no I/O, no side effects) for testability
- All calculations are deterministic

