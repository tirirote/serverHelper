import React from 'react';
import PropTypes from 'prop-types';
import DataTableRow from './DataTableRow.jsx';
import styles from './DataTable.module.css';

const DataTable = ({ columns, data }) => {
    
    const columnCount = columns.length;    
    const headers = columns.map(col => col.header);

    return (
        <div className={styles.tableContainer}>
            {/* Encabezados de la Tabla (Thead) */}
            <div className={styles.tableHeader}
                style={{ '--column-count': columnCount }}>
                {headers.map((header, index) => (
                    // Usamos un div para cada celda de encabezado
                    <div key={index} className={styles.headerCell}>
                        {header}
                    </div>
                ))}
            </div>

            {/* Cuerpo de la Tabla (Tbody) */}
            <div className={styles.tableBody}>
                {data.length > 0 ? (
                    data.map(item => (
                        <DataTableRow
                            key={item.id}
                            data={item}
                            columns={columns}
                            columnCount={columnCount}
                        />
                    ))
                ) : (
                    <div className={styles.emptyState}>
                        No hay datos disponibles para mostrar.
                    </div>
                )}
            </div>
        </div>
    );
};

DataTable.propTypes = {
    columns: PropTypes.arrayOf(PropTypes.shape({
        header: PropTypes.string.isRequired,
        key: PropTypes.string.isRequired, // Clave del objeto de datos
        render: PropTypes.func, // Función opcional para renderizado personalizado
    })).isRequired,
    data: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    })).isRequired,
};

export default DataTable;