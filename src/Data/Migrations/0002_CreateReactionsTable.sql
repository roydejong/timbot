CREATE TABLE `reactions` (
  `id`	INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
  `type`	TEXT DEFAULT 'keyword',
  `trigger`	TEXT,
  `response`	TEXT,
  `must_mention`	INTEGER DEFAULT 1,
  `insensitive`	INTEGER DEFAULT 1,
  `emote`	TEXT,
  `do_mention`	INTEGER DEFAULT 0
);
