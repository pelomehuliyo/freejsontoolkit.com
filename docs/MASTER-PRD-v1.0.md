# Free JSON Toolkit
# Master Product Requirements Document (Master PRD)

Version: 1.0.0

Status: Active

Repository:
freejsontoolkit.com

Document Owner:
Project Team

Created:
July 2026

Last Updated:
July 2026

---

# Purpose

This document defines the engineering, design, product, accessibility, SEO, and quality standards for every tool built under the Free JSON Toolkit project.

It serves as the single source of truth for both human contributors and AI coding assistants.

Every future tool should follow this document before implementation begins.

---

# Philosophy

Free JSON Toolkit exists to build the highest-quality collection of browser-based developer utilities.

The goal is not to create the largest collection of tools.

The goal is to create the collection developers trust the most.

Every page should make users think:

"This is cleaner, faster, and easier than every other free tool I've used."

We optimize for quality before quantity.

---

# Mission

Build fast, privacy-first developer utilities that solve common data transformation problems entirely inside the browser.

Users should never have to upload sensitive data to a server when client-side processing is possible.

---

# Vision

Become the most trusted browser-based toolkit for developers, analysts, students, and technical professionals.

The project should eventually contain dozens of carefully crafted utilities while maintaining a consistent experience across every page.

Every tool should feel like it belongs to the same product.

---

# Core Values

## Privacy First

Whenever technically possible, processing happens entirely inside the browser.

User files are not uploaded to our servers.

Privacy is a feature, not marketing copy.

---

## Simplicity

Every page has one job.

No unnecessary buttons.

No confusing workflows.

No distracting animations.

No visual clutter.

---

## Speed

Pages should load quickly.

Conversions should begin immediately.

Interactions should feel responsive.

Performance is part of the product.

---

## Accessibility

Every feature should be usable with:

- keyboard only
- screen readers
- reduced motion
- high contrast

Accessibility is considered a required feature.

---

## Consistency

Every tool should share the same design language.

Users should immediately understand how to use a new tool because it behaves like every previous tool.

---

## Accuracy

Conversion correctness is more important than feature count.

Correct output always takes priority over adding new options.

---

# Product Scope

Free JSON Toolkit focuses on browser-based developer utilities.

Examples include:

- JSON ↔ CSV
- JSON Formatter
- JSON Validator
- JSON Minifier
- CSV ↔ JSON
- XML ↔ JSON
- YAML ↔ JSON
- Base64 utilities
- URL Encoder/Decoder
- UUID Generator
- Timestamp Converter

The project does not aim to become a general productivity suite.

Only utilities that fit the developer and data-processing workflow are included.

---

# Target Audience

Primary Users

- Software developers
- Data analysts
- Backend engineers
- Frontend engineers
- QA engineers
- DevOps engineers
- Technical students

Secondary Users

- Business analysts
- Researchers
- Spreadsheet users
- API users
- Technical writers

---

# Product Principles

Every tool must follow these principles.

1. One page. One purpose.

A page exists to solve exactly one problem.

Avoid feature creep.

---

2. Browser First

Prefer browser APIs over server-side processing whenever possible.

---

3. Local Processing

Sensitive data should remain on the user's device.

If server processing is required, it must be explicitly communicated.

---

4. Mobile First

Desktop cannot be the only experience.

Every tool must remain usable on phones and tablets.

---

5. Progressive Enhancement

The core experience should work without advanced browser capabilities whenever practical.

Additional functionality may enhance the experience but should not replace core functionality.

---

6. Reusable Components

Duplicate UI patterns are discouraged.

Shared components should be reused whenever possible.

---

7. Production Quality

No placeholder text.

No TODO comments.

No unfinished UI.

No broken routes.

Every release should be deployable.

---

# Success Metrics

Technical

- Lighthouse Performance ≥ 95
- Lighthouse Accessibility ≥ 100
- Lighthouse Best Practices ≥ 100
- Lighthouse SEO ≥ 100

User Experience

- Fast interaction
- Clear error messages
- Zero unnecessary scrolling
- Excellent mobile usability

Business

- Organic search growth
- Returning visitors
- High engagement
- Increasing number of published tools

---

# Decision Framework

When choosing between two implementations:

Prefer:

Simpler > Complex

Readable > Clever

Fast > Fancy

Accessible > Decorative

Reliable > Experimental

Maintainable > Short

Privacy > Convenience

Consistency > Novelty

---

# Document Usage

Every new tool follows this workflow.

Research

↓

Tool PRD

↓

Implementation

↓

Quality Assurance

↓

Deployment

↓

Documentation Update

Master PRD evolves continuously.

Every completed project may improve this document.

This is a living document.

Version updates are expected.

# Non-Goals

To maintain a focused, high-quality product, Free JSON Toolkit intentionally avoids features that fall outside its mission.

The following are considered out of scope unless the product vision is formally revised.

---

## Not an Online IDE

The toolkit is not intended to become a browser-based code editor or integrated development environment.

Editing capabilities should exist only when they directly support the primary purpose of a tool.

---

## Not a Cloud Storage Service

User files are not stored, synchronized, or backed up.

The default assumption is that all processing occurs locally within the browser.

Cloud storage integrations are outside the scope of the project.

---

## Not an Analytics Platform

The toolkit transforms and validates data.

It does not provide dashboards, business intelligence, reporting, or long-term data analysis.

---

## Not a Spreadsheet Application

While some tools may provide lightweight table previews or editing to improve usability, the goal is not to replace spreadsheet software.

Complex spreadsheet functionality such as formulas, pivot tables, collaboration, or workbook management is outside the project's scope.

---

## Not a General Productivity Suite

Free JSON Toolkit focuses on developer and data-processing utilities.

Features unrelated to data transformation, validation, formatting, encoding, or developer workflows should not be added.

---

## No Feature Bloat

New features are added only when they provide meaningful value to the majority of users.

Features that increase complexity without significantly improving usability should be rejected.

A smaller, polished feature set is preferred over a larger, inconsistent one.

---

## No Unnecessary Server Processing

Whenever browser APIs can safely and efficiently perform an operation, client-side processing is the preferred implementation.

Server-side processing should only be introduced when there is a clear technical requirement that cannot reasonably be solved within the browser.

---

## No Inconsistent User Experience

Every tool should feel like part of the same product.

New pages must follow the established design system, interaction patterns, accessibility standards, and engineering guidelines.

Visual or behavioral inconsistencies should be treated as defects.

---

## Guiding Principle

When evaluating a new idea, ask:

> Does this make the current tool substantially better without making it more complicated?

If the answer is no, the feature should not be added.


# Chapter 2 — Product Principles

This chapter defines the principles that govern every product built under the Free JSON Toolkit brand.

These are not recommendations.

They are engineering and product standards.

If a proposed feature conflicts with these principles, the feature should either be redesigned or rejected.

---

# Section 2.1 — User Experience Principles

## Principle 1 — One Page, One Purpose

Every page exists to solve one clearly defined problem.

Examples:

✔ JSON → CSV converts JSON into CSV.

✔ CSV → JSON converts CSV into JSON.

A page should never attempt to become an all-in-one workspace.

If additional functionality belongs elsewhere, create another tool rather than expanding the current one indefinitely.

Goal:

Users should understand the page's purpose within five seconds of arriving.

---

## Principle 2 — Minimize Cognitive Load

Users should spend their attention solving their own problem—not learning the interface.

The interface should eliminate unnecessary decisions.

Avoid:

- excessive configuration
- multiple competing call-to-actions
- decorative elements without purpose
- unnecessary onboarding

Prefer:

- sensible defaults
- progressive disclosure
- clear labels
- familiar layouts

The simplest interface that solves the problem is usually the best interface.

---

## Principle 3 — Speed Feels Like a Feature

Users perceive fast software as higher quality.

Every interaction should provide immediate feedback.

Examples:

- instant button states
- copy confirmation
- upload progress
- conversion progress (when applicable)
- success notifications

Users should never wonder whether something happened.

---

## Principle 4 — Mobile Is Not Optional

Every feature must be usable on:

- desktop
- laptop
- tablet
- mobile phone

Responsive behavior must be intentionally designed—not inherited accidentally.

Touch targets should be comfortable.

Scrolling should be predictable.

Horizontal scrolling should never occur unless the content itself requires it.

---

## Principle 5 — Familiar Interaction Patterns

Do not invent new interaction models.

Developers already understand:

- drag & drop
- upload buttons
- copy buttons
- download buttons
- keyboard shortcuts

Reuse familiar conventions whenever possible.

Consistency reduces learning time.

---

## Principle 6 — Progressive Disclosure

Show advanced functionality only when users need it.

Example:

Basic user:

- Upload CSV
- Convert
- Download JSON

Advanced user:

- Custom delimiter
- Header toggle
- Encoding
- Pretty/minified output

The default interface should remain clean.

---

## Principle 7 — Clear Feedback

Every action must produce visible feedback.

Examples:

✔ "Copied to clipboard."

✔ "Download started."

✔ "Conversion completed."

✔ "Invalid CSV detected."

Silence creates uncertainty.

---

## Principle 8 — Empty States Matter

An empty interface should still teach users what to do.

Examples include:

- drag-and-drop hints
- sample data buttons
- supported formats
- privacy reminder

An empty page should never feel broken.

---

## Principle 9 — Accessibility Is Part of UX

Accessibility is not a separate feature.

It is part of the user experience.

Every interaction should support:

- keyboard navigation
- screen readers
- focus indicators
- sufficient color contrast
- reduced motion preferences

If a user cannot access a feature, the feature is incomplete.

---

# Section 2.2 — Engineering Principles

## Principle 1 — Browser First

Whenever possible, processing should occur entirely inside the browser.

Benefits:

- privacy
- speed
- reduced infrastructure costs
- offline capability
- user trust

Server-side processing should be introduced only when technically necessary.

---

## Principle 2 — Local Processing by Default

User data belongs to the user.

Files should remain on the user's device whenever browser APIs can complete the task.

This principle applies to:

- uploads
- pasted data
- generated output

Privacy is a product feature.

---

## Principle 3 — Reuse Before Creating

Before creating a new component, determine whether an existing component satisfies the requirement.

Examples:

Reuse:

- Button
- Card
- Container
- Alert
- Header
- Footer

Avoid duplicate implementations.

Consistency reduces maintenance costs.

---

## Principle 4 — Predictable Architecture

The project structure should remain easy to understand.

Prefer:

- descriptive file names
- shallow component hierarchy
- reusable utilities
- modular code

Avoid deeply nested dependencies and tightly coupled components.

---

## Principle 5 — Build for Maintainability

Future readability is more important than clever implementations.

Code should be understandable by:

- new contributors
- future maintainers
- AI coding assistants

Readable code has a longer lifespan than clever code.

---

## Principle 6 — Fail Gracefully

Unexpected input should never crash the interface.

Instead:

- validate input
- explain the issue
- offer a recovery path

Every failure should produce a useful error message.

---

## Principle 7 — Performance Is a Requirement

Performance is considered a core feature.

Every implementation should minimize:

- bundle size
- unnecessary re-renders
- memory usage
- blocking operations

Heavy processing should use Web Workers where appropriate.

Performance should be measured—not assumed.

---

## Principle 8 — Offline First

Core functionality should continue working without an internet connection whenever technically possible.

Only features requiring external services may depend on connectivity.

Conversion tools should remain fully functional offline.

---

## Principle 9 — Incremental Complexity

Build the smallest complete solution first.

Version 1 should solve the primary problem exceptionally well.

Additional features should be added only after validating their usefulness.

Avoid building speculative functionality.

---

## Principle 10 — Production Ready by Default

Every completed feature must satisfy:

- passes production build
- no console errors
- no placeholder content
- no TODO comments
- no broken links
- no unused assets
- responsive layouts
- accessibility requirements
- performance targets

A feature is considered complete only when it is deployable without further engineering work.

---

# Chapter Summary

The principles in this chapter form the foundation of every future tool.

Design decisions, engineering trade-offs, feature requests, and code reviews should all reference these principles before implementation begins.

If uncertainty exists, choose the solution that best aligns with:

- simplicity
- consistency
- accessibility
- privacy
- maintainability
- performance


---

# Exception Process

The principles defined in this chapter are the default standards for every product built under the Free JSON Toolkit brand.

Exceptions are permitted only when there is a clear and documented product benefit.

Any exception must be recorded in the Tool PRD before implementation begins.

Each documented exception must include:

- The principle being overridden.
- Why the standard approach is not appropriate.
- Alternative solutions that were considered.
- The expected benefit to users.
- Any trade-offs introduced.
- Whether the exception is permanent or temporary.

Exceptions should be rare.

Repeated exceptions indicate that the Master PRD should be updated rather than continually bypassed.

The preferred order of decision-making is:

1. Follow the Master PRD.
2. Document any justified exception.
3. Update the Master PRD if the exception becomes a recurring pattern.

The goal is consistency across every tool while allowing thoughtful evolution of the product over time.



## Design Philosophy

Free JSON Toolkit is designed for developers and technical professionals who value speed, clarity, and reliability over visual novelty.

Every design decision should answer one question:

"Does this help users complete their task faster and with greater confidence?"

The design system follows five principles:

- Function before decoration
- Consistency over creativity
- Readability before density
- Speed over animation
- Simplicity over feature bloat


# Color System

## Brand Colors

Primary Brand

Green

HEX: #27C79A

Purpose:

- Brand recognition
- Primary actions
- Success indicators
- Links
- Interactive highlights

---

Canvas

White

HEX: #FFFFFF

Purpose:

Main page background.

---

Primary Text

Near Black

HEX: #171717

Purpose:

Headings

Paragraphs

Navigation

Buttons

---

Secondary Text

Gray

HEX: #666666

Purpose:

Supporting descriptions

Metadata

Helper text

---

Border

#E5E7EB

Purpose:

Cards

Inputs

Dividers

Tables

---

Success

#27C79A

---

Warning

#F59E0B

---

Error

#DC2626

---

Information

#2563EB

---

Color Rules

The green brand color should be used sparingly.

Never use green for large backgrounds.

White remains the dominant surface.

Near-black remains the dominant text color.

Use only one accent color on any screen.

Avoid introducing additional brand colors without updating this document.

Gradients are prohibited.

Glassmorphism is prohibited.

Heavy shadows are discouraged.

# Section 3.3 — Typography

Typography should prioritize readability, consistency, and efficient information scanning.

## Font Families

Primary UI Font

- Modern sans-serif
- Optimized for readability across desktop and mobile
- Single primary font family throughout the product

Monospace Font

Used for:

- JSON
- CSV
- XML
- YAML
- Code snippets
- Terminal output
- Error traces

Monospace text should never be used for general UI content.

---

## Type Scale

Typography should follow a consistent scale throughout the product.

Suggested hierarchy:

- Hero Title
- Page Title
- Section Heading
- Card Heading
- Body Text
- Supporting Text
- Caption
- Code

Font sizes should scale proportionally across breakpoints.

---

## Text Principles

Typography should:

- maximize readability
- avoid visual clutter
- maintain consistent spacing
- use clear heading hierarchy
- minimize unnecessary emphasis

Avoid:

- excessive bold text
- multiple font families
- decorative typography
- inconsistent heading sizes

---

## Documentation

Detailed typography specifications are maintained in:

docs/standards/design-system.md

# Section 3.4 — Layout & Spacing

Consistency in layout reduces cognitive load and improves maintainability.

## Layout Philosophy

Layouts should prioritize:

- predictable structure
- generous whitespace
- visual hierarchy
- responsive behavior

Every page should follow the same overall rhythm.

---

## Grid System

Use a consistent responsive grid.

Layouts should avoid arbitrary widths.

Containers should maintain comfortable reading widths while allowing editors and data tables to expand where appropriate.

---

## Breakpoints

The project follows a mobile-first approach.

Recommended breakpoints:

- Small Mobile
- Large Mobile
- Tablet
- Laptop
- Desktop
- Wide Desktop

Breakpoint values are maintained in:

docs/standards/design-system.md

---

## Spacing Scale

Spacing should use a defined scale.

Examples include:

XS

SM

MD

LG

XL

XXL

Avoid arbitrary spacing values.

Every margin and padding value should come from the spacing scale.

---

## Alignment

Prefer left alignment for text.

Center alignment should be reserved for:

- hero sections
- empty states
- loading screens

Avoid inconsistent alignment within the same component.



# Button

Purpose

Triggers a user action.

Variants

Primary

Secondary

Danger

Disabled

States

Default

Hover

Focus

Active

Disabled

Loading

Rules

Only one Primary button per section.

Never place two Primary buttons side by side.

Primary buttons use brand green.

Secondary buttons use neutral styling.

Danger buttons use red.

Loading buttons must keep the same width to avoid layout shift.

Accessibility

Minimum touch target: 44 × 44 px

Visible keyboard focus required.

Button text must describe the action.

# Design Anti-Patterns

The following patterns are intentionally prohibited.

## Do Not Introduce New Brand Colors

All new interfaces must use the approved color palette.

---

## Do Not Use Gradients

Flat surfaces improve readability and maintain visual consistency.

---

## Do Not Use Glassmorphism

Transparency reduces contrast and distracts from content.

---

## Do Not Create Duplicate Components

Reuse existing components before creating new ones.

---

## Do Not Change Spacing Arbitrarily

Use the spacing scale defined in this document.

---

## Do Not Mix Typography Styles

Follow the approved heading and body text hierarchy.

---

## Do Not Add Decorative Animations

Animations should communicate state changes—not decorate the interface.

---

## Do Not Create Long Scrolling Experiences Without Purpose

Pages should remain focused.

Additional educational content should be useful rather than simply increasing page length.

---

## Do Not Break Mobile Layouts

Horizontal scrolling is considered a defect unless required by the content itself (for example, wide data tables).

---

## Do Not Hide Errors

Errors must clearly explain:

- What happened.
- Why it happened.
- How the user can fix it.

---

## Do Not Introduce Inconsistent Interaction Patterns

Every tool should feel familiar to someone who has already used another Free JSON Toolkit tool.


# Section 3.6 — Icons & Imagery

Visual assets should reinforce clarity rather than decorate the interface.

## Logo

The approved Free JSON Toolkit logo must be used consistently.

Do not modify:

- colors
- proportions
- spacing
- aspect ratio

---

## Favicons

All favicon assets should represent the approved brand identity.

Multiple favicon formats may exist to support different browsers and devices, but they must all represent the same brand.

---

## Icons

Icons should:

- use one consistent style
- clearly communicate actions
- support text rather than replace it

Avoid decorative icons without functional value.

---

## Images

Images should be used sparingly.

Prefer:

- screenshots
- diagrams
- educational illustrations

Avoid:

- generic stock photography
- decorative hero graphics
- images unrelated to the tool

---

## Optimization

Every image should be optimized for:

- file size
- responsive delivery
- accessibility
- modern formats where appropriate


# Section 3.7 — Motion & Feedback

Motion exists to communicate state changes—not to entertain.

## Motion Principles

Animations should:

- feel fast
- remain subtle
- improve usability
- never delay interactions

---

## Appropriate Motion

Examples include:

- hover transitions
- button feedback
- accordion expansion
- loading indicators
- success confirmations
- progress indicators

---

## Avoid

- decorative animations
- looping animations
- unnecessary page transitions
- distracting effects

---

## Reduced Motion

Users requesting reduced motion should receive a simplified experience.

Animations should respect browser accessibility preferences.

---

## Feedback

Every meaningful action should provide feedback.

Examples:

- copied successfully
- conversion complete
- download started
- upload finished
- validation passed

# Section 3.8 — Responsive Design

Every page must provide an excellent experience across supported devices.

Responsive design is a product requirement.

---

## Mobile First

Interfaces should be designed for mobile before expanding to larger screens.

Desktop enhancements should never break mobile usability.

---

## Responsive Behavior

Components should:

- resize gracefully
- stack logically
- avoid overflow
- maintain readable typography

---

## Tables

Large datasets may scroll horizontally when necessary.

The overall page should never require horizontal scrolling.

---

## Editors

Editors should remain usable on smaller screens through adaptive layouts rather than fixed dimensions.

---

## Touch Targets

Interactive elements should remain comfortable for touch interaction.

Buttons, inputs, and controls should be appropriately sized for mobile devices.

---

## Testing

Every release should be verified across representative mobile, tablet, laptop, and desktop viewports.

Responsive testing is part of the QA process.


# Section 3.9 — Accessibility

Accessibility is a core product requirement.

Every user should be able to use the toolkit regardless of input method or ability.

---

## Semantic HTML

Use semantic HTML wherever possible.

Avoid replacing native elements with custom implementations without a clear benefit.

---

## Keyboard Navigation

Every interactive element must be accessible using only a keyboard.

Visible focus indicators are required.

---

## Screen Readers

Interfaces should expose meaningful labels and structure.

Use appropriate ARIA attributes only when native HTML cannot provide the required semantics.

---

## Color Contrast

Text and controls must meet accepted accessibility contrast requirements.

Color should never be the sole method of communicating information.

---

## Forms

Inputs must include:

- labels
- validation
- accessible error messages
- clear focus states

---

## Media

Images should include appropriate alternative text where required.

Decorative images should not interfere with assistive technologies.

---

## Accessibility Testing

Accessibility should be verified throughout development rather than treated as a final review step.

Detailed accessibility guidance is maintained in:

docs/standards/accessibility.md


# Section 3.5 — Component Standards

Reusable components ensure consistency across every tool.

Every component specification must define:

- Purpose
- Variants
- States
- Behavior
- Accessibility
- Usage Rules
- Common Mistakes

Detailed component specifications are maintained in:

docs/components/

Examples include:

- button.md
- card.md
- editor.md
- upload.md
- table.md
- header.md
- footer.md
- faq.md
- alert.md
- toast.md


---

# Chapter 4 — Tool Standards

> This chapter defines the engineering, UX, functional, performance, and quality standards that every Free JSON Toolkit tool must follow. These standards ensure consistency across the product and establish a repeatable blueprint for future development.

---

# 4.1 Universal Tool Page Structure

Every tool page should follow the same overall structure unless a documented exception exists.

```
Header

↓

Breadcrumbs (Optional)

↓

Hero
• H1
• Short description
• Primary CTA (if applicable)

↓

Tool Workspace
• Input
• Controls
• Output

↓

Action Bar
• Copy
• Download
• Upload
• Sample Data
• Clear / Reset

↓

Feedback Area
• Validation
• Errors
• Success Messages

↓

How It Works

↓

Features & Benefits

↓

FAQ

↓

Related Tools

↓

Footer
```

## Rules

* Users should understand the page purpose within five seconds.
* The workspace must remain above the fold on desktop whenever practical.
* Supporting content should educate without distracting from the primary task.
* Every tool should feel familiar to users of other Free JSON Toolkit tools.

---

# 4.2 Tool Categories

Every tool belongs to one primary category.

## Converter

Examples:

* JSON → CSV
* CSV → JSON
* XML → JSON

Standard workflow:

```
Input

↓

Convert

↓

Output
```

---

## Formatter

Examples:

* JSON Formatter
* XML Formatter
* SQL Formatter

Workflow:

```
Input

↓

Formatting Options

↓

Formatted Output
```

---

## Validator

Examples:

* JSON Validator
* YAML Validator

Workflow:

```
Input

↓

Validate

↓

Errors / Success
```

---

## Generator

Examples:

* UUID Generator
* Password Generator
* Lorem Ipsum

Workflow:

```
Options

↓

Generate

↓

Output

↓

Copy
```

---

## Encoder / Decoder

Examples:

* Base64
* URL Encode
* JWT Decode

Workflow:

```
Input

↓

Encode / Decode

↓

Output
```

---

## Analyzer

Examples:

* JSON Statistics
* CSV Inspector

Workflow:

```
Input

↓

Analysis

↓

Insights
```

---

## Editor

Examples:

* CSV Table Editor
* JSON Tree Editor

Workflow:

```
Editor

↓

Toolbar

↓

Export
```

A tool should conform to one category unless there is a documented reason to combine workflows.

---

# 4.3 Universal Functional Requirements

Unless technically impossible, every tool should support:

## Core Features

* Paste input
* Drag-and-drop upload (where files are relevant)
* File upload
* Sample data
* Copy output
* Download output
* Clear input/output
* Reset tool state

## User Feedback

Every significant action should provide immediate feedback.

Examples:

* "Copied to clipboard."
* "Conversion completed."
* "Validation successful."
* "Download started."

Silent actions should be avoided.

## Empty States

Every tool must explain what to do before the user provides input.

## Progressive Enhancement

Tools should remain usable even if optional browser capabilities are unavailable.

---

# 4.4 Category-Specific Standards

Each category has additional requirements.

### Converter

* Preserve data integrity.
* Detect malformed input where possible.
* Warn users about unsupported formats.
* Offer downloadable output.

### Formatter

* Never modify data semantics.
* Preserve valid structure.
* Explain formatting failures.

### Validator

* Report the exact error location.
* Explain the error in plain language.
* Distinguish warnings from errors.

### Generator

* Produce deterministic output when configured.
* Support regeneration.
* Allow one-click copying.

### Encoder / Decoder

* Support round-trip conversion.
* Clearly identify invalid input.

### Analyzer

* Summarize findings clearly.
* Highlight important issues first.
* Never overwhelm users with unnecessary detail.

### Editor

* Support undo/redo where practical.
* Preserve unsaved changes during editing.
* Prevent accidental data loss.

---

# 4.5 Error Handling Standards

Errors should help users solve problems—not simply report failures.

Every error message should answer:

1. What happened?
2. Why did it happen?
3. How can the user fix it?

Example:

❌ Invalid JSON.

Better:

> The uploaded file contains invalid JSON. Check for missing commas, unmatched braces, or invalid quotation marks before trying again.

Avoid technical stack traces unless they provide actionable value.

Errors should be:

* specific
* actionable
* concise
* respectful

---

# 4.6 Performance Standards

Performance is a product feature.

Every tool should prioritize:

* client-side processing whenever possible
* fast interaction
* minimal memory usage
* responsive UI during long-running operations

Requirements:

* Avoid unnecessary re-renders.
* Minimize bundle size.
* Support reasonably large files within browser limitations.
* Show progress indicators for operations that may take noticeable time.
* Prevent browser freezes where feasible.

Performance expectations should be documented in each Tool PRD.

---

# 4.7 SEO Standards (Tool Level)

Every tool page should satisfy the following requirements.

## Metadata

* Unique title
* Unique meta description
* Canonical URL
* Open Graph metadata
* Twitter metadata

## Content

* Clear H1
* Supporting introduction
* Educational content
* FAQ
* Internal links to related tools

## Structured Data

Where appropriate, implement Schema.org structured data such as:

* WebApplication
* FAQPage
* BreadcrumbList

## Keywords

Each Tool PRD must define:

* Primary keyword
* Supporting keywords
* Search intent
* Competitor targets

SEO should improve discoverability without reducing usability.

---

# 4.8 Quality Assurance & Release Checklist

A tool is considered complete only when all applicable checks have passed.

## User Experience

* Clear purpose
* Consistent layout
* Mobile responsive
* Keyboard accessible
* Helpful empty state
* Helpful success/error feedback

## Functionality

* Copy works
* Download works (if applicable)
* Upload works (if applicable)
* Sample data works
* Reset works
* No broken interactions

## Performance

* Client-side processing verified
* Large-file behavior tested
* No unnecessary loading delays
* No browser crashes under expected workloads

## Accessibility

* Semantic HTML
* Keyboard navigation
* Visible focus states
* Accessible forms
* Sufficient color contrast

## SEO

* Metadata complete
* Structured data validated
* Internal links present
* Sitemap updated (if required)
* Robots configuration verified

## Quality

* No console errors
* Production build succeeds
* Responsive testing completed
* Cross-browser testing completed
* Documentation updated
* Tool PRD completed

No tool should be released until this checklist has been satisfied or approved exceptions have been documented.

---


# Chapter 6 — AI Engineering Rules

This chapter defines how AI assistants participate in the development of Free JSON Toolkit.

AI is treated as an engineering collaborator, not an autonomous decision maker.

Every AI-generated contribution must follow the Master PRD, Design System, Tool Standards, and SEO Standards.

When conflicts exist, the Master PRD is the source of truth.

---

# 6.1 Role of AI

AI exists to accelerate engineering, not replace engineering judgment.

AI may assist with:

- writing code
- refactoring
- documentation
- testing
- accessibility improvements
- SEO implementation
- bug fixing
- performance optimization
- generating boilerplate
- explaining existing code

Final product decisions remain the responsibility of the project owner.

---

# 6.2 Decision Authority

## AI May Decide

AI may make autonomous decisions when they involve:

- code formatting
- variable naming
- file organization (within project conventions)
- component extraction
- small performance improvements
- accessibility improvements
- documentation improvements
- bug fixes that do not alter product behavior
- implementation details that satisfy existing standards

These decisions should not require user approval.

---

## AI Must Ask Before Proceeding

AI must request approval before:

- changing the user experience
- modifying page layouts
- introducing new dependencies
- changing branding
- changing navigation
- changing SEO strategy
- removing existing features
- changing URLs
- altering analytics behavior
- modifying structured data strategy
- introducing server-side processing
- collecting user data
- changing privacy behavior

When uncertain, AI should ask rather than assume.

---

# 6.3 Code Generation Standards

Generated code must:

- be readable
- be maintainable
- follow project conventions
- avoid duplication
- prioritize simplicity
- use descriptive naming
- include comments only where they improve understanding

Avoid:

- unnecessary abstractions
- deeply nested logic
- clever but unreadable solutions
- dead code
- placeholder implementations

Prefer explicit, understandable code over overly compact code.

---

# 6.4 Review Requirements

Every AI-generated contribution should be reviewed before release.

The review should verify:

## Functional

- Requirements satisfied
- No regressions
- Correct behavior

## Design

- Matches Design System
- Responsive
- Accessible

## Engineering

- No unnecessary complexity
- No duplicated logic
- No unused code
- No unnecessary dependencies

## SEO

- Metadata correct
- Structured data valid
- Internal links updated where applicable

AI-generated code is not exempt from review.

---

# 6.5 Security & Privacy Guardrails

Privacy is a core product principle.

AI must never introduce features that violate that principle without explicit approval.

Unless required by the Tool PRD:

- do not upload user files
- do not transmit user content
- do not log sensitive data
- do not store user files
- do not introduce third-party tracking beyond approved analytics
- do not expose secrets in client code

Prefer browser APIs whenever technically feasible.

If server-side processing becomes necessary, the Tool PRD must document the reason.

---

# 6.6 Dependency Policy

Every dependency increases maintenance cost.

Before introducing a new dependency, AI should ask:

- Does the platform already provide this capability?
- Can existing project code solve this?
- Is the dependency actively maintained?
- Does it significantly improve developer or user experience?
- Does it increase bundle size unnecessarily?

Dependencies should be introduced only when they provide clear long-term value.

---

# 6.7 Performance Rules

Generated code should:

- minimize JavaScript
- avoid unnecessary re-renders
- avoid blocking the main thread
- process data efficiently
- use lazy loading where appropriate
- optimize bundle size

Performance regressions should be treated as defects.

---

# 6.8 Accessibility Requirements

AI-generated interfaces must follow the accessibility standards defined in Chapter 3.

At minimum:

- semantic HTML
- keyboard navigation
- visible focus states
- accessible labels
- sufficient contrast
- meaningful error messages

Accessibility should never be deferred as a "future improvement."

---

# 6.9 Documentation Requirements

Every significant implementation should update documentation when appropriate.

Examples include:

- new reusable components
- new engineering patterns
- architectural decisions
- Tool PRDs
- release checklists

Documentation is part of the deliverable, not an optional task.

---

# 6.10 AI Completion Checklist

Before considering a task complete, AI should verify:

- [ ] Requirements satisfied
- [ ] Master PRD followed
- [ ] Design System followed
- [ ] Tool Standards followed
- [ ] Accessibility verified
- [ ] Responsive behavior verified
- [ ] SEO implemented
- [ ] No console errors
- [ ] No unnecessary dependencies
- [ ] Documentation updated
- [ ] Release checklist completed (where applicable)

AI should not declare work "finished" until this checklist has been satisfied or any exceptions have been documented.


---

# Chapter 7 — Tool PRD Template

Every new tool begins with this document.

The Tool PRD defines the product, engineering, SEO, UX, and quality requirements for a single tool.

Implementation should not begin until the Tool PRD has been reviewed.

---

# 1. Tool Information

Tool Name:

Category:

Version:

Status:

Owner:

Created:

Last Updated:

Target Release:

---

# 2. Overview

## Purpose

What problem does this tool solve?

---

## Target Users

Who is this tool for?

---

## Success Criteria

How will we know the tool succeeds?

---

# 3. SEO Brief

Reference:

docs/templates/seo-brief.md

Complete the SEO Brief before implementation.

Include:

- Primary keyword
- Supporting keywords
- Search intent
- Competitor analysis
- Content outline
- Internal linking plan

---

# 4. Functional Requirements

## Inputs

Describe all supported input methods.

Examples:

- Paste
- Upload
- Drag & Drop
- URL
- Sample Data

---

## Processing

Describe exactly how the tool behaves.

Include:

- validation
- conversion
- formatting
- generation
- analysis

---

## Outputs

Describe:

- displayed results
- downloadable files
- copy behavior
- export formats

---

## Toolbar Actions

Specify every available action.

Examples:

- Copy
- Download
- Clear
- Reset
- Upload
- Generate
- Validate

---

# 5. User Experience

Reference:

Master PRD Chapter 3

Describe any tool-specific UX requirements.

Include:

- empty state
- onboarding text
- loading states
- success states
- error states

---

# 6. Page Structure

Follow the universal page template defined in Chapter 4.

Document any justified deviations.

Typical structure:

Header

↓

Hero

↓

Workspace

↓

Action Bar

↓

Feedback

↓

How It Works

↓

Features

↓

FAQ

↓

Related Tools

↓

Footer

---

# 7. Components

Reference:

docs/components/

List reusable components required.

Examples:

- Button
- Card
- Editor
- Upload
- Toolbar
- Alert
- FAQ
- Table

Document any new reusable components introduced by this tool.

---

# 8. Performance Requirements

Expected file sizes:

Processing expectations:

Memory considerations:

Progress indicators required?

Performance risks:

---

# 9. Accessibility

List any accessibility considerations beyond the Design System.

Examples:

- keyboard shortcuts
- ARIA requirements
- screen reader announcements

---

# 10. Error Handling

List every expected error.

For each error define:

- Trigger
- Message
- Recovery

Example:

Invalid JSON

Trigger:

Malformed JSON input.

Message:

"The uploaded file contains invalid JSON. Check for missing commas or unmatched braces."

Recovery:

Correct the input and validate again.

---

# 11. Responsive Requirements

Document any tool-specific responsive behavior.

Examples:

- stacked editors
- horizontal scrolling
- adaptive tables

---

# 12. Analytics

Events to track:

Examples:

- conversion_completed
- file_uploaded
- copy_clicked
- download_clicked
- sample_loaded

---

# 13. Security & Privacy

Confirm:

- client-side processing
- no file storage
- no unnecessary network requests
- approved analytics only

Document any exceptions.

---

# 14. SEO Requirements

Reference:

Master PRD Chapter 5

Confirm:

- metadata
- structured data
- FAQ
- internal links
- related tools

---

# 15. Testing

Reference:

docs/templates/tool-checklist.md

Document any additional tests required for this tool.

---

# 16. Exceptions

Reference:

Master PRD Exception Process

Document every approved exception.

Include:

- overridden standard
- justification
- alternatives considered
- expected benefit
- trade-offs

---

# 17. Release Notes

Version:

Summary:

Known limitations:

Future improvements:

---

# Related Documents

Master PRD

docs/templates/seo-brief.md

docs/templates/tool-checklist.md

docs/components/

docs/standards/


---

