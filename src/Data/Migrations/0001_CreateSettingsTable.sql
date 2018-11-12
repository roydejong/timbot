DROP TABLE IF EXISTS `settings`;

CREATE TABLE `settings` (
  `key`	TEXT UNIQUE,
  `value`	TEXT,
  PRIMARY KEY(`key`)
);

INSERT INTO `settings`(`key`,`value`) VALUES ("db_version",0);
INSERT INTO `settings`(`key`,`value`) VALUES ("presence","online");
INSERT INTO `settings`(`key`,`value`) VALUES ("activity_type","PLAYING");
INSERT INTO `settings`(`key`,`value`) VALUES ("activity_text","");
INSERT INTO `settings`(`key`,`value`) VALUES ("activity_url","");
