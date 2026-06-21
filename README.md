# Will's To-do Manager

A full-stack task management app with a React frontend and a .NET 9 REST API backed by SQLite.

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- [.NET 9 SDK](https://dotnet.microsoft.com/download/dotnet/9.0)

## Project structure

```
to-do-manager/
├── backend/
│   └── TodoManager.Api/   # ASP.NET Core Web API
└── frontend/              # React + Vite app
```

## Running the app

### Using the start script (recommended)

From the project root in PowerShell:

```powershell
.\start.ps1
```

This opens the backend and frontend each in their own PowerShell window. Once both are running, open **http://localhost:5173** in your browser.

> **First run:** install frontend dependencies before using the script:
> ```powershell
> cd frontend
> npm install
> cd ..
> ```

### Manually (two terminals)

**Terminal 1 — backend:**
```bash
cd backend/TodoManager.Api
dotnet run
```

**Terminal 2 — frontend:**
```bash
cd frontend
npm install   # only needed the first time
npm run dev
```

The API runs on **http://localhost:5000** and the app on **http://localhost:5173**. The SQLite database (`todos.db`) is created automatically on first run — no setup required.

## Features

This app allows basic task management. You can create a task with a title, description and due date. Each task can be given a status (New, Active, In progress, Blocked, Closed) and assigned to a team member. You can view and edit tasks, including filtering by who they are assigned to or status. Tasks that are past their due date and not closed are flagged as overdue. You can add or remove team members. The team members that you have added, will be the team members that show up as options to assign tasks to.

This was designed to look good on devices of any size, be accessibility compliant in terms of being keyboard navigatable, understandable when using a screen reader, and meeting required color contrast thresholds.

## Assumptions

- The app is built with the assumption that it is being used by one team, where any user has full access to all tasks.
- Tasks are assumed to not need attachments or lengthy descriptions/context.
- It's assumed that a relatively small amount of tasks will be there at any given time, such that you don't need options like searching for tasks or specific filtered views like only tasks due within the next week.
- This was built with the idea that the number of team members will be relatively small (like less than 20).
- It's assumed that only one user will be editing tasks at a time (it doesn't have conflict detection logic or auto refresh logic to automatically show a new task that someone else created while you are looking at the tasks view).

## Scalability

This app is not built to handle large amounts of data. If there are significant numbers of tasks and/or team members changes would need to be made to accommodate that. Instead of loading all of them at once, it should load only some of them at any given time and implement something like pagination. Additionally, UX changes would be helpful to better handle large amounts of options. For example, there should be a search bar in the dropdown to assign a task that lets the user start typing the name of the person to assign and shows options of people who match the search input. The usage of SQLite also limits it to be run on one server; to scale truly large it would need to use an actual SQL database.

## Possible improvements

- If this was going to be used in cases where not everyone has access to everything, it would need user accounts so users can log in and only see the tasks they have access to.
- To handle multiple teams, there could be an option to assign tasks to teams and have views filtering by team.
- Tasks could have comments to allow people to add additional information.
- It could have analytics views allowing user to analyze historical data of tasks.
- Those analytics views could be enhanced with AI insights into the data.