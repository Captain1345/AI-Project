"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeftIcon, CheckCircledIcon, CrossCircledIcon, RocketIcon, MixerHorizontalIcon } from '@radix-ui/react-icons';

// Re-defining components locally as before
const Card = ({ children, className }) => (
  <div className={`bg-white rounded-lg shadow-md p-6 ${className}`}>{children}</div>
);

const CardHeader = ({ children, className }) => (
  <div className={`mb-4 ${className}`}>{children}</div>
);

const CardTitle = ({ children, className }) => (
  <h3 className={`text-lg font-semibold text-gray-800 ${className}`}>{children}</h3>
);

const CardContent = ({ children, className }) => (
  <div className={className}>{children}</div>
);

const Badge = ({ children, className }) => (
  <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${className}`}>
    {children}
  </span>
);

const AnalysisItem = ({ title, description, evidence }) => (
  <div>
    <h4 className="font-semibold text-gray-800">{title}</h4>
    <p className="text-sm text-gray-600 mt-1">{description}</p>
    {evidence && <p className="text-sm text-gray-500 mt-2 border-l-2 border-gray-300 pl-2 italic">Evidence: {evidence}</p>}
  </div>
);

const EvidenceCard = ({ title, icon, data }) => (
  <Card>
    <CardHeader className="flex items-center space-x-3">
      {icon}
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-sm text-gray-600 font-semibold">Question: {data.quote}</p>
      <blockquote className="mt-2 pl-4 border-l-4 border-gray-200 text-gray-700 italic">
        {data.explanation}
      </blockquote>
      <p className="mt-3 text-sm text-gray-800"><span className="font-semibold">Analysis:</span> {data.analysis}</p>
    </CardContent>
  </Card>
);

export default function FeedbackPage() {
  const router = useRouter();
  const [quantitative, setQuantitative] = useState(null);
  const [qualitative, setQualitative] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const dataString = sessionStorage.getItem('feedbackData');
    if (dataString) {
      try {
        const parsedData = JSON.parse(dataString);
        console.log(parsedData);
        const { quantitative, qualitative, recommendation } = parsedData;
        setQuantitative(quantitative);
        setQualitative(qualitative);
        setRecommendation(recommendation);
        // It's good practice to clear the storage after use
        sessionStorage.removeItem('feedbackData');
      } catch (error) {
        console.error("Error parsing feedback data from sessionStorage:", error);
      }
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 font-sans flex items-center justify-center">
        <p className="text-gray-600">Loading feedback...</p>
      </div>
    );
  }

  if (!quantitative || !qualitative || !recommendation) {
    return (
      <div className="min-h-screen bg-gray-50 font-sans flex flex-col items-center justify-center p-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">No Feedback Available</h2>
        <p className="text-gray-600 mb-6">Feedback data was not found. Please generate it from the conversation page.</p>
        <button
          onClick={() => router.back()}
          className="px-6 py-2 bg-gray-700 text-white font-semibold rounded-lg hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 flex items-center mx-auto"
        >
          <ArrowLeftIcon className="w-4 h-4 mr-2" />
          Back to Conversation
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      <main className="max-w-6xl mx-auto p-8 md:ml-24">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Interview Performance Analysis</h2>
            <p className="text-sm text-gray-500 mt-1">
              Question: {quantitative.question} | Type: {quantitative.questionType}
            </p>
          </div>
          <div className="text-right">
            <div className="bg-blue-600 text-white rounded-lg px-6 py-3">
              <p className="text-sm">Overall Average</p>
              <p className="text-3xl font-bold">{quantitative.overallAverage?.toFixed(1)}/5</p>
            </div>
          </div>
        </div>

        {/* Quantitative Analysis */}
        <section className="mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Quantitative Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Core Competencies</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {quantitative.coreCompetencies.map((item, index) => (
                    <li key={index} className="flex justify-between items-center">
                      <span className="text-gray-700">{item.name}</span>
                      <span className="font-semibold text-blue-600">{item.score}/{item.maxScore}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Cultural Fit</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  {quantitative.culturalFit.map((item, index) => (
                    <li key={index} className="flex justify-between items-center">
                      <span className="text-gray-700">{item.name}</span>
                      <Badge className={item.score > 0 ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                        {item.score > 0 ? 'Aligned' : 'Not Aligned'}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Qualitative Analysis */}
        <section className="mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Qualitative Analysis</h3>
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center"><RocketIcon className="w-5 h-5 mr-2 text-green-500" /> Strengths</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {qualitative.strengths.map((item, index) => (
                  <AnalysisItem key={index} {...item} />
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center"><MixerHorizontalIcon className="w-5 h-5 mr-2 text-red-500" /> Areas for Development</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {qualitative.areasForDevelopment.map((item, index) => (
                  <AnalysisItem key={index} {...item} />
                ))}
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Evidence-Based Analysis */}
        <section className="mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Evidence-Based Analysis</h3>
          <div className="space-y-6">
            {qualitative.evidenceBasedAnalysis.bestResponseMoment && (
              <EvidenceCard
                title="Best Response Moment"
                icon={<CheckCircledIcon className="w-6 h-6 text-green-500" />}
                data={qualitative.evidenceBasedAnalysis.bestResponseMoment}
              />
            )}
            {qualitative.evidenceBasedAnalysis.mostConcerningResponse && (
              <EvidenceCard
                title="Most Concerning Response"
                icon={<CrossCircledIcon className="w-6 h-6 text-red-500" />}
                data={qualitative.evidenceBasedAnalysis.mostConcerningResponse}
              />
            )}
          </div>
        </section>

        {/* Behavioral Observations */}
        <section className="mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Behavioral Observations</h3>
          <Card>
            <CardContent>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                {Object.entries(qualitative.behavioralObservations).map(([key, value]) => (
                  <li key={key} className="text-gray-700">
                    <span className="font-semibold text-gray-800">{key.replace(/([A-Z])/g, ' $1').trim()}: </span>{value}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Recommendation */}
        <section>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Recommendation</h3>
          <Card>
            <CardHeader className="flex justify-between items-center">
              <CardTitle>Final Verdict</CardTitle>
              <Badge className={recommendation.overallRating === 'Hire' ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                {recommendation.overallRating}
              </Badge>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-800">Rationale</h4>
                  <p className="text-gray-600 mt-1">{recommendation.rationale}</p>
                </div>
                {recommendation.keyFactors && recommendation.keyFactors.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-800">Key Factors in Decision</h4>
                    <ul className="list-none text-gray-600 mt-2 space-y-2">
                      {recommendation.keyFactors.map((factor, index) => (
                        <li key={index}>{factor}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
