import React from 'react';
import { useContent } from '../../contexts/ContentContext';

export function YoutubeExplainer() {
  const { content } = useContent();
  const videoContent = content.youtube_explainer?.value;

  if (!videoContent?.url) return null;

  const getVideoId = (url: string) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([\w-]{11})/);
    return match ? match[1] : null;
  };

  const videoId = getVideoId(videoContent.url);
  
  if (!videoId) return null;

  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">{videoContent.title || 'How It Works'}</h2>
          {videoContent.description && (
            <p className="mt-3 text-base text-gray-600">{videoContent.description}</p>
          )}
        </div>
        <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-lg shadow-lg max-w-2xl mx-auto">
          <iframe
            className="absolute top-0 left-0 w-full h-full"
            src={`https://www.youtube.com/embed/${videoId}`}
            title="How It Works"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}