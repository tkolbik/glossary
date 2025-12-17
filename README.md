A setup web application ready to be deployed for creating and managing multilingual glossary

Prerequisites
Backend
- .NET 7 SDK
- MySQL Server (8.x)+
Frontend
- Node.js 16+ with npm

The backend requires the following environment variables.

- `MYSQLHOST` - MySQL server host
- `MYSQL_DATABASE` - Database name
- `MYSQLUSER` - Database username
- `MYSQLPASSWORD` - Database password
- `JwtKey` - Secret key for JWT tokens (use a long random string, 32+ characters)
- `JwtIssuer` - JWT issuer URL (e.g., `https://localhost`)
- `JwtAudience` - JWT audience URL (e.g., `https://localhost`)

Run the Backend

dotnet restore
dotnet run

Run Frontend

npm install
npm start

The first time you run the application set up the admin account at `http://<frontend_host>/login`
