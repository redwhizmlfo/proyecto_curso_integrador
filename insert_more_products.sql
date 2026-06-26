-- 1. Taladro DeWalt DCD701
INSERT INTO productos_modelos (id, id_categoria, id_marca, modelo, codigo_modelo, sku, precio, stock) VALUES
  ('b0010001-3482-411a-829d-ee3d45c1a3b1', '4fdcb3de-5b91-4c4f-96a9-858349280d0d', '20601df5-0db6-48ee-a010-388f61559871', 'DCD701', 'DCD701F2', 'SKU-10000001', 259.90, 30)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO especificaciones (id, id_producto_modelo, atributo, valor) VALUES
  ('b0010001-4910-482a-bc91-38291039d001', 'b0010001-3482-411a-829d-ee3d45c1a3b1', 'Voltaje', '12V'),
  ('b0010001-4910-482a-bc91-38291039d002', 'b0010001-3482-411a-829d-ee3d45c1a3b1', 'Mandril', '3/8"')
ON CONFLICT (id) DO NOTHING;
INSERT INTO productos_imagenes (id, id_producto_modelo, url_imagen) VALUES
  ('b0010001-4829-410a-bc92-192013829d01', 'b0010001-3482-411a-829d-ee3d45c1a3b1', '/src/assets/taladro_dewalt.png')
ON CONFLICT (id) DO NOTHING;

-- 2. Taladro Makita HP1630
INSERT INTO productos_modelos (id, id_categoria, id_marca, modelo, codigo_modelo, sku, precio, stock) VALUES
  ('b0010002-3482-411a-829d-ee3d45c1a3b1', '4fdcb3de-5b91-4c4f-96a9-858349280d0d', '32be432e-5036-4ad6-b52e-56e632d431f9', 'HP1630', 'HP1630 710W', 'SKU-10000002', 189.90, 40)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO especificaciones (id, id_producto_modelo, atributo, valor) VALUES
  ('b0010002-4910-482a-bc91-38291039d001', 'b0010002-3482-411a-829d-ee3d45c1a3b1', 'Potencia', '710W'),
  ('b0010002-4910-482a-bc91-38291039d002', 'b0010002-3482-411a-829d-ee3d45c1a3b1', 'Velocidad', '3200 RPM')
ON CONFLICT (id) DO NOTHING;
INSERT INTO productos_imagenes (id, id_producto_modelo, url_imagen) VALUES
  ('b0010002-4829-410a-bc92-192013829d01', 'b0010002-3482-411a-829d-ee3d45c1a3b1', '/src/assets/taladro.png')
ON CONFLICT (id) DO NOTHING;

-- 3. Taladro Bosch GSB 18V-50
INSERT INTO productos_modelos (id, id_categoria, id_marca, modelo, codigo_modelo, sku, precio, stock) VALUES
  ('b0010003-3482-411a-829d-ee3d45c1a3b1', '4fdcb3de-5b91-4c4f-96a9-858349280d0d', '5c61266d-1bf9-4700-8b1e-b81682701b22', 'GSB18V50', 'GSB 18V-50', 'SKU-10000003', 449.00, 20)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO especificaciones (id, id_producto_modelo, atributo, valor) VALUES
  ('b0010003-4910-482a-bc91-38291039d001', 'b0010003-3482-411a-829d-ee3d45c1a3b1', 'Voltaje', '18V'),
  ('b0010003-4910-482a-bc91-38291039d002', 'b0010003-3482-411a-829d-ee3d45c1a3b1', 'Motor', 'Brushless')
ON CONFLICT (id) DO NOTHING;
INSERT INTO productos_imagenes (id, id_producto_modelo, url_imagen) VALUES
  ('b0010003-4829-410a-bc92-192013829d01', 'b0010003-3482-411a-829d-ee3d45c1a3b1', '/src/assets/taladro.png')
ON CONFLICT (id) DO NOTHING;

-- 4. Esmeril Makita GA4530
INSERT INTO productos_modelos (id, id_categoria, id_marca, modelo, codigo_modelo, sku, precio, stock) VALUES
  ('b0010004-3482-411a-829d-ee3d45c1a3b1', '8a53e6b7-3b97-4b9e-bd83-bf019808602b', '32be432e-5036-4ad6-b52e-56e632d431f9', 'GA4530', 'GA4530 720W', 'SKU-10000004', 169.00, 35)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO especificaciones (id, id_producto_modelo, atributo, valor) VALUES
  ('b0010004-4910-482a-bc91-38291039d001', 'b0010004-3482-411a-829d-ee3d45c1a3b1', 'Potencia', '720W'),
  ('b0010004-4910-482a-bc91-38291039d002', 'b0010004-3482-411a-829d-ee3d45c1a3b1', 'Disco', '4 1/2"')
ON CONFLICT (id) DO NOTHING;
INSERT INTO productos_imagenes (id, id_producto_modelo, url_imagen) VALUES
  ('b0010004-4829-410a-bc92-192013829d01', 'b0010004-3482-411a-829d-ee3d45c1a3b1', '/src/assets/esmeril_gws750.png')
ON CONFLICT (id) DO NOTHING;

-- 5. Esmeril DeWalt DWE4020
INSERT INTO productos_modelos (id, id_categoria, id_marca, modelo, codigo_modelo, sku, precio, stock) VALUES
  ('b0010005-3482-411a-829d-ee3d45c1a3b1', '8a53e6b7-3b97-4b9e-bd83-bf019808602b', '20601df5-0db6-48ee-a010-388f61559871', 'DWE4020', 'DWE4020 800W', 'SKU-10000005', 185.00, 28)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO especificaciones (id, id_producto_modelo, atributo, valor) VALUES
  ('b0010005-4910-482a-bc91-38291039d001', 'b0010005-3482-411a-829d-ee3d45c1a3b1', 'Potencia', '800W'),
  ('b0010005-4910-482a-bc91-38291039d002', 'b0010005-3482-411a-829d-ee3d45c1a3b1', 'Velocidad', '12000 RPM')
ON CONFLICT (id) DO NOTHING;
INSERT INTO productos_imagenes (id, id_producto_modelo, url_imagen) VALUES
  ('b0010005-4829-410a-bc92-192013829d01', 'b0010005-3482-411a-829d-ee3d45c1a3b1', '/src/assets/esmeril_gws750.png')
ON CONFLICT (id) DO NOTHING;

-- 6. Esmeril Bosch GWS 9-125
INSERT INTO productos_modelos (id, id_categoria, id_marca, modelo, codigo_modelo, sku, precio, stock) VALUES
  ('b0010006-3482-411a-829d-ee3d45c1a3b1', '8a53e6b7-3b97-4b9e-bd83-bf019808602b', '5c61266d-1bf9-4700-8b1e-b81682701b22', 'GWS9-125', 'GWS 9-125', 'SKU-10000006', 229.00, 18)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO especificaciones (id, id_producto_modelo, atributo, valor) VALUES
  ('b0010006-4910-482a-bc91-38291039d001', 'b0010006-3482-411a-829d-ee3d45c1a3b1', 'Potencia', '900W'),
  ('b0010006-4910-482a-bc91-38291039d002', 'b0010006-3482-411a-829d-ee3d45c1a3b1', 'Disco', '5"')
ON CONFLICT (id) DO NOTHING;
INSERT INTO productos_imagenes (id, id_producto_modelo, url_imagen) VALUES
  ('b0010006-4829-410a-bc92-192013829d01', 'b0010006-3482-411a-829d-ee3d45c1a3b1', '/src/assets/esmeril_gws750.png')
ON CONFLICT (id) DO NOTHING;

-- 7. Rotomartillo DeWalt D25133K
INSERT INTO productos_modelos (id, id_categoria, id_marca, modelo, codigo_modelo, sku, precio, stock) VALUES
  ('b0010007-3482-411a-829d-ee3d45c1a3b1', 'd7b403f5-67c3-4d69-a1b1-6a05e2d19213', '20601df5-0db6-48ee-a010-388f61559871', 'D25133K', 'D25133K 800W', 'SKU-10000007', 489.00, 12)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO especificaciones (id, id_producto_modelo, atributo, valor) VALUES
  ('b0010007-4910-482a-bc91-38291039d001', 'b0010007-3482-411a-829d-ee3d45c1a3b1', 'Fuerza', '2.6 J'),
  ('b0010007-4910-482a-bc91-38291039d002', 'b0010007-3482-411a-829d-ee3d45c1a3b1', 'Potencia', '800W')
ON CONFLICT (id) DO NOTHING;
INSERT INTO productos_imagenes (id, id_producto_modelo, url_imagen) VALUES
  ('b0010007-4829-410a-bc92-192013829d01', 'b0010007-3482-411a-829d-ee3d45c1a3b1', '/src/assets/rotomartillo_bosch.png')
ON CONFLICT (id) DO NOTHING;

-- 8. Rotomartillo Makita HR2470
INSERT INTO productos_modelos (id, id_categoria, id_marca, modelo, codigo_modelo, sku, precio, stock) VALUES
  ('b0010008-3482-411a-829d-ee3d45c1a3b1', 'd7b403f5-67c3-4d69-a1b1-6a05e2d19213', '32be432e-5036-4ad6-b52e-56e632d431f9', 'HR2470', 'HR2470 780W', 'SKU-10000008', 429.00, 16)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO especificaciones (id, id_producto_modelo, atributo, valor) VALUES
  ('b0010008-4910-482a-bc91-38291039d001', 'b0010008-3482-411a-829d-ee3d45c1a3b1', 'Fuerza', '2.4 J'),
  ('b0010008-4910-482a-bc91-38291039d002', 'b0010008-3482-411a-829d-ee3d45c1a3b1', 'Potencia', '780W')
ON CONFLICT (id) DO NOTHING;
INSERT INTO productos_imagenes (id, id_producto_modelo, url_imagen) VALUES
  ('b0010008-4829-410a-bc92-192013829d01', 'b0010008-3482-411a-829d-ee3d45c1a3b1', '/src/assets/rotomartillo_bosch.png')
ON CONFLICT (id) DO NOTHING;

-- 9. Rotomartillo Bosch GBH 18V-26
INSERT INTO productos_modelos (id, id_categoria, id_marca, modelo, codigo_modelo, sku, precio, stock) VALUES
  ('b0010009-3482-411a-829d-ee3d45c1a3b1', 'd7b403f5-67c3-4d69-a1b1-6a05e2d19213', '5c61266d-1bf9-4700-8b1e-b81682701b22', 'GBH18V26', 'GBH 18V-26', 'SKU-10000009', 799.00, 8)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO especificaciones (id, id_producto_modelo, atributo, valor) VALUES
  ('b0010009-4910-482a-bc91-38291039d001', 'b0010009-3482-411a-829d-ee3d45c1a3b1', 'Voltaje', '18V'),
  ('b0010009-4910-482a-bc91-38291039d002', 'b0010009-3482-411a-829d-ee3d45c1a3b1', 'Fuerza', '2.6 J')
ON CONFLICT (id) DO NOTHING;
INSERT INTO productos_imagenes (id, id_producto_modelo, url_imagen) VALUES
  ('b0010009-4829-410a-bc92-192013829d01', 'b0010009-3482-411a-829d-ee3d45c1a3b1', '/src/assets/rotomartillo_bosch.png')
ON CONFLICT (id) DO NOTHING;

-- 10. Atornillador Bosch GSR 1000 Smart
INSERT INTO productos_modelos (id, id_categoria, id_marca, modelo, codigo_modelo, sku, precio, stock) VALUES
  ('b0010010-3482-411a-829d-ee3d45c1a3b1', '4fdcb3de-5b91-4c4f-96a9-858349280d0d', '5c61266d-1bf9-4700-8b1e-b81682701b22', 'GSR1000', 'GSR 1000 Smart', 'SKU-10000010', 145.00, 50)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO especificaciones (id, id_producto_modelo, atributo, valor) VALUES
  ('b0010010-4910-482a-bc91-38291039d001', 'b0010010-3482-411a-829d-ee3d45c1a3b1', 'Voltaje', '12V'),
  ('b0010010-4910-482a-bc91-38291039d002', 'b0010010-3482-411a-829d-ee3d45c1a3b1', 'Torque', '15 Nm')
ON CONFLICT (id) DO NOTHING;
INSERT INTO productos_imagenes (id, id_producto_modelo, url_imagen) VALUES
  ('b0010010-4829-410a-bc92-192013829d01', 'b0010010-3482-411a-829d-ee3d45c1a3b1', '/src/assets/taladro.png')
ON CONFLICT (id) DO NOTHING;

-- 11. Atornillador DeWalt DCF801
INSERT INTO productos_modelos (id, id_categoria, id_marca, modelo, codigo_modelo, sku, precio, stock) VALUES
  ('b0010011-3482-411a-829d-ee3d45c1a3b1', '4fdcb3de-5b91-4c4f-96a9-858349280d0d', '20601df5-0db6-48ee-a010-388f61559871', 'DCF801', 'DCF801 12V', 'SKU-10000011', 299.90, 22)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO especificaciones (id, id_producto_modelo, atributo, valor) VALUES
  ('b0010011-4910-482a-bc91-38291039d001', 'b0010011-3482-411a-829d-ee3d45c1a3b1', 'Voltaje', '12V'),
  ('b0010011-4910-482a-bc91-38291039d002', 'b0010011-3482-411a-829d-ee3d45c1a3b1', 'Torque', '163 Nm')
ON CONFLICT (id) DO NOTHING;
INSERT INTO productos_imagenes (id, id_producto_modelo, url_imagen) VALUES
  ('b0010011-4829-410a-bc92-192013829d01', 'b0010011-3482-411a-829d-ee3d45c1a3b1', '/src/assets/taladro_dewalt.png')
ON CONFLICT (id) DO NOTHING;

-- 12. Esmeril Inalámbrico Makita DGA452
INSERT INTO productos_modelos (id, id_categoria, id_marca, modelo, codigo_modelo, sku, precio, stock) VALUES
  ('b0010012-3482-411a-829d-ee3d45c1a3b1', '8a53e6b7-3b97-4b9e-bd83-bf019808602b', '32be432e-5036-4ad6-b52e-56e632d431f9', 'DGA452', 'DGA452 18V', 'SKU-10000012', 399.00, 14)
ON CONFLICT (sku) DO NOTHING;
INSERT INTO especificaciones (id, id_producto_modelo, atributo, valor) VALUES
  ('b0010012-4910-482a-bc91-38291039d001', 'b0010012-3482-411a-829d-ee3d45c1a3b1', 'Voltaje', '18V'),
  ('b0010012-4910-482a-bc91-38291039d002', 'b0010012-3482-411a-829d-ee3d45c1a3b1', 'Velocidad', '10000 RPM')
ON CONFLICT (id) DO NOTHING;
INSERT INTO productos_imagenes (id, id_producto_modelo, url_imagen) VALUES
  ('b0010012-4829-410a-bc92-192013829d01', 'b0010012-3482-411a-829d-ee3d45c1a3b1', '/src/assets/esmeril_gws750.png')
ON CONFLICT (id) DO NOTHING;
