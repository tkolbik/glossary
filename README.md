A setup web application ready to be deployed for creating and managing multilingual glossary

Prerequisites
Backend
- .NET 7 SDK
- MySQL Server (8.x)+
Frontend
- Node.js 16+ with npm

The backend requires the following environment variables set up in appsettings.json

- `MYSQLHOST` - MySQL server host
- `MYSQL_DATABASE` - Database name
- `MYSQLUSER` - Database username
- `MYSQLPASSWORD` - Database password
- `JwtKey` - Secret key for JWT tokens (use a long random string, 32+ characters)
- `JwtIssuer` - JWT issuer URL (e.g., `https://localhost`)
- `JwtAudience` - JWT audience URL (e.g., `https://localhost`)

Run the Backend
  navigate to backend/glossaryapi folder
  Run commands in order:
    dotnet build
    dotnet ef migrations add Initial
    dotnet ef database update
    dotnet run

Run Frontend
 navigate to frontend folder
 Run commands:
  npm install
  npmstart

The first time you run the application set up the admin account at `http://<frontend_host>/login`

