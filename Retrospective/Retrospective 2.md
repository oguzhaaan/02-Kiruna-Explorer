TEMPLATE FOR RETROSPECTIVE (Team ##)
=====================================

The retrospective should include _at least_ the following
sections:

- [process measures](#process-measures)
- [quality measures](#quality-measures)
- [general assessment](#assessment)

## PROCESS MEASURES 

### Macro statistics

- Number of stories committed vs. done 
  - 6 vs. 6
- Total points committed vs. done 
  - 41 vs. 41
- Nr of hours planned vs. spent (as a team)
  - 96h vs. 96h 24m

**Remember**a story is done ONLY if it fits the Definition of Done:
 
- Unit Tests passing
- Code review completed
- Code present on VCS
- End-to-End tests performed

> Please refine your DoD if required (you cannot remove items!) 

### Detailed statistics

| Story  | # Tasks | Points | Hours est. | Hours actual |
|--------|---------|--------|------------|--------------|
| _#0_   | 13      | -      | 40h        | 41h 58m      |
| _#4_   | 4       | 13     | 09h 30m    | 08h 25m      |
| _#5_   | 7       | 5      | 11h 30m    | 11h 25m      |
| _#6_   | 3       | 5      | 05h        | 04h 30m      |
| _#7_   | 8       | 5      | 15h 30m    | 14h 37m      |
| _#8_   | 8       | 5      | 12h        | 13h 14m      |
| _#9_   | 2       | 8      | 02h 30m    | 02h 15m      |
   

> story `#0` is for technical tasks, leave out story points (not applicable in this case)
(45)
- Hours per task average
  - Estimated: 2,1333h
  - Actual: 2,1422h
- Standard deviation
  - Estimated: 112,5045
  - Actual: 115,5871
- Total estimation error ratio: sum of total hours spent / sum of total hours effort - 1

    $$\frac{\sum_i spent_{task_i}}{\sum_i estimation_{task_i}} - 1$$ = 0,0041666
    
- Absolute relative task estimation error: sum( abs( spent-task-i / estimation-task-i - 1))/n

    $$\frac{1}{n}\sum_i^n \left| \frac{spent_{task_i}}{estimation_task_i}-1 \right| $$ = 0,17097606
  
## QUALITY MEASURES 

- Unit Testing:
  - Total hours estimated
  - Total hours spent
  - Nr of automated unit test cases 
  - Coverage (if available)
- E2E testing:
  - Total hours estimated
  - Total hours spent
- Code review 
  - Total hours estimated 
  - Total hours spent
  


## ASSESSMENT

- What caused your errors in estimation (if any)?

- What lessons did you learn (both positive and negative) in this sprint?

- Which improvement goals set in the previous retrospective were you able to achieve? 
  
- Which ones you were not able to achieve? Why?

- Improvement goals for the next sprint and how to achieve them (technical tasks, team coordination, etc.)

  > Propose one or two

- One thing you are proud of as a Team!!