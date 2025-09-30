import React, { useState } from 'react';
import Button from '../button/Button.jsx';
import { Search, SlidersHorizontal, Funnel, X } from 'lucide-react';

import PropTypes from 'prop-types';
import InputField from '../input/InputField';
import styles from './SearchFilterBar.module.css';

const SearchFilterBar = ({
    onSearchChange,
    onFilterClick,
    searchPlaceholder = 'Buscar...',
    filterLabel = 'Filtros'
}) => {

    const [searchTerm, setSearchTerm] = useState('');

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        if (onSearchChange) {
            onSearchChange(value);
        }
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        if (onSearchChange) {
            onSearchChange('');
        }
    };

    return (
        <div className={styles.searchFilterBarContainer}>
            <Button
                onClick={onFilterClick}
                variant="icon-only"
                aria-label="Abrir opciones de filtrado"
            >
                <Funnel size={24} />
            </Button>
            <InputField
                type="search"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={handleSearchChange}
                startAdornment={<Search size={20} />} 
            />
        </div>
    );
};

SearchFilterBar.propTypes = {
    onSearchChange: PropTypes.func.isRequired,
    onFilterClick: PropTypes.func.isRequired,
    searchPlaceholder: PropTypes.string,
    filterLabel: PropTypes.string,
};

export default SearchFilterBar;