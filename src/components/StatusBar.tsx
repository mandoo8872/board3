import React from 'react';
import type { SaveStatus, Theme } from '../types/types';

interface StatusBarProps {
  saveStatus: SaveStatus;
  errorMessage?: string;
  theme: Theme;
}

const StatusBar: React.FC<StatusBarProps> = ({ saveStatus, errorMessage, theme }) => {
  const getStatusColor = () => {
    switch (saveStatus) {
      case 'saving':
        return theme.colors.secondary;
      case 'saved':
        return theme.colors.success;
      case 'error':
        return theme.colors.error;
      default:
        return theme.colors.text;
    }
  };

  const getStatusText = () => {
    switch (saveStatus) {
      case 'saving':
        return '저장 중...';
      case 'saved':
        return '저장 완료';
      case 'error':
        return '저장 실패';
      default:
        return '';
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: 24,
        backgroundColor: theme.colors.surface,
        borderTop: `1px solid ${theme.colors.border}`,
        display: 'flex',
        alignItems: 'center',
        padding: '0 16px',
        fontSize: 12,
        color: theme.colors.text,
        zIndex: 1000
      }}
    >
      <div style={{ flex: 1 }}>
        <span style={{ color: getStatusColor() }}>
          {getStatusText()}
        </span>
      </div>
      {errorMessage && (
        <div style={{ color: theme.colors.error }}>
          {errorMessage}
        </div>
      )}
    </div>
  );
};

export default StatusBar; 