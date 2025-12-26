import React from 'react';
import { Link } from 'react-router-dom';
import { FaChevronRight, FaHome } from 'react-icons/fa';
import './Breadcrumbs.css';

const Breadcrumbs = ({ items }) => {
    return (
        <nav className="breadcrumbs" aria-label="Breadcrumb">
            <ol className="breadcrumbs-list">
                <li className="breadcrumbs-item">
                    <Link to="/" className="breadcrumbs-link">
                        <FaHome className="breadcrumbs-icon" />
                        <span className="sr-only">Home</span>
                    </Link>
                </li>
                {items.map((item, index) => (
                    <li key={index} className="breadcrumbs-item">
                        <FaChevronRight className="breadcrumbs-separator" />
                        {item.link ? (
                            <Link to={item.link} className="breadcrumbs-link">
                                {item.label}
                            </Link>
                        ) : (
                            <span className="breadcrumbs-current" aria-current="page">
                                {item.label}
                            </span>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
};

export default Breadcrumbs;
