-- ========================================================
-- CLEAN UP (Borra datos previos para evitar duplicados y reinicia secuencias)
-- ========================================================
TRUNCATE TABLE 
    public.purchase_order_item, public.purchase_order, public.messages,
    public.repair_intervention, public.repair, public.part_intervention, 
    public.part_drone_model, public.intervention, public.part, 
    public.drone, public.drone_model, public.user 
RESTART IDENTITY CASCADE;

-- ========================================================
-- 1. POBLAR TABLA: user
-- ========================================================
INSERT INTO public.user (id, first_name, last_name, email, state, city, nick, telephone, address, role)
OVERRIDING SYSTEM VALUE
VALUES 
(1, 'Mauricio', 'Cruz', 'admin@mauriciocruzdrones.com', 'Santa Fe', 'Granadero Baigorria', 'mcruz', '3416559834', 'Av. San Martín 1200', 'admin'),
(2, 'Juan Carlos', 'Pérez', 'juan.perez@gmail.com', 'Santa Fe', 'Rosario', 'juanca', '3415551234', 'Pellegrini 1500', 'cliente'),
(3, 'María Laura', 'Gómez', 'marialg@hotmail.com', 'Santa Fe', 'San Lorenzo', 'marialu', '3476449876', 'Urquiza 450', 'cliente'),
(4, 'Soporte', 'Técnico', 'soporte@mauriciocruzdrones.com', 'Santa Fe', 'Granadero Baigorria', 'tech_partner', '3416559835', 'Av. San Martín 1200', 'partner');

-- ========================================================
-- 2. POBLAR TABLA: drone_model
-- ========================================================
INSERT INTO public.drone_model (id, name, description, price_ref, manufacturer, code) 
OVERRIDING SYSTEM VALUE
VALUES 
(1, 'DJI Mavic 3 Pro', 'Dron profesional con triple cámara', 2500.00, 'DJI', 'M3P-001'),
(2, 'DJI Avata', 'Dron FPV Cinewhoop', 1200.00, 'DJI', 'AVT-001'),
(3, 'DJI Neo 2', 'Dron compacto', 600.00, 'DJI', 'NEO2-001');

-- ========================================================
-- 3. POBLAR TABLA: drone
-- ========================================================
INSERT INTO public.drone (id, drone_model_id, owner_id, name, serial_number, observations)
OVERRIDING SYSTEM VALUE
VALUES 
(1, 2, 2, 'Avata de Juan', '1581F4X0012345', 'Uso recreativo, marcas de uso en los protectores'),  
(2, 1, 3, 'Mavic 3 ML', '3GZD2340056789', 'Uso en productora audiovisual'),   
(3, 3, 2, 'Neo 2 Juan', '4X7RK920011223', 'Recién comprado');       

-- ========================================================
-- 4. POBLAR TABLA: part
-- ========================================================
INSERT INTO public.part (id, name, description, provider, price, stock, backorder)
OVERRIDING SYSTEM VALUE
VALUES 
(1, 'Frame Medio (Middle Frame)', 'Chasis central', 'DroneParts Import', 28000.00, 2, 0),
(2, 'Placa ESC Controller Board', 'Placa de controladores de velocidad', 'Global Electronic Componentes', 45000.00, 3, 0),
(3, 'Main Board', 'Placa principal', 'Global Electronic Componentes', 85000.00, 2, 1),
(4, 'Brazo de Motor Delantero Izquierdo', 'Brazo con motor incluido', 'DroneParts Import', 32000.00, 4, 0);

-- ========================================================
-- 5. POBLAR TABLA: intervention
-- ========================================================
INSERT INTO public.intervention (id, drone_model_id, name, description, labor_cost, parts_cost, total_cost, estimated_duration)
OVERRIDING SYSTEM VALUE
VALUES 
(1, 2, 'Reemplazo de Middle Frame', 'Desarme completo para cambio de chasis central', 25000.00, 28000.00, 53000.00, 3),
(2, 3, 'Reemplazo de ESC', 'Cambio de placa controladora de velocidad independiente', 15000.00, 45000.00, 60000.00, 2),
(3, 3, 'Reemplazo de Main Board', 'Cambio de placa principal del dron', 18000.00, 85000.00, 103000.00, 2);

-- ========================================================
-- 6. POBLAR TABLA: part_drone_model
-- ========================================================
INSERT INTO public.part_drone_model (id, part_id, drone_model_id)
OVERRIDING SYSTEM VALUE
VALUES 
(1, 1, 2), -- Frame Medio es para Avata
(2, 2, 3), -- ESC es para Neo 2
(3, 3, 3); -- Main Board es para Neo 2

-- ========================================================
-- 7. POBLAR TABLA: part_intervention
-- ========================================================
INSERT INTO public.part_intervention (id, part_id, intervention_id, quantity)
OVERRIDING SYSTEM VALUE
VALUES 
(1, 1, 1, 1), -- Intervención de frame usa 1 Frame
(2, 2, 2, 1), -- Intervención de ESC usa 1 ESC
(3, 3, 3, 1); -- Intervención de Main Board usa 1 Main Board

-- ========================================================
-- 8. POBLAR TABLA: repair
-- ========================================================
INSERT INTO public.repair (id, state, priority, drone_id, owner_id, description, diagnosis, price_labor, price_total, contact_date, reception_date)
OVERRIDING SYSTEM VALUE
VALUES 
(1, 'En progreso', 1, 1, 2, 'Caída desde altura', 'Frame medio roto, requiere desarme total.', 25000.00, 53000.00, CAST(EXTRACT(EPOCH FROM NOW() - INTERVAL '3 days') * 1000 AS BIGINT), CAST(EXTRACT(EPOCH FROM NOW() - INTERVAL '2 days') * 1000 AS BIGINT)),
(2, 'Recibido', 2, 3, 2, 'Fallo de potencia en vuelo', 'Revisión pendiente de placas internas ESC y Main.', NULL, NULL, CAST(EXTRACT(EPOCH FROM NOW() - INTERVAL '1 day') * 1000 AS BIGINT), CAST(EXTRACT(EPOCH FROM NOW()) * 1000 AS BIGINT));

-- ========================================================
-- 9. POBLAR TABLA: repair_intervention
-- ========================================================
INSERT INTO public.repair_intervention (id, repair_id, intervention_id, labor_cost, parts_cost, total_cost, status, description)
OVERRIDING SYSTEM VALUE
VALUES 
(1, 1, 1, 25000.00, 28000.00, 53000.00, 'en proceso', 'Traspasando componentes al frame nuevo.');

-- ========================================================
-- 10. POBLAR TABLA: messages (No usa OVERRIDING, usa nextval)
-- ========================================================
INSERT INTO public.messages (id, user_id, other_user_id, sender_id, sendername, content, date, isread)
VALUES 
(1, 2, 1, 1, 'Mauricio', 'Hola Juan, ya recibimos el Avata. Confirmo que hay que cambiar el frame medio.', CAST(EXTRACT(EPOCH FROM NOW() - INTERVAL '2 days') * 1000 AS BIGINT), true),
(2, 2, 1, 2, 'Juan Carlos', 'Perfecto, avanza con la reparación.', CAST(EXTRACT(EPOCH FROM NOW() - INTERVAL '1 day') * 1000 AS BIGINT), false);

-- ========================================================
-- 11. POBLAR TABLA: purchase_order (No usa OVERRIDING, usa nextval)
-- ========================================================
INSERT INTO public.purchase_order (id, supplier_id, supplier_name, order_date, status, tracking_number)
VALUES 
(1, 101, 'DroneParts Import', CURRENT_DATE - INTERVAL '5 days', 'completed', 'AR-98347239-RE'),
(2, 102, 'Global Electronic Componentes', CURRENT_DATE - INTERVAL '1 day', 'pending', 'DHL-3849204-CH');

-- ========================================================
-- 12. POBLAR TABLA: purchase_order_item (No usa OVERRIDING, usa nextval)
-- ========================================================
INSERT INTO public.purchase_order_item (id, purchase_order_id, part_id, part_name, quantity, unit_price)
VALUES 
(1, 1, 1, 'Frame Medio (Middle Frame)', 2, 26000.00),
(2, 2, 3, 'Main Board', 1, 80000.00);