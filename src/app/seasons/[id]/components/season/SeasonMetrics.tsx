
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";


export const SeasonMetricsCard = ({ season }: any) => {
  const metrics = [
    { label: 'Total Divisions', value: '4' }, // Mock data
    { label: 'Total Promo Codes', value: '7 active' }, // Mock data
    // { label: 'Waitlist Size', value: season.memberships.filter(m => m.status === 'WAITLISTED').length },
    // { label: 'Created On', value: formatDate(season.createdAt) },
  ];

  return (
    <Card className="lg:col-span-3">
      <CardHeader>
        <CardTitle>Key Season Metrics & Relations</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {metrics.map((metric) => (
            <div key={metric.label} className="border-l-4 border-blue-500 pl-4">
              <p className="text-sm text-gray-500">{metric.label}</p>
              <p className="text-2xl font-bold text-gray-900">{metric.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};