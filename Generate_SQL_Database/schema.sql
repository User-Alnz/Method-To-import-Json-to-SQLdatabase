CREATE TABLE station (
  id INT UNSIGNED PRIMARY KEY AUTO_INCREMENT NOT NULL,
  id_station VARCHAR(100),
  n_station VARCHAR(100),
  ad_station VARCHAR(150),
  xlongitude FLOAT,
  ylatitude FLOAT,
  nbre_pdc INT,
  acces_recharge VARCHAR(100),
  accessibilite VARCHAR(50),
  puiss_max DECIMAL,
  type_prise VARCHAR(50)
);

