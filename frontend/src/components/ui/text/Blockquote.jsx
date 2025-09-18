import React from 'react';
import PropTypes from 'prop-types';
import styles from './Blockquote.module.css';

const Blockquote = ({ children, author }) => {
    return (
        <blockquote className={styles.quote}>
            <p>{children}</p>
            {author && <footer className={styles.quoteAuthor}>— {author}</footer>}
        </blockquote>
    );
};

Blockquote.propTypes = {
    children: PropTypes.node.isRequired,
    author: PropTypes.string,
};

export default Blockquote;