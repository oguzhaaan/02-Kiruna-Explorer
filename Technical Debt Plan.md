## Technical Debt Plan - Sprint 4

**Goal:**
* Increase "reliability" rating from C to a higher level.
* Address critical "security hotspots".

**Rationale:**
* Avoid repeating the mistake of the previous sprint (i.e., starting to solve some of the issues at the beginning of the sprint and others at the end) which did not bring significant benefits but only complications.

**Action Plan:**
* **Dedicated time:** 6 hours to do as last thing of the sprint.
* **Priorities:**
    * Reliability issues
    * Security hotspots

**Reasons:**
* We neglected the code duplication issues because it would be too burdensome in terms of effort, preferring to complete more stories as possible.


## Technical Debt Plan - Sprint 3

To proactively manage our technical debt, we've implemented a sprint-based approach. 

**Pre-Sprint:** 
* Allocate 3 hours to identify and initiate the resolution of reliability issues categorized as 'C' severity.

**Post-Sprint:**
* Dedicate 2 hours to review and finalize the resolution of these issues in light of the latest changes.

**Prioritization:**
* **Reliability:** Given the significant impact on system stability, we've prioritized addressing reliability issues.
* **Code Duplication and Security Hotspots:** Given the significant refactoring required and the time constraints, we have temporarily deferred addressing code duplication issues. Additionally, security hotspots primarily related to hardcoded credentials for test purposes will be considered in a future iteration due to the immediate impact of reliability on our systems.

By following this structured approach, we aim to gradually reduce our technical debt and improve the overall quality of our codebase.