const pool = require("../config/db");
const MAX_BOOKING_PLAYERS = 4;

const hasConflict = async (courtId, bookingDate, startTime, endTime) => {
  const [rows] = await pool.query(
    `SELECT id FROM bookings
     WHERE court_id = ?
       AND booking_date = ?
       AND booking_status NOT IN ('CANCELLED','REJECTED')
       AND (
            (start_time < ? AND end_time > ?)
         OR (start_time < ? AND end_time > ?)
         OR (start_time >= ? AND end_time <= ?)
       )
     LIMIT 1`,
    [courtId, bookingDate, endTime, endTime, startTime, startTime, startTime, endTime]
  );

  return rows.length > 0;
};

exports.createBooking = async (req, res) => {
  const { courtId, bookingDate, startTime, endTime, playerIds = [] } = req.body;
  const userId = req.user.id;

  if (!courtId || !bookingDate || !startTime || !endTime) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const normalizedPlayerIds = Array.from(
      new Set([userId, ...playerIds.map((id) => Number(id)).filter(Boolean)])
    );

    if (normalizedPlayerIds.length > MAX_BOOKING_PLAYERS) {
      return res.status(400).json({
        message: "Booking can have maximum 4 players including you",
      });
    }

    const [playerRows] = await pool.query(
      `SELECT id, name, cm_no, fees_status
       FROM users
       WHERE status = 'active'
         AND id IN (?)`,
      [normalizedPlayerIds]
    );

    const players = normalizedPlayerIds
      .map((id) => playerRows.find((player) => player.id === id))
      .filter(Boolean);

    if (!players.some((player) => player.id === userId)) {
      return res.status(400).json({ message: "Booking user must be included as player 1" });
    }

    const defaulterPlayer = players.find(
      (player) =>
        player.id !== userId &&
        String(player.fees_status || "paid").toLowerCase() === "defaulter"
    );

    if (defaulterPlayer) {
      return res.status(400).json({
        message: "This user is defaulter. Select other user.",
      });
    }

    const conflict = await hasConflict(courtId, bookingDate, startTime, endTime);
    if (conflict) {
      return res.status(409).json({ message: "Time slot not available" });
    }

    const [result] = await pool.query(
      `INSERT INTO bookings
        (user_id, court_id, booking_type, booking_date, start_time, end_time, players_json)
       VALUES (?, ?, 'COURT', ?, ?, ?, ?)`,
      [userId, courtId, bookingDate, startTime, endTime, JSON.stringify(players)]
    );

    const [booking] = await pool.query(
      `SELECT b.*, u.name AS user_name, c.name AS court_name
       FROM bookings b
       JOIN users u ON b.user_id = u.id
       JOIN courts c ON b.court_id = c.id
       WHERE b.id = ?`,
      [result.insertId]
    );

    res.status(201).json(booking[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Booking failed" });
  }
};

exports.getBookingsByDate = async (req, res) => {
  try {
    const { courtId, date } = req.query;

    if (!courtId || !date) {
      return res.status(400).json({ message: "courtId and date required" });
    }

    const [bookings] = await pool.query(
      `SELECT b.*, u.name AS user_name
       FROM bookings b
       JOIN users u ON b.user_id = u.id
       WHERE b.court_id = ? 
         AND b.booking_date = ? 
         AND b.booking_status NOT IN ('CANCELLED','REJECTED')
       ORDER BY b.start_time`,
      [courtId, date]
    );

    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.user.id;

    const [rows] = await pool.query(
      `SELECT user_id FROM bookings WHERE id = ?`,
      [bookingId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (rows[0].user_id !== userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await pool.query(
      `UPDATE bookings SET booking_status = 'CANCELLED' WHERE id = ?`,
      [bookingId]
    );

    res.json({ message: "Booking cancelled" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Cancel failed" });
  }
};

exports.adminUpdateStatus = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const { status, adminNote } = req.body;

    await pool.query(
      `UPDATE bookings SET booking_status = ?, admin_note = ? WHERE id = ?`,
      [status, adminNote || "", bookingId]
    );

    const [booking] = await pool.query(
      `SELECT b.*, u.name AS user_name, c.name AS court_name
       FROM bookings b
       JOIN users u ON b.user_id = u.id
       JOIN courts c ON b.court_id = c.id
       WHERE b.id = ?`,
      [bookingId]
    );

    res.json(booking[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Admin update failed" });
  }
};

exports.updatePayment = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const { paymentStatus } = req.body;

    await pool.query(
      `UPDATE bookings SET payment_status = ? WHERE id = ?`,
      [paymentStatus, bookingId]
    );

    const [booking] = await pool.query(
      `SELECT b.*, u.name AS user_name, c.name AS court_name
       FROM bookings b
       JOIN users u ON b.user_id = u.id
       JOIN courts c ON b.court_id = c.id
       WHERE b.id = ?`,
      [bookingId]
    );

    res.json(booking[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Payment update failed" });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    const userId = req.user.id;

    const [bookings] = await pool.query(
      `SELECT b.*, c.name AS court_name
       FROM bookings b
       JOIN courts c ON b.court_id = c.id
       WHERE b.user_id = ?
       ORDER BY b.created_at DESC`,
      [userId]
    );

    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch history" });
  }
};

exports.getAllBookingsAdmin = async (req, res) => {
  try {
    const {
      year,
      month,
      dateFrom,
      dateTo,
      search,
      bookingStatus,
      paymentStatus
    } = req.query;

    let query = `SELECT b.*, u.name AS user_name, u.email AS user_email, c.name AS court_name
                 FROM bookings b
                 JOIN users u ON b.user_id = u.id
                 JOIN courts c ON b.court_id = c.id
                 WHERE 1=1`;
    const params = [];

    if (year) {
      if (month) {
        query += ` AND YEAR(b.booking_date) = ? AND MONTH(b.booking_date) = ?`;
        params.push(year, month);
      } else {
        query += ` AND YEAR(b.booking_date) = ?`;
        params.push(year);
      }
    }

    if (dateFrom && dateTo) {
      query += ` AND b.booking_date BETWEEN ? AND ?`;
      params.push(dateFrom, dateTo);
    }

    if (bookingStatus) {
      query += ` AND b.booking_status = ?`;
      params.push(bookingStatus);
    }
    if (paymentStatus) {
      query += ` AND b.payment_status = ?`;
      params.push(paymentStatus);
    }

    query += ` ORDER BY b.created_at DESC`;

    let [bookings] = await pool.query(query, params);

    if (search) {
      const s = search.toLowerCase();
      bookings = bookings.filter(
        (b) => (b.user_name && b.user_name.toLowerCase().includes(s)) ||
               (b.court_name && b.court_name.toLowerCase().includes(s))
      );
    }

    res.json(bookings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Admin booking fetch failed" });
  }
};
