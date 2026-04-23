# Eye Test Website (Vision Analytics Project)

## Overview

This project is a full-stack web application that simulates a simplified
eye examination system inspired by the Snellen vision test. It allows a
user to select the smallest readable line on a visual chart, generates a
corresponding vision score (e.g., 20/40, 20/100), and then visualizes
and stores that result for analysis.

The application includes a frontend interface, a backend server written
in Python, and a lightweight JSON-based storage system.

This project was created as part of a "Learn Something -- Teach
Something" academic presentation focused on understanding vision,
specifically myopia (nearsightedness), and how eye shape, aging, and
refractive errors affect how light is focused in the human eye.

## Important Note on Development Approach

This project is heavily AI-assisted. It was not built entirely from
independent programming knowledge. Instead, AI tools were used to help
design, structure, and implement much of the system, including backend
routing, frontend logic, and data visualization.

However, the project reflects an understanding of the underlying
concepts, particularly how vision testing works and how data can be
represented in a web application.

## Presentation Context

### Research Question

Why do some people develop blurry vision, and how do eye shape, aging,
and common eye conditions affect the way light focuses in the human eye?

### Personal Motivation

The topic is personally relevant due to my own experience with myopia
(nearsightedness), where distant objects appear blurred while nearby
objects remain clear. This project was an attempt to better understand
whether this condition is caused by environmental factors such as screen
usage, reading habits, or primarily by genetics and physiological
structure of the eye.

### Research Sources

-   National Eye Institute:
    https://www.nei.nih.gov/eye-health-information/eye-conditions-and-diseases/refractive-errors\
-   Centers for Disease Control and Prevention:
    https://www.cdc.gov/vision-health/about-eye-disorders/index.html\
-   MedlinePlus: https://medlineplus.gov/refractiveerrors.html\
-   Mayo Clinic:
    https://www.mayoclinic.org/diseases-conditions/astigmatism/symptoms-causes/syc-20353835

## Project Structure

The project is organized into a backend folder and a frontend folder:

eyewebsite/ - back-end/ - server.py - submissions.json - front-end/ -
front-page/ - index.html - script.js - style.css - analysis-page/ -
index.html - script.js - style.css - result-page/ - index.html -
script.js - style.css

## Features

### Eye Test Simulation

The front page presents a simplified vision chart. The user selects the
smallest line they can read, which corresponds to a numerical vision
score.

### Result Visualization

The result page displays: - A calculated vision score in 20/X format - A
blur simulation that visually represents reduced visual acuity - A
descriptive explanation of the selected vision level - An interactive
comparison tool between sharp and blurred images

### Submission System

Users can submit their name and vision result. Before submission, a
confirmation modal appears showing the entered name and vision score.
The submission is then stored in a backend JSON file.

To prevent repeated submissions, a browser cookie is used to mark
whether a user has already submitted a result.

### Analytics Dashboard

The analysis page provides aggregated data visualizations including: -
Total number of submissions - Average vision score - Best and worst
recorded vision results - Distribution of vision categories using pie
and bar charts - A timeline-style visualization of all submissions - A
table listing all stored entries

Charts are implemented using Chart.js.

## Backend System

The backend is implemented in Python using the built-in HTTP server
module. It serves two primary purposes:

1.  Hosting static frontend files
2.  Handling API requests for data submission and retrieval

### API Endpoints

-   GET /api/submissions\
    Returns all stored submissions from the JSON file.

-   POST /api/submit\
    Accepts a JSON payload containing:

    -   name
    -   vision\
        and appends it to the submissions file.

## Data Storage

All submissions are stored in a local JSON file (submissions.json). This
acts as a lightweight database alternative suitable for small-scale
projects and educational demonstrations.

Additionally: - localStorage is used to pass vision data between pages -
cookies are used to prevent duplicate submissions per browser session

## Limitations

-   There is no authentication system
-   Cookie-based submission prevention is client-side and can be
    bypassed
-   JSON file storage is not suitable for concurrent or large-scale
    usage
-   The system is intended for educational and demonstration purposes
    only

## Key Learning Outcomes

This project demonstrates understanding of:

-   How vision is measured using the 20/X system
-   How refractive errors affect visual perception
-   Client-server communication using HTTP requests
-   Frontend state management using cookies and localStorage
-   Data visualization using Chart.js
-   Basic backend routing and file handling in Python
-   Full-stack application architecture

## Conclusion

This project bridges biological concepts of human vision with computer
science principles such as data collection, processing, and
visualization. It serves as a functional demonstration of how scientific
concepts can be translated into interactive educational tools using web
technologies.
