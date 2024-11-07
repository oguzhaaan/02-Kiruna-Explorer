# Retrospective (Team 02)

The retrospective should include _at least_ the following
sections:

- [process measures](#process-measures)
- [quality measures](#quality-measures)
- [general assessment](#assessment)

## PROCESS MEASURES

### Macro statistics

- Number of stories committed vs. done
  - 47 vs. 47
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

  - Our estimations were more or less similiar with spent time

- What lessons did you learn (both positive and negative) in this sprint?

  - We learned how to well organize git and knew each other better since we already made a project before. We could estimate the time of tasks in more accurate way.
  - Also we learned the features that a web application should have on its front-end part for user convenience. For example usage of smaller letters and avoiding scrolling much.

- Which improvement goals set in the previous retrospective were you able to achieve?
  - Usage of git, better communication, prediction of time spent
- Which ones you were not able to achieve? Why?

- Improvement goals for the next sprint and how to achieve them (technical tasks, team coordination, etc.)

  - Documentation part should be improved. Our readme file was not very clear at some point so we had to change some important and fundemental things like database's attributes so that some already written functions were effected, that caused to wasting of time.

- One thing you are proud of as a Team!!
