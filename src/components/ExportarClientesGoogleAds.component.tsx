import React, { useState } from 'react';
import { useAppSelector } from 'redux-tool-kit/hooks/useAppSelector';
import { selectUsuariosNoAdmin } from 'redux-tool-kit/usuario/usuario.selectors';

function generarCSV(filas: string[][]): string {
    return filas
        .map(fila =>
            fila.map(celda => `"${celda.replace(/"/g, '""')}"`).join(',')
        )
        .join('\n');
}

function descargarCSV(contenido: string, nombreArchivo: string): void {
    const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nombreArchivo;
    link.click();
    URL.revokeObjectURL(url);
}

export default function ExportarClientesGoogleAds(): React.ReactElement {
    const usuarios = useAppSelector(selectUsuariosNoAdmin);
    const [exportado, setExportado] = useState(false);

    const usuariosConEmail = usuarios.filter(u => u.data.EmailUsu && u.data.EmailUsu.trim() !== '');

    const handleExportar = () => {
        const encabezado = ['Email', 'Phone'];

        const filas = usuariosConEmail.map(u => [
            (u.data.EmailContacto || u.data.EmailUsu || '').trim(),
            (u.data.TelefonoUsu || '').trim(),
        ]);

        const csv = generarCSV([encabezado, ...filas]);
        const fecha = new Date().toISOString().slice(0, 10);
        descargarCSV(csv, `clientes-google-ads-${fecha}.csv`);
        setExportado(true);
    };

    return (
        <div className="d-flex flex-column" style={{ height: '100vh' }}>
            {/* Header */}
            <div className="p-4 pb-2 bg-white border-bottom" style={{ position: 'sticky', top: 0, zIndex: 100 }}>
                <h3 className="mb-0">Exportar Clientes — Google Ads</h3>
            </div>

            {/* Contenido */}
            <div className="flex-grow-1 overflow-auto">
                <div className="p-4 pt-3">
                    <div className="card mb-3">
                        <div className="card-body">
                            <h5 className="card-title">Lista de clientes para Customer Match</h5>
                            <p className="text-muted mb-1">
                                Se exportan todos los usuarios (clientes y partners) con email registrado.
                                El archivo CSV está listo para subir directamente a Google Ads.
                            </p>
                            <p className="text-muted">
                                Columnas: <code>Email</code>, <code>Phone</code>
                            </p>
                        </div>
                    </div>

                    <div className="card mb-3">
                        <div className="card-body">
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <div>
                                    <span className="text-muted">Usuarios a exportar: </span>
                                    <strong>{usuariosConEmail.length}</strong>
                                    {usuarios.length !== usuariosConEmail.length && (
                                        <span className="text-muted ms-2">
                                            ({usuarios.length - usuariosConEmail.length} sin email)
                                        </span>
                                    )}
                                </div>
                            </div>

                            {usuariosConEmail.length === 0 ? (
                                <div className="alert alert-warning" role="alert">
                                    No hay usuarios con email para exportar.
                                </div>
                            ) : (
                                <>
                                    {exportado && (
                                        <div className="alert alert-success mb-3" role="alert">
                                            ✓ Archivo descargado correctamente.
                                        </div>
                                    )}
                                    <button
                                        className="btn bg-bluemcdron text-white w-100"
                                        onClick={handleExportar}
                                    >
                                        ⬇ Descargar CSV ({usuariosConEmail.length} clientes)
                                    </button>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Vista previa */}
                    {usuariosConEmail.length > 0 && (
                        <div className="card">
                            <div className="card-body">
                                <h6 className="card-title text-muted">Vista previa (primeros 5)</h6>
                                <div className="table-responsive">
                                    <table className="table table-sm table-bordered mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Email</th>
                                                <th>Phone</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {usuariosConEmail.slice(0, 5).map(u => (
                                                <tr key={u.id}>
                                                    <td className="text-truncate" style={{ maxWidth: '200px' }}>
                                                        {u.data.EmailContacto || u.data.EmailUsu}
                                                    </td>
                                                    <td>{u.data.TelefonoUsu || '—'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
