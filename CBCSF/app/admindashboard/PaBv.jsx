export default function PaBv({ program, batch }) {
    console.log(program, batch);
    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Programs and Batch ID</h1>
            <div className="bg-white p-4 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Programs</h2>
                <table className="min-w-full bg-white">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="py-2 px-4 text-left text-gray-600">ID</th>
                            <th className="py-2 px-4 text-left text-gray-600">Name</th>
                        </tr>
                    </thead>
                    <tbody>
                        {program.map((prog) => (
                            <tr key={prog.id} className="hover:bg-gray-100">
                                <td className="border px-4 py-2 text-gray-800">{prog.id}</td>
                                <td className="border px-4 py-2 text-gray-800">{prog.name}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-md mt-6">
                <h2 className="text-xl font-semibold text-gray-700 mb-2">Batches</h2>
                <table className="min-w-full bg-white">
                    <thead>
                        <tr className="bg-gray-200">
                            <th className="py-2 px-4 text-left text-gray-600">ID</th>
                            <th className="py-2 px-4 text-left text-gray-600">Start</th>
                            <th className="py-2 px-4 text-left text-gray-600">End</th>
                            <th className="py-2 px-4 text-left text-gray-600">Total Students</th>
                        </tr>
                    </thead>
                    <tbody>
                        {batch.map((b) => (
                            <tr key={b.id} className="hover:bg-gray-100">
                                <td className="border px-4 py-2 text-gray-800">{b.id}</td>
                                <td className="border px-4 py-2 text-gray-800">{b.start}</td>
                                <td className="border px-4 py-2 text-gray-800">{b.end}</td>
                                <td className="border px-4 py-2 text-gray-800">{b.total_students}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}