# RETROSPECTIVE 4 (Team 02)

- [process measures](#process-measures)
- [quality measures](#quality-measures)
- [general assessment](#assessment)

## PROCESS MEASURES

### Macro statistics

- Number of stories committed vs done
  - 6 vs. 6
- Total points committed vs done
  - 31 vs. 31
- Nr of hours planned vs spent (as a team)
  - 96h vs. 96h 38m

Definition of Done:

- Unit Tests passing
- Code review completed
- Code present on VCS
- End-to-End tests performed

### Detailed statistics

| Story | # Tasks | Points | Hours est. | Hours actual |
| ----- | ------- | ------ | ---------- | ------------ |
| _#0_  | 19      | -      | 58h 55m    | 59h 23m      |
| _#11_ | 2       | 3      | 3h 30m     | 3h 50m       |
| _#17_ | 2       | 5      | 3h 30m     | 4h           |
| _#12_ | 10      | 8      | 13h 35m    | 14h 25m      |
| _#13_ | 5       | 8      | 10h 30m    | 9h 15m       |
| _#15_ | 3       | 5      | 5h         | 4h 45m       |
| _#16_ | 1       | 2      | 1h         | 1h           |

- Hours per task (average, standard deviation)
  - Average:
    - Estimated: 2h 17m
    - Actual: 2h 18m
  - Standard Deviation:
    - Estimated: 187,89
    - Actual: 186,82
- Total estimation error ratio: sum of total hours spent / sum of total hours effort - 1

  $$\frac{\sum_i spent_{task_i}}{\sum_i estimation_{task_i}} - 1$$

  - 0,006597

- Absolute relative task estimation error: sum( abs( spent-task-i / estimation-task-i - 1))/n

  $$\frac{1}{n}\sum_i^n \left| \frac{spent_{task_i}}{estimation_task_i}-1 \right| $$

  - 0,099802

## QUALITY MEASURES

- Unit Testing/Integration Testing:
  - Total hours estimated 3h 40m
  - Total hours spent 5h 10m
  - Nr of automated unit test cases 167
  - Coverage (if available) 88.43%
- E2E testing:
  - Total hours estimated 9h
  - Total hours spent 8h 25m
- Code review
  - Total hours estimated 14h 30m
  - Total hours spent 14h 30m
- Technical Debt management:
  - Strategy adopted [see Technical Debt Plan](../Technical%20Debt%20Plan.md)
  - Total hours estimated estimated at sprint planning 6h
  - Total hours spent 5h

## ASSESSMENT

- What caused your errors in estimation (if any)?

  - Our estimations were largely accurate, as all the stories were successfully completed and passed all relevant tests. Additionally, we managed to resolve all the issues raised during the previous sprint.

- What lessons did you learn (both positive and negative) in this sprint?

  - As team members became more familiar with each other’s strengths and capabilities, our collaboration became more efficient.
  - Developing software in a reusable way significantly accelerated our workflow. For instance, in some new user stories, we were able to leverage components that had been developed earlier in the project, which enabled us to complete all six stories successfully.
  - Working on this project taught us the value of a well-defined team workflow and how to navigate it effectively.
  - By the end of the project, using Git had become second nature to everyone on the team.

- Which improvement goals set in the previous retrospective were you able to achieve?

  - We achieved an acceptable level of test coverage.
  - We successfully automated parts of our end-to-end testing process using the Cypress framework.
  - The priority of completing the previous sprint's changes and merging them promptly has been successfully achieved.

- Which ones you were not able to achieve? Why?
  - We were unable to give sufficient attention to SonarCloud issues, which resulted in minimal improvements despite a slight reduction in the number of issues, even with an increase in lines of code. However, we managed to improve the "reliability" rating to a B and addressed only a few of the identified "security hotspots."

- Improvement goals for the next sprint and how to achieve them (technical tasks, team coordination, etc.)

  - 

- One thing you are proud of as a Team!!
  - We’ve built a strong, cohesive team that genuinely enjoys working, learning, and improving together. We’re proud to have nearly completed the project with polished and deliverable work.
