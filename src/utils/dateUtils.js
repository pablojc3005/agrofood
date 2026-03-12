/**
 * Retorna la fecha actual local en formato YYYY-MM-DD
 */
export const getLocalDateStr = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Normaliza una fecha string YYYY-MM-DD para mostrarla en formato largo local
 */
export const formatLongDate = (dateStr) => {
    if (!dateStr) return '';
    // Usamos T12:00:00 para evitar desajustes de zona horaria al crear el objeto Date
    const d = new Date(dateStr + 'T12:00:00');
    return d.toLocaleDateString('es-PE', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    });
};
