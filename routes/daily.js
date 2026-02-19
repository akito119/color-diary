var express = require('express');
var router = express.Router();
var sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('db/diary.db');

/* ===== POST /daily ===== */
router.post('/', function(req, res, next) {
  const { color, memo } = req.body;

  if (!['red', 'yellow', 'blue'].includes(color)) {
    return res.status(400).send('Invalid color');
  }

  const today = new Date().toISOString().slice(0, 10);

  // ① 今日の行を確保（なければ作る）
  db.run(
    'INSERT OR IGNORE INTO daily_color (date) VALUES (?)',
    [today],
    function(err) {
      if (err) return next(err);

      // ② 色に応じてカウントアップ
      const column =
        color === 'red' ? 'red_point' :
        color === 'yellow' ? 'yellow_point' :
        'blue_point';

      db.run(
        `UPDATE daily_color
         SET ${column} = ${column} + 1
         WHERE date = ?`,
        [today],
        function(err) {
          if (err) return next(err);

          // ③ diary に保存
          db.run(
            'INSERT INTO diary (date, color, memo) VALUES (?, ?, ?)',
            [today, color, memo],
            function(err) {
              if (err) return next(err);
              res.redirect('/daily/' + today);
            }
          );
        }
      );
    }
  );
});


/* ===== GET /daily/:date ===== */
router.get('/:date', function(req, res, next) {
  const date = req.params.date; 
   const now = new Date();
  const today =
    now.getFullYear() + '-' +
    String(now.getMonth() + 1).padStart(2, '0') + '-' +
    String(now.getDate()).padStart(2, '0');

  const isToday = (date === today);
  db.all(
    'SELECT color, memo FROM diary WHERE date = ?',
    [date],
    (err, rows) => {
      if (err) return next(err);
      console.log(rows),

      res.render('daily', {
        date: date,
        memos: rows,   // ← これが無いとエラーになる
        istoday: isToday
      });
    }
  );
});

module.exports = router;
