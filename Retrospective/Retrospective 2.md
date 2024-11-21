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
- Total points committed vs. done 
- Nr of hours planned vs. spent (as a team)

**Remember** a story is done ONLY if it fits the Definition of Done:
 
- Unit Tests passing
- Code review completed
- Code present on VCS
- End-to-End tests performed

> Please refine your DoD if required (you cannot remove items!) 

### Detailed statistics

| Story | # Tasks | Points | Hours est. | Hours actual |
| ----- | ------- | ------ | ---------- | ------------ |
| _#0_  |         |        |            |              |
| n     |         |        |            |              |
   

> story `#0` is for technical tasks, leave out story points (not applicable in this case)

- Hours per task average, standard deviation (estimate and actual)
- Total estimation error ratio: sum of total hours spent / sum of total hours effort - 1

    $$\frac{\sum_i spent_{task_i}}{\sum_i estimation_{task_i}} - 1$$
    
- Absolute relative task estimation error: sum( abs( spent-task-i / estimation-task-i - 1))/n

    $$\frac{1}{n}\sum_i^n \left| \frac{spent_{task_i}}{estimation_task_i}-1 \right| $$
  
## QUALITY MEASURES 

- Unit Testing:
  - Total hours estimated: 3h
  - Total hours spent: 3h 10m
  - Nr of automated unit test cases: 54
  - Coverage (if available): 90.97%
- Unit Testing:
  - Total hours estimated: 3h 30m
  - Total hours spent: 3h
  - Nr of automated unit test cases: 50
  - Coverage (if available): 90.97%
- E2E testing:
  - Total hours estimated: 9h 30m
  - Total hours spent: 6h 50m
- Code review 
  - Total hours estimated: 11h
  - Total hours spent: 10h 37m
  


  ## ASSESSMENT

- What caused your errors in estimation (if any)?
    - Our estimations were generally accurate and closely aligned with the actual time spent. There were only minor deviations, such as the "Modify Georeference" story, which took slightly longer than estimated due to its lack of clear definition.

- What lessons did you learn (both positive and negative) in this sprint?
    - We have now identified each other's strengths and weaknesses, enabling us to work very efficiently and avoid wasting time

- Which improvement goals set in the previous retrospective were you able to achieve? 
    - We successfully built a robust database from the start, resulting in significantly fewer changes during the process compared to the previous sprint.
    
- Which ones you were not able to achieve? Why?
    - We could improve more the README by making it even clearer about what each API should receive and return. However, it has already improved compared to the previous sprint.

- Improvement goals for the next sprint and how to achieve them (technical tasks, team coordination, etc.)
    - Improve the clarity of the README to specify what each API should receive and return. To achieve this, we could assign specific team members to review and update the documentation with precise examples and detailed descriptions.
    - Focus on increasing the test coverage, especially for newly implemented features, to reduce the likelihood of unforeseen issues arising during the sprint. To achieve this, we could allocate more time for unit and integration testing in our sprint planning.
- One thing you are proud of as a Team!!
  - We are very proud of the number of stories we were able to complete. We believe that accomplishing 9 stories is a great achievement.