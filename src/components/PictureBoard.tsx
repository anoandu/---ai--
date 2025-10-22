import React from 'react';
import { Language } from '../types';
import { COMMON_NEEDS } from '../constants';
import { t } from '../i18n';
import './PictureBoard.css';

interface PictureBoardProps {
  language: Language;
  onSelect: (intent: string, sentenceZh: string, sentenceEn: string) => void;
  onBack: () => void;
}

const PictureBoard: React.FC<PictureBoardProps> = ({ language, onSelect, onBack }) => {
  return (
    <div className="picture-board">
      <div className="picture-board-header">
        <button className="back-button" onClick={onBack}>
          ← {t('back', language)}
        </button>
        <p className="picture-board-title">
          {t('chooseBelowOrTryAgain', language)}
        </p>
      </div>
      
      <div className="picture-board-grid">
        {COMMON_NEEDS.map((need) => (
          <button
            key={need.id}
            className="picture-card"
            onClick={() => onSelect(need.intent, need.label_zh, need.label_en)}
          >
            <span className="picture-card-icon">{need.icon}</span>
            <span className="picture-card-label">
              {language === 'zh' ? need.label_zh : need.label_en}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default PictureBoard;

