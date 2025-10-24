import dynamic from 'next/dynamic'; 

const SeasonDetailClient = dynamic(() => import('./SeasonDetailClient'), {
  loading: () => <div className="p-8 text-center text-gray-500">Loading season details...</div>,
});

interface SeasonDetailPageProps {
  // Next.js 15 requires params to be async
  params: Promise<{ id: string }>; 
}

// Server Component
export default async function SeasonDetailPage({ params }: SeasonDetailPageProps) {
  // Await params before accessing its properties (Next.js 15 requirement)
  const { id } = await params;
  
  // Pass the season ID down as a prop to the Client Component
  return <SeasonDetailClient seasonId={id} />;
  return <SeasonDetailClient seasonId={id} />;
}