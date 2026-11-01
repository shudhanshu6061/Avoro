'use client';

import React, { useState } from 'react';

interface AccordionProps {
  id: string;
  title: React.ReactNode;
  children: React.ReactNode;
  isOpen?: boolean;
  onToggle?: () => void;
  defaultOpen?: boolean;
  className?: string;
  style?: React.CSSProperties;
  cardStyle?: React.CSSProperties;
  headerStyle?: React.CSSProperties;
  nested?: boolean; // simplified styling for nested sections (e.g. Fragrance Notes)
}

export default function Accordion({
  id,
  title,
  children,
  isOpen: controlledIsOpen,
  onToggle,
  defaultOpen = false,
  className = '',
  style,
  cardStyle,
  headerStyle,
  nested = false,
}: AccordionProps) {
  const [uncontrolledIsOpen, setUncontrolledIsOpen] = useState(defaultOpen);

  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : uncontrolledIsOpen;

  const handleToggle = () => {
    if (isControlled) {
      if (onToggle) onToggle();
    } else {
      setUncontrolledIsOpen(!uncontrolledIsOpen);
    }
  };

  const headerId = `accordion-header-${id}`;
  const panelId = `accordion-panel-${id}`;

  return (
    <div
      className={`avoro-accordion ${isOpen ? 'is-open' : ''} ${nested ? 'is-nested' : ''} ${className}`}
      style={{
        background: nested ? 'rgba(255, 255, 255, 0.5)' : 'var(--bg-card)',
        borderRadius: nested ? '12px' : '18px',
        border: `1px solid ${isOpen ? '#B89452' : 'var(--border-soft)'}`,
        boxShadow: nested ? 'none' : 'var(--shadow-sm)',
        transition: 'all 0.3s var(--ease)',
        overflow: 'hidden',
        ...style,
        ...cardStyle,
      }}
    >
      <button
        id={headerId}
        type="button"
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={handleToggle}
        className="avoro-accordion-trigger"
        style={{
          width: '100%',
          minHeight: nested ? '48px' : '56px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          textAlign: 'left',
          padding: nested ? '0.85rem 1.25rem' : '1.25rem 2rem',
          cursor: 'pointer',
          border: 'none',
          background: 'none',
          outline: 'none',
          color: 'var(--text)',
          fontFamily: 'var(--font-display)',
          fontWeight: nested ? 500 : 600,
          letterSpacing: '-0.01em',
          transition: 'all 0.3s var(--ease)',
          ...headerStyle,
        }}
      >
        <span style={{ fontSize: nested ? '0.95rem' : 'clamp(1.05rem, 2vw, 1.2rem)' }}>
          {title}
        </span>
        <span
          className="chevron-icon"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 350ms var(--ease)',
            color: isOpen ? '#B89452' : 'var(--text-soft)',
            marginLeft: '1rem',
          }}
        >
          <svg
            width="12"
            height="8"
            viewBox="0 0 12 8"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M1 1.5L6 6.5L11 1.5" />
          </svg>
        </span>
      </button>

      <div
        id={panelId}
        role="region"
        aria-labelledby={headerId}
        className="avoro-accordion-panel"
        style={{
          display: 'grid',
          gridTemplateRows: isOpen ? '1fr' : '0fr',
          transition: 'grid-template-rows 350ms var(--ease)',
        }}
      >
        <div style={{ overflow: 'hidden' }}>
          <div
            className="avoro-accordion-content"
            style={{
              padding: nested ? '0 1.25rem 1.25rem 1.25rem' : '0 2rem 2rem 2rem',
              opacity: isOpen ? 1 : 0,
              transform: isOpen ? 'translateY(0)' : 'translateY(8px)',
              transition: 'opacity 300ms var(--ease) 50ms, transform 300ms var(--ease) 50ms',
            }}
          >
            {children}
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .avoro-accordion:not(.is-nested):hover {
          transform: translateY(-2px);
          box-shadow: var(--shadow-md) !important;
          border-color: #B89452 !important;
        }
        .avoro-accordion-trigger:focus-visible {
          box-shadow: inset 0 0 0 1.5px #B89452;
          background: rgba(184, 146, 82, 0.03);
        }
      ` }} />
    </div>
  );
}
