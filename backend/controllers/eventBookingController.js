const pool = require("../config/db");
const { emitRealtime } = require("../socket");

const hasConflict = async (eventId, bookingDate, startTime, endTime) => {
  const [rows] = await pool.query(
    `SELECT id FROM event_bookings
     WHERE event_id = ?
       AND booking_date = ?
       AND booking_status NOT IN ('CANCELLED','REJECTED')
       AND (
            (start_time < ? AND end_time > ?)
         OR (start_time < ? AND end_time > ?)
         OR (start_time >= ? AND end_time <= ?)
       )
     LIMIT 1`,
    [eventId, bookingDate, endTime, endTime, startTime, startTime, startTime, endTime]
  );

  return rows.length > 0;
};

exports.createEventBooking = async (req, res) => {
  const { eventId, bookingDate, startTime, endTime } = req.body;
  const userId = req.user.id;

  if (!eventId || !bookingDate || !startTime || !endTime) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const conflict = await hasConflict(eventId, bookingDate, startTime, endTime);
    if (conflict) {
      return res.status(409).json({ message: "Time slot not available" });
    }

    const [result] = await pool.query(
      `INSERT INTO event_bookings
        (user_id, event_id, booking_date, start_time, end_time)
       VALUES (?, ?, ?, ?, ?)`,
      [userId, eventId, bookingDate, startTime, endTime]
    );

    const [booking] = await pool.query(
      `SELECT eb.*, u.name AS user_name, u.email AS user_email, e.name AS event_name
       FROM event_bookings eb
       JOIN users u ON eb.user_id = u.id
       JOIN events e ON eb.event_id = e.id
       WHERE eb.id = ?`,
      [result.insertId]
    );

    emitRealtime("event-bookings:updated", {
      action: "created",
      id: result.insertId,
      eventId: Number(eventId),
      bookingDate,
    });
    res.status(201).json(booking[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Event booking failed" });
  }
};

exports.getEventBookingsByDate = async (req, res) => {
  try {
    const { eventId, date } = req.query;

    if (!eventId || !date) {
      return res.status(400).json({ message: "eventId and date required" });
    }

    const [bookings] = await pool.query(
      `SELECT eb.*, u.name AS user_name
       FROM event_bookings eb
       JOIN users u ON eb.user_id = u.id
       WHERE eb.event_id = ?
         AND eb.booking_date = ?
         AND eb.booking_status NOT IN ('CANCELLED','REJECTED')
       ORDER BY eb.start_time`,
      [eventId, date]
    );

    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch event bookings" });
  }
};

exports.getMyEventBookings = async (req, res) => {
  try {
    const userId = req.user.id;

    const [bookings] = await pool.query(
      `SELECT eb.*, e.name AS event_name
       FROM event_bookings eb
       JOIN events e ON eb.event_id = e.id
       WHERE eb.user_id = ?
       ORDER BY eb.created_at DESC`,
      [userId]
    );

    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch event history" });
  }
};

exports.adminUpdateEventBookingStatus = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const { status, adminNote } = req.body;

    await pool.query(
      `UPDATE event_bookings SET booking_status = ?, admin_note = ? WHERE id = ?`,
      [status, adminNote || "", bookingId]
    );

    const [booking] = await pool.query(
      `SELECT eb.*, u.name AS user_name, u.email AS user_email, e.name AS event_name
       FROM event_bookings eb
       JOIN users u ON eb.user_id = u.id
       JOIN events e ON eb.event_id = e.id
       WHERE eb.id = ?`,
      [bookingId]
    );

    emitRealtime("event-bookings:updated", { action: "status-updated", id: Number(bookingId) });
    res.json(booking[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Admin update failed" });
  }
};

exports.updateEventBookingPayment = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const { paymentStatus } = req.body;

    await pool.query(
      `UPDATE event_bookings SET payment_status = ? WHERE id = ?`,
      [paymentStatus, bookingId]
    );

    const [booking] = await pool.query(
      `SELECT eb.*, u.name AS user_name, u.email AS user_email, e.name AS event_name
       FROM event_bookings eb
       JOIN users u ON eb.user_id = u.id
       JOIN events e ON eb.event_id = e.id
       WHERE eb.id = ?`,
      [bookingId]
    );

    emitRealtime("event-bookings:updated", { action: "payment-updated", id: Number(bookingId) });
    res.json(booking[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Payment update failed" });
  }
};

exports.getAllEventBookingsAdmin = async (req, res) => {
  try {
    const {
      year,
      month,
      dateFrom,
      dateTo,
      search,
      bookingStatus,
      paymentStatus,
    } = req.query;

    let query = `SELECT eb.*, u.name AS user_name, u.email AS user_email, e.name AS event_name
                 FROM event_bookings eb
                 JOIN users u ON eb.user_id = u.id
                 JOIN events e ON eb.event_id = e.id
                 WHERE 1=1`;
    const params = [];

    if (year) {
      if (month) {
        query += ` AND YEAR(eb.booking_date) = ? AND MONTH(eb.booking_date) = ?`;
        params.push(year, month);
      } else {
        query += ` AND YEAR(eb.booking_date) = ?`;
        params.push(year);
      }
    }

    if (dateFrom && dateTo) {
      query += ` AND eb.booking_date BETWEEN ? AND ?`;
      params.push(dateFrom, dateTo);
    }

    if (bookingStatus) {
      query += ` AND eb.booking_status = ?`;
      params.push(bookingStatus);
    }

    if (paymentStatus) {
      query += ` AND eb.payment_status = ?`;
      params.push(paymentStatus);
    }

    query += ` ORDER BY eb.created_at DESC`;

    let [bookings] = await pool.query(query, params);

    if (search) {
      const s = search.toLowerCase();
      bookings = bookings.filter(
        (b) =>
          (b.user_name && b.user_name.toLowerCase().includes(s)) ||
          (b.event_name && b.event_name.toLowerCase().includes(s))
      );
    }

    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Admin event booking fetch failed" });
  }
};
