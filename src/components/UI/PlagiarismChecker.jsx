import React, { useState } from 'react';
import Card from './Card';
import Button from './Button';
import LoadingSpinner from './LoadingSpinner';
import { AlertTriangle, CheckCircle, FileText, ExternalLink } from 'lucide-react';

const PlagiarismChecker = ({ content, onCheck, results, loading }) => {
  const [showDetails, setShowDetails] = useState(false);

  const getSeverityColor = (percentage) => {
    if (percentage < 15) return 'text-green-600 bg-green-100';
    if (percentage < 30) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getSeverityIcon = (percentage) => {
    if (percentage < 15) return <CheckCircle className="h-5 w-5 text-green-600" />;
    return <AlertTriangle className="h-5 w-5 text-red-600" />;
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center">
          <FileText className="h-5 w-5 mr-2" />
          Plagiarism Check
        </h3>
        <Button
          onClick={onCheck}
          disabled={loading || !content}
          size="sm"
        >
          {loading ? 'Checking...' : 'Check Plagiarism'}
        </Button>
      </div>

      {loading && (
        <div className="text-center py-8">
          <LoadingSpinner text="Analyzing content for plagiarism..." />
        </div>
      )}

      {results && !loading && (
        <div className="space-y-4">
          {/* Overall Score */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              {getSeverityIcon(results.overallScore)}
              <div>
                <p className="font-medium">Overall Plagiarism Score</p>
                <p className="text-sm text-gray-600">
                  {results.overallScore < 15 ? 'Low risk' : 
                   results.overallScore < 30 ? 'Medium risk' : 'High risk'}
                </p>
              </div>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getSeverityColor(results.overallScore)}`}>
              {results.overallScore}%
            </div>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <p className="text-2xl font-bold text-blue-600">{results.totalSources}</p>
              <p className="text-sm text-gray-600">Sources Found</p>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <p className="text-2xl font-bold text-purple-600">{results.matchedWords}</p>
              <p className="text-sm text-gray-600">Matched Words</p>
            </div>
            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <p className="text-2xl font-bold text-orange-600">{results.uniquePercentage}%</p>
              <p className="text-sm text-gray-600">Unique Content</p>
            </div>
          </div>

          {/* Detailed Results */}
          <div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
              className="mb-3"
            >
              {showDetails ? 'Hide' : 'Show'} Detailed Results
            </Button>

            {showDetails && (
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Potential Matches:</h4>
                {results.matches?.map((match, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(match.similarity)}`}>
                          {match.similarity}% match
                        </span>
                        <span className="text-sm text-gray-600">
                          {match.words} words
                        </span>
                      </div>
                      {match.url && (
                        <a
                          href={match.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-blue-600 hover:text-blue-800 text-sm"
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View Source
                        </a>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs font-medium text-gray-700 mb-1">Your Content:</p>
                        <p className="text-sm bg-red-50 p-2 rounded border-l-4 border-red-400">
                          "{match.originalText}"
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-xs font-medium text-gray-700 mb-1">Source ({match.source}):</p>
                        <p className="text-sm bg-yellow-50 p-2 rounded border-l-4 border-yellow-400">
                          "{match.matchedText}"
                        </p>
                      </div>
                    </div>
                  </div>
                )) || (
                  <p className="text-gray-500 text-center py-4">No detailed matches available</p>
                )}
              </div>
            )}
          </div>

          {/* Recommendations */}
          {results.overallScore > 15 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-800 mb-2">Recommendations:</h4>
              <ul className="text-sm text-yellow-700 space-y-1">
                <li>• Review highlighted sections and add proper citations</li>
                <li>• Paraphrase content in your own words</li>
                <li>• Use quotation marks for direct quotes</li>
                <li>• Add references to original sources</li>
              </ul>
            </div>
          )}

          {/* Report Generation */}
          <div className="flex justify-end space-x-2">
            <Button variant="secondary" size="sm">
              Download Report
            </Button>
            <Button variant="secondary" size="sm">
              Share Results
            </Button>
          </div>
        </div>
      )}

      {!results && !loading && (
        <div className="text-center py-8 text-gray-500">
          <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p>Click "Check Plagiarism" to analyze the content</p>
          <p className="text-sm mt-1">Powered by advanced AI detection algorithms</p>
        </div>
      )}
    </Card>
  );
};

export default PlagiarismChecker;