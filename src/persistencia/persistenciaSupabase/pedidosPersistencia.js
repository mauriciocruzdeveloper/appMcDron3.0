import { supabase } from './supabaseClient.js';

// Helper: transforma fila de BD al formato del frontend
const toFrontend = (row, items = []) => ({
  id: String(row.id),
  data: {
    ProveedorId: row.supplier_id,
    ProveedorNombre: row.supplier_name,
    FechaPedido: row.order_date,
    FechaEstimadaLlegada: row.estimated_arrival ?? null,
    FechaLlegadaReal: row.actual_arrival ?? null,
    Estado: row.status,
    NumeroPedido: row.tracking_number ?? null,
    Notas: row.notes ?? '',
    Items: items.map(item => ({
      id: String(item.id),
      data: {
        PedidoId: String(row.id),
        RepuestoId: item.part_id ? String(item.part_id) : null,
        NombreRepuesto: item.part_name,
        Cantidad: item.quantity,
        PrecioUnitario: item.unit_price ?? null,
      },
    })),
  },
});

// -------------------------
// GET todos los pedidos
// -------------------------
export const getPedidosPersistencia = async (callback) => {
  try {
    const { data: pedidos, error } = await supabase
      .from('purchase_order')
      .select('*')
      .order('order_date', { ascending: false });

    if (error) throw error;

    const pedidosConItems = await Promise.all(
      (pedidos ?? []).map(async (p) => {
        const { data: items, error: itemsError } = await supabase
          .from('purchase_order_item')
          .select('*')
          .eq('purchase_order_id', p.id);
        if (itemsError) throw itemsError;
        return toFrontend(p, items ?? []);
      })
    );

    callback(pedidosConItems);

    // Suscripción en tiempo real
    const channel = supabase
      .channel('purchase_order_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'purchase_order' }, async () => {
        const { data: updated, error: updError } = await supabase
          .from('purchase_order')
          .select('*')
          .order('order_date', { ascending: false });
        if (updError) return;

        const updatedConItems = await Promise.all(
          (updated ?? []).map(async (p) => {
            const { data: items } = await supabase
              .from('purchase_order_item')
              .select('*')
              .eq('purchase_order_id', p.id);
            return toFrontend(p, items ?? []);
          })
        );
        callback(updatedConItems);
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    throw error;
  }
};

// -------------------------
// GET pedido por id
// -------------------------
export const getPedidoPersistencia = async (id) => {
  try {
    const { data, error } = await supabase
      .from('purchase_order')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;

    const { data: items, error: itemsError } = await supabase
      .from('purchase_order_item')
      .select('*')
      .eq('purchase_order_id', id);
    if (itemsError) throw itemsError;

    return toFrontend(data, items ?? []);
  } catch (error) {
    console.error('Error al obtener pedido:', error);
    throw error;
  }
};

// -------------------------
// GUARDAR pedido (crear o actualizar)
// -------------------------
export const guardarPedidoPersistencia = async (pedido) => {
  try {
    const isNew = !pedido.id || pedido.id === 'new';

    const rowData = {
      supplier_id:        pedido.data.ProveedorId,
      supplier_name:      pedido.data.ProveedorNombre,
      order_date:         pedido.data.FechaPedido,
      estimated_arrival:  pedido.data.FechaEstimadaLlegada || null,
      actual_arrival:     pedido.data.FechaLlegadaReal || null,
      status:             pedido.data.Estado,
      tracking_number:    pedido.data.NumeroPedido || null,
      notes:              pedido.data.Notas || null,
    };

    let savedId;

    if (isNew) {
      const { data, error } = await supabase
        .from('purchase_order')
        .insert(rowData)
        .select()
        .single();
      if (error) throw error;
      savedId = data.id;
    } else {
      const { error } = await supabase
        .from('purchase_order')
        .update(rowData)
        .eq('id', pedido.id);
      if (error) throw error;
      savedId = pedido.id;

      // Eliminar ítems antiguos para re-insertar
      const { error: delError } = await supabase
        .from('purchase_order_item')
        .delete()
        .eq('purchase_order_id', savedId);
      if (delError) throw delError;
    }

    // Insertar ítems
    if (pedido.data.Items && pedido.data.Items.length > 0) {
      const itemsRows = pedido.data.Items.map(item => ({
        purchase_order_id: savedId,
        part_id:           item.data.RepuestoId ? Number(item.data.RepuestoId) : null,
        part_name:         item.data.NombreRepuesto,
        quantity:          item.data.Cantidad,
        unit_price:        item.data.PrecioUnitario ?? null,
      }));

      const { error: itemsError } = await supabase
        .from('purchase_order_item')
        .insert(itemsRows);
      if (itemsError) throw itemsError;
    }

    return await getPedidoPersistencia(savedId);
  } catch (error) {
    console.error('Error al guardar pedido:', error);
    throw error;
  }
};

// -------------------------
// ELIMINAR pedido
// -------------------------
export const eliminarPedidoPersistencia = async (id) => {
  try {
    // Los ítems se eliminan en cascada por FK
    const { error } = await supabase
      .from('purchase_order')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return String(id);
  } catch (error) {
    console.error('Error al eliminar pedido:', error);
    throw error;
  }
};
