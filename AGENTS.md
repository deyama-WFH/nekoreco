# AGENTS.md

This repository contains planning and implementation specifications for `nekoreco`, a mobile app for managing records for multiple cats.

When working in this repository, follow the instructions below.

## Project

`nekoreco` is an MVP v1 mobile app for households with multiple cats and, later, cat rescue workflows.

The core product goal is:

- manage each cat's profile and records separately
- make daily recording fast
- make upcoming tasks visible
- keep the MVP focused while preserving future extensibility

## Required Specification References

Before implementation work, read the specifications in this order:

1. `README-updated.md`
2. `mvp-scope.md`
3. `data-model-spec.md`
4. `navigation-spec.md`
5. `onboarding-spec.md`
6. `home-screen-spec.md`
7. `cat-list-detail-spec.md`
8. `record-flow-spec.md`
9. `reminder-spec.md`
10. `family-sharing-spec.md`

Use `codex-implementation-prompt.md` as the master implementation prompt when a full or phased implementation request is made.

## MVP v1 Scope

Always implement these features for MVP v1 unless the user narrows the task:

- first-run onboarding
- cat registration
- multiple cat registration
- home screen
- cat list
- cat detail
- weight records
- hospital visit records
- food records
- insurance records
- memo records
- vaccine schedule management
- deworming schedule management
- hospital visit schedule management
- birthday reminders
- adoption anniversary reminders
- local persistence
- local notification foundation

Implement these when practical and aligned with the current task:

- medication records
- health condition records
- medication reminders
- information-completion prompt cards
- name search
- notification settings screen
- home display for unclaimed insurance items
- creating the next visit schedule from a hospital visit record

Do not implement these in MVP v1 unless explicitly requested:

- real family sharing
- away mode
- PDF export
- multi-device sync
- permission management
- blood test value management
- advanced medication schedules
- cloud backup
- backup restore
- adoption-transfer profiles
- rescue-operator-specific workflows

Family sharing should only be implemented as a coming-soon flow in MVP v1.

## Implementation Order

Prefer this implementation sequence:

1. Data models, mock data, common UI, date utilities, local store, and navigation foundation
2. Onboarding
3. Home screen
4. Cat list and cat detail
5. Record creation flow
6. Reminder and notification foundation
7. Family sharing coming-soon flow
8. Empty, error, loading, validation, and polish states

For phased work, follow the step prompts in `codex-implementation-prompt.md`.

## Navigation

MVP v1 uses four bottom tabs:

1. Home
2. Cats
3. Records
4. Settings

Do not add sharing, away mode, notification list, or PDF export as bottom tabs.

Follow `navigation-spec.md` for navigator structure.

## Data Model Rules

Follow `data-model-spec.md`.

Important constraints:

- `Cat` contains only the core profile.
- Medical, food, insurance, and care information should be separated into profile-related models.
- Date-based events should be modeled as `CatRecord`-style records.
- Schedule, task, and notification concepts must remain separate.
- Family sharing models may exist as types, but the real feature is out of MVP scope.

Avoid duplicate type definitions.

## UX Principles

Prioritize:

1. clear use for multi-cat households
2. fast record creation
3. immediate visibility of today's tasks
4. easy discovery of each cat's information
5. future extensibility
6. avoiding feature creep in MVP

Keep screens simple. Do not show every advanced detail up front. Make frequently used actions shallow and quick.

## Acceptance Criteria

Use the acceptance criteria in `codex-implementation-prompt.md` as the checklist for implementation completion.

At minimum, verify:

- onboarding appears only before completion
- the first cat can be registered
- home shows today's cats, tasks, upcoming schedules, cat mini list, and record action
- cat list supports registered cats and name search
- cat cards navigate to cat detail
- cat detail has six tabs: overview, medical, food, history, insurance, memo
- records can be added and reflected in home or cat detail
- unsaved record input prompts before leaving
- reminders can be generated from vaccine, deworming, visit, birthday, adoption anniversary, and insurance-unclaimed data
- home tasks are visible even when notifications are off
- family sharing buttons navigate only to coming-soon screens

## Completion Report Format

When completing implementation work, report in this format:

```text
## Implemented

## Changed Files

## Differences From Specs

## Deferred / Not Implemented

## Verification Steps

## Next Recommended Work
```

