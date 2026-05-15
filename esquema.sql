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
    lower(status) in ('en turno', 'asistio', 'falto')
  ),
  constraint employee_attendance_event_consistency check (
    (
      lower(status) = 'falto'
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
