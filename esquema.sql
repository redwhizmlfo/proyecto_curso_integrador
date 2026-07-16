create extension if not exists pgcrypto;

create table if not exists suppliers (
  id uuid primary key default gen_random_uuid(),
  name varchar(180) not null,
  ruc varchar(32) not null unique,
  contact varchar(180),
  phone varchar(40),
  email varchar(180),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint suppliers_name_not_blank check (btrim(name) <> ''),
  constraint suppliers_ruc_not_blank check (btrim(ruc) <> '')
);

create unique index if not exists suppliers_ruc_unique_normalized_idx
  on suppliers (lower(btrim(ruc)));

create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  name varchar(180) not null,
  doc_type varchar(16) not null,
  doc_number varchar(32) not null,
  phone varchar(40),
  email varchar(180),
  address text,
  preferred_discount numeric(5,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint customers_name_not_blank check (btrim(name) <> ''),
  constraint customers_doc_type_not_blank check (btrim(doc_type) <> ''),
  constraint customers_doc_number_not_blank check (btrim(doc_number) <> ''),
  constraint customers_preferred_discount_range check (
    preferred_discount >= 0 and preferred_discount <= 100
  ),
  constraint customers_doc_type_allowed check (
    lower(doc_type) in ('dni', 'ruc')
  )
);

create unique index if not exists customers_doc_unique_normalized_idx
  on customers (lower(doc_type), lower(doc_number));

create table if not exists employees (
  id uuid primary key default gen_random_uuid(),
  initials varchar(16) not null,
  name varchar(180) not null,
  role varchar(80) not null,
  dni varchar(32) not null unique,
  pay_per_day numeric(12,2) not null default 0,
  worked_days numeric(12,2) not null default 0,
  today_status varchar(32),
  attendance_today boolean,
  can_mark_exit boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint employees_initials_not_blank check (btrim(initials) <> ''),
  constraint employees_name_not_blank check (btrim(name) <> ''),
  constraint employees_role_not_blank check (btrim(role) <> ''),
  constraint employees_dni_not_blank check (btrim(dni) <> ''),
  constraint employees_pay_per_day_non_negative check (pay_per_day >= 0),
  constraint employees_worked_days_non_negative check (worked_days >= 0)
);

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null unique references employees(id),
  username varchar(80) not null unique,
  role varchar(80) not null,
  status varchar(32) not null default 'active',
  password_hash text not null,
  last_access_at timestamptz,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint users_username_not_blank check (btrim(username) <> ''),
  constraint users_role_not_blank check (btrim(role) <> ''),
  constraint users_status_allowed check (
    lower(status) in ('active', 'inactive', 'blocked')
  )
);

create unique index if not exists users_username_unique_normalized_idx
  on users (lower(btrim(username)));

create table if not exists user_module_permissions (
  user_id uuid not null references users(id) on delete cascade,
  permission_key varchar(120) not null,
  primary key (user_id, permission_key),
  constraint user_module_permissions_key_not_blank check (btrim(permission_key) <> '')
);

create table if not exists categorias (
  id uuid primary key default gen_random_uuid(),
  nombre_categoria varchar(180) not null,
  constraint categorias_nombre_not_blank check (btrim(nombre_categoria) <> '')
);

create table if not exists marcas (
  id uuid primary key default gen_random_uuid(),
  nombre_marca varchar(180) not null,
  constraint marcas_nombre_not_blank check (btrim(nombre_marca) <> '')
);

create table if not exists productos_modelos (
  id uuid primary key default gen_random_uuid(),
  id_categoria uuid not null references categorias(id),
  id_marca uuid not null references marcas(id),
  modelo varchar(180) not null,
  codigo_modelo varchar(80) not null,
  sku varchar(80) not null unique,
  precio numeric(12,2) not null default 0,
  stock integer not null default 0,
  constraint productos_modelos_modelo_not_blank check (btrim(modelo) <> ''),
  constraint productos_modelos_codigo_not_blank check (btrim(codigo_modelo) <> ''),
  constraint productos_modelos_sku_not_blank check (btrim(sku) <> ''),
  constraint productos_modelos_precio_non_negative check (precio >= 0),
  constraint productos_modelos_stock_non_negative check (stock >= 0)
);

create table if not exists especificaciones (
  id uuid primary key default gen_random_uuid(),
  id_producto_modelo uuid not null references productos_modelos(id) on delete cascade,
  atributo varchar(180) not null,
  valor varchar(180) not null,
  constraint especificaciones_atributo_not_blank check (btrim(atributo) <> ''),
  constraint especificaciones_valor_not_blank check (btrim(valor) <> '')
);

create table if not exists productos_imagenes (
  id uuid primary key default gen_random_uuid(),
  id_producto_modelo uuid not null references productos_modelos(id) on delete cascade,
  url_imagen varchar(1000) not null,
  constraint productos_imagenes_url_not_blank check (btrim(url_imagen) <> '')
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references suppliers(id),
  name varchar(180) not null,
  barcode varchar(80) not null unique,
  category varchar(80) not null,
  supplier_name_snapshot varchar(180) not null,
  unit varchar(30) not null,
  description text,
  cost numeric(12,2) not null default 0,
  price numeric(12,2) not null default 0,
  stock numeric(12,2) not null default 0,
  min_stock numeric(12,2) not null default 0,
  last_reason varchar(180),
  is_active boolean not null default true,
  image_url varchar(1000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_name_not_blank check (btrim(name) <> ''),
  constraint products_barcode_not_blank check (btrim(barcode) <> ''),
  constraint products_category_not_blank check (btrim(category) <> ''),
  constraint products_supplier_snapshot_not_blank check (btrim(supplier_name_snapshot) <> ''),
  constraint products_unit_not_blank check (btrim(unit) <> ''),
  constraint products_cost_non_negative check (cost >= 0),
  constraint products_price_non_negative check (price >= 0),
  constraint products_stock_non_negative check (stock >= 0),
  constraint products_min_stock_non_negative check (min_stock >= 0)
);

create table if not exists product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  image_url text not null,
  sort_order integer not null default 1,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  constraint product_images_url_not_blank check (btrim(image_url) <> ''),
  constraint product_images_sort_order_positive check (sort_order > 0)
);

create unique index if not exists product_images_one_primary_per_product_idx
  on product_images (product_id)
  where is_primary = true;

create table if not exists supplier_categories (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references suppliers(id) on delete cascade,
  category_name varchar(80) not null,
  sort_order integer not null default 1,
  created_at timestamptz not null default now(),
  constraint supplier_categories_name_not_blank check (btrim(category_name) <> ''),
  constraint supplier_categories_sort_order_positive check (sort_order > 0),
  constraint supplier_categories_unique unique (supplier_id, category_name)
);

create table if not exists sales (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id),
  employee_id uuid references employees(id),
  created_by_user_id uuid not null references users(id),
  series varchar(40) not null,
  document_type varchar(32) not null,
  payment_method varchar(32) not null,
  payment_status varchar(32),
  payment_reference varchar(120),
  payment_evidence_name varchar(220),
  payment_bank_name varchar(80),
  payment_bank_account_alias varchar(120),
  payment_bank_account_number varchar(80),
  sold_at timestamptz not null default now(),
  client_name_snapshot varchar(180) not null,
  client_doc_type_snapshot varchar(16) not null,
  client_doc_number_snapshot varchar(32) not null,
  seller_name_snapshot varchar(180) not null,
  subtotal numeric(12,2) not null default 0,
  igv numeric(12,2) not null default 0,
  total numeric(12,2) not null default 0,
  discount_pct numeric(5,2) not null default 0,
  discount_amount numeric(12,2) not null default 0,
  note text,
  received_amount numeric(12,2),
  change_amount numeric(12,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint sales_series_not_blank check (btrim(series) <> ''),
  constraint sales_document_type_not_blank check (btrim(document_type) <> ''),
  constraint sales_payment_method_not_blank check (btrim(payment_method) <> ''),
  constraint sales_client_name_not_blank check (btrim(client_name_snapshot) <> ''),
  constraint sales_client_doc_type_not_blank check (btrim(client_doc_type_snapshot) <> ''),
  constraint sales_client_doc_number_not_blank check (btrim(client_doc_number_snapshot) <> ''),
  constraint sales_seller_name_not_blank check (btrim(seller_name_snapshot) <> ''),
  constraint sales_subtotal_non_negative check (subtotal >= 0),
  constraint sales_igv_non_negative check (igv >= 0),
  constraint sales_total_non_negative check (total >= 0),
  constraint sales_discount_pct_range check (discount_pct >= 0 and discount_pct <= 100),
  constraint sales_discount_amount_non_negative check (discount_amount >= 0),
  constraint sales_received_amount_non_negative check (received_amount is null or received_amount >= 0),
  constraint sales_change_amount_non_negative check (change_amount is null or change_amount >= 0),
  constraint sales_total_formula check (
    total = round((subtotal + igv)::numeric, 2)
  ),
  constraint sales_payment_consistency check (
    (received_amount is null and change_amount is null)
    or (
      received_amount is not null
      and change_amount is not null
      and received_amount >= total
      and change_amount = received_amount - total
    )
  )
);

alter table if exists sales
  drop constraint if exists sales_total_formula;

alter table if exists sales
  add constraint sales_total_formula check (
    total = round((subtotal + igv)::numeric, 2)
  );

alter table if exists sales
  add column if not exists payment_status varchar(32),
  add column if not exists payment_reference varchar(120),
  add column if not exists payment_evidence_name varchar(220),
  add column if not exists payment_bank_name varchar(80),
  add column if not exists payment_bank_account_alias varchar(120),
  add column if not exists payment_bank_account_number varchar(80);

create table if not exists sale_items (
  id uuid primary key default gen_random_uuid(),
  sale_id uuid not null references sales(id) on delete cascade,
  product_id uuid not null references products(id),
  product_name_snapshot varchar(180) not null,
  barcode_snapshot varchar(80) not null,
  supplier_id uuid references suppliers(id),
  supplier_name_snapshot varchar(180),
  category_snapshot varchar(80) not null,
  unit_snapshot varchar(30) not null,
  qty numeric(12,2) not null,
  price numeric(12,2) not null,
  cost numeric(12,2) not null,
  line_total numeric(12,2) generated always as (qty * price) stored,
  created_at timestamptz not null default now(),
  constraint sale_items_product_name_not_blank check (btrim(product_name_snapshot) <> ''),
  constraint sale_items_barcode_not_blank check (btrim(barcode_snapshot) <> ''),
  constraint sale_items_category_not_blank check (btrim(category_snapshot) <> ''),
  constraint sale_items_unit_not_blank check (btrim(unit_snapshot) <> ''),
  constraint sale_items_qty_positive check (qty > 0),
  constraint sale_items_price_non_negative check (price >= 0),
  constraint sale_items_cost_non_negative check (cost >= 0)
);

create table if not exists stock_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id),
  created_by_user_id uuid references users(id),
  occurred_at timestamptz not null default now(),
  movement_type varchar(32) not null,
  source_module varchar(32),
  reason_code varchar(64),
  delta numeric(12,2) not null,
  unit_snapshot varchar(30) not null,
  stock_before numeric(12,2) not null,
  stock_after numeric(12,2) not null,
  detail text,
  product_name_snapshot varchar(180) not null,
  created_at timestamptz not null default now(),
  constraint stock_movements_type_not_blank check (btrim(movement_type) <> ''),
  constraint stock_movements_source_module_not_blank check (
    source_module is null or btrim(source_module) <> ''
  ),
  constraint stock_movements_reason_code_not_blank check (
    reason_code is null or btrim(reason_code) <> ''
  ),
  constraint stock_movements_unit_not_blank check (btrim(unit_snapshot) <> ''),
  constraint stock_movements_product_name_not_blank check (btrim(product_name_snapshot) <> ''),
  constraint stock_movements_type_allowed check (
    lower(movement_type) in (
      'alta_producto',
      'edicion_stock',
      'ingreso_stock',
      'importacion',
      'venta',
      'perdida',
      'ajuste_perdida',
      'anulacion_perdida'
    )
  ),
  constraint stock_movements_delta_non_zero check (delta <> 0),
  constraint stock_movements_before_non_negative check (stock_before >= 0),
  constraint stock_movements_after_non_negative check (stock_after >= 0),
  constraint stock_movements_stock_consistency check (stock_after = stock_before + delta)
);

create table if not exists losses (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id),
  created_by_user_id uuid not null references users(id),
  reverted_by_user_id uuid references users(id),
  occurred_at timestamptz not null default now(),
  reverted_at timestamptz,
  status varchar(32) not null default 'active',
  product_name_snapshot varchar(180) not null,
  category_snapshot varchar(80) not null,
  reason varchar(180) not null,
  qty numeric(12,2) not null,
  unit_cost_snapshot numeric(12,2) not null,
  loss_amount numeric(12,2) not null,
  responsible_snapshot varchar(180) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint losses_product_name_not_blank check (btrim(product_name_snapshot) <> ''),
  constraint losses_category_not_blank check (btrim(category_snapshot) <> ''),
  constraint losses_reason_not_blank check (btrim(reason) <> ''),
  constraint losses_responsible_not_blank check (btrim(responsible_snapshot) <> ''),
  constraint losses_qty_positive check (qty > 0),
  constraint losses_unit_cost_non_negative check (unit_cost_snapshot >= 0),
  constraint losses_amount_non_negative check (loss_amount >= 0),
  constraint losses_status_allowed check (lower(status) in ('active', 'reverted')),
  constraint losses_revert_consistency check (
    (lower(status) = 'active' and reverted_at is null and reverted_by_user_id is null)
    or
    (lower(status) = 'reverted' and reverted_at is not null and reverted_by_user_id is not null)
  )
);

create table if not exists purchase_orders (
  id uuid primary key default gen_random_uuid(),
  supplier_id uuid not null references suppliers(id),
  created_by_user_id uuid not null references users(id),
  sent_by_user_id uuid references users(id),
  received_by_user_id uuid references users(id),
  cancelled_by_user_id uuid references users(id),
  supplier_name_snapshot varchar(180) not null,
  status varchar(32) not null default 'pendiente',
  priority varchar(32) not null default 'media',
  note text,
  ordered_at timestamptz not null default now(),
  sent_at timestamptz,
  received_at timestamptz,
  cancelled_at timestamptz,
  total_units numeric(12,2) not null default 0,
  total_lines integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint purchase_orders_supplier_name_not_blank check (btrim(supplier_name_snapshot) <> ''),
  constraint purchase_orders_status_allowed check (
    lower(status) in ('pendiente', 'enviado', 'recibido', 'cancelado')
  ),
  constraint purchase_orders_priority_allowed check (
    lower(priority) in ('baja', 'media', 'alta', 'urgente')
  ),
  constraint purchase_orders_total_units_non_negative check (total_units >= 0),
  constraint purchase_orders_total_lines_non_negative check (total_lines >= 0),
  constraint purchase_orders_status_event_consistency check (
    (
      lower(status) = 'pendiente'
      and sent_at is null
      and sent_by_user_id is null
      and received_at is null
      and received_by_user_id is null
      and cancelled_at is null
      and cancelled_by_user_id is null
    )
    or
    (
      lower(status) = 'enviado'
      and sent_at is not null
      and sent_by_user_id is not null
      and received_at is null
      and received_by_user_id is null
      and cancelled_at is null
      and cancelled_by_user_id is null
    )
    or
    (
      lower(status) = 'recibido'
      and sent_at is not null
      and sent_by_user_id is not null
      and received_at is not null
      and received_by_user_id is not null
      and cancelled_at is null
      and cancelled_by_user_id is null
    )
    or
    (
      lower(status) = 'cancelado'
      and cancelled_at is not null
      and cancelled_by_user_id is not null
      and received_at is null
      and received_by_user_id is null
      and (
        (sent_at is null and sent_by_user_id is null)
        or
        (sent_at is not null and sent_by_user_id is not null)
      )
    )
  )
);

create table if not exists purchase_order_items (
  id uuid primary key default gen_random_uuid(),
  purchase_order_id uuid not null references purchase_orders(id) on delete cascade,
  product_id uuid not null references products(id),
  product_name_snapshot varchar(180) not null,
  category_snapshot varchar(80),
  unit_snapshot varchar(30) not null,
  qty numeric(12,2) not null,
  created_at timestamptz not null default now(),
  constraint purchase_order_items_product_name_not_blank check (btrim(product_name_snapshot) <> ''),
  constraint purchase_order_items_unit_not_blank check (btrim(unit_snapshot) <> ''),
  constraint purchase_order_items_qty_positive check (qty > 0)
);

create table if not exists employee_attendance (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references employees(id),
  marked_by_user_id uuid references users(id),
  work_date date not null,
  entry_at timestamptz,
  exit_at timestamptz,
  status varchar(32) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint employee_attendance_status_allowed check (
    lower(status) in ('en turno', 'asistio', 'falto', 'permiso')
  ),
  constraint employee_attendance_event_consistency check (
    (
      lower(status) = 'falto'
      and entry_at is null
      and exit_at is null
    )
    or
    (
      lower(status) = 'permiso'
      and entry_at is null
      and exit_at is null
    )
    or
    (
      lower(status) = 'en turno'
      and entry_at is not null
      and exit_at is null
    )
    or
    (
      lower(status) = 'asistio'
      and entry_at is not null
      and exit_at is not null
      and exit_at >= entry_at
    )
  ),
  constraint employee_attendance_unique_day unique (employee_id, work_date)
);

alter table if exists employee_attendance
  drop constraint if exists employee_attendance_status_allowed;

alter table if exists employee_attendance
  add constraint employee_attendance_status_allowed check (
    lower(status) in ('en turno', 'asistio', 'falto', 'permiso')
  );

alter table if exists employee_attendance
  drop constraint if exists employee_attendance_event_consistency;

alter table if exists employee_attendance
  add constraint employee_attendance_event_consistency check (
    (
      lower(status) in ('falto', 'permiso')
      and entry_at is null
      and exit_at is null
    )
    or
    (
      lower(status) = 'en turno'
      and entry_at is not null
      and exit_at is null
    )
    or
    (
      lower(status) = 'asistio'
      and entry_at is not null
      and exit_at is not null
      and exit_at >= entry_at
    )
  );

create table if not exists employee_slips (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references employees(id),
  created_by_user_id uuid references users(id),
  slip_number varchar(40) not null unique,
  period_label varchar(40) not null,
  issued_at timestamptz not null default now(),
  total_amount numeric(12,2) not null,
  worked_days_snapshot numeric(12,2) not null,
  pay_per_day_snapshot numeric(12,2) not null,
  employee_name_snapshot varchar(180) not null,
  employee_dni_snapshot varchar(32) not null,
  employee_role_snapshot varchar(80) not null,
  username_snapshot varchar(80),
  created_at timestamptz not null default now(),
  constraint employee_slips_period_not_blank check (btrim(period_label) <> ''),
  constraint employee_slips_name_not_blank check (btrim(employee_name_snapshot) <> ''),
  constraint employee_slips_dni_not_blank check (btrim(employee_dni_snapshot) <> ''),
  constraint employee_slips_role_not_blank check (btrim(employee_role_snapshot) <> ''),
  constraint employee_slips_total_non_negative check (total_amount >= 0),
  constraint employee_slips_worked_days_non_negative check (worked_days_snapshot >= 0),
  constraint employee_slips_pay_per_day_non_negative check (pay_per_day_snapshot >= 0)
);

create table if not exists sales_workflow_documents (
  id uuid primary key default gen_random_uuid(),
  document_kind varchar(32) not null,
  doc_number varchar(40) not null unique,
  order_number varchar(40),
  document_date timestamptz not null default now(),
  customer_json text not null,
  items_json text not null,
  payment_method varchar(80),
  payment_status varchar(32),
  payment_reference varchar(120),
  payment_evidence_name varchar(220),
  payment_bank_name varchar(80),
  payment_bank_account_alias varchar(120),
  payment_bank_account_number varchar(80),
  subtotal numeric(12,2),
  igv numeric(12,2),
  total numeric(12,2) not null,
  discount_pct numeric(5,2),
  discount_amount numeric(12,2),
  status varchar(80),
  origin_address varchar(240),
  destination_address varchar(240),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint sales_workflow_documents_kind_allowed check (
    lower(document_kind) in ('quotation', 'order', 'dispatch')
  ),
  constraint sales_workflow_documents_doc_not_blank check (btrim(doc_number) <> ''),
  constraint sales_workflow_documents_customer_not_blank check (btrim(customer_json) <> ''),
  constraint sales_workflow_documents_items_not_blank check (btrim(items_json) <> ''),
  constraint sales_workflow_documents_total_non_negative check (total >= 0)
);

create table if not exists inventory_min_stocks (
  product_model_id uuid primary key references productos_modelos(id) on delete cascade,
  min_stock integer not null,
  updated_at timestamptz not null default now(),
  constraint inventory_min_stocks_non_negative check (min_stock >= 0)
);

create table if not exists inventory_boxes (
  id uuid primary key default gen_random_uuid(),
  name varchar(160) not null,
  brand_id varchar(80),
  brand_name varchar(180),
  status varchar(32) not null default 'SELLADA',
  origin varchar(180),
  items_json text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint inventory_boxes_name_not_blank check (btrim(name) <> ''),
  constraint inventory_boxes_status_allowed check (lower(status) in ('sellada', 'liberada')),
  constraint inventory_boxes_items_not_blank check (btrim(items_json) <> '')
);

create table if not exists inventory_box_history (
  id uuid primary key default gen_random_uuid(),
  box_name varchar(160) not null,
  brand_name varchar(180),
  items_json text not null,
  released_at timestamptz not null default now(),
  constraint inventory_box_history_name_not_blank check (btrim(box_name) <> ''),
  constraint inventory_box_history_items_not_blank check (btrim(items_json) <> '')
);

create table if not exists bank_account_configs (
  id uuid primary key default gen_random_uuid(),
  bank_name varchar(80) not null,
  account_alias varchar(120) not null,
  account_holder_name varchar(180) not null,
  account_number varchar(80) not null,
  cci varchar(80),
  currency varchar(8) not null default 'PEN',
  document_type varchar(16),
  document_number varchar(32),
  supports_api boolean not null default false,
  provider_code varchar(80),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint bank_account_configs_bank_not_blank check (btrim(bank_name) <> ''),
  constraint bank_account_configs_alias_not_blank check (btrim(account_alias) <> ''),
  constraint bank_account_configs_holder_not_blank check (btrim(account_holder_name) <> ''),
  constraint bank_account_configs_number_not_blank check (btrim(account_number) <> '')
);

create table if not exists sunat_ruc_records (
  ruc varchar(11) primary key,
  business_name varchar(240) not null,
  taxpayer_status varchar(80),
  domicile_condition varchar(80),
  ubigeo varchar(12),
  fiscal_address text,
  source varchar(80) not null default 'SUNAT_PADRON_REDUCIDO',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint sunat_ruc_records_ruc_length check (length(ruc) = 11),
  constraint sunat_ruc_records_business_name_not_blank check (btrim(business_name) <> '')
);

create index if not exists products_supplier_id_idx on products (supplier_id);
create index if not exists products_category_idx on products (category);
create index if not exists products_active_stock_idx on products (is_active, stock, min_stock);
create index if not exists customers_name_idx on customers (name);
create index if not exists employees_name_idx on employees (name);
create index if not exists sales_customer_id_idx on sales (customer_id);
create index if not exists sales_employee_id_idx on sales (employee_id);
create index if not exists sales_created_by_user_id_idx on sales (created_by_user_id);
create index if not exists sales_sold_at_idx on sales (sold_at);
create index if not exists sale_items_sale_id_idx on sale_items (sale_id);
create index if not exists sale_items_product_id_idx on sale_items (product_id);
create index if not exists stock_movements_product_id_idx on stock_movements (product_id);
create index if not exists stock_movements_occurred_at_idx on stock_movements (occurred_at);
create index if not exists losses_product_id_idx on losses (product_id);
create index if not exists losses_occurred_at_idx on losses (occurred_at);
create index if not exists purchase_orders_supplier_id_idx on purchase_orders (supplier_id);
create index if not exists purchase_orders_status_idx on purchase_orders (status);
create index if not exists purchase_orders_ordered_at_idx on purchase_orders (ordered_at);
create index if not exists purchase_order_items_po_id_idx on purchase_order_items (purchase_order_id);
create index if not exists purchase_order_items_product_id_idx on purchase_order_items (product_id);
create index if not exists employee_attendance_employee_id_idx on employee_attendance (employee_id);
create index if not exists employee_attendance_work_date_idx on employee_attendance (work_date);
create index if not exists employee_slips_employee_id_idx on employee_slips (employee_id);
create index if not exists employee_slips_period_label_idx on employee_slips (period_label);
create index if not exists employee_slips_issued_at_idx on employee_slips (issued_at);
create index if not exists sales_workflow_documents_kind_idx on sales_workflow_documents (document_kind);
create index if not exists inventory_boxes_status_idx on inventory_boxes (status);
create index if not exists inventory_box_history_released_at_idx on inventory_box_history (released_at);

-- Categorias
INSERT INTO categorias (id, nombre_categoria) VALUES
  ('8a53e6b7-3b97-4b9e-bd83-bf019808602b', 'Esmeriles'),
  ('4fdcb3de-5b91-4c4f-96a9-858349280d0d', 'Taladros'),
  ('d7b403f5-67c3-4d69-a1b1-6a05e2d19213', 'Rotomartillos')
ON CONFLICT (id) DO NOTHING;

-- Marcas
INSERT INTO marcas (id, nombre_marca) VALUES
  ('5c61266d-1bf9-4700-8b1e-b81682701b22', 'Bosch'),
  ('32be432e-5036-4ad6-b52e-56e632d431f9', 'Makita'),
  ('20601df5-0db6-48ee-a010-388f61559871', 'DeWalt')
ON CONFLICT (id) DO NOTHING;

-- Productos Modelos (Stock en Vivo)
INSERT INTO productos_modelos (id, id_categoria, id_marca, modelo, codigo_modelo, sku, precio, stock) VALUES
  ('f65c9284-8848-46cb-84ff-b4e82df43a99', '8a53e6b7-3b97-4b9e-bd83-bf019808602b', '5c61266d-1bf9-4700-8b1e-b81682701b22', 'GWS2200', 'GWS 22-180 H', 'SKU-75010324', 349.99, 80),
  ('2de3e990-28b9-4d92-9447-e61b369f88c3', '8a53e6b7-3b97-4b9e-bd83-bf019808602b', '5c61266d-1bf9-4700-8b1e-b81682701b22', 'GWS750', 'GWS 7-115', 'SKU-72093104', 199.50, 45),
  ('c4ab044d-5878-43d9-a719-21b36cd8ef16', '8a53e6b7-3b97-4b9e-bd83-bf019808602b', '32be432e-5036-4ad6-b52e-56e632d431f9', 'M0900B', 'M0900B 540W', 'SKU-84102941', 155.00, 30)
ON CONFLICT (sku) DO NOTHING;

-- Especificaciones de Modelos
INSERT INTO especificaciones (id, id_producto_modelo, atributo, valor) VALUES
  ('38d4c2e0-3a61-42b9-a50b-c0209e210001', (SELECT id FROM productos_modelos WHERE sku = 'SKU-75010324'), 'Potencia', '2200 W'),
  ('38d4c2e0-3a61-42b9-a50b-c0209e210002', (SELECT id FROM productos_modelos WHERE sku = 'SKU-75010324'), 'Diametro de disco', '7" (180 mm)'),
  ('38d4c2e0-3a61-42b9-a50b-c0209e210003', (SELECT id FROM productos_modelos WHERE sku = 'SKU-75010324'), 'Velocidad', '8500 RPM'),
  ('38d4c2e0-3a61-42b9-a50b-c0209e210004', (SELECT id FROM productos_modelos WHERE sku = 'SKU-75010324'), 'Peso', '5.2 kg'),
  ('38d4c2e0-3a61-42b9-a50b-c0209e210005', (SELECT id FROM productos_modelos WHERE sku = 'SKU-72093104'), 'Potencia', '750 W'),
  ('38d4c2e0-3a61-42b9-a50b-c0209e210006', (SELECT id FROM productos_modelos WHERE sku = 'SKU-72093104'), 'Diametro de disco', '4 1/2" (115 mm)'),
  ('38d4c2e0-3a61-42b9-a50b-c0209e210007', (SELECT id FROM productos_modelos WHERE sku = 'SKU-72093104'), 'Velocidad', '11000 RPM'),
  ('38d4c2e0-3a61-42b9-a50b-c0209e210008', (SELECT id FROM productos_modelos WHERE sku = 'SKU-72093104'), 'Peso', '1.8 kg'),
  ('38d4c2e0-3a61-42b9-a50b-c0209e210009', (SELECT id FROM productos_modelos WHERE sku = 'SKU-84102941'), 'Potencia', '540 W'),
  ('38d4c2e0-3a61-42b9-a50b-c0209e210010', (SELECT id FROM productos_modelos WHERE sku = 'SKU-84102941'), 'Velocidad', '12000 RPM'),
  ('38d4c2e0-3a61-42b9-a50b-c0209e210011', (SELECT id FROM productos_modelos WHERE sku = 'SKU-84102941'), 'Peso', '1.6 kg')
ON CONFLICT (id) DO NOTHING;

-- Imagenes de Modelos
INSERT INTO productos_imagenes (id, id_producto_modelo, url_imagen) VALUES
  ('38d4c2e0-3a61-42b9-a50b-c0209e210021', (SELECT id FROM productos_modelos WHERE sku = 'SKU-75010324'), '/src/assets/esmeril_gws2200.png'),
  ('38d4c2e0-3a61-42b9-a50b-c0209e210022', (SELECT id FROM productos_modelos WHERE sku = 'SKU-75010324'), '/src/assets/taladro.png'),
  ('38d4c2e0-3a61-42b9-a50b-c0209e210023', (SELECT id FROM productos_modelos WHERE sku = 'SKU-75010324'), '/src/assets/casco.png'),
  ('38d4c2e0-3a61-42b9-a50b-c0209e210024', (SELECT id FROM productos_modelos WHERE sku = 'SKU-72093104'), '/src/assets/esmeril_gws750.png'),
  ('38d4c2e0-3a61-42b9-a50b-c0209e210025', (SELECT id FROM productos_modelos WHERE sku = 'SKU-72093104'), '/src/assets/taladro.png'),
  ('38d4c2e0-3a61-42b9-a50b-c0209e210026', (SELECT id FROM productos_modelos WHERE sku = 'SKU-72093104'), '/src/assets/pernos.png'),
  ('38d4c2e0-3a61-42b9-a50b-c0209e210027', (SELECT id FROM productos_modelos WHERE sku = 'SKU-84102941'), '/src/assets/taladro.png')
ON CONFLICT (id) DO NOTHING;

-- Configuracion de Cuentas Bancarias
INSERT INTO bank_account_configs (id, bank_name, account_alias, account_holder_name, account_number, cci, currency, document_type, document_number, supports_api, provider_code, is_active, created_at, updated_at) VALUES
  ('38d4c2e0-3a61-42b9-a50b-c0209e210031', 'BCP', 'Cuenta soles BCP', 'MEPS GROUP PERU S.A.C.', '191-12345678-0-00', '00219100123456780000', 'PEN', 'RUC', '20601234567', true, 'BCP_API', true, now(), now()),
  ('38d4c2e0-3a61-42b9-a50b-c0209e210032', 'INTERBANK', 'Cuenta ventas Interbank', 'MEPS GROUP PERU S.A.C.', '200-300400500600', '00320030040050060000', 'PEN', 'RUC', '20601234567', true, 'INTERBANK_API', true, now(), now()),
  ('38d4c2e0-3a61-42b9-a50b-c0209e210033', 'BBVA', 'Cuenta soles BBVA', 'MEPS GROUP PERU S.A.C.', '0011-0123-01-00098765', '01112300010009876500', 'PEN', 'RUC', '20601234567', true, 'BBVA_API', true, now(), now())
ON CONFLICT (id) DO NOTHING;

-- 10 Registros de SUNAT RUC
INSERT INTO sunat_ruc_records (ruc, business_name, taxpayer_status, domicile_condition, ubigeo, fiscal_address, source, created_at, updated_at) VALUES
  ('20601234567', 'CONSTRUCTORA DEL NORTE S.A.C.', 'Activo', 'Habido', '150101', 'AV. LOS ALGARROBOS 456 - LIMA', 'SUNAT_PADRON_REDUCIDO', now(), now()),
  ('20543210987', 'DISTRIBUIDORA FERRETERA ALFA S.A.', 'Activo', 'Habido', '150103', 'CALLE LOS FICUS 789 - SAN ISIDRO', 'SUNAT_PADRON_REDUCIDO', now(), now()),
  ('20109876543', 'SERVICIOS GENERALES GOMEZ E.I.R.L.', 'Activo', 'Habido', '150115', 'AV. LAS PALMERAS 1011 - LA MOLINA', 'SUNAT_PADRON_REDUCIDO', now(), now()),
  ('20345678901', 'INVERSIONES METALURGICAS S.R.L.', 'Activo', 'Habido', '150132', 'JR. HUANUCO 345 - CERCADO DE LIMA', 'SUNAT_PADRON_REDUCIDO', now(), now()),
  ('20498765432', 'CONTRATISTAS ASOCIADOS S.A.', 'Activo', 'Habido', '150140', 'AV. JAVIER PRADO 1500 - SAN BORJA', 'SUNAT_PADRON_REDUCIDO', now(), now()),
  ('20234567890', 'LOGISTICA Y TRANSPORTE RAPIDO S.A.C.', 'Activo', 'Habido', '150101', 'CALLE EL SOL 123 - LIMA', 'SUNAT_PADRON_REDUCIDO', now(), now()),
  ('20987654321', 'CONSTRUCCIONES METROPOLITANAS E.I.R.L.', 'Activo', 'Habido', '150108', 'AV. UNIVERSITARIA 3421 - LOS OLIVOS', 'SUNAT_PADRON_REDUCIDO', now(), now()),
  ('20876543210', 'TECNOLOGIA DE FIJACIONES S.R.L.', 'Activo', 'Habido', '150125', 'JR. AREQUIPA 567 - MIRAFLORES', 'SUNAT_PADRON_REDUCIDO', now(), now()),
  ('20765432109', 'MATERIALES E INSUMOS DEL PERU S.A.C.', 'Activo', 'Habido', '150110', 'AV. ARGENTINA 2800 - CALLAO', 'SUNAT_PADRON_REDUCIDO', now(), now()),
  ('20654321098', 'GRUPO CONSTRUCTOR VILLA S.A.', 'Activo', 'Habido', '150142', 'AV. PACHACUTEC 1450 - VILLA MARIA DEL TRIUNFO', 'SUNAT_PADRON_REDUCIDO', now(), now())
ON CONFLICT (ruc) DO NOTHING;

-- Proveedores (10 Registros)
INSERT INTO suppliers (id, name, ruc, contact, phone, email, is_active, created_at, updated_at) VALUES
  ('38d4c2e0-3a61-42b9-a50b-c0209e210041', 'PROVEEDOR GENERAL S.A.C.', '20601111111', 'Contacto de Ventas', '999888777', 'proveedor@general.com', true, now(), now()),
  ('38d4c2e0-3a61-42b9-a50b-c0209e210081', 'CORPORACION ACEROS AREQUIPA S.A.', '20100088559', 'Ing. Carlos Mendoza', '981234567', 'ventas@acerosarequipa.com.pe', true, now(), now()),
  ('38d4c2e0-3a61-42b9-a50b-c0209e210082', 'CEMENTOS PACASMAYO S.A.A.', '20100140224', 'Lic. Patricia Alva', '972345678', 'distribucion@pacasmayo.com.pe', true, now(), now()),
  ('38d4c2e0-3a61-42b9-a50b-c0209e210083', 'SIDERURGICA DEL PERU S.A.A. - SIDERPERU', '20100122404', 'Ing. Luis Valdivia', '963456789', 'ventas@sider.com.pe', true, now(), now()),
  ('38d4c2e0-3a61-42b9-a50b-c0209e210084', 'ROBERT BOSCH S.A.C.', '20504780517', 'Representante Bosch Peru', '954567890', 'soporte@bosch.com.pe', true, now(), now()),
  ('38d4c2e0-3a61-42b9-a50b-c0209e210085', 'MAKITA PERU S.A.', '20508688755', 'Area Mayorista Makita', '945678901', 'comercial@makita.pe', true, now(), now()),
  ('38d4c2e0-3a61-42b9-a50b-c0209e210086', 'STANLEY BLACK & DECKER PERU S.R.L.', '20512345678', 'Supervisor Stanley', '936789012', 'pedidos.sbd@stanley.com', true, now(), now()),
  ('38d4c2e0-3a61-42b9-a50b-c0209e210087', 'FERREYROS S.A.', '20100028653', 'Contacto Corporativo', '927890123', 'clientes@ferreyros.com.pe', true, now(), now()),
  ('38d4c2e0-3a61-42b9-a50b-c0209e210088', 'PRODUCTOS PRODAC S.A.', '20100080655', 'Ventas Alambres', '918901234', 'contacto@prodac.com.pe', true, now(), now()),
  ('38d4c2e0-3a61-42b9-a50b-c0209e210089', 'FABRICA DE CUBIERTOS S.A. - FACUSA', '20100023694', 'Ventas Herramientas', '909012345', 'ventas@facusa.com.pe', true, now(), now())
ON CONFLICT (ruc) DO NOTHING;

-- 10 Clientes DNI + 10 Clientes RUC (con preferred_discount)
INSERT INTO customers (id, name, doc_type, doc_number, phone, email, address, preferred_discount, created_at, updated_at) VALUES
  -- 10 Clientes DNI
  ('38d4c2e0-3a61-42b9-a50b-c0209e210051', 'Publico General / Varios', 'DNI', '00000000', '-', '-', '[Minorista] Av. El Sol 123', 0.00, now(), now()),
  ('38d4c2e0-3a61-42b9-a50b-c0209e210052', 'Juan Perez Rodriguez', 'DNI', '44558899', '987654321', 'juan.perez@gmail.com', '[Minorista] Av. El Sol 123, Lima', 5.00, now(), now()),
  ('38d4c2e0-3a61-42b9-a50b-c0209e210054', 'Juan Carlos Mendoza', 'DNI', '10293847', '944888333', 'carlos.mendoza@gmail.com', '[Minorista] Av. Larco 450, Miraflores', 0.00, now(), now()),
  ('38d4c2e0-3a61-42b9-a50b-c0209e210055', 'Maria Helena Santos', 'DNI', '56473829', '922777111', 'maria.santos@outlook.com', '[Minorista] Jr. Puno 782, Lima', 5.00, now(), now()),
  ('38d4c2e0-3a61-42b9-a50b-c0209e210056', 'Carlos Alberto Quispe', 'DNI', '87463529', '999111222', 'carlos.quispe@gmail.com', '[Minorista] Av. Tacna 120, Lima', 0.00, now(), now()),
  ('38d4c2e0-3a61-42b9-a50b-c0209e210057', 'Ana Cecilia Rojas', 'DNI', '34251627', '988333444', 'ana.rojas@hotmail.com', '[Minorista] Calle Los Pinos 400, San Isidro', 5.00, now(), now()),
  ('38d4c2e0-3a61-42b9-a50b-c0209e210058', 'Luis Fernando Torres', 'DNI', '98765432', '911222333', 'lfernando.torres@gmail.com', '[Minorista] Av. La Marina 2200, San Miguel', 10.00, now(), now()),
  ('38d4c2e0-3a61-42b9-a50b-c0209e210059', 'Diana Patricia Vega', 'DNI', '23456789', '933444555', 'diana.vega@gmail.com', '[Minorista] Jr. Huallaga 550, Lima', 0.00, now(), now()),
  ('38d4c2e0-3a61-42b9-a50b-c0209e210060', 'Jorge Luis Flores', 'DNI', '76543210', '955666777', 'jorge.flores@gmail.com', '[Minorista] Av. Brasil 1400, Jesus Maria', 5.00, now(), now()),
  ('38d4c2e0-3a61-42b9-a50b-c0209e210062', 'Rosa Maria Chavez', 'DNI', '12345678', '966777888', 'rosa.chavez@gmail.com', '[Minorista] Av. Arequipa 3500, San Isidro', 10.00, now(), now()),
  ('38d4c2e0-3a61-42b9-a50b-c0209e210063', 'Miguel Angel Ramirez', 'DNI', '45678901', '977888999', 'miguel.ramirez@gmail.com', '[Minorista] Jr. Quilca 210, Lima', 0.00, now(), now()),
  ('38d4c2e0-3a61-42b9-a50b-c0209e210064', 'Carmen Julia Benitez', 'DNI', '89012345', '988999000', 'carmen.benitez@gmail.com', '[Minorista] Av. Sucre 800, Pueblo Libre', 5.00, now(), now()),
  
  -- 10 Clientes RUC
  ('38d4c2e0-3a61-42b9-a50b-c0209e210053', 'CONSTRUCTORA DEL NORTE S.A.C.', 'RUC', '20601234567', '01 4567890', 'compras@construalfa.com', '[Mayorista] Av. Los Algarrobos 456 - LIMA', 10.00, now(), now()),
  ('38d4c2e0-3a61-42b9-a50b-c0209e210065', 'DISTRIBUIDORA FERRETERA ALFA S.A.', 'RUC', '20543210987', '01 9876543', 'ventas@ferrealfa.com', '[Mayorista] Calle Los Ficus 789 - SAN ISIDRO', 15.00, now(), now()),
  ('38d4c2e0-3a61-42b9-a50b-c0209e210066', 'SERVICIOS GENERALES GOMEZ E.I.R.L.', 'RUC', '20109876543', '01 3210987', 'contacto@gomez.com.pe', '[Mayorista] Av. Las Palmeras 1011 - LA MOLINA', 5.00, now(), now()),
  ('38d4c2e0-3a61-42b9-a50b-c0209e210067', 'INVERSIONES METALURGICAS S.R.L.', 'RUC', '20345678901', '01 7894561', 'logistica@invemetal.com', '[Mayorista] Jr. Huanuco 345 - CERCADO DE LIMA', 10.00, now(), now()),
  ('38d4c2e0-3a61-42b9-a50b-c0209e210068', 'CONTRATISTAS ASOCIADOS S.A.', 'RUC', '20498765432', '01 4561230', 'obras@contratas.com.pe', '[Mayorista] Av. Javier Prado 1500 - SAN BORJA', 15.00, now(), now()),
  ('38d4c2e0-3a61-42b9-a50b-c0209e210069', 'LOGISTICA Y TRANSPORTE RAPIDO S.A.C.', 'RUC', '20234567890', '01 1237894', 'despachos@transrapido.com', '[Mayorista] Calle El Sol 123 - LIMA', 5.00, now(), now()),
  ('38d4c2e0-3a61-42b9-a50b-c0209e210070', 'CONSTRUCCIONES METROPOLITANAS E.I.R.L.', 'RUC', '20987654321', '01 9871234', 'proyectos@constru-metro.com', '[Mayorista] Av. Universitaria 3421 - LOS OLIVOS', 10.00, now(), now()),
  ('38d4c2e0-3a61-42b9-a50b-c0209e210071', 'TECNOLOGIA DE FIJACIONES S.R.L.', 'RUC', '20876543210', '01 6549873', 'ventas@tecnofijaciones.com', '[Mayorista] Jr. Arequipa 567 - MIRAFLORES', 15.00, now(), now()),
  ('38d4c2e0-3a61-42b9-a50b-c0209e210072', 'MATERIALES E INSUMOS DEL PERU S.A.C.', 'RUC', '20765432109', '01 7891230', 'adquisiciones@matperu.com', '[Mayorista] Av. Argentina 2800 - CALLAO', 5.00, now(), now()),
  ('38d4c2e0-3a61-42b9-a50b-c0209e210073', 'GRUPO CONSTRUCTOR VILLA S.A.', 'RUC', '20654321098', '01 4567891', 'gerencia@grupovilla.com', '[Mayorista] Av. Pachacutec 1450 - VILLA MARIA DEL TRIUNFO', 10.00, now(), now())
ON CONFLICT (lower(doc_type), lower(doc_number)) DO NOTHING;

-- Empleado y Usuario Administrador de Prueba
INSERT INTO employees (id, initials, name, role, dni, pay_per_day, worked_days, can_mark_exit, is_active, created_at, updated_at) VALUES
  ('38d4c2e0-3a61-42b9-a50b-c0209e210061', 'ADM', 'Admin User', 'GERENTE', '00000000', 100.00, 0, false, true, now(), now())
ON CONFLICT (dni) DO NOTHING;

INSERT INTO users (id, employee_id, username, role, status, password_hash, is_active, created_at, updated_at) VALUES
  ('00000000-0000-0000-0000-000000000001', '38d4c2e0-3a61-42b9-a50b-c0209e210061', 'admin', 'ADMIN', 'active', '$2a$10$oZHH63eSzKIlzFQ6D9zIX.KNaR.A36NSHxNgcP7lUuACxwHeEw7q2', true, now(), now())
ON CONFLICT (username) DO UPDATE SET
  role = EXCLUDED.role,
  status = EXCLUDED.status,
  password_hash = EXCLUDED.password_hash,
  is_active = EXCLUDED.is_active,
  updated_at = now();

-- Nuevos Productos (Agregados por solicitud del usuario)
-- DeWalt Taladro DCD771
INSERT INTO productos_modelos (id, id_categoria, id_marca, modelo, codigo_modelo, sku, precio, stock) VALUES
  ('a54d6738-3482-411a-829d-ee3d45c1a3b1', '4fdcb3de-5b91-4c4f-96a9-858349280d0d', '20601df5-0db6-48ee-a010-388f61559871', 'DCD771', 'DCD771C2', 'SKU-30910482', 289.99, 25)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO especificaciones (id, id_producto_modelo, atributo, valor) VALUES
  ('1a6b2839-4910-482a-bc91-38291039d001', 'a54d6738-3482-411a-829d-ee3d45c1a3b1', 'Voltaje', '20V'),
  ('1a6b2839-4910-482a-bc91-38291039d002', 'a54d6738-3482-411a-829d-ee3d45c1a3b1', 'Mandril', '1/2"'),
  ('1a6b2839-4910-482a-bc91-38291039d003', 'a54d6738-3482-411a-829d-ee3d45c1a3b1', 'Velocidades', '2')
ON CONFLICT (id) DO NOTHING;

INSERT INTO productos_imagenes (id, id_producto_modelo, url_imagen) VALUES
  ('2b839201-4829-410a-bc92-192013829d01', 'a54d6738-3482-411a-829d-ee3d45c1a3b1', '/src/assets/taladro_dewalt.png')
ON CONFLICT (id) DO NOTHING;

-- Bosch Rotomartillo GBH 2-24 D
INSERT INTO productos_modelos (id, id_categoria, id_marca, modelo, codigo_modelo, sku, precio, stock) VALUES
  ('c829e102-4829-410a-bc39-a83d910d82d4', 'd7b403f5-67c3-4d69-a1b1-6a05e2d19213', '5c61266d-1bf9-4700-8b1e-b81682701b22', 'GBH2-24', 'GBH 2-24 D', 'SKU-58291043', 549.90, 15)
ON CONFLICT (sku) DO NOTHING;

INSERT INTO especificaciones (id, id_producto_modelo, atributo, valor) VALUES
  ('3c829e10-4829-412a-bc39-a82910482d01', 'c829e102-4829-410a-bc39-a83d910d82d4', 'Fuerza de impacto', '2.7 J'),
  ('3c829e10-4829-412a-bc39-a82910482d02', 'c829e102-4829-410a-bc39-a83d910d82d4', 'Potencia', '820 W'),
  ('3c829e10-4829-412a-bc39-a82910482d03', 'c829e102-4829-410a-bc39-a83d910d82d4', 'Mandril', 'SDS Plus')
ON CONFLICT (id) DO NOTHING;

INSERT INTO productos_imagenes (id, id_producto_modelo, url_imagen) VALUES
  ('4d829102-4829-420a-bc39-102938482d01', 'c829e102-4829-410a-bc39-a83d910d82d4', '/src/assets/rotomartillo_bosch.png')
ON CONFLICT (id) DO NOTHING;

-- Nuevos Productos Adicionales (12 productos mas)
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

-- 12. Esmeril Inalambrico Makita DGA452
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


