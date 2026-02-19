const express = require('express');
const router = express.Router();
var sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('db/diary.db');


// GET /api/events
router.get('/', (req, res, next) => {
  db.all(
    'SELECT date, red_point, yellow_point, blue_point FROM daily_color',
    (err, rows) => {
      if (err) return next(err);

      const events = rows.map(row => {
        const max = Math.max(
          row.red_point,
          row.yellow_point,
          row.blue_point
        );

        let backgroundColor = '#eeeeee'; // デフォルト

        if (max > 0) {
          if (row.red_point === max) backgroundColor = '#ffcccc';
          else if (row.yellow_point === max) backgroundColor = '#fff2aa';
          else backgroundColor = '#ccccff';
        }

        return {
          start: row.date,
          display: 'background',
          backgroundColor
        };
      });

      res.json(events);
    }
  );
});

module.exports = router;