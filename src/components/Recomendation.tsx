// components/RecommendationLink.tsx
import React from 'react';
import './RecommendationCard.css';

interface RecommendationLinkProps {
  imageUrl: string;
  title: string;
  description: string; // bisa berupa HTML
  kodeKonten: string;  // this will be the href URL
}

const RecommendationLink: React.FC<RecommendationLinkProps> = ({
  imageUrl,
  title,
  description,
  kodeKonten,
}) => {
  const stripHtml = (html: string) => {
    if (!html) return "";
    return html.replace(/<[^>]+>/g, "").trim();
  };

  return (
    <a href={`./${kodeKonten}`} className="recommendation-card" style={{ textDecoration: 'none' }}>
      <div className="recommendation-header">
        <span className="recommendation-title-bar"></span>
        <span className="recommendation-header-text">Lihat Juga</span>
      </div>
      <div className="recommendation-content">
        <img className="recommendation-image" src={imageUrl} alt={title} />
        <div className="recommendation-info">
          <div className="recommendation-title" title={title}>{title}</div>
          <div className="recommendation-description" title={stripHtml(description)}>
            {stripHtml(description)}
          </div>
        </div>
      </div>
    </a>
  );
};

export default RecommendationLink;
