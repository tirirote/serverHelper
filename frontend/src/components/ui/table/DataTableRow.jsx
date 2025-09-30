import React from 'react';
import PropTypes from 'prop-types';
import styles from './DataTable.module.css';

const DataTableRow = ({ data, columns, columnCount }) => {
        
    const cells = columns.map((col, index) => {
        let cellContent;

        if (col.render) {
            cellContent = col.render(data);
        } else {
            cellContent = data[col.key];
        }

        return (
            <div key={index} className={styles.dataCell}>
                {cellContent}
            </div>
        );
    });

    return (
        <div 
            className={styles.dataRow} 
            style={{ '--column-count': columnCount }}
        >
            {cells}
        </div>
    );
};

DataTableRow.propTypes = {
    data: PropTypes.object.isRequired,
    columns: PropTypes.array.isRequired,
    columnCount: PropTypes.number.isRequired,
};

export default DataTableRow;