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
    <div className="bg-emerald-50/90 py-16 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/50 to-emerald-50/90" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-100/20 via-transparent to-transparent" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-emerald-900">
            {videoContent.title || 'How It Works'}
          </h2>
          {videoContent.description && (
            <p className="mt-4 text-lg text-emerald-700/90 max-w-2xl mx-auto">
              {videoContent.description}
            </p>
          )}
        </div>
        <div className="relative max-w-4xl mx-auto">
          <div className="relative pb-[56.25%] h-0 overflow-hidden rounded-2xl shadow-2xl bg-white">
            <iframe
              className="absolute top-0 left-0 w-full h-full"
              src={`https://www.youtube.com/embed/${videoId}`}
              title="How It Works"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
          {/* Decorative elements */}
          <div className="absolute -top-4 -left-4 w-8 h-8 bg-emerald-200 rounded-full opacity-50" />
          <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-emerald-300 rounded-full opacity-40" />
        </div>
      </div>
    </div>
  );
}