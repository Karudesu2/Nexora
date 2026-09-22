# Controllers

Key controllers include `AuthController`, `DashboardController`, `CalendarController`, `AcademicContextController`, and `AdminUserController`.

`AdminUserController` lists users and changes roles only after Laravel policy authorization. It records role updates in `activity_logs` without passwords or tokens.
