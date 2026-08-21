export default function RoomTypeTable() {
  const data = [
    { type: 'Basic', size: 'Standard', meals: 'Standard', guest: 'No' },
    { type: 'Elite', size: 'Large', meals: 'Enhanced', guest: 'No' },
    { type: 'Premium', size: 'Largest', meals: 'Premium', guest: 'Yes' }
  ];

  return (
    <div className="mt-10 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <h3 className="text-lg font-bold mb-4">Room Type Definitions</h3>
      <table className="w-full text-left">
        <thead className="text-slate-500 uppercase text-xs">
          <tr><th className="py-2">Type</th><th className="py-2">Size</th><th className="py-2">Meals</th><th className="py-2">Guest Accomm.</th></tr>
        </thead>
        <tbody className="divide-y">
          {data.map(d => (
            <tr key={d.type}><td className="py-3 font-semibold">{d.type}</td><td className="py-3">{d.size}</td><td className="py-3">{d.meals}</td><td className="py-3">{d.guest}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}