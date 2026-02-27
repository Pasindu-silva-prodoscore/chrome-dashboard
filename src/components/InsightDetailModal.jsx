import { useEffect, useState } from 'react';
import { apiService } from '../services/api';

const InsightDetailModal = ({ isOpen, onClose, insightId }) => {
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && insightId) {
      loadInsightDetail();
    }
  }, [isOpen, insightId]);

  const loadInsightDetail = async () => {
    try {
      setLoading(true);
      const response = await apiService.getInsight(insightId);
      setInsight(response?.result || null);
    } catch (error) {
      console.error('Error loading insight detail:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const riskColors = {
    'low': 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300',
    'medium': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
    'high': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    'critical': 'bg-red-200 dark:bg-red-900/40 text-red-800 dark:text-red-200'
  };

  const riskLevel = insight?.risk_level?.toLowerCase() || 'low';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-surface-dark rounded-2xl shadow-2xl border border-slate-200 dark:border-border-dark max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-200 dark:border-border-dark flex items-start justify-between">
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-xl font-bold text-text-primary dark:text-dark-primary">
                {loading ? 'Loading...' : insight?.title || 'Insight Details'}
              </h3>
              {insight?.risk_level && (
                <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${riskColors[riskLevel]}`}>
                  {insight.risk_level}
                </span>
              )}
            </div>
            {insight?.event_type && (
              <p className="text-sm text-text-secondary dark:text-dark-secondary">
                Event: {insight.event_type} {insight.app_name && `• App: ${insight.app_name}`}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-[#3c4043] text-text-secondary dark:text-dark-secondary transition-colors"
          >
            <span className="material-symbols-outlined text-[24px]">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {loading ? (
            <div className="space-y-4">
              <div className="h-4 bg-slate-200 dark:bg-[#3c4043] rounded animate-pulse"></div>
              <div className="h-4 bg-slate-200 dark:bg-[#3c4043] rounded animate-pulse w-3/4"></div>
              <div className="h-4 bg-slate-200 dark:bg-[#3c4043] rounded animate-pulse w-1/2"></div>
            </div>
          ) : insight ? (
            <div className="space-y-6">
              {/* Summary */}
              {insight.summary && (
                <div>
                  <h4 className="text-sm font-semibold text-text-primary dark:text-dark-primary mb-2">Summary</h4>
                  <p className="text-sm text-text-secondary dark:text-dark-secondary leading-relaxed">
                    {insight.summary}
                  </p>
                </div>
              )}

              {/* Confidence Score */}
              {insight.confidence_score && (
                <div className="bg-slate-50 dark:bg-[#3c4043] rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-text-primary dark:text-dark-primary">Confidence Score</span>
                    <span className="text-2xl font-bold text-primary">{(insight.confidence_score * 100).toFixed(0)}%</span>
                  </div>
                  <div className="mt-3 h-2 bg-slate-200 dark:bg-[#1f1f1f] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${insight.confidence_score * 100}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Key Findings */}
              {insight.key_findings && insight.key_findings.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-text-primary dark:text-dark-primary mb-3">Key Findings</h4>
                  <ul className="space-y-2">
                    {insight.key_findings.map((finding, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">check_circle</span>
                        <span className="text-sm text-text-secondary dark:text-dark-secondary flex-1">{finding}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              {insight.recommendations && insight.recommendations.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-text-primary dark:text-dark-primary mb-3">Recommendations</h4>
                  <ul className="space-y-2">
                    {insight.recommendations.map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-3">
                        <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-[20px] mt-0.5">lightbulb</span>
                        <span className="text-sm text-text-secondary dark:text-dark-secondary flex-1">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Context Analysis */}
              {insight.context_analysis && (
                <div>
                  <h4 className="text-sm font-semibold text-text-primary dark:text-dark-primary mb-2">Context Analysis</h4>
                  <p className="text-sm text-text-secondary dark:text-dark-secondary leading-relaxed">
                    {insight.context_analysis}
                  </p>
                </div>
              )}

              {/* User Information */}
              {insight.user && (
                <div className="bg-slate-50 dark:bg-[#3c4043] rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-text-primary dark:text-dark-primary mb-3">User Information</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-text-muted dark:text-dark-muted mb-1">Name</p>
                      <p className="text-text-primary dark:text-dark-primary font-medium">{insight.user.name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-text-muted dark:text-dark-muted mb-1">Email</p>
                      <p className="text-text-primary dark:text-dark-primary font-medium">{insight.user.primary_email || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-text-muted dark:text-dark-muted mb-1">Username</p>
                      <p className="text-text-primary dark:text-dark-primary font-medium">{insight.user.username || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-text-muted dark:text-dark-muted mb-1">Last Login</p>
                      <p className="text-text-primary dark:text-dark-primary font-medium">
                        {insight.user.last_login_time ? new Date(insight.user.last_login_time).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Metadata */}
              <div className="pt-4 border-t border-slate-200 dark:border-border-dark">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-text-muted dark:text-dark-muted mb-1">Generated At</p>
                    <p className="text-text-primary dark:text-dark-primary">
                      {insight.generated_at ? new Date(insight.generated_at).toLocaleString() : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-text-muted dark:text-dark-muted mb-1">Date Key</p>
                    <p className="text-text-primary dark:text-dark-primary">{insight.date_key || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-text-secondary dark:text-dark-secondary">No insight data available</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-4 border-t border-slate-200 dark:border-border-dark flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-slate-100 dark:bg-[#3c4043] text-text-primary dark:text-dark-primary rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default InsightDetailModal;
