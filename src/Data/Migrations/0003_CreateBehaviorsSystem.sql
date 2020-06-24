CREATE TABLE `behaviors` (
  `id`	INTEGER PRIMARY KEY AUTOINCREMENT,
  `trigger_type`	TEXT NOT NULL,
  `enabled`	INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE `behavior_actions` (
  `behavior_id`	INTEGER NOT NULL,
  `action_type`	TEXT NOT NULL
);

CREATE TABLE `behavior_options` (
  `behavior_id`	INTEGER NOT NULL,
  `action_type`	INTEGER,
  `option_key`	TEXT NOT NULL,
  `option_value`	TEXT NOT NULL
);
