-- DeWalt Taladro
INSERT INTO productos_modelos (id, id_categoria, id_marca, modelo, codigo_modelo, sku, precio, stock) VALUES
  ('a54d6738-3482-411a-829d-ee3d45c1a3b1', '4fdcb3de-5b91-4c4f-96a9-858349280d0d', '20601df5-0db6-48ee-a010-388f61559871', 'DCD771', 'DCD771C2', 'SKU-30910482', 289.99, 25)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO especificaciones (id, id_producto_modelo, atributo, valor) VALUES
  ('1a6b2839-4910-482a-bc91-38291039d001', 'a54d6738-3482-411a-829d-ee3d45c1a3b1', 'Voltaje', '20V'),
  ('1a6b2839-4910-482a-bc91-38291039d002', 'a54d6738-3482-411a-829d-ee3d45c1a3b1', 'Mandril', '1/2"'),
  ('1a6b2839-4910-482a-bc91-38291039d003', 'a54d6738-3482-411a-829d-ee3d45c1a3b1', 'Velocidades', '2')
ON CONFLICT (id) DO NOTHING;

INSERT INTO productos_imagenes (id, id_producto_modelo, url_imagen) VALUES
  ('2b839201-4829-410a-bc92-192013829d01', 'a54d6738-3482-411a-829d-ee3d45c1a3b1', 'https://raw.githubusercontent.com/redwhizmlfo/proyecto_curso_integrador/aea7f14d4c49a317849710ce3d1153f055fdac3e/frontend/src/assets/taladro_dewalt.png')
ON CONFLICT (id) DO NOTHING;

-- Bosch Rotomartillo
INSERT INTO productos_modelos (id, id_categoria, id_marca, modelo, codigo_modelo, sku, precio, stock) VALUES
  ('c829e102-4829-410a-bc39-a83d910d82d4', 'd7b403f5-67c3-4d69-a1b1-6a05e2d19213', '5c61266d-1bf9-4700-8b1e-b81682701b22', 'GBH2-24', 'GBH 2-24 D', 'SKU-58291043', 549.90, 15)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO especificaciones (id, id_producto_modelo, atributo, valor) VALUES
  ('3c829e10-4829-412a-bc39-a82910482d01', 'c829e102-4829-410a-bc39-a83d910d82d4', 'Fuerza de impacto', '2.7 J'),
  ('3c829e10-4829-412a-bc39-a82910482d02', 'c829e102-4829-410a-bc39-a83d910d82d4', 'Potencia', '820 W'),
  ('3c829e10-4829-412a-bc39-a82910482d03', 'c829e102-4829-410a-bc39-a83d910d82d4', 'Mandril', 'SDS Plus')
ON CONFLICT (id) DO NOTHING;

INSERT INTO productos_imagenes (id, id_producto_modelo, url_imagen) VALUES
  ('4d829102-4829-420a-bc39-102938482d01', 'c829e102-4829-410a-bc39-a83d910d82d4', 'https://raw.githubusercontent.com/redwhizmlfo/proyecto_curso_integrador/aea7f14d4c49a317849710ce3d1153f055fdac3e/frontend/src/assets/rotomartillo_bosch.png')
ON CONFLICT (id) DO NOTHING;
