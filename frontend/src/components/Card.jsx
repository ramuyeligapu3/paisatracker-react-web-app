import React from 'react';
import styles from './Card.module.css';

function Card({ title, amount, color, change }) {
  const sign = change >= 0 ? '+' : '-';
  const absChange = Math.abs(change).toFixed(1);  // Show 1 decimal place

  // Determine color class for amount based on positive or negative value
  const amountColorClass = amount >= 0 ? styles['amountPositive'] : styles['amountNegative'];

  return (
    <div className={`${styles.card} ${styles[`card--${color}`]}`}>
      <h4 className={styles.card__title}>{title}</h4>
      <p className={`${styles.card__amount} ${amountColorClass}`}>
        ₹{Math.abs(amount).toLocaleString()}
      </p>
      <p className={`${styles.card__change} ${styles[`card__change--${color}`]}`}>
        {sign}{absChange}% from last month
      </p>
    </div>
  );
}

export default Card;
