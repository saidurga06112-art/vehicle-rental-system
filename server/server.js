
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const db = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

// ===============================
// MIDDLEWARE
// ===============================

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "../public")));

// ===============================
// HOME PAGE
// ===============================

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "../public/index.html"));
});

// ===============================
// VEHICLES CRUD
// ===============================

// GET ALL VEHICLES
app.get("/api/vehicles", async (req, res) => {
    try {
        const [vehicles] = await db.query(`
            SELECT *
            FROM vehicles
            ORDER BY vehicle_id DESC
        `);

        res.json(vehicles);
    } catch (error) {
        console.error("Vehicle loading error:", error.message);
        res.status(500).json({
            message: "Could not load vehicles",
            error: error.message
        });
    }
});

// GET VEHICLE BY ID
app.get("/api/vehicles/:id", async (req, res) => {
    try {
        const [vehicles] = await db.query(
            "SELECT * FROM vehicles WHERE vehicle_id = ?",
            [req.params.id]
        );

        if (vehicles.length === 0) {
            return res.status(404).json({
                message: "Vehicle not found"
            });
        }

        res.json(vehicles[0]);
    } catch (error) {
        console.error("Vehicle details error:", error.message);
        res.status(500).json({
            message: "Could not load vehicle",
            error: error.message
        });
    }
});

// ADD VEHICLE
app.post("/api/vehicles", async (req, res) => {
    try {
        const {
            veh_name,
            vehicle_num,
            veh_time,
            veh_model,
            rent_per_day,
            status,
            image_url
        } = req.body;

        if (
            !veh_name?.trim() ||
            !vehicle_num?.trim() ||
            !veh_time?.trim() ||
            !veh_model?.trim() ||
            !Number.isFinite(Number(rent_per_day)) ||
            Number(rent_per_day) <= 0
        ) {
            return res.status(400).json({
                message: "Please enter all required vehicle details"
            });
        }

        const [result] = await db.query(
            `INSERT INTO vehicles
            (veh_name, vehicle_num, veh_time, veh_model,
             rent_per_day, status, image_url)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                veh_name.trim(),
                vehicle_num.trim(),
                veh_time.trim(),
                veh_model.trim(),
                Number(rent_per_day),
                status || "Available",
                image_url || null
            ]
        );

        res.status(201).json({
            message: "Vehicle added successfully",
            vehicle_id: result.insertId
        });

    } catch (error) {
        console.error("Vehicle creation error:", error.message);

        res.status(error.code === "ER_DUP_ENTRY" ? 409 : 500).json({
            message: error.code === "ER_DUP_ENTRY"
                ? "Vehicle registration number already exists"
                : "Could not add vehicle",
            error: error.message
        });
    }
});

// UPDATE VEHICLE
app.put("/api/vehicles/:id", async (req, res) => {
    try {
        const {
            veh_name,
            vehicle_num,
            veh_time,
            veh_model,
            rent_per_day,
            status,
            image_url
        } = req.body;

        if (
            !veh_name?.trim() ||
            !vehicle_num?.trim() ||
            !veh_time?.trim() ||
            !veh_model?.trim() ||
            !Number.isFinite(Number(rent_per_day)) ||
            Number(rent_per_day) <= 0
        ) {
            return res.status(400).json({
                message: "Please enter valid vehicle details"
            });
        }

        const [result] = await db.query(
            `UPDATE vehicles SET
                veh_name = ?,
                vehicle_num = ?,
                veh_time = ?,
                veh_model = ?,
                rent_per_day = ?,
                status = ?,
                image_url = ?
             WHERE vehicle_id = ?`,
            [
                veh_name.trim(),
                vehicle_num.trim(),
                veh_time.trim(),
                veh_model.trim(),
                Number(rent_per_day),
                status || "Available",
                image_url || null,
                req.params.id
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Vehicle not found"
            });
        }

        res.json({
            message: "Vehicle updated successfully"
        });

    } catch (error) {
        console.error("Vehicle update error:", error.message);

        res.status(error.code === "ER_DUP_ENTRY" ? 409 : 500).json({
            message: "Could not update vehicle",
            error: error.message
        });
    }
});

// DELETE VEHICLE
app.delete("/api/vehicles/:id", async (req, res) => {
    try {
        const [result] = await db.query(
            "DELETE FROM vehicles WHERE vehicle_id = ?",
            [req.params.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: "Vehicle not found"
            });
        }

        res.json({
            message: "Vehicle deleted successfully"
        });

    } catch (error) {
        console.error("Vehicle deletion error:", error.message);

        const linked =
            error.code === "ER_ROW_IS_REFERENCED_2" ||
            error.code === "ER_ROW_IS_REFERENCED";

        res.status(linked ? 409 : 500).json({
            message: linked
                ? "Vehicle has booking history. It cannot be deleted."
                : "Could not delete vehicle",
            error: error.message
        });
    }
});

// ===============================
// BOOKINGS
// ===============================

// GET ALL BOOKINGS
app.get("/api/bookings", async (req, res) => {
    try {
        const [bookings] = await db.query(`
            SELECT
                b.booking_id AS id,
                b.booking_id,
                b.vehicle_id,
                b.customer_name,
                b.customer_phone AS phone,
                b.booking_date AS pickup_date,
                b.return_date,
                b.total_amount,
                b.status,
                b.created_at,
                v.veh_name,
                v.vehicle_num,
                v.veh_model AS model,
                v.rent_per_day
            FROM bookings b
            JOIN vehicles v ON b.vehicle_id = v.vehicle_id
            ORDER BY b.booking_id DESC
        `);

        res.json(bookings);

    } catch (error) {
        console.error("Booking loading error:", error.message);
        res.status(500).json({
            message: "Could not load bookings",
            error: error.message
        });
    }
});

// GET BOOKING BY ID
app.get("/api/bookings/:id", async (req, res) => {
    try {
        const [bookings] = await db.query(`
            SELECT b.*, v.veh_name, v.vehicle_num,
                   v.veh_model AS model
            FROM bookings b
            JOIN vehicles v ON b.vehicle_id = v.vehicle_id
            WHERE b.booking_id = ?
        `, [req.params.id]);

        if (bookings.length === 0) {
            return res.status(404).json({
                message: "Booking not found"
            });
        }

        res.json(bookings[0]);

    } catch (error) {
        console.error("Booking details error:", error.message);
        res.status(500).json({
            message: "Could not load booking",
            error: error.message
        });
    }
});

// CREATE BOOKING
app.post("/api/bookings", async (req, res) => {
    let connection;

    try {
        const {
            vehicle_id,
            customer_name,
            customer_phone,
            phone,
            booking_date,
            pickup_date,
            return_date
        } = req.body;

        const phoneNumber = customer_phone || phone;
        const startDate = booking_date || pickup_date;

        if (
            !vehicle_id ||
            !customer_name ||
            !phoneNumber ||
            !startDate ||
            !return_date
        ) {
            return res.status(400).json({
                message: "Please enter all booking details"
            });
        }

        const start = new Date(startDate);
        const end = new Date(return_date);

        if (
            Number.isNaN(start.getTime()) ||
            Number.isNaN(end.getTime()) ||
            end <= start
        ) {
            return res.status(400).json({
                message: "Return date must be after pickup date"
            });
        }

        const startUTC = Date.UTC(
            start.getFullYear(), start.getMonth(), start.getDate()
        );

        const endUTC = Date.UTC(
            end.getFullYear(), end.getMonth(), end.getDate()
        );

        const rentalDays = Math.ceil(
            (endUTC - startUTC) / 86400000
        );

        connection = await db.getConnection();
        await connection.beginTransaction();

        const [vehicles] = await connection.query(
            `SELECT vehicle_id, rent_per_day, status
             FROM vehicles
             WHERE vehicle_id = ?
             FOR UPDATE`,
            [vehicle_id]
        );

        if (vehicles.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                message: "Vehicle not found"
            });
        }

        const vehicle = vehicles[0];

        if (vehicle.status !== "Available") {
            await connection.rollback();
            return res.status(400).json({
                message: "Vehicle is not available"
            });
        }

        const totalAmount =
            Number(vehicle.rent_per_day) * rentalDays;

        const [result] = await connection.query(
            `INSERT INTO bookings
            (vehicle_id, customer_name, customer_phone,
             booking_date, return_date, total_amount, status)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                vehicle_id,
                customer_name,
                phoneNumber,
                startDate,
                return_date,
                totalAmount,
                "Booked"
            ]
        );

        await connection.query(
            "UPDATE vehicles SET status = 'Rented' WHERE vehicle_id = ?",
            [vehicle_id]
        );

        await connection.commit();

        res.status(201).json({
            message: "Booking created successfully",
            booking_id: result.insertId,
            rental_days: rentalDays,
            total_amount: totalAmount
        });

    } catch (error) {
        if (connection) {
            try {
                await connection.rollback();
            } catch (rollbackError) {
                console.error(rollbackError.message);
            }
        }

        console.error("Booking creation error:", error.message);

        res.status(500).json({
            message: "Could not create booking",
            error: error.message
        });

    } finally {
        if (connection) connection.release();
    }
});

// UPDATE BOOKING STATUS
app.put("/api/bookings/:id/status", async (req, res) => {
    let connection;

    try {
        const { status } = req.body;

        const allowedStatuses = [
            "Booked",
            "Confirmed",
            "Returned",
            "Cancelled"
        ];

        if (!allowedStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid booking status"
            });
        }

        connection = await db.getConnection();
        await connection.beginTransaction();

        const [bookings] = await connection.query(
            `SELECT booking_id, vehicle_id
             FROM bookings
             WHERE booking_id = ?
             FOR UPDATE`,
            [req.params.id]
        );

        if (bookings.length === 0) {
            await connection.rollback();
            return res.status(404).json({
                message: "Booking not found"
            });
        }

        const booking = bookings[0];

        await connection.query(
            "UPDATE bookings SET status = ? WHERE booking_id = ?",
            [status, req.params.id]
        );

        if (status === "Returned" || status === "Cancelled") {
            await connection.query(
                "UPDATE vehicles SET status = 'Available' WHERE vehicle_id = ?",
                [booking.vehicle_id]
            );
        } else {
            await connection.query(
                "UPDATE vehicles SET status = 'Rented' WHERE vehicle_id = ?",
                [booking.vehicle_id]
            );
        }

        await connection.commit();

        res.json({
            message: "Booking status updated successfully"
        });

    } catch (error) {
        if (connection) {
            try {
                await connection.rollback();
            } catch (rollbackError) {
                console.error(rollbackError.message);
            }
        }

        console.error("Booking status error:", error.message);

        res.status(500).json({
            message: "Could not update booking status",
            error: error.message
        });

    } finally {
        if (connection) connection.release();
    }
});

// ===============================
// HEALTH CHECK - EXPRESS + MYSQL
// ===============================

app.get("/api/health", async (req, res) => {
    try {
        await db.query("SELECT 1");

        res.json({
            status: "ok",
            server: "running",
            database: "connected"
        });

    } catch (error) {
        console.error("Database health check failed:", error.message);

        res.status(503).json({
            status: "error",
            server: "running",
            database: "disconnected",
            error: error.message
        });
    }
});

// ===============================
// START SERVER
// ===============================

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
