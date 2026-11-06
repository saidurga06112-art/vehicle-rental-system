# DriveEasy – Vehicle Rental Website

A vehicle rental CRUD project built with HTML, CSS, JavaScript, Node.js, Express and MySQL.

## Requirements
- Node.js 18+
- MySQL 8+
- A browser

## Setup

1. Open MySQL Workbench or the MySQL command line.
2. Run `database/vehicle_rental.sql` to create the database and tables.
   - The SQL schema matches the column names used by the Express API.
   - If you already have an older `vehicle_rental` database with different columns, back it up first. For a fresh setup, drop the old database and run this SQL again.
3. Open a terminal in the `server` folder.
4. Install dependencies:

   ```bash
   npm install
   ```

5. Copy `.env.example` to `.env` and update your MySQL credentials:

   ```env
   PORT=3000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=vehicle_rental
   ```

6. Start the server:

   ```bash
   npm start
   ```

7. Visit `http://localhost:3000`.

## Pages
- `/` – Home
- `/vehicles.html` – Vehicle catalogue
- `/booking.html` – Customer booking form
- `/admin.html` – Vehicle CRUD and booking status management

## CRUD
- Create: Admin → Add vehicle
- Read: Vehicle catalogue and admin inventory
- Update: Admin → Edit
- Delete: Admin → Delete (vehicles with booking history are protected by the database relationship; set them to Maintenance instead)

## API health check
Open `http://localhost:3000/api/health`.

## Important
- Keep `.env` private. Never upload it to GitHub.
- This is a learning/demo project. Add authentication and authorization before exposing the admin panel publicly.
