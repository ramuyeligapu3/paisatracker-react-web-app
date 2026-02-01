import React from 'react';
import './Table.css';

const Table = ({ columns, data, onEdit, onDelete }) => {
  return (
    <div className="table-container">
      <table className="table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={col.align === 'right' ? 'table__right' : ''}
              >
                {col.label}
              </th>
            ))}
            {(onEdit || onDelete) && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length + 1} className="table__no-data">
                No data found.
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr key={index}>
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={col.align === 'right' ? 'table__right' : ''}
                  >
                    {col.render ? col.render(row[col.key], row, index) : row[col.key]}
                  </td>
                ))}
                {(onEdit || onDelete) && (
                  <td className="table__actions">
                    {onEdit && (
                      <button
                        className="table__btn edit"
                        onClick={() => onEdit(row)}
                      >
                        Edit
                      </button>
                    )}
                    {onDelete && (
                      <button
                        className="table__btn delete"
                        onClick={() => onDelete(row)}
                      >
                        Delete
                      </button>
                    )}
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Table;
