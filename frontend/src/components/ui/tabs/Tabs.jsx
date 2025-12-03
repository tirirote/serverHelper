import React from 'react';
import PropTypes from 'prop-types';
import styles from './Tabs.module.css';

const Tabs = ({ tabs, activeKey, onChange }) => {
  return (
    <div className={styles.tabs}>
      <div className={styles.tabList} role="tablist">
        {tabs.map(tab => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={activeKey === tab.key}
            className={`${styles.tabButton} ${activeKey === tab.key ? styles.active : ''}`}
            onClick={() => onChange(tab.key)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className={styles.tabPanel} role="tabpanel">
        {tabs.find(t => t.key === activeKey)?.content || null}
      </div>
    </div>
  );
};

Tabs.propTypes = {
  tabs: PropTypes.arrayOf(PropTypes.shape({
    key: PropTypes.string.isRequired,
    label: PropTypes.node.isRequired,
    content: PropTypes.node,
  })).isRequired,
  activeKey: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
};

export default Tabs;
