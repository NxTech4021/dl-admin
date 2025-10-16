// app/seasons/[id]/page.tsx

import dynamic from 'next/dynamic'; 

// CRITICAL: We pass the 'id' (from URL params) down to the client component.
// We are REMOVING the problematic 'ssr: false' option.
const SeasonDetailClient = dynamic(() => import('./SeasonDetailClient'), {
  loading: () => <div className="p-8 text-center text-gray-500">Loading season details...</div>,
  // The 'ssr: false' line has been removed to resolve the error.
});

interface SeasonDetailPageProps {
  // Next.js automatically provides route parameters here
  params: { id: string }; 
}

// Server Component
export default async function SeasonDetailPage({ params }: SeasonDetailPageProps) {
  // Await params before accessing its properties (Next.js 15 requirement)
  const { id } = await params;
  
  // Pass the season ID down as a prop to the Client Component
  return <SeasonDetailClient seasonId={id} />;
}