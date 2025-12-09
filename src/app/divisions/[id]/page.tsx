import dynamic from 'next/dynamic';

const DivisionDetailClient = dynamic(() => import('./DivisionDetailClient'), {
  loading: () => <div className="p-8 text-center text-gray-500">Loading division details...</div>,
});

interface DivisionDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function DivisionDetailPage({ params }: DivisionDetailPageProps) {
  const { id } = await params;
  return <DivisionDetailClient divisionId={id} />;
}
