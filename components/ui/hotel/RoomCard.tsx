interface RoomCardProps {
  title: string;
  description: string;
}

export default function RoomCard({ title, description }: RoomCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-5 hover:shadow-lg transition">
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}