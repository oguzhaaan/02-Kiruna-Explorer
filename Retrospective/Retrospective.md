# Retrospective (Team 02)

The retrospective should include _at least_ the following
sections:

- [process measures](#process-measures)
- [quality measures](#quality-measures)
- [general assessment](#assessment)

## PROCESS MEASURES

### Macro statistics

- Number of stories committed vs. done
  - 3 vs. 3
- Total points committed vs. done
  - 29 vs. 29
- Nr of hours planned vs. spent (as a team)
  - 96h 05m vs. 97h 17m

**Definition of Done:**

- Unit Tests passing
- Code review completed
- Code present on VCS
- End-to-End tests performed

### Detailed statistics

| Story | # Tasks | Points | Hours est. | Hours actual |
| ----- | ------- | ------ | ---------- | ------------ |
| _#0_  | 19      | -      | 49h 35m    | 49h          |
| _#1_  | 9       | 8      | 16h        | 17h 06m      |
| _#2_  | 9       | 8      | 14h 15m    | 16h 30m      |
| _#3_  | 10      | 13     | 16h 15m    | 14h 41m      |

- Hours per task average, standard deviation (estimate and actual)
  - Estimated: 122.6m or 02h 3m
  - Actual: 124.1m or 02h 4m
- Total estimation error ratio: sum of total hours spent / sum of total hours effort - 1

  $$\frac{\sum_i spent_{task_i}}{\sum_i estimation_{task_i}} - 1$$

  - 0.012489159

- Absolute relative task estimation error: sum( abs( spent-task-i / estimation-task-i - 1))/n

  $$\frac{1}{n}\sum_i^n \left| \frac{spent_{task_i}}{estimation_task_i}-1 \right| $$

  - 0.168657407

## QUALITY MEASURES

- Unit Testing:
  - Total hours estimated:
    -  5h 30m
  - Total hours spent:
    - 5h 25m
  - Nr of automated unit test cases:
    - 78
  - Coverage (if available):
    - 93.18 %
- Code review
  - Total hours estimated
    - 3h
  - Total hours spent
    - 3h
- Integration testing:
  - Total hours estimated
    - 6h
  - Total hours spent
    - 7h 20m
  - Coverage:
    - 93%

## ASSESSMENT

- What caused your errors in estimation (if any)?

  - Our estimations were generally in line with the actual time spent, with only minor deviations.

- What lessons did you learn (both positive and negative) in this sprint?
  - We learned how to better organize our Git workflow and strengthened our understanding of each other’s working styles, having collaborated on a previous project. Additionally, we became more accurate in estimating the time needed for tasks.
  - We also realized the importance of everyone on the team having a clear and complete understanding of the story requirements. This helps prevent implementation errors that would need to be corrected later, avoiding unnecessary time wastage.

- Which improvement goals set in the previous retrospective were you able to achieve?
  - We improved our usage of Git, enhanced team communication, made more accurate time predictions, and adopted better naming conventions for branches, making them more consistent and descriptive.

- Which ones you were not able to achieve? Why?
  - We weren’t fully able to achieve the goal of setting up a robust and well-structured database from the start or strictly adhering to the initial API specifications. This was primarily due to evolving project requirements and unexpected adjustments that had to be made along the way.

- Improvement goals for the next sprint and how to achieve them (technical tasks, team coordination, etc.)
  - One of our improvement goals for the next sprint is to enhance our documentation. The README file was unclear in some areas, which led to changes in fundamental aspects like database attributes. This affected previously written functions and resulted in time wasted on corrections. To avoid this, we’ll ensure clearer and more comprehensive documentation moving forward.

- One thing you are proud of as a Team!!
  - As a team, we’re proud of our strong collaboration. We were able to work closely together, share ideas effectively, and support each other throughout the sprint.
