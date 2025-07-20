import React from 'react';
import styles from './Card.module.css';

function Card({ title, amount, color }) {
  return (
    <div className={`${styles.card} ${styles[`card--${color}`]}`}>
      <h4 className={styles.card__title}>{title}</h4>
      <p className={styles.card__amount}>₹{Math.abs(amount).toLocaleString()}</p>
      <p className={`${styles.card__change} ${styles[`card__change--${color}`]}`}>
        {amount >= 0 ? '+' : '-'}
        {Math.floor(Math.random() * 10) + 1}% from last month
      </p>
    </div>
  );
}

export default Card;
